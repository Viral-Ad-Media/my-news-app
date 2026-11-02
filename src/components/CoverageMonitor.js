"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { editorialRequest } from "./EditorialAdmin";

export default function CoverageMonitor() {
  const [data, setData] = useState(null), [error, setError] = useState(""), [country, setCountry] = useState("ng"), [category, setCategory] = useState(""), [retry, setRetry] = useState(0);
  useEffect(() => { let active = true; editorialRequest("coverage-monitor").then(result => { if (active) { setData(result); setError(""); } }).catch(e => { if (active) setError(e.message); }); return () => { active = false; }; }, [retry]);
  const rows = data?.matrix?.filter(r => r.country === country && (!category || String(r.category) === category)) || [];
  const sources = data?.sources?.filter(s => (country === "world" || s.location === country) && (!category || String(s.default_category_id) === category)) || [];
  return <><header className="editorial-admin-heading"><p className="admin-eyebrow">Coverage intelligence</p><h1>Every edition, accounted for</h1><p>See actual publication activity, missing coverage, and source failures.</p></header>
    {error && <p role="alert" className="admin-error">{error}</p>}<button onClick={() => setRetry(v => v + 1)}>Refresh coverage</button>
    {!data ? <p role="status">Loading coverage…</p> : <>
      <p>Checked {new Date(data.checked_at).toLocaleString()}</p><p className="admin-notice">{data.note}</p>
      <div className="admin-form"><label>Country edition<select aria-label="Country edition" value={country} onChange={e => setCountry(e.target.value)}>{data.countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}</select></label><label>Category<select aria-label="Category" value={category} onChange={e => setCategory(e.target.value)}><option value="">All categories</option>{data.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label></div>
      <div className="admin-stats"><div><strong>{rows.filter(r => r.published_24h === 0).length}</strong><span>Categories with no publications in 24h</span></div><div><strong>{sources.filter(s => s.enabled).length}</strong><span>Enabled sources in this view</span></div><div><strong>{sources.filter(s => s.last_error).length}</strong><span>Sources with fetch errors</span></div></div>
      <div className="admin-table-wrap"><table><thead><tr><th>Category</th><th>Assigned sources / enabled</th><th>Last successful fetch</th><th>Published / new in 24h</th><th>Coverage</th></tr></thead><tbody>{rows.map(row => <tr key={row.category}><td>{data.categories.find(c => c.id === row.category)?.name}</td><td>{row.configured} / {row.enabled}</td><td>{row.last_success ? new Date(row.last_success).toLocaleString() : "No successful fetch recorded"}</td><td>{row.published} / {row.published_24h}</td><td><span className={`coverage-status ${row.published_24h ? "coverage-current" : "coverage-gap"}`}>{row.published_24h ? "Recent publication" : row.published ? "No new publication in 24h" : "No published coverage"}</span>{row.failed > 0 && <p>{row.failed} assigned sources have errors</p>}</td></tr>)}</tbody></table></div>
      <section className="admin-card"><h2>Source health</h2><p>Untested and stale sources are distinct from failed requests. General feeds may cover more topics than their assigned default category.</p>{sources.map(source => <div className="coverage-source-row" key={source.id}><div><strong>{source.name}</strong><p>{source.enabled ? "Enabled" : "Disabled"} · {source.last_error ? "Fetch error" : !source.last_success ? "Untested" : Date.now() - new Date(source.last_success).getTime() > 86400000 ? "Stale: no success in 24h" : "Fetch passed within 24h"}</p>{source.last_error && <p>{source.last_error}</p>}</div><Link href={`/admin/logs?source=${source.id}`}>Inspect logs ↗</Link></div>)}{!sources.length && <p>No sources assigned to these filters.</p>}</section>
      <section className="admin-card"><h2>Repeated source URLs</h2><p>These are duplicate candidates across all editions, not an instruction to delete related reporting.</p>{data.duplicate_urls.length ? data.duplicate_urls.map(row => <p className="break-words" key={row.article_url}>{row.total} stored articles · {row.article_url}</p>) : <p>No repeated non-empty source URLs found.</p>}</section>
    </>}
  </>;
}
