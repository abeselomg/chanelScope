import React, { useState, useEffect } from 'react';
import { Loader2, Check } from 'lucide-react';

const StepItem = ({
  current,
  target,
  text,
  num,
}: {
  current: number;
  target: number;
  text: string;
  num: number;
}) => {
  const isDone = current >= target;
  const isCurrent = current === target - 1;

  return (
    <div
      className={`flex items-center gap-3 text-[13px] transition-all duration-1000 ${isDone ? "text-gray-900 font-medium" : isCurrent ? "text-gray-900 font-bold" : "text-gray-400 font-medium"}`}
    >
      <div className="relative w-[18px] h-[18px] flex-shrink-0">
        <div
          className={`absolute inset-0 rounded-full flex items-center justify-center text-[9.5px] font-bold transition-all duration-1000 ${isDone ? "opacity-0 scale-50" : "opacity-100 scale-100"} ${isCurrent ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-500"}`}
        >
          {num}
        </div>
        <div
          className={`absolute inset-0 rounded-full bg-[#00a36c] flex items-center justify-center transition-all duration-1000 ${isDone ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
        >
          <Check className="w-3 h-3 text-white" strokeWidth={3.5} />
        </div>
      </div>
      {text}
    </div>
  );
};

export default function LoadingState({
  onComplete,
}: {
  onComplete: () => void;
}) {
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
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
