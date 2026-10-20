"use client";

import useSavedStories from "../lib/use-saved-stories";
import SaveStoryButton from "./SaveStoryButton";
import CoverageBar from "./CoverageBar";
import Link from "next/link";
import Image from "./NewsImage";
import { formatNewsDate, getArticleImageUrl } from "../lib/api";

export default function RelatedNews({ articles }) {
  const relatedArticles = Array.isArray(articles) ? articles : [];

  const savedIds = useSavedStories(
    relatedArticles.map((article) => article.id),
  );

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold tracking-tight">Related Stories</h2>
        <p className="text-sm text-muted-foreground">
          More coverage from shared beats and editorial categories
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {relatedArticles.map((news) => (
          <article
            key={news.id}
            className="rounded-xl border border-border bg-card p-4 flex flex-col justify-between gap-3"
          >
            <div className="space-y-2.5">
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground truncate">
                  {news.categories && news.categories.length > 0
                    ? news.categories.map((cat) => cat.name).join(" · ")
                    : "News"}
                </span>
                <SaveStoryButton
                  articleId={news.id}
                  initiallySaved={savedIds.includes(news.id)}
                />
              </div>

              {getArticleImageUrl(news) && (
                <Link href={`/news/${news.id}`} className="block">
                  <Image
                    src={getArticleImageUrl(news)}
                    alt={news.title}
                    width={400}
                    height={200}
                    className="w-full h-36 object-cover rounded-md"
                  />
                </Link>
              )}

              <h3 className="text-base font-semibold leading-snug">
                <Link
                  href={`/news/${news.id}`}
                  className="hover:underline underline-offset-4"
                >
                  {news.title}
                </Link>
              </h3>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/60">
              <CoverageBar
                article={news}
                sources={news.total_sources}
                compact={true}
                showLegend={false}
              />
              <p className="text-xs text-muted-foreground">
                {news.source?.name ? `${news.source.name} · ` : ""}
                {formatNewsDate(news.published_at)}
                {news.location ? ` · ${String(news.location).toUpperCase()}` : ""}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
