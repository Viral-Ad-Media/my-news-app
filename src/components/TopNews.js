"use client";
import LocalizedArticleText from "./LocalizedArticleText";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import NewsImage from "./NewsImage";
import useCountry from "../lib/use-country";
import { articleMatchesCountry } from "../lib/countries";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatNewsDate,
  listItems,
  buildApiUrl,
  getArticleImageUrl,
} from "../lib/api";
import { useLanguage } from "../lib/i18n";

export default function TopNews() {
  const { t } = useLanguage();
  const country = useCountry();
  const [news, setNews] = useState([]);
  const [edition, setEdition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!country) return;
    const controller = new AbortController();
    setLoading(true);
    setEdition(null);
    const url = buildApiUrl(`/edition/?location=${country}`);
    if (!url) {
      setError("The news service is not configured.");
      setLoading(false);
      return;
    }
    fetch(url, { signal: controller.signal })
      .then(async (res) => {
        // Allow a preview frontend to run against the previous API during rollout.
        if (res.status === 404) {
          const previous = await fetch(buildApiUrl(`/news/?page_size=6&location=${country}`), { signal: controller.signal });
          if (!previous.ok) throw new Error();
          return { legacy: await previous.json() };
        }
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        const legacy = data.legacy || (Array.isArray(data.results) ? data : null);
        setEdition(legacy ? null : data);
        setNews(legacy ? listItems(legacy) : [...(data.lead || []), ...(data.supporting || []), ...(data.feature || [])]);
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
  }, [revision, country]);
  if (!country) return <section className="py-8 text-sm text-muted-foreground">Choose a country to see its latest reporting.</section>;
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
  const regionalNews = news.filter(article => articleMatchesCountry(article, country));
  if (!regionalNews.length)
    return (
      <section className="rounded-xl bg-muted p-6">
        <h2 className="font-semibold">Latest briefing</h2>
        <p className="mt-2">No stories published yet. Check back soon.</p>
      </section>
    );
  const [lead, ...others] = regionalNews;
  const supporting = edition ? (edition.supporting || []).filter(article => articleMatchesCountry(article, country)) : others.slice(0, 3);
  const features = edition ? (edition.feature || []).filter(article => articleMatchesCountry(article, country)) : others.slice(3, 5);
  const category = (story) => story.categories?.[0]?.name || "News";
  const storyMeta = (story) => (
    <p className="story-meta">
      <span className="story-category">{category(story)}</span>
      <span aria-hidden="true">/</span>
      <time dateTime={story.published_at}>{formatNewsDate(story.published_at)}</time>
    </p>
  );
  return (
    <section aria-labelledby="briefing-title" className="editorial-briefing">
      <div className="editorial-section-heading">
        <h2 id="briefing-title">{t("briefing_title", "Latest briefing")}</h2>
        <Link href="/timelines">The news archive <ArrowUpRight size={15} aria-hidden="true" /></Link>
      </div>
      <div className={`briefing-grid ${!supporting.length ? "briefing-grid-single" : ""}`}>
        <article className="lead-story min-w-0">
          <p className="story-byline"><span className="desk-mark" aria-hidden="true">A</span><Link href={`/sources/${lead.source?.id}`}>{lead.source?.name || "AbokiNews"}</Link><span className="text-muted-foreground font-normal"> / {lead.editorial_type || "Reporting"}</span></p>
          <Link href={`/news/${lead.id}`} className="story-headline-link">
            <h3 className="lead-headline"><LocalizedArticleText articleId={lead.id} field="title" original={lead.title} /></h3>
          </Link>
          {storyMeta(lead)}
          <Link href={`/news/${lead.id}`} className="block" aria-label={`Read: ${lead.title}`}>
            <NewsImage article={lead} src={getArticleImageUrl(lead)} alt={lead.image_alt || lead.title}
              width={1000} height={620} priority sizes="(max-width: 767px) 100vw, 55vw"
              className="lead-photo w-full aspect-[16/10] rounded-md" />
          </Link>
          <p className="lead-description"><LocalizedArticleText articleId={lead.id} field="description" original={lead.description} /></p>
          {lead.why_matters && <div className="context-note"><h4>Why this matters</h4><p>{lead.why_matters}</p><Link className="text-link" href={`/news/${lead.id}`}>Read the context and evidence ↗</Link></div>}
          {lead.developing_story && <Link className="text-link" href={`/stories/${lead.developing_story.id}`}>Follow this story’s developments ↗</Link>}
        </article>
        {supporting.length > 0 && <div className="supporting-stories">
          {supporting.map((item) => (
            <article key={item.id} className="supporting-story">
              <div className="min-w-0">
                <Link href={`/news/${item.id}`} className="story-headline-link"><h3><LocalizedArticleText articleId={item.id} field="title" original={item.title} /></h3></Link>
                <p className="supporting-description"><LocalizedArticleText articleId={item.id} field="description" original={item.description} /></p>
                {storyMeta(item)}
              </div>
              <Link href={`/news/${item.id}`} aria-label={`Read: ${item.title}`}>
                <NewsImage article={item} src={getArticleImageUrl(item)} alt={item.image_alt || item.title}
                  width={400} height={300} sizes="(max-width: 767px) 32vw, 18vw"
                  className="w-full aspect-[4/3] rounded-md" />
              </Link>
            </article>
          ))}
        </div>}
      </div>
      {features.length > 0 && <div className="feature-stories">
        {features.map((item) => (
          <article key={item.id} className="feature-story">
            <Link href={`/news/${item.id}`}>
              <NewsImage article={item} src={getArticleImageUrl(item)} alt={item.image_alt || item.title}
                width={800} height={450} sizes="(max-width: 639px) 100vw, 50vw"
                className="w-full aspect-[16/9]" />
              <div className="feature-story-copy">
                {storyMeta(item)}
                <h3><LocalizedArticleText articleId={item.id} field="title" original={item.title} /></h3>
              </div>
            </Link>
          </article>
        ))}
      </div>}
      {edition?.latest?.length > 0 && <section className="edition-latest"><h3>Latest in your edition</h3><ol>{edition.latest.filter(article => articleMatchesCountry(article, country)).map(article => <li key={article.id}><time dateTime={article.published_at}>{formatNewsDate(article.published_at)}</time><Link href={`/news/${article.id}`}><LocalizedArticleText articleId={article.id} field="title" original={article.title} /></Link></li>)}</ol></section>}
      {(edition?.sections || []).map((section, index) => <section className="edition-category" key={`${section.category}-${index}`}><div className="editorial-section-heading"><h3>{section.title}</h3><Link href={`/categories/${section.category}`}>All {section.category_name} ↗</Link></div><div className="edition-category-grid">{(section.articles || []).filter(article => articleMatchesCountry(article, country)).map(article => <article key={article.id}><p className="editorial-eyebrow">{article.source?.name} · {article.editorial_type || "news"}</p><Link href={`/news/${article.id}`}><h4><LocalizedArticleText articleId={article.id} field="title" original={article.title} /></h4></Link><p><LocalizedArticleText articleId={article.id} field="description" original={article.description} /></p></article>)}</div>{!section.articles?.length && <p>No published reports in this section yet.</p>}</section>)}
    </section>
  );
}
