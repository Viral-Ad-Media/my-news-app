"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Edit3,
  FolderKanban,
  Globe2,
  LayoutDashboard,
  Lock,
  Newspaper,
  Plus,
  RefreshCw,
  Scale,
  Search,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNewsDate } from "../lib/api";
import SeoEditor from "./SeoEditor";
import { SEO_DEFAULTS, getSiteUrl } from "../lib/seo";

const ADMIN_TABS = [
  { key: "overview", label: "Overview & Pipelines", icon: LayoutDashboard },
  { key: "articles", label: "Publish & Manage Posts", icon: Newspaper },
  { key: "categories", label: "Categories & Sources", icon: FolderKanban },
  { key: "users", label: "Users & Role Access", icon: Users },
];

const INITIAL_ARTICLE_FORM = {
  ...SEO_DEFAULTS,
  id: null,
  title: "",
  description: "",
  content: "",
  categories: "Business, Markets",
  location: "ng",
  source_name: "AbokiNews Editorial",
  source_url: getSiteUrl(),
  article_url: "",
  remote_image_url: "",
  dominant_bias: "balanced",
  left_coverage: 33,
  center_coverage: 34,
};

export default function SuperadminDashboard() {
  const [user, setUser] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [statusBanner, setStatusBanner] = useState("");
  const [errorBanner, setErrorBanner] = useState("");

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("tab") === "articles")
      setActiveTab("articles");
  }, []);

  // Article form & filter state
  const [articleForm, setArticleForm] = useState(INITIAL_ARTICLE_FORM);
  const [submittingArticle, setSubmittingArticle] = useState(false);
  const [articleSearch, setArticleSearch] = useState("");

  // Category form state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [submittingCategory, setSubmittingCategory] = useState(false);

  // Pipeline action state
  const [runningAction, setRunningAction] = useState("");
  const [rssImportUrl, setRssImportUrl] = useState("");

  const loadOverview = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    try {
      const sessionRes = await fetch("/api/session", { signal });
      if (!sessionRes.ok) {
        setUser(null);
        setLoading(false);
        return;
      }
      const sessionUser = await sessionRes.json();
      if (sessionUser?.authenticated === false) {
        setUser(null);
        return;
      }
      setUser(sessionUser);

      const res = await fetch("/api/reader/superadmin/overview", { signal });
      if (res.status === 403 || res.status === 401) {
        setError(
          "Superadmin privileges are required to access this command center.",
        );
        setLoading(false);
        return;
      }
      if (!res.ok) {
        throw new Error("Unable to load superadmin overview.");
      }
      const data = await res.json();
      setOverview(data);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "Unable to load superadmin console.");
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadOverview(controller.signal);
    return () => controller.abort();
  }, [loadOverview]);

  const filteredArticles = useMemo(() => {
    const list = overview?.articles || [];
    if (!articleSearch.trim()) return list;
    const q = articleSearch.trim().toLowerCase();
    return list.filter(
      (item) =>
        String(item.title || "")
          .toLowerCase()
          .includes(q) ||
        String(item.source?.name || "")
          .toLowerCase()
          .includes(q) ||
        String(item.location || "")
          .toLowerCase()
          .includes(q),
    );
  }, [overview?.articles, articleSearch]);

  async function handleSaveArticle(event) {
    event.preventDefault();
    setSubmittingArticle(true);
    setStatusBanner("");
    setErrorBanner("");

    const isEditing = Boolean(articleForm.id);
    const endpoint = isEditing
      ? `/api/reader/superadmin/articles/${articleForm.id}`
      : "/api/reader/superadmin/articles";
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...Object.fromEntries(
            Object.keys(SEO_DEFAULTS).map((key) => [key, articleForm[key]]),
          ),
          title: articleForm.title,
          description: articleForm.description,
          content: articleForm.content || articleForm.description,
          categories: articleForm.categories
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean),
          location: articleForm.location,
          source_name: articleForm.source_name,
          source_url: articleForm.source_url,
          article_url: articleForm.article_url,
          remote_image_url: articleForm.remote_image_url,
          dominant_bias: articleForm.dominant_bias,
          left_coverage: Number(articleForm.left_coverage) || 33,
          center_coverage: Number(articleForm.center_coverage) || 34,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.detail || "Unable to save blog post.");
      }

      setStatusBanner(
        isEditing
          ? `Updated blog post: "${data.title}"`
          : `Published new blog post: "${data.title}"`,
      );
      setArticleForm(INITIAL_ARTICLE_FORM);
      await loadOverview();
    } catch (err) {
      setErrorBanner(err.message || "Failed to save blog post.");
    } finally {
      setSubmittingArticle(false);
    }
  }

  function startEditArticle(article) {
    setArticleForm({
      ...Object.fromEntries(
        Object.entries(SEO_DEFAULTS).map(([key, fallback]) => [
          key,
          article[key] ?? fallback,
        ]),
      ),
      id: article.id,
      title: article.title || "",
      description: article.description || "",
      content: article.content || article.description || "",
      categories:
        article.categories?.map((c) => c.name).join(", ") || "Business",
      location: article.location || "ng",
      source_name: article.source?.name || "AbokiNews Editorial",
      source_url: article.source?.url || getSiteUrl(),
      article_url: article.article_url || "",
      remote_image_url: article.image_url || "",
      dominant_bias: article.dominant_bias || "balanced",
      left_coverage: article.left_coverage ?? 33,
      center_coverage: article.center_coverage ?? 34,
    });
    setActiveTab("articles");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  async function handleDeleteArticle(articleId, title) {
    setStatusBanner("");
    setErrorBanner("");
    try {
      const res = await fetch(`/api/reader/superadmin/articles/${articleId}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) {
        throw new Error("Unable to delete article.");
      }
      setStatusBanner(`Deleted blog post: "${title}"`);
      await loadOverview();
    } catch (err) {
      setErrorBanner(err.message || "Failed to delete blog post.");
    }
  }

  async function handleCreateCategory(event) {
    event.preventDefault();
    if (!newCategoryName.trim()) return;
    setSubmittingCategory(true);
    setStatusBanner("");
    setErrorBanner("");
    try {
      const res = await fetch("/api/reader/superadmin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.detail || "Unable to create category.");
      }
      setStatusBanner(`Created category: "${data.name}"`);
      setNewCategoryName("");
      await loadOverview();
    } catch (err) {
      setErrorBanner(err.message || "Failed to create category.");
    } finally {
      setSubmittingCategory(false);
    }
  }

  async function handleDeleteCategory(categoryId, name) {
    setStatusBanner("");
    setErrorBanner("");
    try {
      const res = await fetch(
        `/api/reader/superadmin/categories/${categoryId}`,
        { method: "DELETE" },
      );
      if (!res.ok && res.status !== 204) {
        throw new Error("Unable to delete category.");
      }
      setStatusBanner(`Removed category: "${name}"`);
      await loadOverview();
    } catch (err) {
      setErrorBanner(err.message || "Failed to remove category.");
    }
  }

  async function handleToggleUserRole(targetUser, field) {
    setStatusBanner("");
    setErrorBanner("");
    try {
      const res = await fetch(`/api/reader/superadmin/users/${targetUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [field]: !targetUser[field],
        }),
      });
      if (!res.ok) {
        throw new Error("Unable to update user privileges.");
      }
      setStatusBanner(`Updated role permissions for ${targetUser.username}.`);
      await loadOverview();
    } catch (err) {
      setErrorBanner(err.message || "Failed to update user privileges.");
    }
  }

  async function handleRunPipeline(action, extraPayload = {}) {
    setRunningAction(action);
    setStatusBanner("");
    setErrorBanner("");
    try {
      const res = await fetch("/api/reader/superadmin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extraPayload }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.detail || "Pipeline action failed.");
      }
      setStatusBanner(data?.output || `Completed pipeline action: ${action}`);
      if (extraPayload?.url) {
        setRssImportUrl("");
      }
      await loadOverview();
    } catch (err) {
      setErrorBanner(err.message || "Pipeline execution failed.");
    } finally {
      setRunningAction("");
    }
  }

  async function handleLogout() {
    await fetch("/api/session", { method: "DELETE" });
    window.dispatchEvent(new Event("news-session"));
    window.location.assign("/login");
  }

  if (loading) {
    return (
      <section
        aria-label="Loading superadmin command center"
        role="status"
        className="space-y-6 py-4"
      >
        <div className="rounded-xl border border-border bg-muted/40 p-6">
          <Skeleton className="h-7 w-72" />
          <Skeleton className="h-4 w-96 mt-2" />
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
            {[1, 2, 3, 4, 5, 6].map((id) => (
              <Skeleton key={id} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!user || error) {
    return (
      <section className="max-w-xl mx-auto py-8">
        <Card className="border border-border shadow-none">
          <CardHeader>
            <div className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Superadmin Access Required
            </div>
            <CardTitle className="text-2xl font-bold mt-1">
              Sign in to the AbokiNews Superadmin Console
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {error ||
                "Sign in with your superadmin account (viraladmediacontent@gmail.com) to publish blog posts, manage categories and sources, and administer reader accounts."}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild>
                <Link href="/login">
                  <Lock className="h-4 w-4 mr-1.5" aria-hidden="true" />
                  Sign In as Superadmin
                </Link>
              </Button>
              {user && (
                <Button variant="outline" asChild>
                  <Link href="/dashboard">Return to Reader Dashboard</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  const stats = overview?.stats || {};
  const biasCounts = stats.bias_counts || {};
  const locCounts = stats.location_counts || {};
  const rightCoverageCalc = Math.max(
    0,
    100 -
      (Number(articleForm.left_coverage) || 0) -
      (Number(articleForm.center_coverage) || 0),
  );

  return (
    <div className="space-y-6 min-w-0 max-w-[1280px] mx-auto">
      <header className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {activeTab === "articles" ? "Post editor" : "Editorial desk"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              AbokiNews · {user.email || user.username}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">Reader view</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => loadOverview()}>
              <RefreshCw aria-hidden="true" />
              Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        </div>
        <nav aria-label="Editorial workspace" className="flex flex-wrap gap-2">
          {ADMIN_TABS.map((tab) => (
            <Button
              key={tab.key}
              type="button"
              size="sm"
              variant={activeTab === tab.key ? "secondary" : "ghost"}
              aria-pressed={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </Button>
          ))}
        </nav>
        {activeTab === "overview" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 rounded-lg bg-muted/40 p-4">
            {[
              ["Published posts", stats.total_articles],
              ["Categories", stats.total_categories],
              ["Sources", stats.total_sources],
              ["Readers", stats.total_users],
              ["Admins", stats.total_superadmins],
              ["Saved stories", stats.total_bookmarks],
            ].map(([label, count]) => (
              <div key={label}>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-normal tabular-nums">
                  {count ?? 0}
                </p>
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Status & Error Notifications */}
      {statusBanner && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-lg border border-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/30 px-4 py-3 text-sm text-emerald-950 dark:text-emerald-100 flex items-center gap-2"
        >
          <CheckCircle2
            className="h-4 w-4 text-emerald-700 dark:text-emerald-300 shrink-0"
            aria-hidden="true"
          />
          <span>{statusBanner}</span>
        </div>
      )}

      {errorBanner && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center gap-2"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* TAB 1: OVERVIEW & PIPELINES */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 min-w-0 space-y-6">
            <Card className="border border-border shadow-none">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Scale className="h-4 w-4" aria-hidden="true" />
                  Editorial Coverage &amp; Regional Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Articles by Regional Desk
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      {
                        code: "NG",
                        label: "Nigeria Desk",
                        count: locCounts.ng || 0,
                      },
                      {
                        code: "US",
                        label: "United States",
                        count: locCounts.us || 0,
                      },
                      {
                        code: "GB",
                        label: "UK & Europe",
                        count: locCounts.gb || 0,
                      },
                      {
                        code: "WORLD",
                        label: "Global Wire",
                        count: locCounts.world || 0,
                      },
                    ].map((desk) => (
                      <div
                        key={desk.code}
                        className="rounded-lg border border-border bg-muted/30 p-3"
                      >
                        <Badge variant="outline" className="text-sm">
                          {desk.code}
                        </Badge>
                        <p className="text-xl font-bold tabular-nums mt-1.5">
                          {desk.count}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {desk.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Articles by Dominant Media Bias Framing
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {[
                      {
                        key: "left",
                        label: "Left-Leaning",
                        count: biasCounts.left || 0,
                      },
                      {
                        key: "center",
                        label: "Center",
                        count: biasCounts.center || 0,
                      },
                      {
                        key: "right",
                        label: "Right-Leaning",
                        count: biasCounts.right || 0,
                      },
                      {
                        key: "balanced",
                        label: "Balanced",
                        count: biasCounts.balanced || 0,
                      },
                      {
                        key: "polarized",
                        label: "Polarized",
                        count: biasCounts.polarized || 0,
                      },
                    ].map((b) => (
                      <div
                        key={b.key}
                        className="rounded-lg border border-border bg-muted/30 p-3"
                      >
                        <p className="text-sm font-semibold text-muted-foreground">
                          {b.label}
                        </p>
                        <p className="text-xl font-bold tabular-nums mt-1">
                          {b.count}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border shadow-none">
              <CardHeader>
                <CardTitle className="text-lg font-bold">
                  Newsroom Ingestion &amp; Seed Pipelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-border">
                  <span className="text-sm font-medium text-muted-foreground mr-1">
                    API Keys:
                  </span>
                  <Badge
                    variant={
                      overview?.integrations?.news_api_configured
                        ? "secondary"
                        : "outline"
                    }
                  >
                    NEWS_API_KEY:{" "}
                    {overview?.integrations?.news_api_configured
                      ? "Active"
                      : "Unset"}
                  </Badge>
                  <Badge
                    variant={
                      overview?.integrations?.newsdata_io_configured
                        ? "secondary"
                        : "outline"
                    }
                  >
                    NEWS_DATA_IO_API_KEY:{" "}
                    {overview?.integrations?.newsdata_io_configured
                      ? "Active"
                      : "Unset"}
                  </Badge>
                  <Badge
                    variant={
                      overview?.integrations?.cloudinary_configured
                        ? "secondary"
                        : "outline"
                    }
                  >
                    CLOUDINARY:{" "}
                    {overview?.integrations?.cloudinary_configured
                      ? "Active"
                      : "Unset"}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground">
                  Run idempotent data ingestion commands to synchronize starter
                  blog posts, pull live headlines from NewsAPI.org &amp;
                  NewsData.io, or refresh AllSides multi-perspective roundups.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="default"
                    disabled={Boolean(runningAction)}
                    onClick={() =>
                      handleRunPipeline("fetch_news", { country: "ng" })
                    }
                  >
                    <Newspaper className="h-4 w-4 mr-1.5" aria-hidden="true" />
                    {runningAction === "fetch_news"
                      ? "Fetching NewsAPI & NewsData.io…"
                      : "Fetch Live NewsAPI & NewsData.io (fetch_news)"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={Boolean(runningAction)}
                    onClick={() => handleRunPipeline("seed_news")}
                  >
                    <RefreshCw className="h-4 w-4 mr-1.5" aria-hidden="true" />
                    {runningAction === "seed_news"
                      ? "Syncing Starter Stories…"
                      : "Sync Starter Blog Posts (seed_news)"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={Boolean(runningAction)}
                    onClick={() => handleRunPipeline("fetch_allsides")}
                  >
                    <Scale className="h-4 w-4 mr-1.5" aria-hidden="true" />
                    {runningAction === "fetch_allsides"
                      ? "Syncing AllSides Roundups…"
                      : "Sync AllSides Roundups"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={Boolean(runningAction)}
                    onClick={() => handleRunPipeline("fetch_rss")}
                  >
                    <Globe2 className="h-4 w-4 mr-1.5" aria-hidden="true" />
                    {runningAction === "fetch_rss"
                      ? "Syncing RSS Feeds…"
                      : "Sync RSS / Atom Feeds (fetch_rss)"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setArticleForm(INITIAL_ARTICLE_FORM);
                      setActiveTab("articles");
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
                    Write New Blog Post
                  </Button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!rssImportUrl.trim()) return;
                    handleRunPipeline("fetch_rss", {
                      url: rssImportUrl.trim(),
                    });
                  }}
                  className="pt-4 border-t border-border flex flex-col sm:flex-row gap-2"
                >
                  <Label htmlFor="admin-rss-url" className="sr-only">
                    Import external RSS or Atom feed URL
                  </Label>
                  <Input
                    id="admin-rss-url"
                    type="url"
                    value={rssImportUrl}
                    onChange={(e) => setRssImportUrl(e.target.value)}
                    placeholder="https://nairametrics.com/feed/ — Import any external RSS 2.0 or Atom feed URL"
                    className="flex-1 min-w-0"
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={Boolean(runningAction) || !rssImportUrl.trim()}
                    className="shrink-0"
                  >
                    Import Custom RSS URL
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5 min-w-0 space-y-6">
            <Card className="border border-border shadow-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold">
                    Latest Published Blog Posts
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("articles")}
                  >
                    Manage all ({overview?.articles?.length || 0})
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {(overview?.articles || []).slice(0, 6).map((art) => (
                  <div
                    key={art.id}
                    className="rounded-lg border border-border bg-muted/30 p-3 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/news/${art.id}`}
                        className="text-sm font-semibold leading-snug hover:underline underline-offset-4 block"
                      >
                        {art.title}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        {art.source?.name} ·{" "}
                        {String(art.location || "ng").toUpperCase()} ·{" "}
                        {formatNewsDate(art.published_at)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-sm shrink-0"
                      onClick={() => startEditArticle(art)}
                    >
                      Edit
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: PUBLISH & MANAGE BLOG POSTS */}
      {activeTab === "articles" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Publish / Edit Form */}
          <div className="lg:col-span-12 min-w-0">
            <Card className="border border-border shadow-none">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg font-bold">
                    {articleForm.id
                      ? `Edit Blog Post #${articleForm.id}`
                      : "Publish New Blog Post"}
                  </CardTitle>
                  {articleForm.id && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setArticleForm(INITIAL_ARTICLE_FORM)}
                    >
                      Cancel Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSaveArticle}
                  className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start"
                >
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="admin-post-title">Headline Title</Label>
                      <Input
                        id="admin-post-title"
                        required
                        value={articleForm.title}
                        onChange={(e) =>
                          setArticleForm((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder="Enter blog post headline"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="admin-post-desc">
                        Key Summary Description
                      </Label>
                      <textarea
                        id="admin-post-desc"
                        required
                        rows={3}
                        value={articleForm.description}
                        onChange={(e) =>
                          setArticleForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Concise 1–2 sentence executive summary"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="admin-post-content">Article body</Label>
                      <textarea
                        id="admin-post-content"
                        rows={12}
                        value={articleForm.content}
                        onChange={(e) =>
                          setArticleForm((prev) => ({
                            ...prev,
                            content: e.target.value,
                          }))
                        }
                        placeholder="Separate paragraphs with a blank line. Use ## for subheadings and [label](/news/123) for related links."
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="admin-post-categories">
                          Categories (comma-separated)
                        </Label>
                        <Input
                          id="admin-post-categories"
                          value={articleForm.categories}
                          onChange={(e) =>
                            setArticleForm((prev) => ({
                              ...prev,
                              categories: e.target.value,
                            }))
                          }
                          placeholder="Business, Technology"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="admin-post-location">
                          Regional Desk
                        </Label>
                        <select
                          id="admin-post-location"
                          value={articleForm.location}
                          onChange={(e) =>
                            setArticleForm((prev) => ({
                              ...prev,
                              location: e.target.value,
                            }))
                          }
                          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="ng">Nigeria (ng)</option>
                          <option value="us">United States (us)</option>
                          <option value="gb">UK &amp; Europe (gb)</option>
                          <option value="world">Global Wire (world)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="admin-post-source">Source Name</Label>
                        <Input
                          id="admin-post-source"
                          value={articleForm.source_name}
                          onChange={(e) =>
                            setArticleForm((prev) => ({
                              ...prev,
                              source_name: e.target.value,
                            }))
                          }
                          placeholder="Nairametrics"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="admin-post-bias">
                          Dominant Framing
                        </Label>
                        <select
                          id="admin-post-bias"
                          value={articleForm.dominant_bias}
                          onChange={(e) =>
                            setArticleForm((prev) => ({
                              ...prev,
                              dominant_bias: e.target.value,
                            }))
                          }
                          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="balanced">Balanced</option>
                          <option value="center">Center</option>
                          <option value="left">Left-Leaning</option>
                          <option value="right">Right-Leaning</option>
                          <option value="polarized">Polarized</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="admin-cov-left" className="text-sm">
                          Left %
                        </Label>
                        <Input
                          id="admin-cov-left"
                          type="number"
                          min={0}
                          max={100}
                          value={articleForm.left_coverage}
                          onChange={(e) =>
                            setArticleForm((prev) => ({
                              ...prev,
                              left_coverage: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="admin-cov-center" className="text-sm">
                          Center %
                        </Label>
                        <Input
                          id="admin-cov-center"
                          type="number"
                          min={0}
                          max={100}
                          value={articleForm.center_coverage}
                          onChange={(e) =>
                            setArticleForm((prev) => ({
                              ...prev,
                              center_coverage: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm">Right %</Label>
                        <div className="h-9 rounded-md border border-border bg-muted/40 px-3 flex items-center text-sm font-normal tabular-nums">
                          {rightCoverageCalc}%
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="admin-post-image">
                        Cloudinary or Remote Image URL (optional)
                      </Label>
                      <Input
                        id="admin-post-image"
                        type="url"
                        value={articleForm.remote_image_url}
                        onChange={(e) =>
                          setArticleForm((prev) => ({
                            ...prev,
                            remote_image_url: e.target.value,
                          }))
                        }
                        placeholder="https://res.cloudinary.com/..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="admin-post-url">
                        Primary Source Article URL (optional)
                      </Label>
                      <Input
                        id="admin-post-url"
                        type="url"
                        value={articleForm.article_url}
                        onChange={(e) =>
                          setArticleForm((prev) => ({
                            ...prev,
                            article_url: e.target.value,
                          }))
                        }
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <SeoEditor value={articleForm} onChange={setArticleForm} />
                  <Button
                    type="submit"
                    disabled={submittingArticle}
                    className="w-full xl:col-span-2"
                  >
                    <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
                    {submittingArticle
                      ? "Saving Blog Post…"
                      : articleForm.id
                        ? "Update Blog Post"
                        : "Publish Blog Post"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Responsive Articles Data Table */}
          <div className="lg:col-span-12 min-w-0">
            <Card className="border border-border shadow-none">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <CardTitle
                    id="superadmin-articles-caption"
                    className="text-lg font-bold"
                  >
                    Published Blog Posts ({filteredArticles.length})
                  </CardTitle>
                  <div className="relative w-full sm:w-64">
                    <Search
                      className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <Input
                      type="search"
                      value={articleSearch}
                      onChange={(e) => setArticleSearch(e.target.value)}
                      placeholder="Filter posts by title or desk…"
                      aria-label="Filter posts by title or desk"
                      className="h-8 pl-8 text-sm"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  tabIndex={0}
                  role="region"
                  aria-labelledby="superadmin-articles-caption"
                  className="table-wrapper rounded-lg border border-border"
                >
                  <table
                    className="responsive-data-table text-left text-sm"
                    style={{
                      "--label-2": '"Desk"',
                      "--label-3": '"Source"',
                      "--label-4": '"Bias"',
                      "--label-5": '"Actions"',
                    }}
                  >
                    <thead className="bg-muted text-muted-foreground border-b border-border">
                      <tr>
                        <th scope="col" className="p-3 font-semibold">
                          Headline
                        </th>
                        <th scope="col" className="p-3 font-semibold">
                          Desk
                        </th>
                        <th scope="col" className="p-3 font-semibold">
                          Source
                        </th>
                        <th scope="col" className="p-3 font-semibold">
                          Bias
                        </th>
                        <th
                          scope="col"
                          className="p-3 text-right font-semibold"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredArticles.map((art) => (
                        <tr key={art.id}>
                          <th
                            scope="row"
                            className="p-3 font-semibold text-foreground max-w-xs"
                          >
                            <Link
                              href={`/news/${art.id}`}
                              className="hover:underline underline-offset-4 line-clamp-2"
                            >
                              {art.title}
                            </Link>
                          </th>
                          <td className="p-3 uppercase font-normal">
                            {art.location || "ng"}
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {art.source?.name || "Editorial"}
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-sm">
                              {art.dominant_bias || "balanced"}
                            </Badge>
                          </td>
                          <td className="p-3 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-sm"
                                onClick={() => startEditArticle(art)}
                              >
                                <Edit3
                                  className="h-3 w-3 mr-1"
                                  aria-hidden="true"
                                />
                                Edit
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-sm text-destructive hover:text-destructive"
                                onClick={() =>
                                  handleDeleteArticle(art.id, art.title)
                                }
                              >
                                <Trash2
                                  className="h-3 w-3"
                                  aria-hidden="true"
                                />
                                <span className="sr-only">
                                  Delete {art.title}
                                </span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORIES & SOURCES */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 min-w-0 space-y-6">
            <Card className="border border-border shadow-none">
              <CardHeader>
                <CardTitle className="text-lg font-bold">
                  Manage Topic Categories ({overview?.categories?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleCreateCategory} className="flex gap-2">
                  <Label htmlFor="new-category-name" className="sr-only">
                    New category name
                  </Label>
                  <Input
                    id="new-category-name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Add category (e.g. Energy, Climate)…"
                    className="min-w-0"
                  />
                  <Button type="submit" disabled={submittingCategory}>
                    <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
                    Add
                  </Button>
                </form>

                <div className="divide-y divide-border rounded-lg border border-border">
                  {(overview?.categories || []).map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between gap-2 p-3 text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Link
                          href={`/categories/${cat.id}`}
                          className="font-semibold hover:underline underline-offset-4 truncate"
                        >
                          {cat.name}
                        </Link>
                        <Badge
                          variant="secondary"
                          className="text-sm tabular-nums"
                        >
                          {cat.article_count ?? 0} posts
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-sm text-destructive"
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="sr-only">Delete {cat.name}</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-7 min-w-0">
            <Card className="border border-border shadow-none">
              <CardHeader>
                <CardTitle
                  id="superadmin-sources-caption"
                  className="text-lg font-bold"
                >
                  Verified News Sources ({overview?.sources?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  tabIndex={0}
                  role="region"
                  aria-labelledby="superadmin-sources-caption"
                  className="table-wrapper rounded-lg border border-border"
                >
                  <table
                    className="responsive-data-table text-left text-sm"
                    style={{
                      "--label-2": '"Default Bias"',
                      "--label-3": '"Articles"',
                      "--label-4": '"Website"',
                    }}
                  >
                    <thead className="bg-muted text-muted-foreground border-b border-border">
                      <tr>
                        <th scope="col" className="p-3 font-semibold">
                          Source Name
                        </th>
                        <th scope="col" className="p-3 font-semibold">
                          Default Bias
                        </th>
                        <th scope="col" className="p-3 font-semibold">
                          Articles
                        </th>
                        <th scope="col" className="p-3 font-semibold">
                          Website
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {(overview?.sources || []).map((src) => (
                        <tr key={src.id}>
                          <th
                            scope="row"
                            className="p-3 font-semibold text-foreground"
                          >
                            {src.name}
                          </th>
                          <td className="p-3 uppercase">{src.bias}</td>
                          <td className="p-3 tabular-nums font-semibold">
                            {src.article_count}
                          </td>
                          <td className="p-3">
                            {src.url && (
                              <a
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 underline underline-offset-4"
                              >
                                Visit
                                <ArrowUpRight
                                  className="h-3 w-3"
                                  aria-hidden="true"
                                />
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 4: USERS & ROLE ACCESS */}
      {activeTab === "users" && (
        <Card className="border border-border shadow-none">
          <CardHeader>
            <CardTitle
              id="superadmin-users-caption"
              className="text-lg font-bold"
            >
              Registered Users &amp; Superadmin Roles (
              {overview?.users?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              tabIndex={0}
              role="region"
              aria-labelledby="superadmin-users-caption"
              className="table-wrapper rounded-lg border border-border"
            >
              <table
                className="responsive-data-table text-left text-sm"
                style={{
                  "--label-2": '"Email"',
                  "--label-3": '"Role"',
                  "--label-4": '"Activity"',
                  "--label-5": '"Permissions"',
                }}
              >
                <thead className="bg-muted text-muted-foreground border-b border-border">
                  <tr>
                    <th scope="col" className="p-3 font-semibold">
                      Username
                    </th>
                    <th scope="col" className="p-3 font-semibold">
                      Email
                    </th>
                    <th scope="col" className="p-3 font-semibold">
                      Role
                    </th>
                    <th scope="col" className="p-3 font-semibold">
                      Activity
                    </th>
                    <th scope="col" className="p-3 text-right font-semibold">
                      Permissions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {(overview?.users || []).map((u) => (
                    <tr key={u.id}>
                      <th
                        scope="row"
                        className="p-3 font-semibold text-foreground"
                      >
                        {u.username}
                      </th>
                      <td className="p-3 text-muted-foreground">
                        {u.email || "—"}
                      </td>
                      <td className="p-3">
                        {u.is_superuser ? (
                          <Badge className="text-sm">Superadmin</Badge>
                        ) : u.is_staff ? (
                          <Badge variant="secondary" className="text-sm">
                            Staff
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-sm">
                            Reader
                          </Badge>
                        )}
                      </td>
                      <td className="p-3 tabular-nums text-muted-foreground">
                        {u.saved_count} saved · {u.topics_count} topics
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                          <Button
                            type="button"
                            size="sm"
                            variant={u.is_superuser ? "secondary" : "outline"}
                            className="h-7 px-2 text-sm"
                            onClick={() =>
                              handleToggleUserRole(u, "is_superuser")
                            }
                          >
                            {u.is_superuser
                              ? "Revoke Superadmin"
                              : "Grant Superadmin"}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={u.is_staff ? "secondary" : "outline"}
                            className="h-7 px-2 text-sm"
                            onClick={() => handleToggleUserRole(u, "is_staff")}
                          >
                            {u.is_staff ? "Revoke Staff" : "Grant Staff"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
