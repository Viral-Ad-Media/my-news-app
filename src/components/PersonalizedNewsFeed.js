"use client";

import Link from "next/link";
import { LayoutDashboard, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import NewsList from "./NewsList";

export default function PersonalizedNewsFeed() {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-4 py-2.5 text-xs sm:text-sm">
        <span className="text-muted-foreground font-medium">
          Tailored to your subscribed beats and reading preferences.
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/news/custom"
            className="inline-flex items-center gap-1 font-semibold underline underline-offset-4 hover:text-muted-foreground"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            Choose your topics
          </Link>
          <Button variant="outline" size="sm" asChild className="h-7 text-xs">
            <Link href="/dashboard">
              <LayoutDashboard className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
              Reader Dashboard
            </Link>
          </Button>
        </div>
      </div>
      <NewsList title="Your News Feed" endpoint="/feed/" privateFeed />
    </div>
  );
}
