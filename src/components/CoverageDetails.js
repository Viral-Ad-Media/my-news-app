"use client";

import { useEffect, useState } from "react";
import CoverageBar from "./CoverageBar";

export default function CoverageDetails({ apiUrl }) {
  const [coverageData, setCoverageData] = useState({
    totalSources: 0,
    leftCoverage: 33,
    centerCoverage: 34,
    rightCoverage: 33,
    dominantBias: "balanced",
    positive: 34,
    neutral: 48,
    negative: 18,
    sentiment: "Balanced",
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
          throw new Error(
            `HTTP Error: ${response.status} ${response.statusText}`,
          );
        }
        const data = await response.json();
        setCoverageData({
          totalSources: data.total_sources || 1,
          leftCoverage:
            typeof data.left_coverage === "number" ? data.left_coverage : 33,
          centerCoverage:
            typeof data.center_coverage === "number"
              ? data.center_coverage
              : 34,
          rightCoverage:
            typeof data.right_coverage === "number" ? data.right_coverage : 33,
          dominantBias: data.dominant_bias || "balanced",
          positive: Math.round(data.sentiment_stats?.positive ?? 34),
          neutral: Math.round(data.sentiment_stats?.neutral ?? 48),
          negative: Math.round(data.sentiment_stats?.negative ?? 18),
          sentiment: data.sentiment || "Balanced",
        });
        setError(null);
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCoverageDetails();

    return () => controller.abort();
  }, [apiUrl]);

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground mt-4">
        Loading coverage details…
      </p>
    );
  }

  if (error) {
    return <p className="text-sm text-destructive mt-4">Error: {error}</p>;
  }

  return (
    <section
      className="rounded-xl border border-border bg-muted/30 p-4 space-y-4"
      aria-labelledby="coverage-spectrum-heading"
    >
      <div>
        <h3 id="coverage-spectrum-heading" className="text-base font-bold">
          Coverage &amp; Bias Spectrum
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          AllSides-style L · C · R source breakdown
        </p>
      </div>

      <CoverageBar
        sources={coverageData.totalSources}
        left={coverageData.leftCoverage}
        center={coverageData.centerCoverage}
        right={coverageData.rightCoverage}
        compact={true}
      />

      <div className="flex flex-col space-y-2 text-xs pt-2 border-t border-border">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total News Sources</span>
          <span className="font-semibold tabular-nums">
            {coverageData.totalSources}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">From the Left</span>
          <span className="font-semibold tabular-nums">
            {coverageData.leftCoverage}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">From the Center</span>
          <span className="font-semibold tabular-nums">
            {coverageData.centerCoverage}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">From the Right</span>
          <span className="font-semibold tabular-nums">
            {coverageData.rightCoverage}%
          </span>
        </div>
        <div className="flex justify-between pt-2 border-t border-border/60">
          <span className="text-muted-foreground">Dominant Framing</span>
          <span className="font-semibold capitalize">
            {coverageData.dominantBias}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tone / Sentiment</span>
          <span className="font-semibold capitalize">
            {coverageData.sentiment}
          </span>
        </div>
      </div>
    </section>
  );
}
