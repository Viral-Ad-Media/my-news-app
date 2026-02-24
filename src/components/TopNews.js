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

function getCategoryLabel(article) {
  if (!Array.isArray(article?.categories) || article.categories.length === 0) {
    return "Uncategorized";
  }
  return article.categories.map((category) => category.name).join(", ");
}

export default function TopNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const newsUrl = buildApiUrl("/news/");

    if (!newsUrl) {
      setError("API base URL is not configured.");
      setLoading(false);
      return () => controller.abort();
    }

    fetch(newsUrl, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const items = Array.isArray(data) ? data : [];
        const sortedData = [...items].sort(
          (a, b) => new Date(b.published_at) - new Date(a.published_at)
        );
        setNews(sortedData.slice(0, 5));
        setError(null);
      })
      .catch((fetchError) => {
        if (fetchError.name === "AbortError") return;
        setError("Unable to load top news right now.");
        setNews([]);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  if (loading) return <p>Loading top news...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (news.length === 0) return <p className="text-gray-500">No top news available.</p>;

  const mainNews = news[0];
  const sideNews = news[1];
  const bottomNews = news.slice(2, 5);

  return (
    <div>
      <h3 className="text-2xl font-bold mb-1">Top News</h3>
      <div className="flex flex-col space-y-1 mb-6">
        <div className="h-0.5 w-full bg-gray-700"></div>
        <div className="h-0.5 w-full bg-gray-400"></div>
        <div className="h-0.5 w-full bg-gray-200"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {mainNews && (
          <Link href={`/news/${mainNews.id}`} className="col-span-2 relative">
            <Image
              src={getArticleImage(mainNews)}
              alt={mainNews.title}
              width={1200}
              height={720}
              className="w-full h-96 object-cover rounded-md"
            />
            <div className="absolute bottom-6 left-6 text-white bg-black bg-opacity-60 p-4 rounded">
              <span className="bg-red-600 px-2 py-1 rounded text-xs uppercase">
                {getCategoryLabel(mainNews)}
              </span>
              <h3 className="text-4xl font-extrabold mt-2">{mainNews.title}</h3>
              <CoverageBar leftCoverage={54} sources={20} />
              <p className="text-sm mt-2">
                {getTimeAgo(mainNews.published_at)} | {mainNews.location || "Unknown"}
              </p>
            </div>
          </Link>
        )}

        {sideNews && (
          <Link href={`/news/${sideNews.id}`}>
            <div className="relative bg-gray-100 p-4 border rounded-md shadow-sm cursor-pointer hover:shadow-lg transition-shadow duration-300">
              <span className="text-xs text-gray-500">{getCategoryLabel(sideNews)}</span>
              <h4 className="text-xl font-bold mt-2">{sideNews.title}</h4>
              <CoverageBar leftCoverage={38} sources={8} />
              <Image
                src={getArticleImage(sideNews)}
                alt={sideNews.title}
                width={640}
                height={360}
                className="w-full h-40 object-cover mt-4 rounded-md"
              />
              <p className="text-sm text-gray-600 mt-2">
                {getTimeAgo(sideNews.published_at)} | {sideNews.location || "Unknown"}
              </p>
            </div>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {bottomNews.map((item) => (
          <Link key={item.id} href={`/news/${item.id}`}>
            <div className="relative bg-gray-100 p-4 border rounded-md shadow-sm cursor-pointer hover:shadow-lg transition-shadow duration-300">
              <span className="text-xs text-gray-500">{getCategoryLabel(item)}</span>
              <h5 className="text-lg font-bold mt-2">{item.title}</h5>
              <CoverageBar leftCoverage={50} sources={6} />
              <Image
                src={getArticleImage(item)}
                alt={item.title}
                width={640}
                height={360}
                className="w-full h-32 object-cover mt-4 rounded-md"
              />
              <p className="text-sm text-gray-600 mt-2">
                {getTimeAgo(item.published_at)} | {item.location || "Unknown"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
