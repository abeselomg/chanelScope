import React from 'react';
import { Play, TrendingUp, Eye, ThumbsUp, MessageSquare, Clock } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import Sparkline from '@/components/ui/Sparkline';
import Tooltip from '@/components/Tooltip';

import { VideoData } from '@/types';

const VideoCard = React.memo(function VideoCard({ video, rank }: { video: VideoData; rank: number }) {
  const engagementRate = video.views > 0
    ? (((video.likes + video.comments) / video.views) * 100).toFixed(1)
    : 0;

  return (
    <div className="bg-white border border-gray-100 rounded-[20px] p-4 flex flex-col lg:flex-row items-stretch lg:items-center gap-5 lg:gap-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all">
      {/* Thumbnail & Rank */}
      <div className="flex items-start gap-4 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#0a0f1c] text-white flex items-center justify-center font-bold text-[13px] flex-shrink-0 mt-1">
          {rank}
        </div>

        {/* Thumbnail */}
        <div className="relative w-[150px] aspect-video rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 group cursor-pointer shadow-sm">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-lg backdrop-blur-sm">
              <Play className="w-4 h-4 text-gray-900 ml-0.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Info & Stats Wrapper */}
      <div className="flex-1 min-w-0 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Title & Tags */}
        <div className="flex-1 min-w-0 lg:pr-4">
          <a
            href={`https://youtube.com/watch?v=${video.id}`}
            title={video.title}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-[14px] md:text-[15px] font-bold text-gray-900 mb-2 leading-snug line-clamp-2 hover:text-blue-600 transition-colors"
          >
            {video.title}
          </a>
          <div className="flex flex-wrap items-center gap-2.5 text-[10px] md:text-[11px] font-bold">
            <span className="text-gray-400 font-medium whitespace-nowrap">
              {new Date(video.publishedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span
              className={`px-2 py-0.5 rounded whitespace-nowrap ${video.isShort ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"}`}
            >
              {video.isShort ? "SHORT" : "LONG-FORM"}
            </span>
            {video.momentum === "Trending" && (
              <span className="flex items-center gap-1 text-[#00a36c] whitespace-nowrap">
                <TrendingUp className="w-3 h-3" /> Breakout
              </span>
            )}
            {video.momentum === "Growing Fast" && (
              <span className="flex items-center gap-1 text-purple-600 whitespace-nowrap">
                <TrendingUp className="w-3 h-3" /> Growing
              </span>
            )}
          </div>
        </div>

        {/* Column Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:flex lg:items-center gap-x-8 gap-y-5 lg:gap-7 xl:gap-9 py-3 lg:py-0 border-t lg:border-t-0 border-gray-50 lg:pr-2">
          <div className="flex flex-col min-w-[64px]">
            <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">
              Views
            </span>
            <div className="flex items-center gap-1.5">
              <Eye className="w-3 h-3 text-gray-400" />
              <span className="text-[13px] font-bold text-gray-900">
                {formatNumber(video.views)}
              </span>
            </div>
          </div>
          <div className="flex flex-col min-w-[70px]">
            <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">
              Views/day
            </span>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-gray-400" />
              <span className="text-[13px] font-bold text-gray-900">
                {formatNumber(video.viewsPerDay)}
              </span>
            </div>
          </div>
          <div className="flex flex-col min-w-[64px]">
            <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">
              Likes
            </span>
            <div className="flex items-center gap-1.5">
              <ThumbsUp className="w-3 h-3 text-gray-400" />
              <span className="text-[13px] font-bold text-gray-900">
                {formatNumber(video.likes)}
              </span>
            </div>
          </div>
          <div className="flex flex-col min-w-[70px]">
            <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">
              Comments
            </span>
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-3 h-3 text-gray-400" />
              <span className="text-[13px] font-bold text-gray-900">
                {formatNumber(video.comments)}
              </span>
            </div>
          </div>
          <Tooltip content="Interactions per 100 views">
            <div className="flex flex-col min-w-[64px] cursor-help">
              <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">
                Eng. rate
              </span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-[13px] font-bold text-gray-900">
                  {engagementRate}%
                </span>
              </div>
            </div>
          </Tooltip>
          <Tooltip content="Momentum: Performance trend over the last 30 days">
            <div className="flex items-center justify-start lg:ml-2 pt-2 lg:pt-0 cursor-help">
              <Sparkline momentum={video.momentum} />
            </div>
          </Tooltip>
        </div>
      </div>
    </div>
  );
});

export default VideoCard;
