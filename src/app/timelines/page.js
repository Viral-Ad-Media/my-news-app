"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import NewsList from "../../components/NewsList";

const TIME_FILTERS = [
  { id: "", label: "All Time" },
  { id: "last_day", label: "Last 24 Hours" },
  { id: "last_week", label: "Past 7 Days" },
  { id: "last_month", label: "Past 30 Days" },
];

const BIAS_FILTERS = [
  { id: "", label: "All Coverage" },
  { id: "balanced", label: "Balanced" },
  { id: "lopsided", label: "Lopsided / Polarized" },
];

export default function TimelinesPage() {
  const [timeFilter, setTimeFilter] = useState("");
  const [biasFilter, setBiasFilter] = useState("");

  const params = new URLSearchParams();
  if (timeFilter) params.set("filter", timeFilter);
  if (biasFilter) params.set("bias", biasFilter);
  const queryString = params.toString();

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-border bg-muted/40 p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="uppercase tracking-wider text-[11px]">
                <Clock className="h-3 w-3 mr-1" aria-hidden="true" />
                Chronological Wire
              </Badge>
              <span className="text-xs text-muted-foreground">
                Ordered newest to oldest
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              News Timeline &amp; Wire Archive
            </h1>
            <p className="text-sm text-muted-foreground">
              Stories listed from newest to oldest by their publication time.
            </p>
          </div>

          <Button variant="outline" size="sm" asChild>
            <Link href="/lopsided">
              <Scale className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Compare Left · Center · Right
            </Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/70">
          <div
            className="flex flex-wrap items-center gap-1.5"
            role="group"
            aria-label="Filter timeline by time window"
          >
            <span className="text-xs font-semibold text-muted-foreground mr-1">
              Window:
            </span>
            {TIME_FILTERS.map((item) => (
              <Button
                key={item.id || "all"}
                type="button"
                size="sm"
                variant={timeFilter === item.id ? "default" : "outline"}
                onClick={() => setTimeFilter(item.id)}
                aria-pressed={timeFilter === item.id}
                className="h-8 text-xs"
              >
                {item.label}
              </Button>
            ))}
          </div>

          <div
            className="flex flex-wrap items-center gap-1.5"
            role="group"
            aria-label="Filter timeline by coverage balance"
          >
            <span className="text-xs font-semibold text-muted-foreground mr-1">
              Spectrum:
            </span>
            {BIAS_FILTERS.map((item) => (
              <Button
                key={item.id || "all-bias"}
                type="button"
                size="sm"
                variant={biasFilter === item.id ? "secondary" : "ghost"}
                onClick={() => setBiasFilter(item.id)}
                aria-pressed={biasFilter === item.id}
                className="h-8 text-xs"
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </header>

      <NewsList title="News Timeline" query={queryString} />
    </div>
  );
}
