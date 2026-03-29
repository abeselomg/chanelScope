import React from 'react';
import Link from 'next/link';
import { SearchX } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center mt-20 px-6 text-center animate-in fade-in zoom-in duration-500">
      <div className="w-16 h-16 bg-gray-100 border border-gray-200 text-gray-400 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <SearchX className="w-7 h-7" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">No videos found</h2>
      <p className="text-[14px] text-gray-500 max-w-sm mb-8 leading-relaxed">
        This channel hasn&apos;t uploaded any videos in this timeframe. Try expanding your search or checking the URL.
      </p>
      <Link href="/">
        <button className="px-6 py-2.5 bg-[#0a0f1c] text-white text-[13px] font-semibold rounded-xl hover:bg-gray-800 transition-colors shadow-sm">
          Try a different channel
        </button>
      </Link>
    </div>
  );
}
