"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  Compass,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Scale,
  SlidersHorizontal,
  Sparkles,
  UserCheck,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import NewsList from "./NewsList";
import CoverageBar from "./CoverageBar";
import AskVTAI from "./AskVTAI";
import { buildApiUrl, formatNewsDate, listItems } from "../lib/api";
import { normalizeArticleCoverage } from "../lib/lopsided";

const DASHBOARD_VIEWS = [
  { key: "overview", label: "Overview & My Feed", icon: LayoutDashboard },
  { key: "saved", label: "Saved Reading List", icon: Bookmark },
  { key: "topics", label: "Topic Subscriptions", icon: SlidersHorizontal },
];

export default function ReaderDashboard() {
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [activeView, setActiveView] = useState("overview");
  const [feedData, setFeedData] = useState({ count: 0, results: [] });
  const [savedData, setSavedData] = useState({ count: 0, results: [] });
  const [categories, setCategories] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [savingTopics, setSavingTopics] = useState(false);
  const [topicStatus, setTopicStatus] = useState("");
  const [feedRevision, setFeedRevision] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);

  const loadDashboardData = useCallback(async (signal) => {
    setAuthChecking(true);
    try {
      const sessionRes = await fetch("/api/session", { signal });
      if (!sessionRes.ok) {
        setUser(null);
        setAuthChecking(false);
        return;
      }
      const userData = await sessionRes.json();
      if (userData?.authenticated === false) {
        setUser(null);
        return;
      }
      setUser(userData);

      const categoriesUrl = buildApiUrl("/categories/?page_size=20");
      const [feedRes, savedRes, prefsRes, catsRes] = await Promise.all([
        fetch("/api/reader/feed?page=1", { signal }).catch(() => null),
        fetch("/api/reader/saved?page=1", { signal }).catch(() => null),
        fetch("/api/reader/preferences", { signal }).catch(() => null),
        categoriesUrl ? fetch(categoriesUrl, { signal }).catch(() => null) : null,
      ]);

      if (feedRes?.ok) {
        const json = await feedRes.json();
        setFeedData({
          count: json.count ?? listItems(json).length,
          results: listItems(json),
        });
      }
      if (savedRes?.ok) {
        const json = await savedRes.json();
        setSavedData({
          count: json.count ?? listItems(json).length,
          results: listItems(json),
        });
      }
      if (prefsRes?.ok) {
        const json = await prefsRes.json();
        setSelectedTopics(Array.isArray(json.categories) ? json.categories : []);
      }
      if (catsRes?.ok) {
        const json = await catsRes.json();
        setCategories(listItems(json));
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setUser(null);
      }
    } finally {
      if (!signal?.aborted) {
        setAuthChecking(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadDashboardData(controller.signal);
    return () => controller.abort();
  }, [loadDashboardData, feedRevision]);

  const readingDiet = useMemo(() => {
    const combined = [...(feedData.results || []), ...(savedData.results || [])];
    if (!combined.length) {
      return { left: 33, center: 34, right: 33, totalSources: 3 };
    }
    let lSum = 0;
    let cSum = 0;
    for (const item of combined) {
      const cov = normalizeArticleCoverage(item);
      lSum += cov.left;
      cSum += cov.center;
    }
    const n = combined.length;
    const left = Math.round(lSum / n);
    const center = Math.round(cSum / n);
    const right = Math.max(0, 100 - left - center);
    return { left, center, right, totalSources: n };
  }, [feedData.results, savedData.results]);

  const subscribedCategoryNames = useMemo(() => {
    if (!selectedTopics.length) return ["All Newsroom Beats"];
    return categories
      .filter((c) => selectedTopics.includes(c.id))
      .map((c) => c.name);
  }, [categories, selectedTopics]);

  async function handleSaveTopics(event) {
    event.preventDefault();
    setSavingTopics(true);
    setTopicStatus("");
    try {
      const res = await fetch("/api/reader/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: selectedTopics }),
      });
      if (!res.ok) {
        throw new Error("Unable to save topics right now.");
      }
      setTopicStatus("Your topic subscriptions have been updated.");
      setFeedRevision((v) => v + 1);
    } catch (err) {
      setTopicStatus(err.message || "Unable to save topics.");
    } finally {
      setSavingTopics(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const res = await fetch("/api/session", { method: "DELETE" });
      if (res.ok) {
        setUser(null);
        window.dispatchEvent(new Event("news-session"));
        window.location.assign("/");
      }
    } finally {
      setLoggingOut(false);
    }
  }

  if (authChecking) {
    return (
      <section
        aria-label="Loading reader dashboard"
        role="status"
        className="space-y-6 py-4"
      >
        <div className="rounded-xl border border-border bg-muted/40 p-6">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="max-w-xl mx-auto py-8">
        <Card className="border border-border shadow-none">
          <CardHeader>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />
              Reader Dashboard
            </div>
            <CardTitle className="text-2xl font-bold mt-1">
              Sign in to view your personalized dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your dashboard brings together your custom topic beats, bookmarked
              reading list, and your Left · Center · Right media bias diet in
              one workspace.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/signup">Create Account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      {/* Reader Masthead & Session Header */}
      <header className="rounded-xl border border-border bg-muted/40 p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              aria-hidden="true"
              className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold uppercase shrink-0"
            >
              {String(user.username || "R").slice(0, 2)}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-950 dark:text-emerald-200">
                <UserCheck className="h-3 w-3" aria-hidden="true" />
                Active Reader Session
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
                Welcome back, {user.username}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Your personal newsroom command center · Multi-perspective feed,
                saved stories &amp; bias radar.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(user.is_superuser || user.is_staff) && (
              <Button variant="default" size="sm" asChild>
                <Link href="/superadmin">
                  <LayoutDashboard className="h-4 w-4 mr-1" aria-hidden="true" />
                  Superadmin Console
                </Link>
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href="/lopsided">
                <Scale className="h-4 w-4 mr-1" aria-hidden="true" />
                Lopsided Desk
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              <LogOut className="h-4 w-4 mr-1" aria-hidden="true" />
              {loggingOut ? "Signing out…" : "Sign Out"}
            </Button>
          </div>
        </div>

        {/* 4-Card KPI & Reading Spectrum Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="rounded-lg border border-border bg-background p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>My Feed Stories</span>
              <Newspaper className="h-4 w-4" aria-hidden="true" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold tabular-nums mt-2">
              {feedData.count}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Matching your topic preferences
            </p>
          </div>

          <div className="rounded-lg border border-border bg-background p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>Saved Reading List</span>
              <Bookmark className="h-4 w-4" aria-hidden="true" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold tabular-nums mt-2">
              {savedData.count}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Bookmarked for deep reading
            </p>
          </div>

          <div className="rounded-lg border border-border bg-background p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>Subscribed Beats</span>
              <Compass className="h-4 w-4" aria-hidden="true" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold tabular-nums mt-2">
              {selectedTopics.length || "All"}
            </p>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {subscribedCategoryNames.join(", ") || "All Newsroom Beats"}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-background p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-2">
              <span>My Reading Spectrum</span>
              <Scale className="h-4 w-4" aria-hidden="true" />
            </div>
            <CoverageBar
              sources={readingDiet.totalSources}
              left={readingDiet.left}
              center={readingDiet.center}
              right={readingDiet.right}
              compact={true}
            />
          </div>
        </div>

        {/* Workspace View Switcher */}
        <div
          role="group"
          aria-label="Dashboard sections"
          className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-border"
        >
          {DASHBOARD_VIEWS.map((view) => {
            const Icon = view.icon;
            const active = activeView === view.key;
            return (
              <Button
                key={view.key}
                type="button"
                variant={active ? "default" : "outline"}
                size="sm"
                aria-pressed={active}
                onClick={() => setActiveView(view.key)}
              >
                <Icon className="h-4 w-4 mr-1.5" aria-hidden="true" />
                {view.label}
              </Button>
            );
          })}
        </div>
      </header>

      {/* Active Workspace Section */}
      {activeView === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 min-w-0 space-y-6">
            <NewsList
              key={`dashboard-feed-${feedRevision}`}
              title="Your Personalized Briefing"
              endpoint="/feed/"
              privateFeed
            />
          </div>

          <aside
            aria-label="Saved reading list and AI assistant"
            className="lg:col-span-4 min-w-0 space-y-6"
          >
            {/* Quick Saved Stories Card */}
            <Card className="border border-border shadow-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-1.5">
                    <Bookmark className="h-4 w-4" aria-hidden="true" />
                    Saved Reading List
                  </CardTitle>
                  <button
                    type="button"
                    onClick={() => setActiveView("saved")}
                    className="text-xs font-semibold underline underline-offset-4 hover:text-muted-foreground"
                  >
                    View all ({savedData.count})
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {savedData.results.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No saved stories yet. Click &ldquo;Save&rdquo; on any
                    article card to build your reading list.
                  </p>
                ) : (
                  savedData.results.slice(0, 4).map((item) => (
                    <article
                      key={item.id}
                      className="rounded-lg border border-border bg-muted/30 p-3 space-y-1"
                    >
                      <Link
                        href={`/news/${item.id}`}
                        className="text-sm font-semibold leading-snug hover:underline underline-offset-4 block"
                      >
                        {item.title}
                      </Link>
                      <p className="text-[11px] text-muted-foreground">
                        {item.source?.name} · {formatNewsDate(item.published_at)}
                      </p>
                    </article>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Quick Topic Filter Card */}
            <Card className="border border-border shadow-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-1.5">
                    <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                    Active Topic Beats
                  </CardTitle>
                  <button
                    type="button"
                    onClick={() => setActiveView("topics")}
                    className="text-xs font-semibold underline underline-offset-4 hover:text-muted-foreground"
                  >
                    Customize
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {subscribedCategoryNames.map((name) => (
                    <span
                      key={name}
                      className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Briefing Assistant */}
            <Card className="border border-border shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Newsroom AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AskVTAI />
              </CardContent>
            </Card>
          </aside>
        </div>
      )}

      {activeView === "saved" && (
        <section aria-label="Saved stories workspace">
          <NewsList
            title="Your Saved Reading List"
            endpoint="/saved/"
            privateFeed
            saved
          />
        </section>
      )}

      {activeView === "topics" && (
        <section
          aria-labelledby="dashboard-topics-heading"
          className="rounded-xl border border-border bg-card p-6 space-y-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2
                id="dashboard-topics-heading"
                className="text-xl font-bold tracking-tight"
              >
                Manage Your Topic Subscriptions
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Select the beats you want prioritized in your personalized feed.
                Leave all unchecked to receive all newsroom stories.
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/news/custom">
                Full Topic Page
                <ArrowUpRight className="h-4 w-4 ml-1" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          {topicStatus && (
            <div
              role="status"
              aria-live="polite"
              className="rounded-lg border border-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/30 px-4 py-3 text-sm text-emerald-950 dark:text-emerald-100 flex items-center gap-2"
            >
              <CheckCircle2
                className="h-4 w-4 text-emerald-700 shrink-0"
                aria-hidden="true"
              />
              <span>{topicStatus}</span>
            </div>
          )}

          <form onSubmit={handleSaveTopics} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((topic) => {
                const checked = selectedTopics.includes(topic.id);
                return (
                  <Label
                    key={topic.id}
                    className={`flex items-center justify-between gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                      checked
                        ? "border-primary bg-muted/80"
                        : "border-border bg-background hover:bg-muted/40"
                    }`}
                  >
                    <span className="flex items-center gap-3 font-medium">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(val) =>
                          setSelectedTopics(
                            val === true
                              ? [...selectedTopics, topic.id]
                              : selectedTopics.filter((id) => id !== topic.id)
                          )
                        }
                      />
                      {topic.name}
                    </span>
                    {typeof topic.article_count === "number" && (
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {topic.article_count}
                      </span>
                    )}
                  </Label>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={savingTopics}>
                {savingTopics ? "Saving preferences…" : "Save Topic Preferences"}
              </Button>
              {selectedTopics.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setSelectedTopics([])}
                >
                  Clear all filters
                </Button>
              )}
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
