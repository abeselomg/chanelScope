import React, { useState } from 'react';
import { Calendar, ChevronDown, ArrowDownUp, Search } from 'lucide-react';
import Tooltip from '@/components/Tooltip';

export interface FilterProps {
  dateFilter: string;
  setDateFilter: (val: string) => void;
  sortFilter: string;
  setSortFilter: (val: string) => void;
  typeFilter: "All" | "Shorts" | "Long-form";
  setTypeFilter: (val: "All" | "Shorts" | "Long-form") => void;
  breakoutOnly: boolean;
  setBreakoutOnly: (val: boolean) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

export default function ResultsFilterBar({
  dateFilter,
  setDateFilter,
  sortFilter,
  setSortFilter,
  typeFilter,
  setTypeFilter,
  breakoutOnly,
  setBreakoutOnly,
  searchQuery,
  setSearchQuery,
}: FilterProps) {
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-100 pb-5 mb-8 gap-4 px-0">
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        {/* Date Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => {
              setDateDropdownOpen(!dateDropdownOpen);
              setSortDropdownOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 font-semibold text-[12px] rounded-md hover:bg-gray-50 transition-colors shadow-sm outline-none whitespace-nowrap"
          >
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            {dateFilter}
            <ChevronDown className="w-3.5 h-3.5 text-gray-300 ml-1" />
          </button>

          {dateDropdownOpen && (
            <div className="absolute top-full mt-2 left-0 w-[150px] bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-1.5 z-50">
              {[
                "All Time",
                "This Week",
                "This Month",
                "Last 90 Days",
                "This Year",
              ].map((o) => (
                <button
                  key={o}
                  onClick={() => {
                    setDateFilter(o);
                    setDateDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-[12px] font-semibold rounded-lg transition-colors ${dateFilter === o ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
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
            onClick={() => {
              setSortDropdownOpen(!sortDropdownOpen);
              setDateDropdownOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 font-semibold text-[12px] rounded-md hover:bg-gray-50 transition-colors shadow-sm outline-none whitespace-nowrap"
          >
            <ArrowDownUp className="w-3.5 h-3.5 text-gray-400" />
            {sortFilter}
            <ChevronDown className="w-3.5 h-3.5 text-gray-300 ml-1" />
          </button>

          {sortDropdownOpen && (
            <div className="absolute top-full mt-2 left-0 w-[160px] bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-1.5 z-50">
              {["Latest", "Total Views", "Momentum", "Engagement"].map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSortFilter(s);
                      setSortDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-[12px] font-semibold rounded-lg transition-colors ${sortFilter === s ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
                  >
                    {s}
                  </button>
                ),
              )}
            </div>
          )}
        </div>

        {/* Type Filter */}
        <div className="flex items-center bg-gray-100 rounded-md p-0.5 shrink-0">
          {(["All", "Shorts", "Long-form"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 text-[12px] font-semibold rounded-md transition-all whitespace-nowrap ${typeFilter === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              {t}
            </button>
          ))}
        </div>

        <Tooltip content="Hides the bottom 50% of the channel's performance">
          <button
            onClick={() => setBreakoutOnly(!breakoutOnly)}
            className={`px-3 py-1.5 text-[12px] font-semibold rounded-md border transition-all shrink-0 whitespace-nowrap ${breakoutOnly ? "bg-green-50 border-green-200 text-green-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm"}`}
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
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-blue-500 w-full shadow-sm font-medium"
        />
      </div>
    </div>
  );
}
