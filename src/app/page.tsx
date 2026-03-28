"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const channelParam = searchParams.get('channel') || '';
  const [inputValue, setInputValue] = useState(channelParam);

  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 lg:px-10 mt-8 lg:mt-16 flex-1 flex flex-col lg:flex-row items-center lg:items-start justify-center lg:justify-between gap-12 lg:gap-8 pb-12 lg:pb-32">
      
      {/* Left Column - Hero */}
      <div className="w-full lg:max-w-[55%] pt-2">
        {/* Built For Badge */}
        <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-sm mb-7">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
          <span className="text-[11px] font-semibold text-gray-500 tracking-wide">
            Built for strategy teams, producers, creative leads, and growth
          </span>
        </div>

        {/* Hero Title & Subtitle */}
        <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold tracking-tight text-[#0a0f1c] mb-5 leading-[1.05]">
          See which competitor videos are winning this month
        </h1>
        
        <p className="text-[14px] md:text-[15px] text-[#555f76] mb-10 leading-relaxed max-w-[520px]">
          Paste a YouTube channel URL to uncover top-performing videos, breakout Shorts, and content patterns.
        </p>

        {/* Input Box Container */}
        <div className="bg-white p-5 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mb-8 relative max-w-[540px]">
          <label className="block text-[11px] font-bold text-[#555f76] mb-2 px-1">Channel URL</label>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if(inputValue) router.push('/results?channel=' + encodeURIComponent(inputValue));
            }}
            className="flex flex-col sm:flex-row gap-2 relative"
          >
            <input 
              type="text" 
              placeholder="https://www.youtube.com/@mkbhd"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-[13px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
            />
            <button 
              type="submit"
              className="px-6 py-3 bg-[#0a0f1c] text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors shadow-sm text-[13px] whitespace-nowrap"
            >
              Analyze Channel
            </button>
          </form>
          <div className="hidden sm:block mt-3 text-[11px] text-[#8e98ac] px-1 font-medium">
            You can paste a full YouTube channel URL or just the @handle to instantly reveal what is working right now.
          </div>
        </div>

        {/* Sample Channels */}
        <div className="max-w-[540px]">
          <h3 className="text-[11px] font-bold text-[#8e98ac] mb-3 ml-1 tracking-wide">Suggested sample channels</h3>
          <div className="flex flex-wrap gap-2.5 mb-6">
            <button onClick={() => setInputValue('https://www.youtube.com/@mkbhd')} className="text-left px-4 py-3 bg-white border border-gray-100 rounded-[14px] shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:border-gray-200 transition-all">
              <div className="font-bold text-[12px] text-gray-900">Marques Brownlee</div>
            </button>
            <button onClick={() => setInputValue('https://www.youtube.com/@Fireship')} className="text-left px-4 py-3 bg-white border border-gray-100 rounded-[14px] shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:border-gray-200 transition-all">
              <div className="font-bold text-[12px] text-gray-900">Fireship</div>
            </button>
            <button onClick={() => setInputValue('https://www.youtube.com/@ColinAndSamir')} className="text-left px-4 py-3 bg-white border border-gray-100 rounded-[14px] shadow-[0_4px_12px_rgba(0,0,0,0.01)] transition-all">
              <div className="font-bold text-[12px] text-gray-900">Colin and Samir</div>
            </button>
          </div>
          
          {/* Filters explicitly removed per user request */}
        </div>
      </div>

      {/* Right Column - Mock Preview Card - Hidden on Mobile */}
      <div className="hidden lg:block w-full lg:w-[420px] xl:w-[460px] flex-shrink-0 relative mt-4 lg:mt-0">
        <div className="bg-white rounded-[24px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100/80 p-5 md:p-6 transform sm:scale-95 origin-top lg:origin-top-left xl:scale-90 xl:w-[110%]">
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Preview</div>
              <div className="text-[15px] font-bold text-gray-900">This month's winners</div>
            </div>
            <div className="px-2.5 py-1 bg-[#FFEEE5] border border-gray-100 rounded-lg text-[9px] font-semibold text-[#D9693C] mt-1">
              Marques Brownlee
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-2.5 mb-7">
            <div className="flex-1 border border-[#f1f5f9] rounded-[14px] p-4 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Top Video</div>
              <div className="text-[19px] font-bold text-gray-900 leading-none">612K</div>
            </div>
            <div className="flex-1 border border-[#f1f5f9] rounded-[14px] p-4 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Best Short</div>
              <div className="text-[19px] font-bold text-gray-900 leading-none">0:34</div>
            </div>
            <div className="flex-[1.4] border border-[#f1f5f9] rounded-[14px] p-4 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Winning Topic</div>
              <div className="text-[15px] font-bold text-gray-900 leading-none truncate mt-[5px]">Client results</div>
            </div>
          </div>

          {/* Video Mockup List */}
          <div className="space-y-4">
            {[1, 2, 3].map((num) => (
              <div key={num} className="border border-[#f1f5f9] p-3 rounded-[20px] flex gap-4 items-center bg-white shadow-[0_4px_12px_rgba(0,0,0,0.015)]">
                {/* Thumbnail mock */}
                <div className="w-[104px] h-[64px] rounded-xl bg-gradient-to-br from-[#e0e7ff] via-[#EFF4FF] to-[#e0e7ff] relative flex-shrink-0 border border-indigo-50/50">
                   <div className="text-[9px] font-bold text-indigo-400 w-5 h-5 bg-white rounded-[7px] shadow-sm flex items-center justify-center absolute left-2 top-2">
                     #{num}
                   </div>
                </div>
                {/* Content mock */}
                <div className="flex-1 space-y-3.5 pr-2">
                  <div className={`h-2.5 bg-[#e2e8f0] rounded-full ${num===1 ? 'w-full' : (num===2 ? 'w-[85%]' : 'w-[75%]')}`}></div>
                  <div className="flex gap-2.5">
                    <div className="h-2 w-12 bg-[#f1f5f9] rounded-full"></div>
                    <div className="h-2 w-12 bg-[#f1f5f9] rounded-full"></div>
                    <div className="h-2 w-12 bg-[#f1f5f9] rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-grid selection:bg-blue-100 selection:text-blue-900 flex flex-col font-sans relative overflow-x-hidden">
      {/* Original Transparent Header - Pinned to edge to match results page */}
      <header className="w-full h-[72px] bg-transparent px-6 lg:px-10 relative z-50">
        <div className="w-full h-full flex items-center">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-[32px] h-[32px] bg-[#0a0f1c] text-white flex items-center justify-center rounded-[10px] text-[10px] font-bold tracking-wider shadow-sm">
              CS
            </div>
            <div className="font-bold text-[14px] text-[#0a0f1c] tracking-tight translate-y-[1px]">Channel Scope</div>
          </Link>
        </div>
      </header>

      <Suspense fallback={<div className="p-8 text-center text-gray-500 flex-1">Loading Application...</div>}>
         <DashboardContent />
      </Suspense>
    </main>
  );
}
