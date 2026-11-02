"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { COUNTRIES, countryName } from "../lib/countries";

export async function editorialRequest(path, method = "GET", body) {
  const res = await fetch(`/api/admin/${path}`, { method, cache: "no-store", signal: AbortSignal.timeout(25000), headers: { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
  const data = res.status === 204 ? null : await res.json();
  if (!res.ok) throw Error(typeof data?.detail === "string" ? data.detail : JSON.stringify(data));
  return data;
}
const labels = { stories: "Developing stories", placements: "Homepage stories", sections: "Homepage sections", updates: "Timeline updates", corrections: "Corrections", reports: "Reader reports" };
const localDate = value => { const date = value ? new Date(value) : new Date(); return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };
const defaults = resource => ({
  stories: { title: "", location: "ng", overview: "", agreements: "", differences: "", uncertainty: "", published: false, article_ids: [] },
  placements: { article: "", location: "ng", slot: "lead", rank: 0, starts_at: localDate(), ends_at: localDate(Date.now() + 86400000) },
  sections: { title: "", location: "ng", category: "", rank: 0, enabled: true },
  updates: { story: "", article: "", summary: "", occurred_at: localDate() },
  corrections: { article: "", note: "" },
}[resource]);

export default function EditorialAdmin() {
  const [resource, setResource] = useState("stories"), [data, setData] = useState(null), [page, setPage] = useState(1);
  const [form, setForm] = useState(null), [error, setError] = useState(""), [status, setStatus] = useState(""), [busy, setBusy] = useState(false), [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]), [stories, setStories] = useState([]), [canDelete, setCanDelete] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    try { const result = await editorialRequest(`editorial/${resource}?page=${page}&page_size=20`); setData(result); setError(""); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  }, [resource, page]);
  useEffect(() => { let active = true; setData(null); setLoading(true); editorialRequest(`editorial/${resource}?page=${page}&page_size=20`).then(result => { if (active) { setData(result); setError(""); } }).catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [resource, page]);
  useEffect(() => {
    let active = true;
    async function all(path) { const rows = []; let page = 1, data; do { data = await editorialRequest(`${path}?page_size=100&page=${page++}`); rows.push(...data.results); } while (data.next); return rows; }
    Promise.all([all("categories"), all("editorial/stories"), editorialRequest("me")]).then(([c, s, me]) => { if (active) { setCategories(c); setStories(s); setCanDelete(me.can_delete); } }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [status]);
  function field(key, value) { setForm(current => ({ ...current, [key]: value })); }
  function input(key, label, type = "text", required = false) {
    return <label>{label}{type === "textarea" ? <textarea required={required} value={form[key] || ""} onChange={e => field(key, e.target.value)} maxLength={12000} /> : <input type={type} required={required} min={type === "number" ? 0 : undefined} value={form[key] ?? ""} onChange={e => field(key, type === "number" ? Number(e.target.value) : e.target.value)} />}</label>;
  }
  function edit(row) { setForm({ ...row, article_ids: row.report_ids || [], ...Object.fromEntries(["starts_at", "ends_at", "occurred_at"].filter(k => row[k]).map(k => [k, localDate(row[k])])) }); setStatus(""); }
  async function save(e) {
    e.preventDefault(); if (busy) return; setBusy(true); setError(""); setStatus("");
    try {
      const payload = { ...form };
      for (const key of ["id", "updated_at", "report_ids", "created_at"]) delete payload[key];
      for (const key of ["starts_at", "ends_at", "occurred_at"]) if (payload[key]) payload[key] = new Date(payload[key]).toISOString();
      await editorialRequest(`editorial/${resource}${form.id ? `/${form.id}` : ""}`, form.id ? "PUT" : "POST", resource === "reports" ? { status: form.status } : payload);
      setForm(null); await load(); setStatus("Editorial changes saved.");
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function remove(row) {
    if (!window.confirm(`Permanently delete this ${labels[resource].toLowerCase()} record?`)) return;
    setBusy(true); setError("");
    try { await editorialRequest(`editorial/${resource}/${row.id}`, "DELETE"); setForm(null); await load(); setStatus("Record deleted."); } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <>
    <header className="editorial-admin-heading"><p className="admin-eyebrow">The editorial desk</p><h1>Shape your edition</h1><p>Choose the lead, connect developing events, and keep a clear record of corrections.</p><Link href="/admin/coverage">Open coverage monitor ↗</Link></header>
    <nav className="editorial-admin-tabs" aria-label="Editorial tools">{Object.entries(labels).map(([key, label]) => <button key={key} aria-pressed={resource === key} onClick={() => { setResource(key); setPage(1); setForm(null); setError(""); setStatus(""); }}>{label}</button>)}</nav>
    {error && <p role="alert" className="admin-error">{error}</p>}{status && <p role="status" className="admin-notice">{status}</p>}
    <div className="admin-actions"><h2>{labels[resource]}</h2>{resource !== "reports" && <button onClick={() => setForm(defaults(resource))}>Create {resource === "stories" ? "story" : "record"}</button>}<button disabled={loading || busy} onClick={load}>Refresh</button></div>
    {loading && <p role="status">Loading editorial records…</p>}
    <div className="admin-table-wrap"><table><thead><tr><th>ID</th><th>Record</th><th>Details</th><th>Actions</th></tr></thead><tbody>{(data?.results || []).map(row => <tr key={row.id}><td>#{row.id}</td><td>{row.title || row.summary || row.note || row.message || `Article #${row.article}`}<br />{row.location && countryName(row.location)}</td><td>{resource === "stories" ? `${row.published ? "Public" : "Draft"} · ${row.report_ids?.length || 0} reports` : resource === "placements" ? `${row.slot} · rank ${row.rank} · until ${new Date(row.ends_at).toLocaleString()}` : resource === "sections" ? `Category #${row.category} · rank ${row.rank} · ${row.enabled ? "Enabled" : "Hidden"}` : resource === "reports" ? `${row.status} · ${new Date(row.created_at).toLocaleString()}` : `Article #${row.article}`}</td><td><button onClick={() => edit(row)}>{resource === "reports" ? "Review" : "Edit"}</button>{resource === "stories" && row.published && <Link href={`/stories/${row.id}`}>Public page ↗</Link>}{canDelete && !["corrections", "reports"].includes(resource) && <button disabled={busy} onClick={() => remove(row)}>Delete</button>}</td></tr>)}</tbody></table>{!loading && !data?.results?.length && <p>No records yet.</p>}</div>
    <div className="admin-pagination"><button disabled={page === 1 || loading} onClick={() => setPage(v => v - 1)}>Previous</button><span>Page {page} · {data?.count || 0} records</span><button disabled={!data?.next || loading} onClick={() => setPage(v => v + 1)}>Next</button></div>
    {form && <section className="admin-card editorial-editor"><h2>{form.id ? "Edit" : "Create"} {labels[resource].toLowerCase()}</h2><form onSubmit={save} className="admin-form">
      {["stories", "sections"].includes(resource) && input("title", "Title", "text", true)}
      {["stories", "placements", "sections"].includes(resource) && <label>Country edition<select aria-label="Country edition" value={form.location} onChange={e => field("location", e.target.value)}><option value="world">World / mixed countries</option>{COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}</select></label>}
      {resource === "stories" && <>
        {input("overview", "What happened — sourced overview", "textarea", true)}{input("agreements", "Where linked reports agree (optional)", "textarea")}{input("differences", "Differences in coverage (optional)", "textarea")}{input("uncertainty", "What remains uncertain (optional)", "textarea")}
        <div className="wide"><ArticlePicker value={form.article_ids} onChange={ids => field("article_ids", ids)} multiple /><p>Select reports about this specific event. Adding a report already in another event moves it here. Removing it separates the report; its original article is preserved.</p></div>
        <label className="editorial-toggle"><input type="checkbox" role="switch" checked={!!form.published} onChange={e => field("published", e.target.checked)} /><span>Publish event page</span></label><p>Publication requires a sourced overview and at least one report from the same edition. Review comparison notes against the linked reports.</p>
      </>}
      {["placements", "updates", "corrections"].includes(resource) && <div className="wide"><ArticlePicker value={form.article ? [form.article] : []} onChange={ids => field("article", ids[0] || "")} /></div>}
      {resource === "placements" && <><label>Homepage position<select aria-label="Homepage position" value={form.slot} onChange={e => field("slot", e.target.value)}><option value="lead">Lead story</option><option value="supporting">Supporting headline</option><option value="feature">Feature story</option></select></label>{input("rank", "Order (lowest first)", "number")}{input("starts_at", "Starts at (your local time)", "datetime-local", true)}{input("ends_at", "Expires at (your local time)", "datetime-local", true)}<p className="wide">Placements expire automatically. Empty positions use the latest articles from the same edition.</p></>}
      {resource === "sections" && <><label>Category<select aria-label="Category" required value={form.category} onChange={e => field("category", Number(e.target.value))}><option value="">Choose category</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>{input("rank", "Section order (lowest first)", "number")}<label className="editorial-toggle"><input type="checkbox" role="switch" checked={!!form.enabled} onChange={e => field("enabled", e.target.checked)} /><span>Show section</span></label></>}
      {resource === "updates" && <><label>Developing story<select aria-label="Developing story" required value={form.story} onChange={e => field("story", Number(e.target.value))}><option value="">Choose event</option>{stories.map(s => <option key={s.id} value={s.id}>#{s.id} · {s.title}</option>)}</select></label>{input("summary", "What changed — supported by the selected report", "textarea", true)}{input("occurred_at", "Development date (your local time)", "datetime-local", true)}<p>The evidence article must belong to this event. Future developments cannot be published as past events.</p></>}
      {resource === "corrections" && <>{input("note", "Public correction / clarification", "textarea", true)}<p>Explain what changed and why. The dated correction will appear on the article. Correction records cannot be deleted through this panel.</p></>}
      {resource === "reports" && <><p className="wide">Reader report for <Link href={`/news/${form.article}`}>Article #{form.article} ↗</Link>: {form.message}</p><label>Review status<select aria-label="Review status" value={form.status} onChange={e => field("status", e.target.value)}><option value="open">Open</option><option value="reviewed">Reviewed</option><option value="resolved">Resolved</option></select></label><p>Use the Articles editor to fix the report, then add a public correction when appropriate.</p></>}
      <div className="admin-actions wide"><button disabled={busy}>{busy ? "Saving…" : "Save editorial changes"}</button><button type="button" disabled={busy} onClick={() => setForm(null)}>Close editor</button></div>
    </form></section>}
  </>;
}

function ArticlePicker({ value, onChange, multiple = false }) {
  const [search, setSearch] = useState(""), [data, setData] = useState(null), [error, setError] = useState(""), [page, setPage] = useState(1);
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => { editorialRequest(`articles?status=published&page_size=20&page=${page}&search=${encodeURIComponent(search)}`).then(result => { if (active) { setData(result); setError(""); } }).catch(e => { if (active) setError(e.message); }); }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [search, page]);
  return <fieldset className="editorial-article-picker"><legend>{multiple ? "Reports in this event" : "Evidence / featured article"}</legend><label>Search published articles<input type="search" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></label><p>Selected: {value.length ? value.map(id => `#${id}`).join(", ") : "None"}</p>{value.length > 0 && <button type="button" onClick={() => onChange([])}>Clear selection</button>}
    {error && <p role="alert">{error}</p>}<div>{(data?.results || []).map(a => <label key={a.id}><input type={multiple ? "checkbox" : "radio"} name={multiple ? undefined : "article-selection"} checked={value.includes(a.id)} onChange={e => onChange(multiple ? e.target.checked ? [...new Set([...value, a.id])] : value.filter(id => id !== a.id) : [a.id])} /><span>#{a.id} · {a.title}<small>{a.source_name} · {a.location}</small></span></label>)}</div>
    <div className="admin-actions"><button type="button" disabled={page <= 1} onClick={() => setPage(v => v - 1)}>Previous articles</button><button type="button" disabled={!data?.next} onClick={() => setPage(v => v + 1)}>Next articles</button></div>
  </fieldset>;
}
