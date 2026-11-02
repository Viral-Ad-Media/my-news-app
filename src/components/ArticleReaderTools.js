"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useReadingPreferences } from "./ReadingPreferences";
import { useReaderChoices } from "../lib/reader-choices";
import ReaderChoiceButtons from "./ReaderChoiceButtons";

export default function ArticleReaderTools({ articleId, sourceId, story }) {
  const { history, ready } = useReadingPreferences(), { choices } = useReaderChoices();
  const authenticated = !!choices;
  const [message, setMessage] = useState(""), [status, setStatus] = useState(""), [busy, setBusy] = useState(false), [error, setError] = useState("");
  useEffect(() => {
    if (!ready || !history || !authenticated) return;
    const controller = new AbortController();
    fetch(`/api/reader/history/${articleId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: "{}", signal: controller.signal }).catch(() => {});
    return () => controller.abort();
  }, [articleId, ready, history, authenticated]);
  async function report(e) {
    e.preventDefault(); if (busy) return; setBusy(true); setError(""); setStatus("");
    try {
      const res = await fetch(`/api/reader/article-reports/${articleId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) });
      const data = await res.json();
      if (!res.ok) throw Error([401, 403].includes(res.status) ? "Sign in to submit an error report." : res.status === 429 ? "Too many reports. Please try again later." : "Could not submit your report. Please retry.");
      setStatus(data.detail); setMessage("");
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <section className="article-reader-tools">
    {story && <div className="context-note"><h2>Follow this story</h2><Link className="text-link" href={`/stories/${story.id}`}>{story.title} · Timeline &amp; compare reports ↗</Link><ReaderChoiceButtons storyId={story.id} /></div>}
    <h2>Choose your sources</h2><ReaderChoiceButtons sourceId={sourceId} />
    <details className="report-error"><summary>Report an error</summary>{choices ? <form onSubmit={report}><label>What should our editors check?<textarea required minLength={10} maxLength={2000} value={message} onChange={e => setMessage(e.target.value)} placeholder="Identify the claim and include a supporting source if possible." /></label><button className="editorial-button" disabled={busy || message.trim().length < 10}>{busy ? "Submitting…" : "Send for editorial review"}</button></form> : <p><Link className="text-link" href="/login">Sign in</Link> to submit a report to the editorial queue.</p>}{status && <p role="status">{status}</p>}{error && <p role="alert">{error}</p>}</details>
    <Link className="text-link text-sm" href="/editorial-policy">Editorial approach and corrections</Link>
  </section>;
}
