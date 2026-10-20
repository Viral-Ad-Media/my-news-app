"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Scale, AlertTriangle } from "lucide-react";
import CoverageBar from "./CoverageBar";
import {
  BIAS_META,
  getBiasBadgeStyle,
  normalizeArticleCoverage,
} from "../lib/lopsided";

export default function StoryCoverage({ apiUrl }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    setError("");
    fetch(apiUrl, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Coverage unavailable");
        return response.json();
      })
      .then(setData)
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message);
      });
    return () => controller.abort();
  }, [apiUrl]);

  if (error) {
    return (
      <section className="rounded-xl border border-border bg-muted/40 p-6">
        <h2 className="text-xl font-bold mb-2">Story Sources &amp; Perspectives</h2>
        <p role="alert" className="text-sm text-muted-foreground">
          {error}
        </p>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="rounded-xl border border-border bg-muted/40 p-6">
        <h2 className="text-xl font-bold mb-2">Story Sources &amp; Perspectives</h2>
        <p className="text-sm text-muted-foreground">Loading sources…</p>
      </section>
    );
  }

  const normalized = normalizeArticleCoverage(data);
  const perspectives = Array.isArray(data.perspectives) && data.perspectives.length > 0
    ? data.perspectives
    : normalized.perspectives;

  return (
    <section
      aria-labelledby="story-perspectives-heading"
      className="rounded-xl border border-border bg-muted/30 p-5 sm:p-6 space-y-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Scale className="h-3.5 w-3.5" aria-hidden="true" />
            AllSides-Style Multi-Perspective Comparison
          </div>
          <h2
            id="story-perspectives-heading"
            className="text-xl font-bold tracking-tight mt-1"
          >
            How Left, Center &amp; Right Covered This Story
          </h2>
        </div>

        {normalized.isLopsided && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${normalized.dominantMeta.pillClass}`}
          >
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
            {normalized.blindspotNote}
          </span>
        )}
      </div>

      <CoverageBar
        sources={data.total_sources}
        left={normalized.left}
        center={normalized.center}
        right={normalized.right}
      />

      {perspectives.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {perspectives.map((item, idx) => {
            const bucketMeta = BIAS_META[item.bucket] || BIAS_META.center;
            const badgeStyle = getBiasBadgeStyle(item.bias_rating || bucketMeta.badgeLabel);
            return (
              <article
                key={`${item.source}-${idx}`}
                className="flex flex-col justify-between rounded-lg border border-border bg-background p-4 min-w-0"
              >
                <div>
                  <div
                    className={`-mx-4 -mt-4 mb-3 px-4 py-2 rounded-t-lg flex items-center justify-between gap-2 ${bucketMeta.headerClass}`}
                  >
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {item.label || bucketMeta.columnLabel}
                    </span>
                    <span
                      className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-semibold ${badgeStyle}`}
                    >
                      {item.bias_rating || "Center"}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    {item.source}
                  </p>
                  <h3 className="text-sm font-bold leading-snug">{item.title}</h3>
                  {item.summary && (
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {item.summary}
                    </p>
                  )}
                </div>

                {/^https?:\/\//.test(item.url || "") && (
                  <div className="mt-3 pt-2.5 border-t border-border/60">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium underline underline-offset-4"
                    >
                      Read {item.source} report
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <div className="pt-3 border-t border-border">
        <h3 className="text-sm font-semibold mb-3">
          Verified Source Links ({(data.articles || []).length})
        </h3>
        <div className="space-y-2.5">
          {(data.articles || []).map((article) => (
            <article
              key={article.id}
              className="rounded-lg border border-border bg-background p-3.5 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <h4 className="font-semibold text-sm">{article.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {article.source}
                  {article.bias_rating ? ` · ${article.bias_rating}` : ""}
                </p>
              </div>
              {/^https?:\/\//.test(article.url || "") && (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold underline underline-offset-4 shrink-0"
                >
                  Read original article
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              )}
            </article>
          ))}
          {!data.articles?.length && (
            <p className="text-sm text-muted-foreground">
              No source links available.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
