import { Suspense } from "react";
import ResultsContent from "./ResultsContent";

export const metadata = {
  title: "Analysis Results | Channel Scope",
  description:
    "View deep performance insights and competitive strategy for this YouTube channel.",
};

export default function ResultsPage() {
  return (
    <main className="min-h-screen bg-grid selection:bg-blue-100 selection:text-blue-900 flex flex-col font-sans relative overflow-x-hidden">
      <Suspense
        fallback={
          <div className="p-8 text-center text-gray-500 font-medium flex-1 mt-20">
            Loading results...
          </div>
        }
      >
        <ResultsContent />
      </Suspense>
    </main>
  );
}
