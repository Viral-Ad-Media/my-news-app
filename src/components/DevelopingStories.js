"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { buildApiUrl, formatNewsDate } from "../lib/api";
import useCountry from "../lib/use-country";
import { countryName, articleMatchesCountry } from "../lib/countries";
import ReaderChoiceButtons from "./ReaderChoiceButtons";
import ReportCards from "./ReportCards";

export default function DevelopingStories({ storyId = null, compact = false }) {
  const country = useCountry();
  const [state, setState] = useState({}), [retry, setRetry] = useState(0);
  const key = storyId ? String(storyId) : country;
  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    const url = buildApiUrl(storyId ? `/stories/${storyId}/` : `/stories/?location=${country}`);
    setState({ key, loading: true });
    if (!url) { setState({ key, error: "News service is not configured." }); return; }
    fetch(url, { signal: controller.signal }).then(async res => {
      if (!res.ok) throw Error(res.status === 404 ? "This story is not currently available." : "Could not load developing stories.");
      return res.json();
    }).then(data => setState({ key, data })).catch(e => { if (!controller.signal.aborted) setState({ key, error: e.message }); });
    return () => controller.abort();
  }, [key, country, storyId, retry]);
  const current = state.key === key ? state : {};
  const title = storyId ? "Follow the story" : "Developing stories";
  return <section className="developing-stories editorial-surface">
    <div className="editorial-section-heading">{compact ? <h2>Follow the developments</h2> : <h1 className="editorial-page-title">{title}</h1>}{compact && <Link href="/stories">All developing stories ↗</Link>}</div>
    {!storyId && <p className="section-intro">Specific events, their timelines, and the reporting behind them{country ? ` · ${countryName(country)}` : ""}.</p>}
    {!key ? <p>Choose a country to explore developing stories.</p> : current.error ? <p role="alert">{current.error} <button className="text-link" onClick={() => setRetry(v => v + 1)}>Retry</button></p> : !current.data ? <p role="status">Loading developments…</p> : storyId ? <StoryDetail story={current.data} /> : <>
      {!current.data.results?.length && <p>No developing events have been curated for this edition yet. <Link className="text-link" href="/timelines">Browse the news archive</Link>.</p>}
      <div className="story-event-grid">{(current.data.results || []).filter(story => articleMatchesCountry(story, country)).slice(0, compact ? 3 : 60).map(story => <article key={story.id} className="story-event-card">
        <p className="editorial-eyebrow">{story.report_count} reports · {story.publisher_count} publisher groups</p>
        <Link href={`/stories/${story.id}`}><h2>{story.title}</h2></Link>
        <p>{story.overview}</p><time dateTime={story.updated_at}>Updated {formatNewsDate(story.updated_at)}</time>
        <ReaderChoiceButtons storyId={story.id} />
      </article>)}</div>
    </>}
  </section>;
}

function StoryDetail({ story }) {
  return <div className="story-detail">
    <p className="editorial-eyebrow">{countryName(story.location)} · Editor-curated event</p>
    <h2 className="event-title">{story.title}</h2>
    <p className="event-overview">{story.overview}</p>
    <p className="text-sm text-muted-foreground">Last editorial update: <time dateTime={story.updated_at}>{formatNewsDate(story.updated_at)}</time></p>
    <ReaderChoiceButtons storyId={story.id} />
    <p className="text-sm text-muted-foreground">Following adds this event’s reports to My Feed in the matching country edition. It does not subscribe you to email alerts.</p>
    <div className="story-context-grid">{[["Where reports agree", story.agreements], ["Differences in coverage", story.differences], ["What remains uncertain", story.uncertainty]].filter(([, text]) => text).map(([title, text]) => <section key={title} className="context-note"><h3>{title}</h3><p>{text}</p><span>Editorial context · see the source reports below</span></section>)}</div>
    <section className="event-timeline"><h3>What changed</h3>{!story.updates?.length && <p>No editorial timeline updates have been added yet. Publication dates for individual reports appear below.</p>}<ol>{(story.updates || []).map(update => <li key={update.id}><time dateTime={update.occurred_at}>{formatNewsDate(update.occurred_at)}</time><p>{update.summary}</p><Link href={`/news/${update.article}`}>Evidence: {update.source} · {update.title}</Link></li>)}</ol></section>
    <section id="compare-reports"><h3>Compare reports</h3><p>{story.report_count} reports from {story.publisher_count} publisher groups. Shared websites or declared ownership groups count together; this is not a measure of independent verification.</p><ReportCards articles={story.articles || []} /></section>
    <Link className="text-link" href="/editorial-policy">How our editorial curation works</Link>
  </div>;
}
