"use client";

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Suspense, useState, useEffect, useRef } from 'react';
import { Loader2, Check, SearchX, Search, Link as LinkIcon, TrendingUp, Zap, Target, Trophy, MessageCircle, Play, RefreshCw, Download, Share, Calendar, ChevronDown, Eye, ThumbsUp, MessageSquare, Clock, ArrowDownUp } from 'lucide-react';
import Link from 'next/link';
import Tooltip from '@/components/Tooltip';

function formatNumber(num: number | string) {
  const n = typeof num === 'string' ? parseInt(num, 10) : num;
  if (isNaN(n)) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toLocaleString();
}

const Sparkline = ({ momentum }: { momentum: string }) => {
  // We pseudo-generate a curve representing velocity since the standard Youtube v3 API 
  // does not provide timeseries data without explicit OAuth per-channel access.
  let path = "M 0 30 C 10 30, 20 15, 30 15 C 50 15, 60 20, 80 20 C 90 20, 95 25, 100 25";
  let color = "stroke-blue-500";
  
  if (momentum === 'Trending') {
    path = "M 0 35 C 10 35, 15 5, 25 5 C 40 5, 60 15, 80 15 C 90 15, 95 10, 100 5";
    color = "stroke-[#00a36c]";
  } else if (momentum === 'Normal') {
    path = "M 0 25 C 20 25, 40 28, 60 25 C 80 22, 90 20, 100 15";
    color = "stroke-gray-300";
  }

  return (
    <div className="w-[50px] h-6 ml-4">
      <svg viewBox="0 0 100 40" className={`w-full h-full ${color} fill-none`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d={path} />
      </svg>
    </div>
  );
};

const StepItem = ({ current, target, text, num }: { current: number, target: number, text: string, num: number }) => {
  const isDone = current >= target;
  const isCurrent = current === target - 1;
  
  return (
    <div className={`flex items-center gap-3 text-[13px] transition-all duration-1000 ${isDone ? 'text-gray-900 font-medium' : isCurrent ? 'text-gray-900 font-bold' : 'text-gray-400 font-medium'}`}>
      <div className="relative w-[18px] h-[18px] flex-shrink-0">
        {/* Number Circle */}
        <div 
          className={`absolute inset-0 rounded-full flex items-center justify-center text-[9.5px] font-bold transition-all duration-1000 ${isDone ? 'opacity-0 scale-50' : 'opacity-100 scale-100'} ${isCurrent ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'}`}
        >
          {num}
        </div>
        {/* Green Check Circle */}
        <div 
          className={`absolute inset-0 rounded-full bg-[#00a36c] flex items-center justify-center transition-all duration-1000 ${isDone ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
        >
          <Check className="w-3 h-3 text-white" strokeWidth={3.5} />
        </div>
      </div>
      {text}
    </div>
  );
};

function LoadingState({ channel, onComplete }: { channel?: string, onComplete: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 1000);
    const t2 = setTimeout(() => setStep(2), 2200);
    const t3 = setTimeout(() => setStep(3), 3600);
    const t4 = setTimeout(() => {
      setStep(4);
      setTimeout(onComplete, 800); // Small pause for the last checkmark
    }, 4800);
    
    return () => { 
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div className="w-full max-w-[800px] mx-auto px-6 flex-1 flex flex-col items-center justify-center lg:justify-start lg:mt-24 pb-20">
      <Loader2 className="w-8 h-8 text-gray-300 animate-spin mb-10" />
      
      {/* Steps List */}
      <div className="flex flex-col gap-4 mb-16">
        <StepItem current={step} target={1} num={1} text="Scanning channel uploads..." />
        <StepItem current={step} target={2} num={2} text="Ranking this month's top performers..." />
        <StepItem current={step} target={3} num={3} text="Separating Shorts from Long-form..." />
        <StepItem current={step} target={4} num={4} text="Generating winning pattern insights..." />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center mt-20 px-6 text-center animate-in fade-in zoom-in duration-500">
      <div className="w-16 h-16 bg-gray-100 border border-gray-200 text-gray-400 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <SearchX className="w-7 h-7" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">No videos found</h2>
      <p className="text-[14px] text-gray-500 max-w-sm mb-8 leading-relaxed">
        This channel hasn't uploaded any videos in this timeframe. Try expanding your search or checking the URL.
      </p>
      <Link href="/">
        <button className="px-6 py-2.5 bg-[#0a0f1c] text-white text-[13px] font-semibold rounded-xl hover:bg-gray-800 transition-colors shadow-sm">
          Try a different channel
        </button>
      </Link>
    </div>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const channel = searchParams.get('channel') || '';
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [animationDone, setAnimationDone] = useState(false);

  // Initialize UI state directly from URL query parameters (supports Shared Links)
  const [typeFilter, setTypeFilter] = useState<'All' | 'Shorts' | 'Long-form'>((searchParams.get('type') as any) || 'All');
  const [breakoutOnly, setBreakoutOnly] = useState(searchParams.get('breakout') === 'true');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [dateFilter, setDateFilter] = useState(searchParams.get('date') || 'This Month');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [imgError, setImgError] = useState(false);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [sortFilter, setSortFilter] = useState(searchParams.get('sort') || 'Total Views');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

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
    params.set('channel', channel);
    
    if (typeFilter !== 'All') params.set('type', typeFilter);
    if (breakoutOnly) params.set('breakout', 'true');
    if (searchQuery) params.set('q', searchQuery);
    if (dateFilter !== 'This Month') params.set('date', dateFilter);
    if (sortFilter !== 'Total Views') params.set('sort', sortFilter);
    if (currentPage > 1) params.set('page', currentPage.toString());

    // Use native history API to update URL without triggering Next.js React rerender loops
    const newUrl = `${pathname}?${params.toString()}`;
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
  }, [typeFilter, breakoutOnly, searchQuery, dateFilter, sortFilter, currentPage, channel, pathname]);

  useEffect(() => {
    if (!channel) return;
    setData(null);
    setAnimationDone(false);
    
    fetch(`/api/analyze?channel=${encodeURIComponent(channel)}`)
      .then(res => res.json().then(j => ({ status: res.status, data: j })))
      .then(({ status, data }) => {
        if (status !== 200 || data.error) throw new Error(data.error || 'Failed to load analysis');
        setData(data);
      })
      .catch(err => setError(err.message));
  }, [channel]);

  // Trip the ErrorBoundary dynamically
  if (error) {
    throw new Error(error);
  }

  if (!data || !animationDone) {
    return (
      <div className="flex-1 w-full relative flex flex-col">
        <LoadingState channel={channel} onComplete={() => setAnimationDone(true)} />
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
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-shrink-0 z-10">
            <div className="w-[32px] h-[32px] bg-[#0a0f1c] text-white flex items-center justify-center rounded-[10px] text-[10px] font-bold tracking-wider shadow-sm">
              CS
            </div>
            <div className="font-bold text-[14px] text-[#0a0f1c] tracking-tight translate-y-[1px]">Channel Scope</div>
          </Link>

          {/* Absolute Centered Wrapper - Forces search to align with content grid regardless of logo width */}
          <div className="absolute inset-x-0 inset-y-0 flex justify-center pointer-events-none">
            <div className="max-w-[1280px] w-full flex justify-end items-center px-6 lg:px-10 pointer-events-auto">
              <div className="hidden md:block w-full max-w-[320px]">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const val = (e.currentTarget.elements.namedItem('channelSearch') as HTMLInputElement).value;
                    if (val) window.location.href = '/results?channel=' + encodeURIComponent(val);
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
                    <Search className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Channel Header Banner */}
      <div className="w-full bg-white border-b border-gray-100/80 py-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
        <div className="max-w-[1280px] w-full mx-auto px-6 lg:px-10 flex flex-col gap-6">
          
          {/* Top Row: Avatar, Title, Tags, Actions */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {!imgError && (data.channel?.thumbnails?.high?.url || data.channel?.thumbnails?.default?.url) ? (
                <img 
                  src={data.channel?.thumbnails?.high?.url || data.channel?.thumbnails?.default?.url} 
                  alt={data.channel?.title} 
                  onError={() => setImgError(true)}
                  className="w-[64px] h-[64px] flex-shrink-0 rounded-[16px] object-cover shadow-sm border border-gray-200"
                />
              ) : (
                <div className="w-[64px] h-[64px] flex-shrink-0 rounded-[16px] bg-[#0a0f1c] text-white flex items-center justify-center text-[28px] font-bold shadow-sm">
                  {data.channel?.title?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-3">
                  <h1 className="text-[20px] font-bold text-gray-900 tracking-tight leading-none">
                    {data.channel?.title}
                  </h1>
                </div>
                
                {/* Dynamically Generated Semantic Tags */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10.5px] font-bold tracking-wide">High momentum</span>
                  {data.videos.filter((v: any) => v.isShort).length > (data.videos.length / 2) && (
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10.5px] font-bold tracking-wide">Shorts-heavy strategy</span>
                  )}
                  {parseInt(data.summary?.totals?.cadence || '0') >= 2 && (
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10.5px] font-bold tracking-wide">Consistent publisher</span>
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
              <span className="text-[10px] font-medium text-gray-500 mb-0.5">Subscribers</span>
              <span className="text-[14px] font-bold text-gray-900 tracking-tight">{formatNumber(data.channelStats?.subscriberCount)}</span>
            </div>
            <div className="flex flex-col min-w-[110px] sm:min-w-0">
              <span className="text-[10px] font-medium text-gray-500 mb-0.5">Total videos</span>
              <span className="text-[14px] font-bold text-gray-900 tracking-tight">{formatNumber(data.channelStats?.videoCount)}</span>
            </div>
            <div className="flex flex-col min-w-[110px] sm:min-w-0">
              <span className="text-[10px] font-medium text-gray-500 mb-0.5">Published this month</span>
              <span className="text-[14px] font-bold text-gray-900 tracking-tight">{data.summary?.totals?.publishedThisMonth}</span>
            </div>
            <div className="flex flex-col min-w-[110px] sm:min-w-0">
              <span className="text-[10px] font-medium text-gray-500 mb-0.5">Views this month</span>
              <span className="text-[14px] font-bold text-gray-900 tracking-tight">{formatNumber(data.summary?.totals?.viewsThisMonth)}</span>
            </div>
            <div className="flex flex-col min-w-[110px] sm:min-w-0">
              <span className="text-[10px] font-medium text-gray-500 mb-0.5">Avg views/upload</span>
              <span className="text-[14px] font-bold text-gray-900 tracking-tight">{formatNumber(data.summary?.totals?.avgViews)}</span>
            </div>
            <div className="flex flex-col min-w-[110px] sm:min-w-0">
              <span className="text-[10px] font-medium text-gray-500 mb-0.5">Avg engagement</span>
              <span className="text-[14px] font-bold text-gray-900 tracking-tight">{data.summary?.totals?.avgEngagement}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 5 Grid Highlight Cards */}
      <div className="flex-1 max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-6 md:py-10">
        
        {/* Mobile-only Copy Link Button - Prominent placement above strategy grid */}
        <div className="flex md:hidden mb-8">
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setShowToast(true);
              setTimeout(() => setShowToast(false), 3000);
            }}
            className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 bg-gray-900 text-white text-[13px] font-bold rounded-xl active:scale-[0.97] transition-all shadow-lg shadow-gray-100/50"
          >
            <LinkIcon className="w-4 h-4" />
            Copy analysis link
          </button>
        </div>
        
        {/* Strategy Insights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10 w-full">
          {data.summary?.strategy?.map((card: any, i: number) => {
            const getIcon = (id: string, className: string) => {
              switch (id) {
                case 'schedule': return <Clock className={className} strokeWidth={2.5} />;
                case 'keywords': return <Target className={className} strokeWidth={2.5} />;
                case 'length': return <Play className={className} strokeWidth={2.5} />;
                case 'links': return <LinkIcon className={className} strokeWidth={2.5} />;
                case 'titles': return <MessageSquare className={className} strokeWidth={2.5} />;
                default: return <Zap className={className} strokeWidth={2.5} />;
              }
            };
            return (
              <div key={i} className="bg-white border border-gray-100 rounded-[18px] p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-start hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all min-h-[140px]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-blue-50/50 rounded-lg shrink-0">
                    {getIcon(card.id, "w-4 h-4 text-blue-600")}
                  </div>
                  <span className="text-[11px] font-medium text-gray-500 truncate">{card.label}</span>
                </div>
                <div className="text-[13px] font-bold text-gray-800 leading-relaxed">
                  {card.value}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-100 pb-5 mb-8 gap-4 px-0">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative shrink-0">
              <button 
                onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 font-semibold text-[12px] rounded-md hover:bg-gray-50 transition-colors shadow-sm outline-none whitespace-nowrap"
              >
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {dateFilter}
                <ChevronDown className="w-3.5 h-3.5 text-gray-300 ml-1" />
              </button>
              
              {dateDropdownOpen && (
                <div className="absolute top-full mt-2 left-0 w-[150px] bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-1.5 z-50">
                  {['All Time', 'This Week', 'This Month', 'Last 90 Days', 'This Year'].map(o => (
                    <button 
                      key={o} 
                      onClick={() => { setDateFilter(o); setDateDropdownOpen(false); }} 
                      className={`w-full text-left px-3 py-2 text-[12px] font-semibold rounded-lg transition-colors ${dateFilter === o ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative shrink-0">
              <button 
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 font-semibold text-[12px] rounded-md hover:bg-gray-50 transition-colors shadow-sm outline-none whitespace-nowrap"
              >
                <ArrowDownUp className="w-3.5 h-3.5 text-gray-400" />
                {sortFilter}
                <ChevronDown className="w-3.5 h-3.5 text-gray-300 ml-1" />
              </button>
              
              {sortDropdownOpen && (
                <div className="absolute top-full mt-2 left-0 w-[160px] bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-1.5 z-50">
                  {['Latest', 'Total Views', 'Momentum', 'Engagement'].map(s => (
                    <button 
                      key={s} 
                      onClick={() => { setSortFilter(s); setSortDropdownOpen(false); }} 
                      className={`w-full text-left px-3 py-2 text-[12px] font-semibold rounded-lg transition-colors ${sortFilter === s ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center bg-gray-100 rounded-md p-0.5 shrink-0">
              {['All', 'Shorts', 'Long-form'].map(t => (
                <button 
                  key={t}
                  onClick={() => setTypeFilter(t as any)}
                  className={`px-3 py-1.5 text-[12px] font-semibold rounded-md transition-all whitespace-nowrap ${typeFilter === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <Tooltip content="Hides the bottom 50% of the channel's performance">
              <button 
                onClick={() => setBreakoutOnly(!breakoutOnly)}
                className={`px-3 py-1.5 text-[12px] font-semibold rounded-md border transition-all shrink-0 whitespace-nowrap ${breakoutOnly ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm'}`}
              >
                Breakout only
              </button>
            </Tooltip>
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search videos..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-blue-500 w-full shadow-sm font-medium"
            />
          </div>
        </div>

        <h2 className="text-[18px] md:text-xl font-bold text-gray-900 mb-6 tracking-tight">Videos Crushing It {dateFilter === 'All Time' ? '(All Time)' : dateFilter}</h2>

        {/* Video List */}
        <div className="flex flex-col gap-4">
          {(() => {
            const isWithinDate = (dateStr: string, filterConfig: string) => {
              if (filterConfig === 'All Time') return true;
              const published = new Date(dateStr);
              const now = new Date();
              
              if (filterConfig === 'This Week') {
                const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
                return published >= sevenDaysAgo;
              }
              if (filterConfig === 'This Month') {
                return published.getMonth() === now.getMonth() && published.getFullYear() === now.getFullYear();
              }
              if (filterConfig === 'Last 90 Days') {
                const ninetyDaysAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
                return published >= ninetyDaysAgo;
              }
              if (filterConfig === 'This Year') {
                return published.getFullYear() === now.getFullYear();
              }
              return true;
            };

            const finalVideos = data.videos
              .filter((v: any) => typeFilter === 'All' || (typeFilter === 'Shorts' && v.isShort) || (typeFilter === 'Long-form' && !v.isShort))
              .filter((v: any) => breakoutOnly ? v.momentum !== 'Normal' : true)
              .filter((v: any) => searchQuery === '' || v.title.toLowerCase().includes(searchQuery.toLowerCase()))
              .filter((v: any) => isWithinDate(v.publishedAt, dateFilter))
              .sort((a: any, b: any) => {
                if (sortFilter === 'Total Views') return (b.views || 0) - (a.views || 0);
                if (sortFilter === 'Momentum') return (b.viewsPerDay || 0) - (a.viewsPerDay || 0);
                if (sortFilter === 'Engagement') {
                  const aEng = ((a.likes || 0) + (a.comments || 0)) / (a.views || 1);
                  const bEng = ((b.likes || 0) + (b.comments || 0)) / (b.views || 1);
                  return bEng - aEng;
                }
                // 'Latest' (default)
                return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
              });
            
            const paginated = finalVideos.slice((currentPage - 1) * 6, currentPage * 6);
            const totalPages = Math.ceil(finalVideos.length / 6);

            if (finalVideos.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center p-14 bg-white border border-gray-100 rounded-[18px] text-center shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
                  <SearchX className="w-10 h-10 text-gray-300 mb-3" />
                  <h3 className="text-[14px] font-bold text-gray-900">No videos found</h3>
                  <p className="text-[12px] text-gray-500 font-medium max-w-[200px] mt-1 line-clamp-2">Try adjusting your date range or search query to see more results.</p>
                </div>
              );
            }

            return (
              <>
                {paginated.map((video: any, i: number) => (
                  <div key={video.id} className="bg-white border border-gray-100 rounded-[20px] p-4 flex flex-col lg:flex-row items-stretch lg:items-center gap-5 lg:gap-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all">
                    {/* Thumbnail & Rank */}
                    <div className="flex items-start gap-4 flex-shrink-0">
                      <div className="w-8 h-8 rounded-lg bg-[#0a0f1c] text-white flex items-center justify-center font-bold text-[13px] flex-shrink-0 mt-1">
                        {(currentPage - 1) * 6 + i + 1}
                      </div>
                      
                      {/* Thumbnail */}
                      <div className="relative w-[150px] aspect-video rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 group cursor-pointer shadow-sm">
                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                  <a href={`https://youtube.com/watch?v=${video.id}`} title={video.title} target="_blank" rel="noopener noreferrer" className="block text-[14px] md:text-[15px] font-bold text-gray-900 mb-2 leading-snug line-clamp-2 hover:text-blue-600 transition-colors">
                    {video.title}
                  </a>
                  <div className="flex flex-wrap items-center gap-2.5 text-[10px] md:text-[11px] font-bold">
                    <span className="text-gray-400 font-medium whitespace-nowrap">
                      {new Date(video.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className={`px-2 py-0.5 rounded whitespace-nowrap ${video.isShort ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                      {video.isShort ? 'SHORT' : 'LONG-FORM'}
                    </span>
                    {video.momentum === 'Trending' && (
                      <span className="flex items-center gap-1 text-[#00a36c] whitespace-nowrap">
                        <TrendingUp className="w-3 h-3" /> Breakout
                      </span>
                    )}
                    {video.momentum === 'Growing Fast' && (
                      <span className="flex items-center gap-1 text-purple-600 whitespace-nowrap">
                        <TrendingUp className="w-3 h-3" /> Growing
                      </span>
                    )}
                  </div>
                </div>

                {/* Column Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:flex lg:items-center gap-x-8 gap-y-5 lg:gap-7 xl:gap-9 py-3 lg:py-0 border-t lg:border-t-0 border-gray-50 lg:pr-2">
                  <div className="flex flex-col min-w-[64px]">
                    <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">Views</span>
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-3 h-3 text-gray-400" />
                      <span className="text-[13px] font-bold text-gray-900">{formatNumber(video.views)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col min-w-[70px]">
                    <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">Views/day</span>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3 text-gray-400" />
                      <span className="text-[13px] font-bold text-gray-900">{formatNumber(video.viewsPerDay)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col min-w-[64px]">
                    <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">Likes</span>
                    <div className="flex items-center gap-1.5">
                      <ThumbsUp className="w-3 h-3 text-gray-400" />
                      <span className="text-[13px] font-bold text-gray-900">{formatNumber(video.likes)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col min-w-[70px]">
                    <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">Comments</span>
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-3 h-3 text-gray-400" />
                      <span className="text-[13px] font-bold text-gray-900">{formatNumber(video.comments)}</span>
                    </div>
                  </div>
                  <Tooltip content="Interactions per 100 views">
                    <div className="flex flex-col min-w-[64px] cursor-help">
                      <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">Eng. rate</span>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-[13px] font-bold text-gray-900">
                          {video.views > 0 ? ((video.likes + video.comments) / video.views * 100).toFixed(1) : 0}%
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
            ))}
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <span className="text-[12px] text-gray-500 font-medium">
                      Showing {(currentPage - 1) * 6 + 1} to {Math.min(currentPage * 6, finalVideos.length)} of {finalVideos.length} videos
                    </span>
                    <div className="flex gap-2">
                      <button 
                        disabled={currentPage === 1} 
                        onClick={() => setCurrentPage(p => p - 1)} 
                        className="px-4 py-2 border border-gray-200 rounded-lg text-[12px] font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all shadow-sm"
                      >
                        Previous
                      </button>
                      <button 
                        disabled={currentPage === totalPages} 
                        onClick={() => setCurrentPage(p => p + 1)} 
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
        
        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-8 right-8 bg-[#0a0f1c] text-white px-5 py-3.5 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-8 z-[100] transition-all">
            <div className="w-5 h-5 bg-[#00a36c] rounded-full flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
            </div>
            <span className="text-[13px] font-bold tracking-wide">Link copied to clipboard!</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Results() {
  return (
    <main className="min-h-screen bg-grid selection:bg-blue-100 selection:text-blue-900 flex flex-col font-sans relative">
      <Suspense fallback={<div className="p-8 text-center text-gray-500 flex-1">Loading Application...</div>}>
         <ResultsContent />
      </Suspense>
    </main>
  );
}
