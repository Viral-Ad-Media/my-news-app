"use client";

import { useEffect, useState } from "react";

export default function CoverageDetails({ apiUrl }) {
  const [coverageData, setCoverageData] = useState({
    totalSources: 0,
    positive: 0,
    neutral: 0,
    negative: 0,
    sentiment: "Unknown",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!apiUrl) {
      setLoading(false);
      setError("Coverage URL is missing.");
      return undefined;
    }

    const controller = new AbortController();

    const fetchCoverageDetails = async () => {
      try {
        const response = await fetch(apiUrl, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setCoverageData({
          totalSources: data.total_sources,
          positive: data.sentiment_stats.positive,
          neutral: data.sentiment_stats.neutral,
          negative: data.sentiment_stats.negative,
          sentiment: data.sentiment,
        });
        setError(null);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Error fetching coverage details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCoverageDetails();

    return () => controller.abort();
  }, [apiUrl]);

  if (loading) {
    return <p>Loading coverage details...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <div>
      <h3 className="text-2xl font-bold mt-6 mb-1">Coverage Details</h3>
      <div className="flex flex-col space-y-1 mb-6">
        <div className="h-0.5 w-full bg-gray-700"></div>
        <div className="h-0.5 w-full bg-gray-400"></div>
        <div className="h-0.5 w-full bg-gray-200"></div>
      </div>
      <div className="flex flex-col space-y-2 text-gray-700">
        <div className="flex justify-between">
          <span>Total News Sources</span>
          <span className="font-bold">{coverageData.totalSources}</span>
        </div>
        <div className="flex justify-between">
          <span>Positive</span>
          <span className="font-bold">{coverageData.positive}</span>
        </div>
        <div className="flex justify-between">
          <span>Neutral</span>
          <span className="font-bold">{coverageData.neutral}</span>
        </div>
        <div className="flex justify-between">
          <span>Negative</span>
          <span className="font-bold">{coverageData.negative}</span>
        </div>
        <div className="flex justify-between mt-4">
          <span>Sentiment</span>
          <span className="font-bold text-red-500">{coverageData.sentiment}</span>
        </div>
      </div>
    </div>
  );
}
