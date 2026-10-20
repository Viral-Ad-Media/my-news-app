"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function DailyIndex({
  apiUrl = "",
  indexValue: propIndexValue,
  sentiment: propSentiment,
}) {
  const [state, setState] = useState({
    indexValue: typeof propIndexValue === "number" ? propIndexValue : 58,
    sentiment: propSentiment || "Balanced",
    positive: 34,
    neutral: 48,
    negative: 18,
  });

  useEffect(() => {
    if (typeof propIndexValue === "number" || propSentiment) {
      setState((prev) => ({
        ...prev,
        indexValue:
          typeof propIndexValue === "number" ? propIndexValue : prev.indexValue,
        sentiment: propSentiment || prev.sentiment,
      }));
    }
  }, [propIndexValue, propSentiment]);

  useEffect(() => {
    if (!apiUrl) return undefined;
    const controller = new AbortController();

    fetch(apiUrl, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Coverage unavailable");
        return res.json();
      })
      .then((data) => {
        const pos = Number(data.sentiment_stats?.positive ?? 34);
        const neu = Number(data.sentiment_stats?.neutral ?? 48);
        const neg = Number(data.sentiment_stats?.negative ?? 18);
        const computedIndex =
          typeof data.index_value === "number"
            ? data.index_value
            : Math.max(
                15,
                Math.min(
                  95,
                  Math.round(
                    50 +
                      (pos - neg) * 0.45 +
                      ((data.center_coverage ?? 34) - 33) * 0.35,
                  ),
                ),
              );
        setState({
          indexValue: computedIndex,
          sentiment: data.sentiment || "Balanced",
          positive: Math.round(pos),
          neutral: Math.round(neu),
          negative: Math.round(neg),
        });
      })
      .catch(() => {});

    return () => controller.abort();
  }, [apiUrl]);

  return (
    <section
      className="mb-6 rounded-xl border border-border bg-muted/30 p-4 space-y-3"
      aria-labelledby="daily-index-heading"
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 id="daily-index-heading" className="text-base font-bold">
            Daily Index
          </h3>
          <p className="text-xs text-muted-foreground">
            Sentiment &amp; framing consensus score
          </p>
        </div>
        <Badge variant="secondary" className="capitalize font-semibold">
          {state.sentiment}
        </Badge>
      </div>

      <div className="flex items-baseline justify-between pt-1">
        <span className="text-2xl font-bold tabular-nums">
          {state.indexValue}
          <span className="text-xs font-normal text-muted-foreground">
            /100
          </span>
        </span>
        <span className="text-xs text-muted-foreground">
          {state.indexValue >= 60
            ? "Constructive consensus"
            : state.indexValue <= 42
              ? "High framing tension"
              : "Balanced editorial tone"}
        </span>
      </div>

      <div
        role="meter"
        aria-label="Daily Sentiment and Framing Index"
        aria-valuenow={state.indexValue}
        aria-valuemin={0}
        aria-valuemax={100}
        className="relative w-full h-2.5 bg-muted rounded-full overflow-hidden border border-border/60"
      >
        <div
          className="h-full bg-foreground rounded-full transition-all"
          style={{ width: `${Math.max(5, Math.min(100, state.indexValue))}%` }}
        />
      </div>

      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>Contested</span>
        <span>Neutral</span>
        <span>Balanced</span>
        <span>Constructive</span>
      </div>

      <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-border/60 text-center text-xs">
        <div className="rounded bg-background/80 px-2 py-1.5 border border-border/50">
          <div className="font-semibold tabular-nums">{state.positive}%</div>
          <div className="text-[10px] text-muted-foreground">Positive</div>
        </div>
        <div className="rounded bg-background/80 px-2 py-1.5 border border-border/50">
          <div className="font-semibold tabular-nums">{state.neutral}%</div>
          <div className="text-[10px] text-muted-foreground">Neutral</div>
        </div>
        <div className="rounded bg-background/80 px-2 py-1.5 border border-border/50">
          <div className="font-semibold tabular-nums">{state.negative}%</div>
          <div className="text-[10px] text-muted-foreground">Critical</div>
        </div>
      </div>
    </section>
  );
}
