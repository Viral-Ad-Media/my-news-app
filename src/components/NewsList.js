"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  formatNewsDate,
  withinPublicationWindow,
  listItems,
  getArticleImageUrl,
} from "../lib/api";
import useSavedStories from "../lib/use-saved-stories";
import NewsImage from "./NewsImage";
import SaveStoryButton from "./SaveStoryButton";
import useNewsStream from "../lib/use-news-stream";
import useCountry from "../lib/use-country";
import { articleMatchesCountry } from "../lib/countries";
import CoverageBar from "./CoverageBar";

export default function NewsList({
  title = "News",
  endpoint = "/news/",
  query = "",
  privateFeed = false,
  saved = false,
  refreshMs = 0,
  showCategories = false,
}) {
  const country = useCountry();
  const [page, setPage] = useState(1);
  const params = new URLSearchParams(query);
  params.set("page", page);
  const { data, error, loading, updatedAt, refresh } = useNewsStream({ endpoint, query: params.toString(), country, privateFeed, refreshMs });
  useEffect(() => { setPage(1); }, [query, endpoint, country]);
  const articles = listItems(data).filter(article => articleMatchesCountry(article, country) && withinPublicationWindow(article, params.get("filter")));
  const savedIds = useSavedStories(articles.map((article) => article.id));
  return (
    <section className="news-list my-6" aria-busy={loading}>
      <h2 className="editorial-section-title text-2xl font-semibold mb-6">{title}</h2>
      {refreshMs > 0 && <p className="stream-update" role="status">{updatedAt ? `Last checked ${new Date(updatedAt).toLocaleTimeString()}. ` : ""}Updates every {refreshMs / 1000} seconds while this tab is open.</p>}
      {error && articles.length > 0 && <p role="alert" className="mb-4 text-sm">{error} <button type="button" className="underline" onClick={refresh}>Retry</button></p>}
      {!country ? <p className="text-sm text-muted-foreground">Choose a country to see its stories.</p> : loading ? (
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
      ) : error && !articles.length ? (
        <p role="alert">
          {error}{" "}
          <Button
            variant="outline"
            type="button"
            className="ml-2"
            onClick={refresh}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {articles.map((article) => (
              <Card
                key={article.id}
                className="news-card bg-transparent border-0 rounded-none shadow-none min-w-0"
              >
                <CardContent className="p-0 h-full">
                  <article className="flex h-full flex-col min-w-0">
                    {showCategories && <p className="stream-category">Category: {article.categories?.map(category => category.name).join(" · ") || "General news"}</p>}
                    <Link href={`/news/${article.id}`}>
                      {getArticleImageUrl(article) && (
                        <NewsImage
                          article={article}
                          src={getArticleImageUrl(article)}
                          alt={article.title}
                          width={640}
                          height={360}
                          className="w-full aspect-[16/9] object-cover rounded"
                        />
                      )}
                      <h3 className="font-semibold text-base sm:text-lg mt-3 leading-snug text-balance">
                        {article.title}
                      </h3>
                    </Link>
                    <p className="text-sm my-3 leading-relaxed text-muted-foreground line-clamp-3">
                      {article.description}
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">
                      {article.source?.name} ·{" "}
                      {formatNewsDate(article.published_at)}
                    </p>
                    {article.total_sources > 1 &&
                      Array.isArray(article.perspectives) &&
                      article.perspectives.length > 1 &&
                      typeof article.left_coverage === "number" && (
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
                        if (saved) refresh();
                      }}
                    />
                  </article>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 sm:gap-4 items-center justify-between sm:justify-start mt-4">
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
