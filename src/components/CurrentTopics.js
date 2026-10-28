"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import useCategories from "../lib/use-categories";
import TopicPreferences from "./TopicPreferences";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import useCountry from "../lib/use-country";
import useNewsStream from "../lib/use-news-stream";
import { articleMatchesCountry, countryName } from "../lib/countries";
import { categoryLinks } from "../lib/categories";
import { listItems, formatNewsDate, getArticleImageUrl } from "../lib/api";
import NewsImage from "./NewsImage";
import { Button } from "@/components/ui/button";

export default function CurrentTopics() {
  const country = useCountry();
  const params = useSearchParams();
  const category = params.get("category") || "";
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const items = categoryLinks(categories);
  if (category && !items.some(item => item.name.toLowerCase() === category.toLowerCase())) items.push({ name: category, href: `/topics?category=${encodeURIComponent(category)}` });
  const manage = params.get("manage") === "1";
  const [managing, setManaging] = useState(manage);
  useEffect(() => setManaging(manage), [manage]);
  const query = new URLSearchParams({ page_size: "30", ...(category ? { category } : {}) }).toString();
  const { data, loading, error, updatedAt, refresh } = useNewsStream({ country, query, refreshMs: 30000 });
  const articles = listItems(data).filter(article => articleMatchesCountry(article, country));
  return <div className="space-y-6">
    <header className="stream-page-heading">
      <p className="editorial-eyebrow">The conversation, as it develops</p><h1>Topics in the news</h1>
      <p>Current headlines and subjects from {countryName(country)}. Every story shows its category.</p>
      <div className="flex flex-wrap items-center gap-4 mt-4"><Button variant="outline" onClick={refresh} disabled={!country || loading}><RefreshCw size={14} aria-hidden="true" />Refresh topics</Button><button type="button" aria-expanded={managing} onClick={() => setManaging(value => !value)} className="text-sm underline underline-offset-4">Manage followed categories</button></div>
    </header>
    <nav className="topic-category-nav category-links" aria-label="News categories"><Link href="/topics" aria-current={!category ? "page" : undefined}>All categories</Link>{items.map(item => <Link key={item.name} href={item.href} aria-current={category.toLowerCase() === item.name.toLowerCase() ? "page" : undefined}>{item.name}</Link>)}</nav>
    {categoriesError && <p role="alert">{categoriesError}</p>}
    {managing && <TopicPreferences categories={categories} loading={categoriesLoading} />}
    <p className="stream-update" role="status">{updatedAt ? `Last checked ${new Date(updatedAt).toLocaleTimeString()}. ` : ""}Refreshes every 30 seconds while this tab is open.</p>
    {error && <p role="alert">{error} <button type="button" className="underline" onClick={refresh}>Retry</button></p>}
    {!country ? <p>Choose a country to see its current topics.</p> : loading ? <p role="status">Loading current topics…</p> : !articles.length && !error ? <p>No published stories for this category in your country yet.</p> : <div className="current-topics-grid">{articles.map(article => <article key={article.id} className="current-topic">
      <Link href={`/news/${article.id}`} className="block"><NewsImage article={article} src={getArticleImageUrl(article)} alt={article.image_alt || article.title} width={640} height={360} className="w-full aspect-[16/9] rounded-md" /></Link>
      <p className="stream-category">Category: {article.categories?.map(item => item.name).join(" · ") || "General news"}</p>
      <h2><Link href={`/news/${article.id}`}>{article.title}</Link></h2>
      {Array.isArray(article.tags) && article.tags.length > 0 && <p className="topic-subjects">Topics: {article.tags.slice(0, 5).join(" · ")}</p>}
      <p className="text-xs text-muted-foreground mt-3">{article.source?.name || "News desk"} · <time dateTime={article.published_at}>{formatNewsDate(article.published_at)}</time></p>
    </article>)}</div>}
  </div>;
}
