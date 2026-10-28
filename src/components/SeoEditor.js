"use client";

import { useEffect, useState } from "react";
import { Check, Circle, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getSiteUrl } from "../lib/seo";

const area =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
export default function SeoEditor({ value, onChange }) {
  const [analysis, setAnalysis] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const payload = JSON.stringify({ ...value, site_url: getSiteUrl() });
  useEffect(() => {
    if (!value.title.trim()) {
      setAnalysis(null);
      setBusy(false);
      return;
    }
    const controller = new AbortController();
    setBusy(true);
    setAnalysis(null);
    setError("");
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/reader/superadmin/seo/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          signal: controller.signal,
        });
        if (!res.ok)
          throw new Error(
            res.status === 404
              ? "Metadata checks are unavailable right now. Publishing is still available."
              : "Could not check metadata. Your changes are still in the form.",
          );
        setAnalysis(await res.json());
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        if (!controller.signal.aborted) setBusy(false);
      }
    }, 600);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [payload, revision, value.title]);
  const update = (key, next) => onChange({ ...value, [key]: next });
  const title = value.seo_title || value.title;
  const description = value.seo_description || value.description;
  const previewUrl =
    value.canonical_url || `${getSiteUrl()}/news/${value.id || "new-post"}`;
  const checks = analysis?.checks || [];
  const pending = checks.filter((c) => !c.passed);
  const [onlyIssues, setOnlyIssues] = useState(true);

  return (
    <section
      aria-labelledby="seo-editor-title"
      className="seo-editor space-y-5 rounded-lg bg-muted/40 p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="seo-editor-title" className="text-lg font-semibold">
            Search &amp; sharing
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Crawled news publishes automatically with prepared metadata. These optional checks do not hold publication.
          </p>
        </div>
        <div role="status" aria-live="polite" className="text-right shrink-0">
          <p className="text-2xl tabular-nums font-normal text-blue-700 dark:text-blue-300">
            {busy ? "—" : analysis ? `${analysis.score}/100` : "—"}
          </p>
          <p className="text-xs text-muted-foreground">
            {busy ? "Checking metadata…" : "Editorial SEO"}
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="seo-focus">Focus keyword</Label>
        <Input
          id="seo-focus"
          maxLength={100}
          value={value.focus_keyword}
          onChange={(e) => update("focus_keyword", e.target.value)}
          placeholder="The main topic, in a few words"
        />
        <p className="text-xs text-muted-foreground">
          For your content checks. This is not a meta-keywords tag.
        </p>
      </div>
      <Tabs defaultValue="search">
        <TabsList
          aria-label="SEO settings"
          className="flex flex-wrap h-auto w-fit max-w-full gap-1"
        >
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        <TabsContent value="search" className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="seo-title">SEO title</Label>
            <Input
              id="seo-title"
              maxLength={120}
              value={value.seo_title}
              placeholder={value.title || "Uses your headline when empty"}
              onChange={(e) => update("seo_title", e.target.value)}
            />
            <p className="text-xs text-muted-foreground tabular-nums">
              {title.length} characters · suggested 30–60
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo-description">Meta description</Label>
            <textarea
              id="seo-description"
              rows={3}
              maxLength={320}
              className={area}
              value={value.seo_description}
              placeholder={value.description || "Uses your summary when empty"}
              onChange={(e) => update("seo_description", e.target.value)}
            />
            <p className="text-xs text-muted-foreground tabular-nums">
              {description.length} characters · suggested 120–160
            </p>
          </div>
          <div
            className="rounded-lg bg-background p-4 min-w-0"
            aria-label="Search result preview"
          >
            <p className="text-xs text-muted-foreground mb-2">
              Search preview · approximate
            </p>
            <p className="text-xs break-all">{previewUrl}</p>
            <p className="mt-1 text-lg text-blue-700 dark:text-blue-300 leading-snug break-words">
              {title || "Your story title"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground break-words">
              {description || "Your description will appear here."}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Search engines choose their own titles and snippets. Length ranges
            are writing prompts, not indexing limits.
          </p>
        </TabsContent>
        <TabsContent value="social" className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="seo-og-title">Social title</Label>
            <Input
              id="seo-og-title"
              maxLength={120}
              value={value.og_title}
              placeholder={title || "Uses the search title"}
              onChange={(e) => update("og_title", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo-og-desc">Social description</Label>
            <textarea
              id="seo-og-desc"
              rows={3}
              maxLength={320}
              className={area}
              value={value.og_description}
              placeholder={description || "Uses the search description"}
              onChange={(e) => update("og_description", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo-og-image">Social image URL</Label>
            <Input
              id="seo-og-image"
              type="url"
              maxLength={2000}
              value={value.og_image_url}
              onChange={(e) => update("og_image_url", e.target.value)}
              placeholder="https://…"
            />
            <p className="text-xs text-muted-foreground">
              Uses the story image when empty. Choose an image you have
              permission to share.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo-image-alt">Story image description</Label>
            <Input
              id="seo-image-alt"
              maxLength={255}
              value={value.image_alt}
              onChange={(e) => update("image_alt", e.target.value)}
              placeholder="What does the image show?"
            />
          </div>
        </TabsContent>
        <TabsContent value="advanced" className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="seo-canonical">Canonical URL</Label>
            <Input
              id="seo-canonical"
              type="url"
              maxLength={2000}
              value={value.canonical_url}
              onChange={(e) => update("canonical_url", e.target.value)}
              placeholder="Uses this post's public URL"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for this post. Change only when another URL is the
              preferred version.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo-schema">Article schema</Label>
            <select
              id="seo-schema"
              className={area}
              value={value.schema_type}
              onChange={(e) => update("schema_type", e.target.value)}
            >
              <option value="NewsArticle">News article</option>
              <option value="BlogPosting">Blog post</option>
              <option value="Article">General article</option>
            </select>
          </div>
          {[
            ["seo_noindex", "Exclude from search results (noindex)"],
            ["seo_nofollow", "Ask crawlers not to follow links (nofollow)"],
          ].map(([key, label]) => (
            <label
              key={key}
              className="flex items-start gap-3 text-sm cursor-pointer py-2"
            >
              <Checkbox
                checked={value[key]}
                onCheckedChange={(checked) => update(key, checked === true)}
              />
              <span>{label}</span>
            </label>
          ))}
          {value.seo_noindex && (
            <p role="status" className="text-sm">
              This post will request exclusion from search results, regardless
              of its score.
            </p>
          )}
        </TabsContent>
      </Tabs>
      <div className="space-y-3">
        <div className="flex flex-wrap justify-between gap-2 items-center">
          <h3 className="font-medium text-sm">
            {analysis ? `${pending.length} checks to review` : "Content checks"}
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setOnlyIssues((v) => !v)}
          >
            {onlyIssues ? "Show all checks" : "Show improvements"}
          </Button>
        </div>
        {error && (
          <div role="alert" className="text-sm">
            {error}
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={() => setRevision((v) => v + 1)}
            >
              <RefreshCw aria-hidden="true" />
              Retry analysis
            </Button>
          </div>
        )}
        {!value.title.trim() && (
          <p className="text-sm text-muted-foreground">
            Add a headline to see optional metadata checks.
          </p>
        )}
        {analysis && (
          <>
            <p className="text-xs text-muted-foreground tabular-nums">
              {analysis.word_count} words · {analysis.internal_links} internal
              links · {analysis.external_links} reference links
            </p>
            <ul className="space-y-3">
              {(onlyIssues ? pending : checks).map((c) => (
                <li key={c.id} className="flex gap-2 text-sm">
                  {c.passed ? (
                    <Check
                      className="h-4 w-4 mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                  ) : (
                    <Circle
                      className="h-4 w-4 mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  <div>
                    <p className="font-medium">
                      {c.label}
                      <span className="ml-2 text-xs text-muted-foreground">
                        {c.passed ? "Pass" : "Review"} · {c.points} points
                      </span>
                    </p>
                    {!c.passed && (
                      <p className="mt-1 text-muted-foreground">{c.advice}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            {onlyIssues && !pending.length && (
              <p className="text-sm">
                Metadata checks are complete. These suggestions do not hold
                news publication.
              </p>
            )}
          </>
        )}
        <p className="text-xs text-muted-foreground">
          Our editorial checklist, not a Rank Math, AIOSEO or Google score. No
          ranking guarantee. Changes save with the post.
        </p>
      </div>
    </section>
  );
}
