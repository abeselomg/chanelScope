const BASE_URL = "https://www.googleapis.com/youtube/v3";

async function fetchYouTube(endpoint: string, params: Record<string, string>) {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  if (!API_KEY)
    throw new Error(
      "Missing YOUTUBE_API_KEY environment variable. Did you add it to .env.local?",
    );

  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append("key", API_KEY);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.append(key, value);
  }

  const response = await fetch(url.toString(), {
    // Cache for 1 hour to preserve API quota
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("YouTube API Error:", errorData);
    throw new Error(
      errorData.error?.message ||
        `YouTube API responded with ${response.status}`,
    );
  }

  return response.json();
}

/**
 * 1. Resolves any YouTube URL or handle string into a formal Channel ID and structural details.
 */
export async function resolveChannel(input: string) {
  let channelId = "";
  const decodedInput = decodeURIComponent(input).trim();

  // Is it a handle? (@channelname)
  const handleMatch = decodedInput.match(/@([\w.-]+)/);
  if (handleMatch) {
    const handle = handleMatch[1];
    try {
      const data = await fetchYouTube("/channels", {
        part: "id,contentDetails,snippet,statistics",
        forHandle: `@${handle}`,
      });
      if (data.items && data.items.length > 0) return data.items[0];
    } catch (e) {
      console.warn("forHandle failed, gracefully falling back to search...", e);
    }

    // Fallback: search for channel if forHandle is restricted
    const searchData = await fetchYouTube("/search", {
      part: "snippet",
      type: "channel",
      q: `@${handle}`,
      maxResults: "1",
    });
    if (searchData.items && searchData.items.length > 0) {
      channelId = searchData.items[0].snippet.channelId;
    }
  }
  // Is it an explicit channel ID? (UC...)
  else if (decodedInput.includes("/channel/UC")) {
    const match = decodedInput.match(/\/channel\/(UC[\w-]+)/);
    if (match) channelId = match[1];
  } else if (decodedInput.startsWith("UC") && decodedInput.length === 24) {
    channelId = decodedInput;
  }
  // Is it a custom URL? (/c/ or /user/)
  else if (decodedInput.includes("/c/") || decodedInput.includes("/user/")) {
    const match = decodedInput.match(/\/(?:c|user)\/([\w.-]+)/);
    if (match) {
      const username = match[1];
      const data = await fetchYouTube("/channels", {
        part: "id,contentDetails,snippet,statistics",
        forUsername: username,
      });
      if (data.items && data.items.length > 0) return data.items[0];
    }
  }

  // 🔴 Aggressive Fallback for Fuzzy Input (raw names, missing @, etc.)
  if (!channelId) {
    // 1. If it's a single unbroken word and doesn't start with UC, try treating it as an exact handle first
    if (!decodedInput.includes(" ") && !decodedInput.startsWith("UC")) {
      try {
        const handleData = await fetchYouTube("/channels", {
          part: "id,contentDetails,snippet,statistics",
          forHandle: decodedInput.startsWith("@")
            ? decodedInput
            : `@${decodedInput}`,
        });
        if (handleData.items && handleData.items.length > 0)
          return handleData.items[0];
      } catch (e) {
        // Fall through to general search below if handle fails
      }
    }

    // 2. Final absolute fallback: Search YouTube for whatever they typed and grab the #1 channel result!
    try {
      const searchData = await fetchYouTube("/search", {
        part: "snippet",
        type: "channel",
        q: decodedInput,
        maxResults: "1",
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
    const data = await fetchYouTube("/channels", {
      part: "id,contentDetails,snippet,statistics",
      id: channelId,
    });
    if (data.items && data.items.length > 0) return data.items[0];
  }

  throw new Error(
    "Could not definitively resolve a YouTube channel from that input.",
  );
}

/**
 * 2. Fetches the 50 most recent uploads for a given uploads playlist ID
 */
export async function getRecentVideos(
  uploadsPlaylistId: string,
  maxResults: number = 50,
) {
  const data = await fetchYouTube("/playlistItems", {
    part: "snippet",
    playlistId: uploadsPlaylistId,
    maxResults: maxResults.toString(),
  });

  if (!data.items || data.items.length === 0) return [];

  // YouTube's /videos endpoint requires comma separated IDs
  const videoIds = data.items
    .map((item: any) => item.snippet.resourceId.videoId)
    .join(",");

  const statsData = await fetchYouTube("/videos", {
    part: "statistics,snippet,contentDetails",
    id: videoIds,
  });

  return statsData.items || [];
}

function parseDuration(durationStr: string) {
  const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * 3. Cleans the raw YouTube payload and mathematically derives the
 *    channel's current momentum baselines to tag Top Performers (percentile based).
 */
export function calculateMomentum(rawVideos: any[]) {
  const now = new Date();

  // Map and calculate discrete values
  const processed = rawVideos.map((v) => {
    const publishedAt = new Date(v.snippet.publishedAt);
    // Determine the age in days (with a floor of 1 to prevent infinity VPD)
    const ageInDays = Math.max(
      1,
      (now.getTime() - publishedAt.getTime()) / (1000 * 3600 * 24),
    );

    const views = parseInt(v.statistics.viewCount || "0", 10);
    const likes = parseInt(v.statistics.likeCount || "0", 10);
    const comments = parseInt(v.statistics.commentCount || "0", 10);

    const durationSeconds = parseDuration(v.contentDetails?.duration || "");
    const isShort = durationSeconds > 0 && durationSeconds <= 61; // YouTube officially allows up to 60s, +1s pad

    // Core custom velocity metric
    const viewsPerDay = Math.floor(views / ageInDays);

    return {
      id: v.id,
      title: v.snippet.title,
      thumbnail:
        v.snippet.thumbnails.maxres?.url ||
        v.snippet.thumbnails.high?.url ||
        v.snippet.thumbnails.default?.url,
      publishedAt: v.snippet.publishedAt,
      durationSeconds,
      isShort,
      // Pass through pure numbers
      views,
      likes,
      comments,
      viewsPerDay,
      // Placeholder for heuristic badge
      momentum: "Normal",
      tags: v.snippet.tags || [],
      description: v.snippet.description || "",
    };
  });

  if (processed.length === 0) return [];

  // Sort purely by Views Per Day to determine percentiles across this batch
  const sortedByVpd = [...processed].sort(
    (a, b) => b.viewsPerDay - a.viewsPerDay,
  );

  // Heuristic: Top 15% is 'Trending' (Viral breakout)
  //            Next 35% is 'Growing Fast' (Strong performer)
  //            Bottom 50% is 'Normal'
  const trendingCount = Math.max(1, Math.ceil(processed.length * 0.15));
  const growingCount = Math.max(1, Math.ceil(processed.length * 0.35));

  sortedByVpd.forEach((v, index) => {
    const original = processed.find((p) => p.id === v.id);
    if (!original) return;

    if (index < trendingCount) {
      original.momentum = "Trending";
    } else if (index < trendingCount + growingCount) {
      original.momentum = "Growing Fast";
    } else {
      original.momentum = "Normal";
    }
  });

  return processed;
}

/**
 * 4. Extracts advanced comparative metrics required for the UI Highlight Cards
 */
export function generatePerformanceSummary(videos: any[]) {
  if (!videos || videos.length === 0) return null;

  // 1. Averages & Counts
  const totalViews = videos.reduce((sum, v) => sum + v.views, 0);
  const totalLikes = videos.reduce((sum, v) => sum + v.likes, 0);
  const totalComments = videos.reduce((sum, v) => sum + v.comments, 0);

  const avgViews = Math.floor(totalViews / videos.length);
  const avgEngagement =
    totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0;

  // Videos per week (assuming max 30 window)
  const daysInWindow = Math.max(
    1,
    (new Date().getTime() -
      new Date(videos[videos.length - 1].publishedAt).getTime()) /
      (1000 * 3600 * 24),
  );
  const cadence = (videos.length / daysInWindow) * 7;

  // New Strategy Analysis Engine
  const strategyCards: any[] = [];

  // 1. Upload Schedule
  if (videos.length > 1) {
    const sortedByDate = [...videos].sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
    const oldestDate = new Date(
      sortedByDate[sortedByDate.length - 1].publishedAt,
    );
    const newestDate = new Date(sortedByDate[0].publishedAt);

    const now = new Date();
    const daysSinceLastUpload =
      (now.getTime() - newestDate.getTime()) / (1000 * 3600 * 24);

    let scheduleValue = "";

    if (daysSinceLastUpload > 90) {
      const years = Math.floor(daysSinceLastUpload / 365);
      const months = Math.floor(daysSinceLastUpload / 30);

      if (years >= 1) {
        scheduleValue = `Dormant: No uploads in ${years} ${years === 1 ? "year" : "years"}.`;
      } else {
        scheduleValue = `Dormant: No uploads in ${months} ${months === 1 ? "month" : "months"}.`;
      }
    } else {
      const totalDays = Math.max(
        1,
        (newestDate.getTime() - oldestDate.getTime()) / (1000 * 3600 * 24),
      );
      const avgDaysNumeric = totalDays / (videos.length - 1);

      if (avgDaysNumeric < 1) {
        const avgHours = Math.max(1, Math.round(avgDaysNumeric * 24));
        scheduleValue = `Averages 1 new upload every ${avgHours} ${avgHours === 1 ? "hour" : "hours"}.`;
      } else {
        const avgDays = avgDaysNumeric.toFixed(1);
        const cleanDays = avgDays.endsWith(".0")
          ? Math.floor(parseFloat(avgDays))
          : avgDays;
        scheduleValue = `Averages 1 new upload every ${cleanDays} ${cleanDays === 1 ? "day" : "days"}.`;
      }
    }

    strategyCards.push({
      id: "schedule",
      label: "Upload Schedule",
      value: scheduleValue,
    });
  }

  // 2. Top Keywords
  const stopWords = new Set([
    "the",
    "and",
    "to",
    "a",
    "of",
    "in",
    "for",
    "is",
    "on",
    "that",
    "by",
    "this",
    "with",
    "i",
    "you",
    "it",
    "not",
    "or",
    "be",
    "are",
    "from",
    "at",
    "as",
    "your",
    "how",
    "why",
    "what",
    "my",
  ]);
  const wordCounts: Record<string, number> = {};
  videos.forEach((v) => {
    const rawWords = v.title.toLowerCase().match(/\w+/g) || [];
    rawWords.forEach((word: string) => {
      if (word.length > 3 && !stopWords.has(word) && isNaN(Number(word)))
        wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
    if (v.tags) {
      v.tags.forEach((tag: string) => {
        const dTag = tag.toLowerCase().replace(/[^a-z0-9\s]/g, "");
        dTag.split(" ").forEach((tw: string) => {
          if (tw.length > 3 && !stopWords.has(tw) && isNaN(Number(tw)))
            wordCounts[tw] = (wordCounts[tw] || 0) + 1;
        });
      });
    }
  });
  const topWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map((w) => w[0]);
  strategyCards.push({
    id: "keywords",
    label: "Top Keywords",
    value:
      topWords.length > 0
        ? `Highly targets SEO around: ${topWords.join(", ")}.`
        : "No consistent SEO keywords targeted.",
  });

  // 3. Video Length Strategy
  const shorts = videos.filter((v) => v.isShort);
  const longs = videos.filter((v) => !v.isShort);
  const avgShortViews =
    shorts.length > 0
      ? shorts.reduce((sum, v) => sum + v.views, 0) / shorts.length
      : 0;
  const avgLongViews =
    longs.length > 0
      ? longs.reduce((sum, v) => sum + v.views, 0) / longs.length
      : 0;

  let lengthStr = "Draws even views across Shorts and Long-form.";
  if (shorts.length === 0)
    lengthStr = "Relies exclusively on Long-form video execution.";
  else if (longs.length === 0)
    lengthStr = "Relies exclusively on YouTube Shorts execution.";
  else if (avgLongViews > avgShortViews * 1.5)
    lengthStr = `Long-form videos drive ${(avgLongViews / avgShortViews).toFixed(1)}x more views per upload than Shorts.`;
  else if (avgShortViews > avgLongViews * 1.5)
    lengthStr = `Shorts drive ${(avgShortViews / avgLongViews).toFixed(1)}x more views per upload than Long-form.`;

  strategyCards.push({
    id: "length",
    label: "Video Length Strategy",
    value: lengthStr,
  });

  // 4. Link & Affiliate Strategy
  let videosWithLinks = 0;
  videos.forEach((v) => {
    if (
      v.description &&
      (v.description.includes("http://") ||
        v.description.includes("https://") ||
        v.description.includes("bit.ly") ||
        v.description.includes("amzn.to"))
    ) {
      videosWithLinks++;
    }
  });
  const linkPct = Math.floor((videosWithLinks / videos.length) * 100);
  strategyCards.push({
    id: "links",
    label: "Link & Affiliate Strategy",
    value: `${linkPct}% of their videos actively funnel viewers to external links.`,
  });

  // 5. Title Length Strategy
  const topViral = [...videos]
    .sort((a, b) => b.viewsPerDay - a.viewsPerDay)
    .slice(0, Math.max(1, Math.floor(videos.length * 0.2)));
  const avgTitleLength =
    topViral.reduce((sum, v) => sum + v.title.length, 0) / topViral.length;
  strategyCards.push({
    id: "titles",
    label: "Title Length Strategy",
    value: `Viral hits strictly utilize ${avgTitleLength < 45 ? "short, punchy" : avgTitleLength > 65 ? "long, highly descriptive" : "medium-length"} titles (avg. ${Math.floor(avgTitleLength)} chars).`,
  });

  return {
    totals: {
      viewsThisMonth: totalViews,
      avgViews: avgViews,
      avgEngagement: avgEngagement.toFixed(1) + "%",
      cadence: cadence >= 1 ? `${Math.round(cadence)} per week` : `1 per week`,
      publishedThisMonth: videos.length,
    },
    strategy: strategyCards,
  };
}
