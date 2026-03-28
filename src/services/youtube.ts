const BASE_URL = 'https://www.googleapis.com/youtube/v3';

async function fetchYouTube(endpoint: string, params: Record<string, string>) {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  if (!API_KEY) throw new Error("Missing YOUTUBE_API_KEY environment variable. Did you add it to .env.local?");
  
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('key', API_KEY);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.append(key, value);
  }
  
  const response = await fetch(url.toString(), { 
    // Cache for 1 hour to preserve API quota
    next: { revalidate: 3600 } 
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("YouTube API Error:", errorData);
    throw new Error(errorData.error?.message || `YouTube API responded with ${response.status}`);
  }
  
  return response.json();
}

/**
 * 1. Resolves any YouTube URL or handle string into a formal Channel ID and structural details.
 */
export async function resolveChannel(input: string) {
  let channelId = '';
  const decodedInput = decodeURIComponent(input).trim();
  
  // Is it a handle? (@channelname)
  const handleMatch = decodedInput.match(/@([\w.-]+)/);
  if (handleMatch) {
    const handle = handleMatch[1];
    try {
      const data = await fetchYouTube('/channels', {
        part: 'id,contentDetails,snippet,statistics',
        forHandle: `@${handle}`
      });
      if (data.items && data.items.length > 0) return data.items[0];
    } catch (e) {
      console.warn("forHandle failed, gracefully falling back to search...", e);
    }
    
    // Fallback: search for channel if forHandle is restricted
    const searchData = await fetchYouTube('/search', {
      part: 'snippet',
      type: 'channel',
      q: `@${handle}`,
      maxResults: '1'
    });
    if (searchData.items && searchData.items.length > 0) {
      channelId = searchData.items[0].snippet.channelId;
    }
  } 
  // Is it an explicit channel ID? (UC...)
  else if (decodedInput.includes('/channel/UC')) {
    const match = decodedInput.match(/\/channel\/(UC[\w-]+)/);
    if (match) channelId = match[1];
  } 
  else if (decodedInput.startsWith('UC') && decodedInput.length === 24) {
    channelId = decodedInput;
  }
  // Is it a custom URL? (/c/ or /user/)
  else if (decodedInput.includes('/c/') || decodedInput.includes('/user/')) {
    const match = decodedInput.match(/\/(?:c|user)\/([\w.-]+)/);
    if (match) {
      const username = match[1];
      const data = await fetchYouTube('/channels', {
        part: 'id,contentDetails,snippet,statistics',
        forUsername: username
      });
      if (data.items && data.items.length > 0) return data.items[0];
    }
  }

  // 🔴 Aggressive Fallback for Fuzzy Input (raw names, missing @, etc.)
  if (!channelId) {
    // 1. If it's a single unbroken word and doesn't start with UC, try treating it as an exact handle first
    if (!decodedInput.includes(' ') && !decodedInput.startsWith('UC')) {
      try {
        const handleData = await fetchYouTube('/channels', {
          part: 'id,contentDetails,snippet,statistics',
          forHandle: decodedInput.startsWith('@') ? decodedInput : `@${decodedInput}`
        });
        if (handleData.items && handleData.items.length > 0) return handleData.items[0];
      } catch (e) {
        // Fall through to general search below if handle fails
      }
    }
    
    // 2. Final absolute fallback: Search YouTube for whatever they typed and grab the #1 channel result!
    try {
      const searchData = await fetchYouTube('/search', {
        part: 'snippet',
        type: 'channel',
        q: decodedInput,
        maxResults: '1'
      });
      if (searchData.items && searchData.items.length > 0) {
        channelId = searchData.items[0].snippet.channelId;
      }
    } catch (e) {
      console.warn("Fuzzy search fallback failed.", e);
    }
  }
  
  // If we collected a raw ID from any method, formalize fetching the full profile
  if (channelId) {
    const data = await fetchYouTube('/channels', {
      part: 'id,contentDetails,snippet,statistics',
      id: channelId
    });
    if (data.items && data.items.length > 0) return data.items[0];
  }

  throw new Error("Could not definitively resolve a YouTube channel from that input.");
}

/**
 * 2. Fetches the 50 most recent uploads for a given uploads playlist ID
 */
export async function getRecentVideos(uploadsPlaylistId: string, maxResults: number = 50) {
  const data = await fetchYouTube('/playlistItems', {
    part: 'snippet',
    playlistId: uploadsPlaylistId,
    maxResults: maxResults.toString()
  });

  if (!data.items || data.items.length === 0) return [];

  // YouTube's /videos endpoint requires comma separated IDs
  const videoIds = data.items.map((item: any) => item.snippet.resourceId.videoId).join(',');
  
  const statsData = await fetchYouTube('/videos', {
    part: 'statistics,snippet,contentDetails',
    id: videoIds
  });

  return statsData.items || [];
}

/**
 * 3. Cleans the raw YouTube payload and mathematically derives the
 *    channel's current momentum baselines to tag Top Performers (percentile based).
 */
export function calculateMomentum(rawVideos: any[]) {
  const now = new Date();
  
  // Map and calculate discrete values
  const processed = rawVideos.map(v => {
    const publishedAt = new Date(v.snippet.publishedAt);
    // Determine the age in days (with a floor of 1 to prevent infinity VPD)
    const ageInDays = Math.max(1, (now.getTime() - publishedAt.getTime()) / (1000 * 3600 * 24));
    
    const views = parseInt(v.statistics.viewCount || '0', 10);
    const likes = parseInt(v.statistics.likeCount || '0', 10);
    const comments = parseInt(v.statistics.commentCount || '0', 10);
    
    // Core custom velocity metric
    const viewsPerDay = Math.floor(views / ageInDays);
    
    return {
      id: v.id,
      title: v.snippet.title,
      thumbnail: v.snippet.thumbnails.maxres?.url || v.snippet.thumbnails.high?.url || v.snippet.thumbnails.default?.url,
      publishedAt: v.snippet.publishedAt,
      // Pass through pure numbers
      views,
      likes,
      comments,
      viewsPerDay,
      // Placeholder for heuristic badge
      momentum: 'Normal'
    };
  });

  if (processed.length === 0) return [];

  // Sort purely by Views Per Day to determine percentiles across this batch
  const sortedByVpd = [...processed].sort((a, b) => b.viewsPerDay - a.viewsPerDay);
  
  // Heuristic: Top 15% is 'Trending' (Viral breakout)
  //            Next 35% is 'Growing Fast' (Strong performer)
  //            Bottom 50% is 'Normal' 
  const trendingCount = Math.max(1, Math.ceil(processed.length * 0.15));
  const growingCount = Math.max(1, Math.ceil(processed.length * 0.35));

  sortedByVpd.forEach((v, index) => {
    const original = processed.find(p => p.id === v.id);
    if (!original) return;
    
    if (index < trendingCount) {
      original.momentum = 'Trending';
    } else if (index < trendingCount + growingCount) {
      original.momentum = 'Growing Fast';
    } else {
      original.momentum = 'Normal';
    }
  });

  return processed;
}
