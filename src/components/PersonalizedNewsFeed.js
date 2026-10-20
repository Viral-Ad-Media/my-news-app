"use client";

import Link from "next/link";
import { LayoutDashboard, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import NewsList from "./NewsList";
import { useLanguage } from "../lib/i18n";

export default function PersonalizedNewsFeed() {
  const { t } = useLanguage();
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-4 py-2.5 text-xs sm:text-sm">
        <span className="text-muted-foreground font-medium">
          {t(
            "feed_tailored",
            "Tailored to your subscribed beats and reading preferences.",
          )}
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/news/custom"
            className="inline-flex items-center gap-1 font-semibold underline underline-offset-4 hover:text-muted-foreground"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            {t("choose_topics", "Choose your topics")}
          </Link>
          <Button variant="outline" size="sm" asChild className="h-7 text-xs">
            <Link href="/dashboard">
              <LayoutDashboard className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
              {t("reader_dashboard", "Reader Dashboard")}
            </Link>
          </Button>
        </div>
      </div>
      <NewsList
        title={t("your_news_feed", "Your News Feed")}
        endpoint="/feed/"
        privateFeed
      />
    </div>
  );
}
