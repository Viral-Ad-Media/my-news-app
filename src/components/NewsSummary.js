"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { listItems, buildApiUrl } from "../lib/api";

const SUMMARY_TABS = ["Last Day", "Last Week", "Last Month"];

export default function NewsSummary({
  activeTab: controlledTab,
  setActiveTab: setControlledTab,
}) {
  const [internalTab, setInternalTab] = useState("Last Week");
  const activeTab = controlledTab ?? internalTab;
  const setActiveTab = setControlledTab ?? setInternalTab;

  const [newsSummary, setNewsSummary] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let url = buildApiUrl("/news/");
    if (!url) {
      setError("API base URL is not configured.");
      setNewsSummary([]);
      return undefined;
    }

    if (activeTab === "Last Day") {
      url += "?filter=last_day";
    } else if (activeTab === "Last Week") {
      url += "?filter=last_week";
    } else if (activeTab === "Last Month") {
      url += "?filter=last_month";
    }

    const controller = new AbortController();
    fetch(url, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Summary unavailable");
        return response.json();
      })
      .then((data) => {
        setNewsSummary(listItems(data).slice(0, 3));
        setError(null);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError("Unable to load summary.");
        setNewsSummary([]);
      });
    return () => controller.abort();
  }, [activeTab]);

  return (
    <section
      className="mt-6 rounded-xl border border-border bg-muted/30 p-4 min-w-0"
      aria-labelledby="news-summary-heading"
    >
      <h2 id="news-summary-heading" className="text-lg font-semibold mb-1">
        Briefing Recap
      </h2>
      <p className="text-xs text-muted-foreground mb-3">
        Quick digest across recent publication windows
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList
          aria-label="News summary period"
          className="grid w-full grid-cols-3 h-auto p-1"
        >
          {SUMMARY_TABS.map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="text-xs px-1.5 py-1.5 truncate"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-3 space-y-3">
          {error && <p className="text-xs text-destructive">{error}</p>}
          {newsSummary.length > 0 ? (
            <ul className="space-y-2.5 divide-y divide-border/60">
              {newsSummary.map((news) => (
                <li key={news.id} className="pt-2.5 first:pt-0">
                  <Link
                    href={`/news/${news.id}`}
                    className="text-sm font-medium text-foreground hover:underline underline-offset-4 block leading-snug"
                  >
                    {news.title}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {news.summary || news.description}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            !error && (
              <p className="text-xs text-muted-foreground">
                No digest items in this window yet.
              </p>
            )
          )}
          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Window: {activeTab.toLowerCase()}
            </span>
            <Link
              href="/timelines"
              className="inline-flex items-center gap-1 font-semibold hover:underline underline-offset-4"
            >
              Full timeline
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
