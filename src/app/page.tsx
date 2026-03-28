"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function DashboardContent() {
  const searchParams = useSearchParams();
  const channel = searchParams.get('channel');
  const range = searchParams.get('range') || 'this_month';

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">
          See which competitor videos are winning this month
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Paste a YouTube channel URL to uncover top-performing videos, breakout Shorts, content patterns, and reasons behind what's working.
        </p>
      </div>
      
      <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-200">
        <input 
          type="text" 
          placeholder="https://www.youtube.com/@mkbhd"
          defaultValue={channel || ''}
          className="flex-1 px-4 py-3 rounded-xl outline-none text-gray-900 placeholder-gray-400 bg-transparent"
        />
        <button className="px-8 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors shadow-sm whitespace-nowrap">
          Analyze Channel
        </button>
      </div>

      {channel && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-100 text-blue-800 rounded-xl w-full max-w-2xl text-center">
          Analyzing <strong>{channel}</strong> for exactly <strong>{range}</strong>... (Actual data fetching to be implemented)
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 selection:bg-blue-100 selection:text-blue-900 flex flex-col pt-12">
      {/* Basic top bar placeholder */}
      <header className="w-full max-w-6xl mx-auto px-4 flex justify-between items-center mb-12">
        <div className="flex items-center gap-2 font-bold text-gray-900 text-xl tracking-tight">
          <div className="w-8 h-8 bg-gray-900 text-white flex items-center justify-center rounded-lg text-sm">CS</div>
          Channel Scope
        </div>
        <div className="flex gap-4 text-sm font-medium text-gray-600">
          <button className="hover:text-gray-900 transition-colors">Saved Analyses</button>
          <button className="hover:text-gray-900 transition-colors">Recent Channels</button>
        </div>
      </header>

      <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading UI...</div>}>
         <DashboardContent />
      </Suspense>
    </main>
  );
}
