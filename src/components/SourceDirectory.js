"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { buildApiUrl, formatNewsDate } from "../lib/api";
import useCountry from "../lib/use-country";
import ReaderChoiceButtons from "./ReaderChoiceButtons";
import ReportCards from "./ReportCards";
import { useReaderChoices } from "../lib/reader-choices";

export default function SourceDirectory({ sourceId, preferences = false }) {
  const country = useCountry(), { choices } = useReaderChoices();
  const [state, setState] = useState({}), [retry, setRetry] = useState(0), [search, setSearch] = useState("");
  const key = `${sourceId || "all"}|${country}|${preferences}`;
  useEffect(() => {
    if (!country && !preferences) return;
    const controller = new AbortController();
    const path = sourceId ? `/sources/${sourceId}/?location=${country}` : preferences ? "/sources/" : `/sources/?location=${country}`;
    const url = buildApiUrl(path); setState({ key });
    if (!url) { setState({ key, error: "News service is not configured." }); return; }
    fetch(url, { signal: controller.signal }).then(async res => { if (!res.ok) throw Error("Could not load publisher information."); return res.json(); }).then(data => setState({ key, data })).catch(e => { if (!controller.signal.aborted) setState({ key, error: e.message }); });
    return () => controller.abort();
  }, [country, sourceId, preferences, key, retry]);
  const data = state.key === key ? state.data : null;
  return <section className="source-directory editorial-surface">
    <p className="editorial-eyebrow">Know your sources</p><h1 className="editorial-page-title">{sourceId ? data?.source?.name || "Publisher profile" : preferences ? "Manage your publishers" : "Publishers in your edition"}</h1>
    <p className="section-intro">Explore attribution, editorial review notes, and the reporting we carry. A source review does not verify every claim or imply a political bias rating.</p>
    {state.key === key && state.error ? <p role="alert">{state.error} <button className="text-link" onClick={() => setRetry(v => v + 1)}>Retry</button></p> : !data ? <p role="status">Loading publishers…</p> : sourceId ? <>
      <SourceProfile source={data.source} />
      <h2 className="editorial-section-title">Latest reports in your selected edition</h2><ReportCards articles={data.articles || []} />{!data.articles?.length && <p>No published reports in this edition yet.</p>}
    </> : <>
      <label className="source-search">Find a publisher<input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by publisher name" /></label>
      {preferences && <p className="text-sm">{choices ? `${choices.sources?.length || 0} followed · ${choices.muted_sources?.length || 0} muted` : "Sign in to save publisher choices."} · Muting affects My Feed. Public headlines and saved stories remain accessible.</p>}
      <div className="source-card-grid">{(data.results || []).filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map(source => <article key={source.id} className="source-card">
        <p className="editorial-eyebrow">{source.review_status === "reviewed" ? "Editorial review recorded" : "Review not recorded"} · Bias unrated</p>
        <Link href={`/sources/${source.id}`}><h2>{source.name}</h2></Link><p>{source.description || "Read this publisher’s profile and original reporting."}</p>
        <ReaderChoiceButtons sourceId={source.id} />
      </article>)}</div>
      {!data.results?.length && <p>No publishers have published reporting in this edition yet.</p>}
    </>}
  </section>;
}
function SourceProfile({ source }) {
  return <div className="source-profile"><p>{source.description || "A publisher description has not been added yet."}</p>
    {/^https?:\/\//i.test(source.url || "") && <a className="text-link" href={source.url} target="_blank" rel="noopener noreferrer">Publisher website ↗</a>}
    <ReaderChoiceButtons sourceId={source.id} />
    <dl><dt>Source review</dt><dd>{source.review_status === "reviewed" ? "Editorial review recorded" : "Not yet reviewed"}</dd><dt>Political bias rating</dt><dd>Unrated — no documented rating has been assigned.</dd>{source.publisher_group && <><dt>Declared publisher group</dt><dd>{source.publisher_group}</dd></>}</dl>
    {source.review_notes && <section className="context-note"><h2>Review notes</h2><p>{source.review_notes}</p>{source.reviewed_at && <p>Reviewed {formatNewsDate(source.reviewed_at)}</p>}{/^https?:\/\//i.test(source.review_evidence_url || "") && <a className="text-link" href={source.review_evidence_url} target="_blank" rel="noopener noreferrer">Review evidence ↗</a>}</section>}
  </div>;
}
