"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import NewsImage from "./NewsImage";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatNewsDate,
  listItems,
  buildApiUrl,
  getArticleImageUrl,
} from "../lib/api";

export default function TopNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const url = buildApiUrl("/news/?page_size=5");
    if (!url) {
      setError("The news service is not configured.");
      setLoading(false);
      return;
    }
    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setNews(listItems(data));
        setError("");
      })
      .catch((err) => {
        if (err.name !== "AbortError")
          setError("We couldn’t load the latest briefing.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [revision]);
  if (loading)
    return (
      <section
        aria-label="Loading briefing"
        role="status"
        className="rounded-xl bg-muted p-6"
      >
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-7 w-1/2 mt-3" />
        <Skeleton className="h-16 mt-6" />
      </section>
    );
  if (error)
    return (
      <section className="rounded-xl bg-muted p-6">
        <h2 className="font-semibold">Latest briefing</h2>
        <p role="alert" className="mt-2">
          {error}
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => setRevision((v) => v + 1)}
        >
          Retry
        </Button>
      </section>
    );
  if (!news.length)
    return (
      <section className="rounded-xl bg-muted p-6">
        <h2 className="font-semibold">Latest briefing</h2>
        <p className="mt-2">No stories published yet. Check back soon.</p>
      </section>
    );
  const [lead, ...others] = news;
  const image = getArticleImageUrl(lead);
  return (
    <section aria-labelledby="briefing-title">
      <h2 id="briefing-title" className="text-lg font-semibold mb-4">
        Latest briefing
      </h2>
      <div className="rounded-xl bg-muted overflow-hidden">
        {image && (
          <NewsImage
            src={image}
            alt=""
            width={1000}
            height={480}
            className="w-full aspect-[2/1] object-cover"
          />
        )}
        <article className="p-5 sm:p-7">
          <p className="text-sm text-muted-foreground mb-3">
            {lead.categories?.map((c) => c.name).join(" · ") || "News"} ·{" "}
            {lead.source?.name}
          </p>
          <Link href={`/news/${lead.id}`} className="group block">
            <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight text-balance group-hover:underline underline-offset-4">
              {lead.title}
            </h3>
          </Link>
          <p className="mt-4 text-base leading-relaxed max-w-4xl">
            {lead.description}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <time
              className="text-sm text-muted-foreground"
              dateTime={lead.published_at}
            >
              {formatNewsDate(lead.published_at)}
            </time>
            <Button variant="ghost" asChild className="px-0">
              <Link href={`/news/${lead.id}`}>
                Read story
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </article>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
        {others.slice(0, 3).map((item) => {
          const itemImage = getArticleImageUrl(item);
          return (
            <article
              key={item.id}
              className="rounded-xl bg-muted/60 overflow-hidden flex flex-col"
            >
              {itemImage && (
                <Link href={`/news/${item.id}`} className="block">
                  <NewsImage
                    src={itemImage}
                    alt=""
                    width={480}
                    height={260}
                    className="w-full h-36 object-cover"
                  />
                </Link>
              )}
              <div className="p-5 flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">
                  {item.source?.name} · {item.categories?.[0]?.name || "News"}
                </p>
                <Link
                  href={`/news/${item.id}`}
                  className="hover:underline underline-offset-4"
                >
                  <h3 className="text-lg leading-snug font-semibold">
                    {item.title}
                  </h3>
                </Link>
                <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                  {item.description}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
