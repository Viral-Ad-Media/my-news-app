"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  formatNewsDate,
  buildApiUrl,
  listItems,
  resolveApiAssetUrl,
} from "../lib/api";
import useSavedStories from "../lib/use-saved-stories";
import NewsImage from "./NewsImage";
import SaveStoryButton from "./SaveStoryButton";
import CoverageBar from "./CoverageBar";

export default function NewsList({
  title = "News",
  endpoint = "/news/",
  query = "",
  privateFeed = false,
  saved = false,
}) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    setPage(1);
  }, [query, endpoint]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const params = new URLSearchParams(query);
    params.set("page", page);
    const url = privateFeed
      ? `/api/reader${endpoint}?${params}`
      : buildApiUrl(`${endpoint}?${params}`);
    if (!url) {
      setError("News service is not configured.");
      setLoading(false);
      return;
    }
    fetch(url, { signal: controller.signal })
      .then(async (response) => {
        if (response.status === 401)
          throw new Error("Please login to view your feed.");
        if (!response.ok) throw new Error("Unable to load stories.");
        return response.json();
      })
      .then(setData)
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [endpoint, query, page, privateFeed, reload]);
  const articles = listItems(data);
  const savedIds = useSavedStories(articles.map((article) => article.id));
  return (
    <section className="my-6" aria-busy={loading}>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {loading ? (
        <div
          role="status"
          aria-label="Loading stories"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {[1, 2, 3].map((id) => (
            <Card key={id} aria-hidden="true">
              <CardContent className="p-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-6 mt-3 w-4/5" />
                <Skeleton className="h-4 mt-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <p role="alert">
          {error}{" "}
          <Button
            variant="outline"
            type="button"
            className="ml-2"
            onClick={() => setReload((v) => v + 1)}
          >
            Retry
          </Button>
          {privateFeed && (
            <Link className="underline" href="/login">
              Login
            </Link>
          )}
        </p>
      ) : (
        <>
          {!articles.length && <p>No stories available for these filters.</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {articles.map((article) => (
              <Card
                key={article.id}
                className="news-card bg-muted/50 border-0 shadow-none"
              >
                <CardContent className="p-4 h-full">
                  <article className="flex h-full flex-col">
                    <Link href={`/news/${article.id}`}>
                      {(article.image_url || article.image) && (
                        <NewsImage
                          src={
                            resolveApiAssetUrl(
                              article.image_url || article.image,
                            ) || "/images/Placeholder.webp"
                          }
                          alt={article.title}
                          width={640}
                          height={360}
                          className="w-full h-40 object-cover rounded"
                        />
                      )}
                      <h3 className="font-semibold text-lg mt-3 leading-snug">
                        {article.title}
                      </h3>
                    </Link>
                    <p className="text-base my-3 leading-relaxed">
                      {article.description}
                    </p>
                    <p className="text-xs text-gray-600 mb-2">
                      {article.source?.name} ·{" "}
                      {formatNewsDate(article.published_at)}
                    </p>
                    {typeof article.left_coverage === "number" && (
                      <div className="mb-3">
                        <CoverageBar
                          article={article}
                          compact={true}
                          showLegend={false}
                        />
                      </div>
                    )}
                    <SaveStoryButton
                      articleId={article.id}
                      initiallySaved={saved || savedIds.includes(article.id)}
                      onChange={() => {
                        if (saved) setReload((value) => value + 1);
                      }}
                    />
                  </article>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex gap-4 items-center mt-4">
            <Button
              disabled={page === 1 || loading}
              variant="outline"
              type="button"
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span aria-live="polite" className="text-sm tabular-nums">
              Page {page}
            </span>
            <Button
              disabled={!data?.next || loading}
              variant="outline"
              type="button"
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
