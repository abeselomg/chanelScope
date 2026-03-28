"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

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

      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-100">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Something went wrong</h2>
        <p className="text-[14px] md:text-[15px] text-gray-500 max-w-sm mb-8 leading-relaxed">
          {error.message || "We couldn't analyze this channel. Please check the URL and try again."}
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 bg-gray-900 text-white text-[13px] font-medium rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
          >
            Try again
          </button>
          <Link href="/">
            <button className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 text-[13px] font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
              Go back
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
