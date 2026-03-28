import React from 'react';

export default function Tooltip({ children, content }: { children: React.ReactNode, content: React.ReactNode }) {
  return (
    <div className="group relative z-40 inline-flex">
      {children}
      <div className="pointer-events-none absolute left-1/2 bottom-full mb-2.5 -translate-x-1/2 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 ease-out">
        <div className="px-3 py-2 bg-gray-900 text-gray-50 text-[12px] font-semibold leading-tight rounded-[8px] shadow-lg whitespace-nowrap tracking-wide border border-gray-800">
          {content}
        </div>
      </div>
    </div>
  );
}
