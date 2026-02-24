"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { resolveApiAssetUrl } from "../lib/api";

export default function StoryCoverage({ apiUrl }) {
  const [coverageData, setCoverageData] = useState([]);
  const [selectedBias, setSelectedBias] = useState("all");
  const [sortOrder, setSortOrder] = useState("relevancy");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!apiUrl) {
      setError("Coverage URL is missing.");
      setCoverageData([]);
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();

    fetch(apiUrl, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setCoverageData(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch((fetchError) => {
        if (fetchError.name === "AbortError") return;
        setError("Failed to fetch coverage data.");
        setCoverageData([]);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [apiUrl]);

  const sortedArticles = useMemo(() => {
    const filteredArticles =
      selectedBias === "all"
        ? coverageData
        : coverageData.filter((article) => article.bias === selectedBias);

    return [...filteredArticles].sort((a, b) => {
      if (sortOrder === "relevancy") {
        return (b.relevance || 0) - (a.relevance || 0);
      }

      return new Date(b.published_at) - new Date(a.published_at);
    });
  }, [coverageData, selectedBias, sortOrder]);

  return (
    <div className="story-coverage bg-gray-100 p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Story Coverage</h2>
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          {["all", "left", "center", "right"].map((bias) => (
            <button
              key={bias}
              onClick={() => setSelectedBias(bias)}
              className={`py-1 px-4 rounded-md text-sm font-medium ${
                selectedBias === bias
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {bias.charAt(0).toUpperCase() + bias.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setSortOrder("relevancy")}
            className={`py-1 px-4 rounded-md text-sm font-medium ${
              sortOrder === "relevancy"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            Relevancy
          </button>
          <button
            onClick={() => setSortOrder("chronological")}
            className={`py-1 px-4 rounded-md text-sm font-medium ${
              sortOrder === "chronological"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            Chronological
          </button>
        </div>
      </div>

      {loading && <p className="text-center text-gray-500">Loading coverage...</p>}
      {!loading && error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && (
        <div>
          {sortedArticles.length > 0 ? (
            sortedArticles.map((article) => (
              <div
                key={article.id}
                className="article-item bg-white p-4 mb-4 rounded-lg shadow-md"
              >
                <div className="flex items-center mb-2">
                  <Image
                    src={
                      article.source_logo
                        ? resolveApiAssetUrl(article.source_logo)
                        : "/images/Placeholder.webp"
                    }
                    alt={article.source || "Source"}
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full mr-2"
                  />
                  <span className="text-sm font-semibold text-gray-600">
                    {article.source || "Unknown Source"}
                  </span>
                </div>

                <h3 className="text-lg font-bold mb-2">{article.title}</h3>

                <p className="text-sm text-gray-500">
                  {new Date(article.published_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  - {article.bias ? article.bias.charAt(0).toUpperCase() + article.bias.slice(1) : "Unknown"}
                </p>

                <a
                  href={article.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 text-sm font-medium hover:underline mt-2 inline-block"
                >
                  Read Full Article →
                </a>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No articles available.</p>
          )}
        </div>
      )}
    </div>
  );
}
