import React from 'react';
import { Target, Play, Link as LinkIcon, MessageSquare, Zap, Clock } from 'lucide-react';
import { StrategyInsight } from '@/types';

export default function StrategyGrid({ strategy }: { strategy: StrategyInsight[] }) {
  const getIcon = (id: string, className: string) => {
    switch (id) {
      case "schedule":
        return <Clock className={className} strokeWidth={2.5} />;
      case "keywords":
        return <Target className={className} strokeWidth={2.5} />;
      case "length":
        return <Play className={className} strokeWidth={2.5} />;
      case "links":
        return <LinkIcon className={className} strokeWidth={2.5} />;
      case "titles":
        return <MessageSquare className={className} strokeWidth={2.5} />;
      default:
        return <Zap className={className} strokeWidth={2.5} />;
    }
  };

  if (!strategy || strategy.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10 w-full">
      {strategy.map((card, i) => (
        <div
          key={i}
          className="bg-white border border-gray-100 rounded-[18px] p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-start hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all min-h-[140px]"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-blue-50/50 rounded-lg shrink-0">
              {getIcon(card.id, "w-4 h-4 text-blue-600")}
            </div>
            <span className="text-[11px] font-medium text-gray-500 truncate">
              {card.label}
            </span>
          </div>
          <div className="text-[13px] font-bold text-gray-800 leading-relaxed">
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}
