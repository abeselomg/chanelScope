import React, { useState } from 'react';
import Image from 'next/image';
import { Link as LinkIcon, Check } from 'lucide-react';
import { DashboardData } from '@/types';
import { formatNumber } from '@/lib/utils';

export default function ChannelHeader({ data }: { data: DashboardData }) {
  const [imgError, setImgError] = useState(false);
  const [showToast, setShowToast] = useState(false);

  if (!data || !data.channel) return null;

  return (
    <>
      <div className="w-full bg-white border-b border-gray-100/80 py-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
        <div className="max-w-[1280px] w-full mx-auto px-6 lg:px-10 flex flex-col gap-6">
          {/* Top Row: Avatar, Title, Tags, Actions */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {!imgError &&
              (data.channel.thumbnails?.high?.url ||
                data.channel.thumbnails?.default?.url) ? (
                <Image
                  src={
                    data.channel.thumbnails?.high?.url ||
                    data.channel.thumbnails?.default?.url ||
                    ''
                  }
                  alt={data.channel.title}
                  width={64}
                  height={64}
                  unoptimized
                  onError={() => setImgError(true)}
                  className="w-[64px] h-[64px] flex-shrink-0 rounded-[16px] object-cover shadow-sm border border-gray-200"
                />
              ) : (
                <div className="w-[64px] h-[64px] flex-shrink-0 rounded-[16px] bg-[#0a0f1c] text-white flex items-center justify-center text-[28px] font-bold shadow-sm">
                  {data.channel.title?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-3">
                  <h1 className="text-[20px] font-bold text-gray-900 tracking-tight leading-none">
                    {data.channel.title}
                  </h1>
                </div>

                {/* Dynamically Generated Semantic Tags */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10.5px] font-bold tracking-wide">
                    High momentum
                  </span>
                  {data.videos && data.videos.filter((v) => v.isShort).length >
                    data.videos.length / 2 && (
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10.5px] font-bold tracking-wide">
                      Shorts-heavy strategy
                    </span>
                  )}
                  {data.summary && parseInt(data.summary.totals?.cadence || "0") >= 2 && (
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10.5px] font-bold tracking-wide">
                      Consistent publisher
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3 md:ml-auto">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setShowToast(true);
                  setTimeout(() => setShowToast(false), 3000);
                }}
                className="flex items-center gap-2 px-4 py-1.5 bg-gray-900 text-white text-[12px] font-bold rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                Copy link
              </button>
            </div>
          </div>

          {/* Bottom Row: Stats Strip */}
          <div className="flex flex-wrap items-center gap-x-8 lg:gap-x-14 gap-y-6 pt-1">
            <div className="flex flex-col min-w-[110px] sm:min-w-0">
              <span className="text-[10px] font-medium text-gray-500 mb-0.5">
                Subscribers
              </span>
              <span className="text-[14px] font-bold text-gray-900 tracking-tight">
                {formatNumber(data.channelStats?.subscriberCount)}
              </span>
            </div>
            <div className="flex flex-col min-w-[110px] sm:min-w-0">
              <span className="text-[10px] font-medium text-gray-500 mb-0.5">
                Total videos
              </span>
              <span className="text-[14px] font-bold text-gray-900 tracking-tight">
                {formatNumber(data.channelStats?.videoCount)}
              </span>
            </div>
            <div className="flex flex-col min-w-[110px] sm:min-w-0">
              <span className="text-[10px] font-medium text-gray-500 mb-0.5">
                Published this month
              </span>
              <span className="text-[14px] font-bold text-gray-900 tracking-tight">
                {data.summary?.totals?.publishedThisMonth}
              </span>
            </div>
            <div className="flex flex-col min-w-[110px] sm:min-w-0">
              <span className="text-[10px] font-medium text-gray-500 mb-0.5">
                Views this month
              </span>
              <span className="text-[14px] font-bold text-gray-900 tracking-tight">
                {formatNumber(data.summary?.totals?.viewsThisMonth)}
              </span>
            </div>
            <div className="flex flex-col min-w-[110px] sm:min-w-0">
              <span className="text-[10px] font-medium text-gray-500 mb-0.5">
                Avg views/upload
              </span>
              <span className="text-[14px] font-bold text-gray-900 tracking-tight">
                {formatNumber(data.summary?.totals?.avgViews)}
              </span>
            </div>
            <div className="flex flex-col min-w-[110px] sm:min-w-0">
              <span className="text-[10px] font-medium text-gray-500 mb-0.5">
                Avg engagement
              </span>
              <span className="text-[14px] font-bold text-gray-900 tracking-tight">
                {data.summary?.totals?.avgEngagement}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 right-8 bg-[#0a0f1c] text-white px-5 py-3.5 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-8 z-[100] transition-all">
          <div className="w-5 h-5 bg-[#00a36c] rounded-full flex items-center justify-center">
            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          </div>
          <span className="text-[13px] font-bold tracking-wide">
            Link copied to clipboard!
          </span>
        </div>
      )}
    </>
  );
}
