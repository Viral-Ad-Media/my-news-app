"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Copy,
  Globe2,
  Layers,
  Rss,
  Scale,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useCountry from "../lib/use-country";
import useCategories from "../lib/use-categories";
import { categoryLinks } from "../lib/categories";
import { articleMatchesCountry, countryName } from "../lib/countries";
import { buildApiUrl, formatNewsDate, listItems } from "../lib/api";

const OTHER_REGIONAL_RSS_FEEDS = [
  {
    title: "Nigeria Regional Desk RSS",
    path: "/rss.xml?location=ng",
    badge: "NG",
    description:
      "Nigerian economy, capital markets, energy, regulation, and public policy.",
  },
  {
    title: "United States Desk RSS",
    path: "/rss.xml?location=us",
    badge: "US",
    description:
      "U.S. science, NASA exploration, elections, and national roundups.",
  },
  {
    title: "United Kingdom Desk RSS",
    path: "/rss.xml?location=gb",
    badge: "GB",
    description:
      "UK Treasury, urban regeneration, and national reporting.",
  },
];

const SPECTRUM_RSS_FEEDS = [
  {
    title: "Lopsided & Blindspot Radar RSS",
    path: "/rss.xml?bias=lopsided",
    badge: "BLINDSPOT",
    description:
      "Stories where coverage skews heavily Left, Right, or exhibits a Center blindspot.",
  },
  {
    title: "Balanced Tri-Column Coverage RSS",
    path: "/rss.xml?bias=balanced",
    badge: "BALANCED",
    description:
      "Stories with even Left · Center · Right newsroom representation.",
  },
];

export default function RssDirectory() {
  const country = useCountry();
  const { categories, error: categoriesError } = useCategories();
  const topicFeeds = categoryLinks(categories).map(category => category.name);
  const [copyError, setCopyError] = useState("");
  const REGIONAL_RSS_FEEDS = [{ title: `${countryName(country)} edition RSS`, path: `/rss.xml?location=${country}`, badge: country.toUpperCase(), description: "Only stories from your selected country." }, ...OTHER_REGIONAL_RSS_FEEDS.filter(feed => feed.path.includes("location=") && !feed.path.endsWith(`=${country}`))];
  const [copiedPath, setCopiedPath] = useState("");
  const [previewArticles, setPreviewArticles] = useState([]);

  useEffect(() => {
    if (!country) return;
    const url = buildApiUrl(`/news/?page_size=6&location=${country}`);
    if (!url) return;
    const controller = new AbortController();
    fetch(url, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setPreviewArticles(listItems(data).slice(0, 6));
      })
      .catch(() => {});
    return () => controller.abort();
  }, [country]);

  async function handleCopy(path) {
    setCopyError("");
    const fullUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${path}`
        : path;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedPath(path);
      setTimeout(() => setCopiedPath(""), 2000);
    } catch {
      setCopiedPath("");
      setCopyError("Could not copy the feed address. Open its XML link and copy the address from your browser.");
    }
  }

  return (
    <div className="space-y-8 min-w-0">
      <header className="rounded-xl border border-border bg-muted/40 p-5 sm:p-7 space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wider">
          <Rss className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
          Open Syndication · RSS 2.0
        </div>
        <h1 className="fluid-article-title font-bold tracking-tight">
          AbokiNews RSS Feeds &amp; Syndication Hub
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
          Follow AbokiNews in Feedly, NetNewsWire, Reeder, thunderbird, or any
          RSS 2.0 reader. Subscribe to the master wire or filter by regional
          desk, topic beat, or media bias spectrum.
        </p>
      </header>

      {copyError && <p role="alert">{copyError}</p>}
      {/* Regional & Spectrum RSS Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-6 min-w-0">
          <Card className="border border-border shadow-none">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Globe2 className="h-4 w-4" aria-hidden="true" />
                Master &amp; Regional Desk RSS Feeds
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {REGIONAL_RSS_FEEDS.map((feed) => (
                <div
                  key={feed.path}
                  className="rounded-lg border border-border bg-muted/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {feed.badge}
                      </Badge>
                      <h2 className="text-sm font-bold truncate">
                        {feed.title}
                      </h2>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {feed.description}
                    </p>
                    <code className="block text-[11px] font-mono text-foreground/80 pt-0.5">
                      {feed.path}
                    </code>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => handleCopy(feed.path)}
                    >
                      {copiedPath === feed.path ? (
                        <>
                          <Check className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                          Copy URL
                        </>
                      )}
                    </Button>
                    <Button variant="default" size="sm" asChild className="h-8 text-xs">
                      <a href={feed.path} target="_blank" rel="noopener noreferrer">
                        Open XML
                        <ArrowUpRight className="h-3.5 w-3.5 ml-1" aria-hidden="true" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-border shadow-none">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Scale className="h-4 w-4" aria-hidden="true" />
                Media Bias &amp; Blindspot RSS Feeds
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {SPECTRUM_RSS_FEEDS.map((feed) => (
                <div
                  key={feed.path}
                  className="rounded-lg border border-border bg-muted/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {feed.badge}
                      </Badge>
                      <h2 className="text-sm font-bold truncate">
                        {feed.title}
                      </h2>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {feed.description}
                    </p>
                    <code className="block text-[11px] font-mono text-foreground/80 pt-0.5">
                      {feed.path}
                    </code>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => handleCopy(feed.path)}
                    >
                      {copiedPath === feed.path ? (
                        <>
                          <Check className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                          Copy URL
                        </>
                      )}
                    </Button>
                    <Button variant="default" size="sm" asChild className="h-8 text-xs">
                      <a href={feed.path} target="_blank" rel="noopener noreferrer">
                        Open XML
                        <ArrowUpRight className="h-3.5 w-3.5 ml-1" aria-hidden="true" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Topic Category Feeds & Live Item Preview */}
        <div className="lg:col-span-5 space-y-6 min-w-0">
          <Card className="border border-border shadow-none">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Layers className="h-4 w-4" aria-hidden="true" />
                Topic Category RSS Feeds
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {categoriesError && <p role="alert">{categoriesError} The standard category feeds are still listed below.</p>}
              {topicFeeds.map((topic) => {
                const path = `/rss.xml?category=${encodeURIComponent(topic)}`;
                return (
                  <div
                    key={topic}
                    className="rounded-lg border border-border bg-muted/30 p-3 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{topic}</p>
                      <code className="text-[10px] text-muted-foreground truncate block">
                        {path}
                      </code>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => handleCopy(path)}
                        aria-label={`Copy ${topic} RSS URL`}
                      >
                        {copiedPath === path ? (
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-7 px-2 text-xs"
                      >
                        <a href={path} target="_blank" rel="noopener noreferrer" aria-label={`${topic} RSS XML`}>
                          XML
                        </a>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {previewArticles.length > 0 && (
            <Card className="border border-border shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Rss className="h-4 w-4 text-amber-600" aria-hidden="true" />
                  Latest Syndicated Wire Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {previewArticles.filter(article => articleMatchesCountry(article, country)).map((art) => (
                  <div
                    key={art.id}
                    className="rounded-lg border border-border bg-muted/20 p-3 space-y-1"
                  >
                    <Link
                      href={`/news/${art.id}`}
                      className="text-xs sm:text-sm font-semibold leading-snug hover:underline underline-offset-4 block"
                    >
                      {art.title}
                    </Link>
                    <p className="text-[11px] text-muted-foreground">
                      {art.source?.name} · {formatNewsDate(art.published_at)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
