"use client";
import useSavedStories from "../lib/use-saved-stories";
import SaveStoryButton from "./SaveStoryButton";
import CoverageBar from "./CoverageBar";
import Link from "next/link";
import Image from "./NewsImage";
import { resolveApiAssetUrl } from "../lib/api";

// Utility function to calculate time ago
function getTimeAgo(dateString) {
  const postedDate = new Date(dateString);
  const now = new Date();
  const timeDiff = Math.abs(now - postedDate);
  const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
  const daysAgo = Math.floor(hoursAgo / 24);

  if (daysAgo > 0) {
    return `${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`;
  } else {
    return `${hoursAgo} hour${hoursAgo > 1 ? "s" : ""} ago`;
  }
}

export default function RelatedNews({ articles }) {
  const relatedArticles = Array.isArray(articles) ? articles : [];

  const savedIds = useSavedStories(
    relatedArticles.map((article) => article.id),
  );
  return (
    <div>
      {/* Header */}
      <h2 className="text-2xl font-bold">Related News</h2>
      <div className="flex flex-col space-y-1 mb-4">
        <div className="h-0.5 w-full bg-gray-700"></div>
        <div className="h-0.5 w-full bg-gray-400"></div>
        <div className="h-0.5 w-full bg-gray-200"></div>
      </div>

      {/* News Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {relatedArticles.map((news) => (
          <div
            key={news.id}
            className="bg-white p-4 border rounded-lg shadow-sm"
          >
            {/* Header with Categories and Bookmark */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-600">
                {news.categories && news.categories.length > 0
                  ? news.categories.map((cat) => cat.name).join(", ")
                  : "Uncategorized"}
              </span>
              <SaveStoryButton
                articleId={news.id}
                initiallySaved={savedIds.includes(news.id)}
              />
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              <Link href={`/news/${news.id}`}>{news.title}</Link>
            </h3>

            {/* Coverage Bar and Source Count */}
            <CoverageBar sources={news.total_sources} />

            {/* Image */}
            {(news.image_url || news.image) && (
              <Image
                src={resolveApiAssetUrl(news.image_url || news.image)}
                alt={news.title}
                width={400}
                height={200}
                className="w-full h-40 object-cover mt-4 rounded-md"
              />
            )}

            {/* Date and Location */}
            <p className="text-xs text-gray-600 mt-2">
              {getTimeAgo(news.published_at)}, {news.location}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
