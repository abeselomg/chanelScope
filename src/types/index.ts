export interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

export interface ChannelProfile {
  title: string;
  thumbnails?: {
    default?: Thumbnail;
    high?: Thumbnail;
  };
}

export interface ChannelStats {
  subscriberCount: string;
  videoCount: string;
}

export interface StrategyInsight {
  id: string;
  label: string;
  value: string;
}

export interface ChannelSummaryTotals {
  cadence: string;
  publishedThisMonth: number;
  viewsThisMonth: number;
  avgViews: number;
  avgEngagement: string;
}

export interface ChannelSummary {
  totals: ChannelSummaryTotals;
  strategy: StrategyInsight[];
}

export interface VideoData {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  viewsPerDay: number;
  momentum: string;
  isShort: boolean;
}

export interface DashboardData {
  channel: ChannelProfile;
  channelStats: ChannelStats;
  summary: ChannelSummary;
  videos: VideoData[];
}
