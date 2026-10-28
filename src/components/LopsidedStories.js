"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ExternalLink,
  Scale,
  AlertTriangle,
  Newspaper,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import NewsImage from "./NewsImage";
import useCountry from "../lib/use-country";
import { articleMatchesCountry, countryName } from "../lib/countries";
import CoverageBar from "./CoverageBar";
import {
  buildApiUrl,
  formatNewsDate,
  listItems,
  getArticleImageUrl,
} from "../lib/api";
import {
  BIAS_META,
  getBiasBadgeStyle,
  normalizeArticleCoverage,
} from "../lib/lopsided";

const BIAS_FILTERS = [
  { key: "all", label: "All Roundups" },
  { key: "lopsided", label: "Lopsided & Blindspots" },
  { key: "polarized", label: "Center Blindspot" },
  { key: "left", label: "Left-Leaning" },
  { key: "center", label: "Center-Focused" },
  { key: "right", label: "Right-Leaning" },
  { key: "balanced", label: "Balanced" },
];

const REGION_FILTERS = [
  { key: "all", label: "Selected country" },

];

function PerspectiveColumn({ item, bucketKey, fallbackArticleId }) {
  const bucketMeta = BIAS_META[bucketKey] || BIAS_META.center;
  const rating = item?.bias_rating || bucketMeta.badgeLabel;
  const badgeStyle = getBiasBadgeStyle(rating);
  const href = item?.url || (fallbackArticleId ? `/news/${fallbackArticleId}` : "#");
  const isExternal = /^https?:\/\//i.test(href);

  return (
    <div className="flex flex-col justify-between rounded-lg border border-border bg-background p-4 min-w-0">
      <div>
        <div
          className={`-mx-4 -mt-4 mb-3 px-4 py-2 rounded-t-lg flex items-center justify-between gap-2 ${bucketMeta.headerClass}`}
        >
          <span className="text-xs font-bold uppercase tracking-wider">
            {item?.label || bucketMeta.columnLabel}
          </span>
          <span
            className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-semibold ${badgeStyle}`}
          >
            {rating}
          </span>
        </div>

        <p className="text-xs font-semibold text-muted-foreground mb-1.5 truncate">
          {item?.source || "Editorial Wire"}
        </p>

        <h4 className="text-sm sm:text-base font-semibold leading-snug text-foreground">
          {isExternal ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline underline-offset-4"
            >
              {item?.title}
            </a>
          ) : (
            <Link href={href} className="hover:underline underline-offset-4">
              {item?.title}
            </Link>
          )}
        </h4>

        {item?.summary && (
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground line-clamp-4">
            {item.summary}
          </p>
        )}
      </div>

      <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between gap-2 text-xs">
        <span className="text-muted-foreground truncate">
          {item?.source || "Source"}
        </span>
        {isExternal ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-foreground hover:underline underline-offset-4 shrink-0"
          >
            Source
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        ) : (
          <Link
            href={href}
            className="inline-flex items-center gap-1 font-medium text-foreground hover:underline underline-offset-4 shrink-0"
          >
            Read
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}

function RoundupArticleCard({ article, featured = false }) {
  const [expanded, setExpanded] = useState(featured);
  const coverage = useMemo(() => normalizeArticleCoverage(article), [article]);
  const image = getArticleImageUrl(article);
  const categoryName =
    article.categories?.map((c) => c.name).join(" · ") || "Headline Roundup";
  const isAllSides =
    article.tags?.includes("allsides-roundup") ||
    String(article.source?.name || "").includes("AllSides");

  // Group perspectives into Left, Center, Right slots for side-by-side comparison
  const leftItem = coverage.perspectives.find((p) => p.bucket === "left");
  const centerItem = coverage.perspectives.find((p) => p.bucket === "center");
  const rightItem = coverage.perspectives.find((p) => p.bucket === "right");
  const columns = [
    leftItem && { key: "left", item: leftItem },
    centerItem && { key: "center", item: centerItem },
    rightItem && { key: "right", item: rightItem },
  ].filter(Boolean);

  // If fewer than 2 distinct buckets matched, render all perspectives in order
  const displayColumns =
    columns.length >= 2
      ? columns
      : coverage.perspectives.slice(0, 3).map((item, idx) => ({
          key: item.bucket || (idx === 0 ? "left" : idx === 1 ? "center" : "right"),
          item,
        }));

  return (
    <Card className="news-card overflow-hidden border border-border bg-card shadow-none">
      <CardContent className="p-0">
        <article className="p-5 sm:p-6">
          {/* Top editorial kicker bar (ABC / AllSides inspired) */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-0.5 font-semibold text-primary-foreground uppercase tracking-wider">
                {isAllSides ? "AllSides Roundup" : categoryName}
              </span>
              {isAllSides && categoryName && (
                <span className="font-semibold text-muted-foreground uppercase tracking-wider">
                  {categoryName}
                </span>
              )}
              <span aria-hidden="true" className="text-muted-foreground">
                ·
              </span>
              <time
                dateTime={article.published_at}
                className="text-muted-foreground tabular-nums"
              >
                {formatNewsDate(article.published_at)}
              </time>
            </div>

            {coverage.isLopsided && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${coverage.dominantMeta.pillClass}`}
              >
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                {coverage.blindspotNote}
              </span>
            )}
          </div>

          {/* Headline & optional feature image (NYT / The Athletic narrative layout) */}
          <div
            className={
              image
                ? "grid grid-cols-1 md:grid-cols-12 gap-5 items-start"
                : "block"
            }
          >
            <div className={image ? "md:col-span-8 min-w-0" : "min-w-0"}>
              <Link
                href={`/news/${article.id}`}
                className="group block focus-visible:outline-none"
              >
                <h3
                  className={`${
                    featured ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"
                  } font-bold tracking-tight leading-snug text-balance group-hover:underline underline-offset-4`}
                >
                  {article.title}
                </h3>
              </Link>

              <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-muted-foreground">
                {article.description}
              </p>

              {/* ABC News-style Key Takeaways / AllSides Details Callouts */}
              {coverage.callouts.length > 0 && (
                <div className="mt-3">
                  {expanded ? (
                    <div className="space-y-2 rounded-lg border border-border/80 bg-muted/50 p-3.5 text-xs sm:text-sm">
                      {coverage.callouts.slice(0, 3).map((c, idx) => (
                        <p key={idx} className="leading-relaxed">
                          <strong className="font-semibold text-foreground">
                            {c.heading}:{" "}
                          </strong>
                          <span className="text-muted-foreground">{c.body}</span>
                        </p>
                      ))}
                    </div>
                  ) : null}
                  {!featured && (
                    <button
                      type="button"
                      onClick={() => setExpanded((v) => !v)}
                      className="mt-2 text-xs font-semibold text-foreground underline underline-offset-4 hover:text-muted-foreground"
                    >
                      {expanded
                        ? "Hide roundup context"
                        : `Read roundup context (${coverage.callouts.length} key points)`}
                    </button>
                  )}
                </div>
              )}
            </div>

            {image && (
              <div className="md:col-span-4">
                <NewsImage
                    article={article}
                  src={image}
                  alt={article.title}
                  width={480}
                  height={320}
                  className="w-full aspect-[3/2] object-cover rounded-lg border border-border"
                />
              </div>
            )}
          </div>

          {/* Coverage distribution bar */}
          <div className="mt-4 pt-4 border-t border-border/70">
            <CoverageBar article={article} />
          </div>

          {/* AllSides 3-column Left / Center / Right comparison grid */}
          <div
            className={`mt-4 grid grid-cols-1 ${
              displayColumns.length === 2
                ? "md:grid-cols-2"
                : "lg:grid-cols-3"
            } gap-3`}
          >
            {displayColumns.map(({ key, item }, idx) => (
              <PerspectiveColumn
                key={`${article.id}-${key}-${idx}`}
                bucketKey={key}
                item={item}
                fallbackArticleId={article.id}
              />
            ))}
          </div>

          {/* Missing Center or Missing Side blindspot callout when only 2 columns exist */}
          {displayColumns.length === 2 && coverage.center === 0 && (
            <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50/70 px-3.5 py-2.5 text-xs text-amber-950 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                <strong>Center Blindspot:</strong> This roundup features direct
                rebuttals between Left and Right commentators with no centrist
                wire synthesis.
              </span>
            </div>
          )}

          {/* Footer actions */}
          <div className="mt-4 pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-muted-foreground">
              Curated via{" "}
              <strong className="font-medium text-foreground">
                {article.source?.name || "AllSides Roundup"}
              </strong>
            </span>
            <div className="flex flex-wrap items-center gap-4">
              {article.article_url && /^https?:\/\//i.test(article.article_url) && (
                <a
                  href={article.article_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground hover:underline underline-offset-4"
                >
                  Original roundup
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              )}
              <Link
                href={`/news/${article.id}`}
                className="inline-flex items-center gap-1 font-semibold text-foreground hover:underline underline-offset-4"
              >
                Full story & coverage analysis
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </article>
      </CardContent>
    </Card>
  );
}

export default function LopsidedStories({ mode = "widget" }) {
  const country = useCountry();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [biasFilter, setBiasFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    if (!country) return () => controller.abort();
    const url = buildApiUrl(`/lopsided/?page_size=20&location=${country}`);
    if (!url) {
      setError("The news service is not configured.");
      setLoading(false);
      return () => controller.abort();
    }

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Unable to load multi-perspective stories.");
        return res.json();
      })
      .then((data) => {
        const items = listItems(data);
        // Sort AllSides headline roundups first so the multi-perspective desk leads with them
        const sorted = [...items].sort((a, b) => {
          const aIsAllSides =
            a.tags?.includes("allsides-roundup") ||
            String(a.source?.name || "").includes("AllSides")
              ? 1
              : 0;
          const bIsAllSides =
            b.tags?.includes("allsides-roundup") ||
            String(b.source?.name || "").includes("AllSides")
              ? 1
              : 0;
          return bIsAllSides - aIsAllSides;
        });
        setArticles(sorted);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("Unable to load multi-perspective stories right now.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [reload, country]);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      if (!articleMatchesCountry(article, country)) return false;
      const cov = normalizeArticleCoverage(article);

      if (biasFilter === "lopsided" && !cov.isLopsided) return false;
      if (
        biasFilter !== "all" &&
        biasFilter !== "lopsided" &&
        cov.dominant !== biasFilter
      ) {
        return false;
      }

      if (regionFilter === "ng" && article.location !== "ng") return false;
      if (regionFilter === "allsides" && article.location === "ng") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const inTitle = String(article.title || "")
          .toLowerCase()
          .includes(q);
        const inDesc = String(article.description || "")
          .toLowerCase()
          .includes(q);
        const inPerspectives = cov.perspectives.some(
          (p) =>
            String(p.title || "")
              .toLowerCase()
              .includes(q) ||
            String(p.source || "")
              .toLowerCase()
              .includes(q)
        );
        if (!inTitle && !inDesc && !inPerspectives) return false;
      }

      return true;
    });
  }, [articles, biasFilter, regionFilter, searchQuery, country]);

  const stats = useMemo(() => {
    let lopsidedCount = 0;
    let leftHeavy = 0;
    let rightHeavy = 0;
    let balancedCount = 0;

    for (const art of articles) {
      const cov = normalizeArticleCoverage(art);
      if (cov.isLopsided) lopsidedCount += 1;
      if (cov.dominant === "left") leftHeavy += 1;
      else if (cov.dominant === "right") rightHeavy += 1;
      else if (cov.dominant === "balanced") balancedCount += 1;
    }

    return {
      total: articles.length,
      lopsidedCount,
      leftHeavy,
      rightHeavy,
      balancedCount,
    };
  }, [articles]);

  if (!country) return <p className="py-6 text-sm text-muted-foreground">Choose a country to compare its reporting.</p>;
  if (loading) {
    return (
      <section
        aria-label="Loading multi-perspective coverage"
        role="status"
        className="rounded-xl border border-border bg-muted/40 p-6 my-6"
      >
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72 mt-2" />
        <Skeleton className="h-44 w-full mt-5" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-xl border border-border bg-muted/40 p-6 my-6">
        <h2 className="text-lg font-semibold">
          Balanced & Lopsided Coverage Desk
        </h2>
        <p role="alert" className="mt-2 text-sm text-muted-foreground">
          {error}
        </p>
        <Button
          variant="outline"
          type="button"
          className="mt-4"
          onClick={() => setReload((v) => v + 1)}
        >
          Retry
        </Button>
      </section>
    );
  }

  if (!articles.length) {
    return null;
  }

  // Compact widget mode for the Home page (/)
  if (mode === "widget") {
    const displayList = filteredArticles.slice(0, 2);

    return (
      <section
        aria-labelledby="lopsided-widget-heading"
        className="rounded-xl border border-border bg-muted/30 p-4 sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-border">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Scale className="h-3.5 w-3.5" aria-hidden="true" />
              AllSides Spectrum · Framing & Blindspot Radar
            </div>
            <h2
              id="lopsided-widget-heading"
              className="text-xl sm:text-2xl font-bold tracking-tight mt-1"
            >
              Side-by-Side & Lopsided Stories
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Compare how Left, Center, and Right newsrooms frame major stories
              and spot one-sided coverage blindspots.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild className="shrink-0">
            <Link href="/lopsided">
              All {articles.length} Roundups
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        {/* Filter bar */}
        <div
          role="group"
          aria-label="Filter roundups by coverage bias"
          className="flex flex-wrap gap-1.5 my-4"
        >
          {BIAS_FILTERS.slice(0, 5).map((f) => {
            const active = biasFilter === f.key;
            return (
              <Button
                key={f.key}
                type="button"
                size="sm"
                variant={active ? "default" : "outline"}
                aria-pressed={active}
                onClick={() => setBiasFilter(f.key)}
                className="h-8 text-xs"
              >
                {f.label}
              </Button>
            );
          })}
        </div>

        {displayList.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No stories match that bias filter.{" "}
            <button
              type="button"
              onClick={() => setBiasFilter("all")}
              className="underline font-medium text-foreground"
            >
              Show all roundups
            </button>
          </p>
        ) : (
          <div className="space-y-4">
            {displayList.map((article, index) => (
              <RoundupArticleCard
                key={article.id}
                article={article}
                featured={index === 0}
              />
            ))}
          </div>
        )}
      </section>
    );
  }

  // Full page mode for /lopsided
  const [leadStory, ...remainingStories] = filteredArticles;

  return (
    <div className="space-y-8">
      {/* KBTX / ABC-inspired Spectrum Radar & Summary Metrics */}
      <section
        aria-label="Coverage spectrum overview"
        className="rounded-xl border border-border bg-muted/40 p-5 sm:p-6"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg border border-border bg-background p-3.5">
            <p className="text-xs font-medium text-muted-foreground">
              Tracked Roundups
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {stats.total}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {countryName(country)} edition
            </p>
          </div>
          <div className="rounded-lg border border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 p-3.5">
            <p className="text-xs font-semibold text-amber-950 dark:text-amber-200">
              Lopsided / Blindspots
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-amber-950 dark:text-amber-100">
              {stats.lopsidedCount}
            </p>
            <p className="mt-0.5 text-[11px] text-amber-900/80 dark:text-amber-200/80">
              Skewed or missing side
            </p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50/40 dark:bg-blue-950/20 p-3.5">
            <p className="text-xs font-semibold text-blue-950 dark:text-blue-200">
              Left vs Right Skew
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
              {stats.leftHeavy}L · {stats.rightHeavy}R
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Dominant outlet framing
            </p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5">
            <p className="text-xs font-semibold text-emerald-950 dark:text-emerald-200">
              Balanced Tri-Column
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-950 dark:text-emerald-100">
              {stats.balancedCount}
            </p>
            <p className="mt-0.5 text-[11px] text-emerald-900/80 dark:text-emerald-200/80">
              Even L · C · R split
            </p>
          </div>
        </div>

        {/* Interactive Filter & Search Controls */}
        <div className="mt-5 pt-4 border-t border-border flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div
              role="group"
              aria-label="Filter by newsroom desk"
              className="flex flex-wrap items-center gap-1.5"
            >
              <span className="text-xs font-semibold text-muted-foreground mr-1 inline-flex items-center gap-1">
                <Newspaper className="h-3.5 w-3.5" aria-hidden="true" />
                Desk:
              </span>
              {REGION_FILTERS.map((rf) => {
                const active = regionFilter === rf.key;
                return (
                  <Button
                    key={rf.key}
                    type="button"
                    size="sm"
                    variant={active ? "secondary" : "ghost"}
                    aria-pressed={active}
                    onClick={() => setRegionFilter(rf.key)}
                    className="h-8 text-xs"
                  >
                    {rf.key === "all" ? countryName(country) : rf.label}
                  </Button>
                );
              })}
            </div>

            <div className="w-full sm:w-64">
              <Label htmlFor="lopsided-search" className="sr-only">
                Filter roundups by keyword or outlet
              </Label>
              <Input
                id="lopsided-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by topic or outlet…"
                className="h-8 text-xs bg-background"
              />
            </div>
          </div>

          <div
            role="group"
            aria-label="Filter by media bias classification"
            className="flex flex-wrap items-center gap-1.5"
          >
            <span className="text-xs font-semibold text-muted-foreground mr-1 inline-flex items-center gap-1">
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              Spectrum:
            </span>
            {BIAS_FILTERS.map((f) => {
              const active = biasFilter === f.key;
              return (
                <Button
                  key={f.key}
                  type="button"
                  size="sm"
                  variant={active ? "default" : "outline"}
                  aria-pressed={active}
                  onClick={() => setBiasFilter(f.key)}
                  className="h-8 text-xs"
                >
                  {f.label}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {filteredArticles.length === 0 ? (
        <section className="rounded-xl border border-border bg-muted/30 p-8 text-center">
          <h2 className="text-lg font-semibold">
            No roundups match your current filters
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Try clearing your search query or switching back to All Roundups.
          </p>
          <Button
            variant="outline"
            type="button"
            className="mt-4"
            onClick={() => {
              setBiasFilter("all");
              setRegionFilter("all");
              setSearchQuery("");
            }}
          >
            Reset filters
          </Button>
        </section>
      ) : (
        <>
          {leadStory && (
            <section aria-labelledby="lead-roundup-heading">
              <div className="flex items-center justify-between mb-3">
                <h2
                  id="lead-roundup-heading"
                  className="text-lg font-bold tracking-tight uppercase text-muted-foreground"
                >
                  Featured Headline Roundup
                </h2>
                <span className="text-xs text-muted-foreground tabular-nums">
                  Showing {filteredArticles.length} of {articles.length} stories
                </span>
              </div>
              <RoundupArticleCard article={leadStory} featured={true} />
            </section>
          )}

          {remainingStories.length > 0 && (
            <section aria-labelledby="more-roundups-heading">
              <h2
                id="more-roundups-heading"
                className="text-lg font-bold tracking-tight uppercase text-muted-foreground mb-4"
              >
                More Multi-Perspective & Blindspot Roundups
              </h2>
              <div className="space-y-6">
                {remainingStories.map((article) => (
                  <RoundupArticleCard
                    key={article.id}
                    article={article}
                    featured={false}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
