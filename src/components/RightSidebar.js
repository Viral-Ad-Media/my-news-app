"use client";
import useCategories from "../lib/use-categories";
import AskVTAI from "./AskVTAI";
import NewsSummary from "./NewsSummary";
import SimilarNewsTopics from "./SimilarNewsTopics";
export default function RightSidebar({ showRecap = true }) {
  const { categories, error } = useCategories();

  return (
    <div className="min-w-0">
      <AskVTAI />
      {showRecap && <NewsSummary />}

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <SimilarNewsTopics topics={categories} />

    </div>
  );
}
