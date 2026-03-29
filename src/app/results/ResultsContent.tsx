"use client";

import { useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { SearchX } from "lucide-react";
import Link from "next/link";
import { isWithinDate } from "@/lib/utils";
import LoadingState from "@/components/results/LoadingState";
import EmptyState from "@/components/results/EmptyState";
import VideoCard from "@/components/results/VideoCard";
import ChannelHeader from "@/components/results/ChannelHeader";
import StrategyGrid from "@/components/results/StrategyGrid";
import ResultsFilterBar from "@/components/results/ResultsFilterBar";
import { DashboardData, VideoData } from "@/types";

export default function ResultsContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const channel = searchParams.get("channel") || "";
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [animationDone, setAnimationDone] = useState(false);

  // Initialize UI state directly from URL query parameters (supports Shared Links)
  const [typeFilter, setTypeFilter] = useState<"All" | "Shorts" | "Long-form">(
    (searchParams.get("type") as "All" | "Shorts" | "Long-form") || "All",
  );
  const [breakoutOnly, setBreakoutOnly] = useState(
    searchParams.get("breakout") === "true",
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [dateFilter, setDateFilter] = useState(
    searchParams.get("date") || "This Month",
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10),
  );
  const [sortFilter, setSortFilter] = useState(
    searchParams.get("sort") || "Total Views",
  );

  // Reset page safely if critical filters alter lengths, but skip initial mount
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setCurrentPage(1);
  }, [typeFilter, breakoutOnly, searchQuery, dateFilter, sortFilter]);

  // Silently sync local UI state changes to the Browser URL to ensure exactly accurate sharing
  useEffect(() => {
    if (!channel) return;
    const params = new URLSearchParams();
    params.set("channel", channel);

    if (typeFilter !== "All") params.set("type", typeFilter);
    if (breakoutOnly) params.set("breakout", "true");
    if (searchQuery) params.set("q", searchQuery);
    if (dateFilter !== "This Month") params.set("date", dateFilter);
    if (sortFilter !== "Total Views") params.set("sort", sortFilter);
    if (currentPage > 1) params.set("page", currentPage.toString());

    // Use native history API to update URL without triggering Next.js React rerender loops
    const newUrl = `${pathname}?${params.toString()}`;
    window.history.replaceState(
      { ...window.history.state, as: newUrl, url: newUrl },
      "",
      newUrl,
    );
  }, [
    typeFilter,
    breakoutOnly,
    searchQuery,
    dateFilter,
    sortFilter,
    currentPage,
    channel,
    pathname,
  ]);

  useEffect(() => {
    if (!channel) return;
    setData(null);
    setAnimationDone(false);

    fetch(`/api/analyze?channel=${encodeURIComponent(channel)}`)
      .then((res) => res.json().then((j) => ({ status: res.status, data: j })))
      .then(({ status, data }) => {
        if (status !== 200 || data.error)
          throw new Error(data.error || "Failed to load analysis");
        setData(data);
      })
      .catch((err) => setError(err.message));
  }, [channel]);

  // Trip the ErrorBoundary dynamically
  if (error) {
    throw new Error(error);
  }

  if (!data || !animationDone) {
    return (
      <div className="flex-1 w-full relative flex flex-col">
        <LoadingState
          onComplete={() => setAnimationDone(true)}
        />
      </div>
    );
  }

  if (!data.videos || data.videos.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex-1 w-full bg-[#f8fafc] flex flex-col">
      {/* Top Bar Header */}
      <header className="w-full h-[72px] bg-white border-b border-gray-100/80 px-6 lg:px-10 relative">
        <div className="w-full h-full flex items-center">
          {/* Brand - Pinned to left edge for original airy layout */}
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-shrink-0 z-10"
          >
            <div className="w-[32px] h-[32px] bg-[#0a0f1c] text-white flex items-center justify-center rounded-[10px] text-[10px] font-bold tracking-wider shadow-sm">
              CS
            </div>
            <div className="font-bold text-[14px] text-[#0a0f1c] tracking-tight translate-y-[1px]">
              Channel Scope
            </div>
          </Link>

          {/* Absolute Centered Wrapper - Forces search to align with content grid regardless of logo width */}
          <div className="absolute inset-x-0 inset-y-0 flex justify-center pointer-events-none">
            <div className="max-w-[1280px] w-full flex justify-end items-center px-6 lg:px-10 pointer-events-auto">
              <div className="hidden md:block w-full max-w-[320px]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const val = (
                      e.currentTarget.elements.namedItem(
                        "channelSearch",
                      ) as HTMLInputElement
                    ).value;
                    if (val)
                      window.location.href =
                        "/results?channel=" + encodeURIComponent(val);
                  }}
                  className="relative flex items-center"
                >
                  <input
                    name="channelSearch"
                    type="text"
                    placeholder="Analyze new channel..."
                    className="w-full bg-gray-50/50 border border-gray-100/80 rounded-xl pl-4 pr-10 py-2 text-[12px] font-medium outline-none focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-gray-400"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 p-1 text-gray-400 hover:text-blue-500 transition-colors"
                    title="Analyze channel"
                  >
                    <SearchX className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </header>

      <ChannelHeader data={data} />

      <div className="flex-1 max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-6 md:py-10">
        <StrategyGrid strategy={data.summary?.strategy || []} />

        <ResultsFilterBar
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          sortFilter={sortFilter}
          setSortFilter={setSortFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          breakoutOnly={breakoutOnly}
          setBreakoutOnly={setBreakoutOnly}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <h2 className="text-[18px] md:text-xl font-bold text-gray-900 mb-6 tracking-tight">
          Videos Crushing It{" "}
          {dateFilter === "All Time" ? "(All Time)" : dateFilter}
        </h2>

        {/* Video List */}
        <div className="flex flex-col gap-4">
          {(() => {
            const finalVideos = data.videos
              .filter(
                (v: VideoData) =>
                  typeFilter === "All" ||
                  (typeFilter === "Shorts" && v.isShort) ||
                  (typeFilter === "Long-form" && !v.isShort),
              )
              .filter((v: VideoData) =>
                breakoutOnly ? v.momentum !== "Normal" : true,
              )
              .filter(
                (v: VideoData) =>
                  searchQuery === "" ||
                  v.title.toLowerCase().includes(searchQuery.toLowerCase()),
              )
              .filter((v: VideoData) => isWithinDate(v.publishedAt, dateFilter))
              .sort((a: VideoData, b: VideoData) => {
                if (sortFilter === "Total Views")
                  return (b.views || 0) - (a.views || 0);
                if (sortFilter === "Momentum")
                  return (b.viewsPerDay || 0) - (a.viewsPerDay || 0);
                if (sortFilter === "Engagement") {
                  const aEng =
                    ((a.likes || 0) + (a.comments || 0)) / (a.views || 1);
                  const bEng =
                    ((b.likes || 0) + (b.comments || 0)) / (b.views || 1);
                  return bEng - aEng;
                }
                // 'Latest' (default)
                return (
                  new Date(b.publishedAt).getTime() -
                  new Date(a.publishedAt).getTime()
                );
              });

            const paginated = finalVideos.slice(
              (currentPage - 1) * 6,
              currentPage * 6,
            );
            const totalPages = Math.ceil(finalVideos.length / 6);

            if (finalVideos.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center p-14 bg-white border border-gray-100 rounded-[18px] text-center shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
                  <SearchX className="w-10 h-10 text-gray-300 mb-3" />
                  <h3 className="text-[14px] font-bold text-gray-900">
                    No videos found
                  </h3>
                  <p className="text-[12px] text-gray-500 font-medium max-w-[200px] mt-1 line-clamp-2">
                    Try adjusting your date range or search query to see more
                    results.
                  </p>
                </div>
              );
            }

            return (
              <>
                {paginated.map((video: VideoData, i: number) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    rank={(currentPage - 1) * 6 + i + 1}
                  />
                ))}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <span className="text-[12px] text-gray-500 font-medium">
                      Showing {(currentPage - 1) * 6 + 1} to{" "}
                      {Math.min(currentPage * 6, finalVideos.length)} of{" "}
                      {finalVideos.length} videos
                    </span>
                    <div className="flex gap-2">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-[12px] font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all shadow-sm"
                      >
                        Previous
                      </button>
                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-[12px] font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all shadow-sm"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>

      </div>
    </div>
  );
}
