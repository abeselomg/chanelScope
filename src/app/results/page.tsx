"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { Loader2, Check, SearchX } from 'lucide-react';
import Link from 'next/link';

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

function LoadingState({ channel }: { channel?: string }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 1000);
    const t2 = setTimeout(() => setStep(2), 2200);
    const t3 = setTimeout(() => setStep(3), 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="w-full max-w-[800px] mx-auto px-6 mt-16 md:mt-24 flex flex-col items-center pb-20">
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
  const channel = searchParams.get('channel') || '';
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!channel) return;
    
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

  if (!data) {
    return (
      <div className="flex-1 w-full relative flex flex-col">
        <LoadingState channel={channel} />
      </div>
    );
  }

  if (!data.videos || data.videos.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex-1 w-full bg-white p-8 overflow-y-auto">
      <h1 className="text-xl font-bold mb-4">Successfully analyzed {data.channel.title}!</h1>
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 overflow-auto max-h-[500px] text-xs font-mono">
        {JSON.stringify(data, null, 2)}
      </div>
    </div>
  );
}

export default function Results() {
  return (
    <main className="min-h-screen bg-grid selection:bg-blue-100 selection:text-blue-900 flex flex-col font-sans">
      {/* Top Bar Header */}
      <header className="w-full flex justify-between items-center px-6 lg:px-10 h-[72px] bg-transparent">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-[32px] h-[32px] bg-[#0a0f1c] text-white flex items-center justify-center rounded-[10px] text-[10px] font-bold tracking-wider shadow-sm">
            CS
          </div>
          <div className="font-bold text-[14px] text-[#0a0f1c] tracking-tight">Channel Scope</div>
        </Link>
      </header>

      <Suspense fallback={<div className="p-8 text-center text-gray-500 flex-1">Loading Application...</div>}>
         <ResultsContent />
      </Suspense>
    </main>
  );
}
