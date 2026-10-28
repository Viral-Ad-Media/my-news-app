"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildApiUrl } from "../../../lib/api";
import NewsList from "../../../components/NewsList";

export default function CategoryDetails({ params }) {
  const [category, setCategory] = useState(null);
  const [error, setError] = useState("");
  const { categoryId } = use(params);

  useEffect(() => {
    const controller = new AbortController();
    setCategory(null);
    setError("");
    const url = buildApiUrl(`/categories/${categoryId}/`);
    if (!url) {
      setError("News service is not configured.");
      return undefined;
    }
    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok)
          throw new Error(
            res.status === 404
              ? "Category not found."
              : "Unable to load category.",
          );
        return res.json();
      })
      .then(setCategory)
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message);
      });
    return () => controller.abort();
  }, [categoryId]);

  if (error) {
    return (
      <p role="alert" className="text-destructive">
        {error}
      </p>
    );
  }

  if (!category) {
    return <p className="text-muted-foreground">Loading category…</p>;
  }

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-border bg-muted/40 p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge className="uppercase tracking-wider text-[11px]">
              Topic Beat
            </Badge>
            {typeof category.article_count === "number" && (
              <span className="text-xs text-muted-foreground">
                {category.article_count} stored{" "}
                {category.article_count === 1 ? "story" : "stories"}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {category.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Source-linked reporting and multi-perspective coverage in{" "}
            {category.name}.
          </p>
        </div>

        <Button variant="outline" size="sm" asChild>
          <Link href="/topics?manage=1#followed-categories">
            <SlidersHorizontal className="h-4 w-4 mr-1.5" aria-hidden="true" />
            Manage Topic Preferences
          </Link>
        </Button>
      </header>

      <NewsList
        title={category.name}
        query={`category_id=${encodeURIComponent(categoryId)}`}
      />
    </div>
  );
}
