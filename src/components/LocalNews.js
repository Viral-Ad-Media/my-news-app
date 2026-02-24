"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import CoverageBar from "./CoverageBar";
import { buildApiUrl, resolveApiAssetUrl } from "../lib/api";

function getTimeAgo(dateString) {
  const postedAt = new Date(dateString).getTime();
  if (Number.isNaN(postedAt)) return "Unknown time";

  const diffInHours = Math.max(0, Math.floor((Date.now() - postedAt) / 3600000));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }

  return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
}

function getArticleImage(article) {
  const imagePath = article?.image_url || article?.image;
  return imagePath ? resolveApiAssetUrl(imagePath) : "/images/Placeholder.webp";
}

export default function LocalNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const localNewsUrl = buildApiUrl("/news/?location=Local");
    const fallbackNewsUrl = buildApiUrl("/news/");

    if (!localNewsUrl || !fallbackNewsUrl) {
      setError("API base URL is not configured.");
      setLoading(false);
      return () => controller.abort();
    }

    const loadNews = async () => {
      try {
        const localResponse = await fetch(localNewsUrl, { signal: controller.signal });
        if (!localResponse.ok) {
          throw new Error(`HTTP ${localResponse.status}`);
        }

        const localItems = await localResponse.json();
        if (Array.isArray(localItems) && localItems.length > 0) {
          setNews(localItems);
          setError(null);
          return;
        }

        const fallbackResponse = await fetch(fallbackNewsUrl, { signal: controller.signal });
        if (!fallbackResponse.ok) {
          throw new Error(`HTTP ${fallbackResponse.status}`);
        }
        const fallbackItems = await fallbackResponse.json();
        setNews(Array.isArray(fallbackItems) ? fallbackItems.slice(0, 3) : []);
        setError(null);
      } catch (fetchError) {
        if (fetchError.name === "AbortError") return;
        setError("Unable to load local news right now.");
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
    return () => controller.abort();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mt-6 mb-1">Local News</h2>
      <p className="text-sm text-gray-600 mb-1">Stay current with all the local breaking news</p>
      <div className="flex flex-col space-y-1 mb-6">
        <div className="h-0.5 w-full bg-gray-700"></div>
        <div className="h-0.5 w-full bg-gray-400"></div>
        <div className="h-0.5 w-full bg-gray-200"></div>
      </div>

      {loading && <p>Loading local news...</p>}
      {!loading && error && <p className="text-red-500">{error}</p>}
      {!loading && !error && news.length === 0 && (
        <p className="text-gray-500">No local stories available.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {news.map((article) => (
          <Link key={article.id} href={`/news/${article.id}`}>
            <div className="bg-gray-100 p-4 border rounded-md shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500">
                  {Array.isArray(article.categories) && article.categories.length > 0
                    ? article.categories.map((category) => category.name).join(", ")
                    : "Uncategorized"}
                </span>
              </div>
              <h3 className="text-xl font-bold mt-2">{article.title}</h3>

              <CoverageBar leftCoverage={article.leftCoverage || 50} sources={article.sources || 10} />

              <Image
                src={getArticleImage(article)}
                alt={article.title}
                width={640}
                height={360}
                className="w-full h-40 object-cover mt-4 rounded-md"
              />
              <p className="text-sm text-gray-600 mt-2">
                {getTimeAgo(article.published_at)} | {article.location || "Unknown"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
