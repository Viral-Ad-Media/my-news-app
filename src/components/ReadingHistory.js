"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ReportCards from "./ReportCards";
import useCountry from "../lib/use-country";
import { useReadingPreferences } from "./ReadingPreferences";

export default function ReadingHistory() {
  const country = useCountry(), { history } = useReadingPreferences();
  const [data, setData] = useState(null), [error, setError] = useState(""), [busy, setBusy] = useState(false), [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!country) return;
    const controller = new AbortController(); setData(null); setError("");
    fetch(`/api/reader/history?location=${country}`, { signal: controller.signal, cache: "no-store" }).then(async res => { if (!res.ok) throw Error([401, 403].includes(res.status) ? "Sign in to view your reading history." : "Could not load reading history."); return res.json(); }).then(setData).catch(e => { if (!controller.signal.aborted) setError(e.message); });
    return () => controller.abort();
  }, [country, retry]);
  async function clear() {
    setBusy(true); setError("");
    try { const res = await fetch("/api/reader/history", { method: "DELETE" }); if (!res.ok) throw Error("Could not clear history. Please retry."); setData({ results: [] }); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <section className="editorial-surface"><h1 className="editorial-page-title">Reading history</h1><p>History recording is {history ? "on" : "off"} on this browser. Change it in Reading settings. Up to 100 recent articles are retained per account; this view shows your selected country.</p>
    {error && <p role="alert">{error} <Link className="text-link" href="/login">Sign in</Link> <button className="text-link" onClick={() => setRetry(v => v + 1)}>Retry</button></p>}
    {data && <><button className="editorial-button" disabled={busy || !data.results?.length} onClick={clear}>{busy ? "Clearing…" : "Clear all countries’ reading history"}</button><ReportCards articles={data.results || []} />{!data.results?.length && <p>No reading history in this edition.</p>}</>}
  </section>;
}
