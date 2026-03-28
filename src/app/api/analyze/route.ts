import { NextRequest, NextResponse } from 'next/server';
import { resolveChannel, getRecentVideos, calculateMomentum, generatePerformanceSummary } from '@/services/youtube';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const channelUrl = searchParams.get('channel');

  if (!channelUrl) {
    return NextResponse.json({ error: 'Channel URL or handle is required' }, { status: 400 });
  }

  try {
    const channelDetails = await resolveChannel(channelUrl);
    const uploadsPlaylistId = channelDetails?.contentDetails?.relatedPlaylists?.uploads;
    
    if (!uploadsPlaylistId) {
      return NextResponse.json({ error: 'Could not find channel uploads playlist' }, { status: 404 });
    }

    const rawVideos = await getRecentVideos(uploadsPlaylistId);
    
    // Process the stats and calculate momentum
    const processedVideos = calculateMomentum(rawVideos);
    const summary = generatePerformanceSummary(processedVideos);

    return NextResponse.json({
      success: true,
      channel: channelDetails.snippet,
      channelStats: channelDetails.statistics,
      summary: summary,
      videos: processedVideos
    });

  } catch (error: any) {
    console.error("Analysis API Error:", error);
    return NextResponse.json({ error: error.message || 'Failed to analyze channel' }, { status: 500 });
  }
}
