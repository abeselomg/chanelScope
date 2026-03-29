import React from 'react';

export default function Sparkline({ momentum }: { momentum: string }) {
  // We pseudo-generate a curve representing velocity since the standard Youtube v3 API
  // does not provide timeseries data without explicit OAuth per-channel access.
  let path =
    "M 0 30 C 10 30, 20 15, 30 15 C 50 15, 60 20, 80 20 C 90 20, 95 25, 100 25";
  let color = "stroke-blue-500";

  if (momentum === "Trending") {
    path = "M 0 35 C 10 35, 15 5, 25 5 C 40 5, 60 15, 80 15 C 90 15, 95 10, 100 5";
    color = "stroke-[#00a36c]";
  } else if (momentum === "Normal") {
    path = "M 0 25 C 20 25, 40 28, 60 25 C 80 22, 90 20, 100 15";
    color = "stroke-gray-300";
  }

  return (
    <div className="w-[50px] h-6 ml-4">
      <svg
        viewBox="0 0 100 40"
        className={`w-full h-full ${color} fill-none`}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={path} />
      </svg>
    </div>
  );
}
