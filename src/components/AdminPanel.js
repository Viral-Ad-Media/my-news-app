'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

async function api(path, method = 'GET', body) {
  const res = await fetch(`/api/admin/${path}`, { method, cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  const data = res.status === 204 ? null : await res.json();
  if (!res.ok) {
    if ([401, 403].includes(res.status)) throw Error('Unauthorized: sign in with an administrator account.');
    throw Error(typeof data?.detail === 'string' ? data.detail : JSON.stringify(data));
  }
  return data;
}
async function choices(resource) {
  const rows = [];
  let page = 1, data;
  do {
    data = await api(`${resource}?page_size=100&page=${page++}`);
    rows.push(...data.results);
  } while (data.next);
  return rows;
}
const date = value => value ? new Date(value).toLocaleString() : 'Not recorded';
const title = value => value.replaceAll('_', ' ').replace(/^./, x => x.toUpperCase());
const blankArticle = { title: '', description: '', content: '', author: '', source: '', categories: [], location: 'ng', article_url: '', focus_keyword: '', seo_title: '', seo_description: '', image_alt: '' };
const blankCategory = { name: '', slug: '', description: '' };
const blankSource = { name: '', url: '', feed_url: '', enabled: false, location: 'ng', default_category: '' };

export default function AdminPanel({ section }) {
  const [data, setData] = useState(null), [error, setError] = useState(''), [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false), [loading, setLoading] = useState(true), [page, setPage] = useState(1);
  const [filters, setFilters] = useState({}), [draftFilters, setDraftFilters] = useState({});
  const [form, setForm] = useState(null), [categories, setCategories] = useState([]), [sources, setSources] = useState([]);
  const [runs, setRuns] = useState(null), [canDelete, setCanDelete] = useState(false);
  const [preparations, setPreparations] = useState(null), [preparationError, setPreparationError] = useState('');
  const resource = section === 'dashboard' ? 'dashboard' : section;
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page: String(page), page_size: '20', ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '')) });
      const result = await api(`${resource}?${query}`);
      setData(result); setError('');
      if (section === 'settings') setForm(result);
      if (section === 'logs') setRuns(await api(`runs?${query}`));
      if (section === 'articles') {
        try { setPreparations(await api('preparations')); setPreparationError(''); }
        catch (e) { setPreparationError(`Article preparation unavailable: ${e.message}. Check that backend migration 0019 has been applied.`); }
      }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [resource, page, filters, section]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    let active = true;
    Promise.all([choices('categories'), choices('sources'), api('me')]).then(([c, s, me]) => {
      if (active) { setCategories(c); setSources(s); setCanDelete(me.can_delete); }
    }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!['dashboard', 'logs', 'articles'].includes(section)) return;
    const timer = setInterval(load, 10000);
    return () => clearInterval(timer);
  }, [load, section]);
  async function perform(action, success) {
    if (busy) return;
    setBusy(true); setError(''); setMessage('');
    try { await action(); setMessage(success); await load(); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  function field(name, value) { setForm(current => ({ ...current, [name]: value })); }
  function input(name, type = 'text', options = {}) {
    return <label key={name}>{title(name)}{type === 'textarea' ? <textarea value={form?.[name] || ''} onChange={e => field(name, e.target.value)} {...options} /> : <input type={type} value={form?.[name] ?? ''} onChange={e => field(name, type === 'number' ? Number(e.target.value) : e.target.value)} {...options} />}</label>;
  }
  async function save(e) {
    e.preventDefault();
    if (!window.confirm('Save these changes?')) return;
    await perform(async () => {
      if (section === 'settings') {
        const { enabled, interval_minutes, max_per_source, timeout_seconds, revision } = form;
        setForm(await api('settings', 'PUT', { enabled, interval_minutes, max_per_source, timeout_seconds, revision }));
        return;
      }
      let payload;
      if (section === 'articles') {
        payload = Object.fromEntries(['title', 'description', 'content', 'author', 'source', 'categories', 'location', 'article_url', 'focus_keyword', 'seo_title', 'seo_description', 'image_alt', 'revision'].filter(k => form[k] !== undefined).map(k => [k, form[k]]));
        if (form.imported) for (const k of ['title', 'description', 'author', 'source', 'article_url']) delete payload[k];
        if (form.imported && form.content === form._originalContent) delete payload.content;
      } else if (section === 'sources') {
        payload = Object.fromEntries(Object.keys(blankSource).map(k => [k, form[k] ?? blankSource[k]]));
        payload.feed_url ||= null; payload.default_category ||= null;
      } else payload = Object.fromEntries(Object.keys(blankCategory).map(k => [k, form[k] || '']));
      await api(`${section}${form.id ? `/${form.id}` : ''}`, form.id ? 'PUT' : 'POST', payload);
      setForm(null);
      if (section === 'categories') setCategories(await choices('categories'));
      if (section === 'sources') setSources(await choices('sources'));
    }, 'Changes saved.');
  }
  function queue(sourceId, test = false, dryRun = false) {
    if (!window.confirm(test || dryRun ? 'Queue a feed check without publishing?' : 'Fetch configured feeds and prepare source-grounded full articles and publish only those passing checks?')) return;
    perform(async () => {
      const run = await api(test ? `sources/${sourceId}/test` : `runs${sourceId ? `/${sourceId}` : ''}`, 'POST', { dry_run: dryRun });
      setMessage(`Run #${run.id} queued. Follow its actual status in Logs. A deployed worker is required.`);
    }, 'Run queued. Follow its status in Logs. A deployed worker is required.');
  }
  function prepare(id, evidence = '', references = []) {
    if (!window.confirm(id ? 'Queue a source-grounded full article upgrade? The summary and publication date will stay unchanged.' : 'Queue full article upgrades for existing short stories? Their current bodies will be backed up.')) return;
    perform(() => api(id ? `articles/${id}/prepare` : 'preparations', 'POST', { evidence, references }), 'Article preparation queued. The background worker is required; follow its status below.');
  }
  function remove(row) {
    if (!window.confirm(`Permanently delete ${row.title || row.name}? This cannot be undone.`)) return;
    perform(() => api(`${section}/${row.id}`, 'DELETE'), 'Record deleted.');
  }
  function selectFilter(name, values) {
    return <select aria-label={`Filter ${name}`} value={draftFilters[name] || ''} onChange={e => setDraftFilters({ ...draftFilters, [name]: e.target.value })}><option value="">All {name}</option>{values.map(([v, label]) => <option key={v} value={v}>{label}</option>)}</select>;
  }
  const rows = data?.results || [];
  const latestPreparations = new Map();
  for (const job of preparations?.jobs || []) if (!latestPreparations.has(job.article)) latestPreparations.set(job.article, job);
  const preparationFor = id => latestPreparations.get(id);
  return <><header><small>PRIVATE WORKSPACE / ABOKINEWS</small><h1>{title(section)}</h1></header>
    {error && <div className="admin-message" role="alert">{error} <Link href="/admin/login">Sign in</Link></div>}
    {message && <div className="admin-message" role="status">{message}</div>}
    {loading && <p role="status">Loading saved backend data…</p>}
    {!data && !loading && <button onClick={load}>Retry</button>}
    {section === 'dashboard' && data && <>
      <div className="admin-grid">{Object.entries(data.stats).map(([key, value]) => <div className="admin-stat" key={key}>{title(key)}<strong>{value}</strong></div>)}</div>
      <p><small>Published excludes archived articles. Fetched counts newly imported articles in the last 24 hours. Failed runs includes partial failures within the 90-day retention window. Drafts are not part of this publishing model.</small></p>
      <section className="admin-card"><h2>News automation</h2><p>Automation: <strong>{data.settings.enabled ? 'Enabled' : 'Disabled'}</strong> · Every {data.settings.interval_minutes} minutes</p><p>Worker last seen: {date(data.settings.worker_seen)}</p><p>Next due: {data.settings.enabled ? date(data.settings.next_run) : 'Disabled'}</p><p>Current job: {data.active_run ? `#${data.active_run.id} queued or executing` : 'No pending job'}</p><p>Last run: {data.last_run ? `#${data.last_run.id} · ${data.last_run.status}` : 'No runs recorded'}</p>{data.last_run && <><p>Started: {date(data.last_run.started_at)} · Duration: {data.last_run.duration?.toFixed(2) ?? 'Pending'} seconds</p><pre>{JSON.stringify(data.last_run.counts, null, 2)}</pre></>}
      <div className="admin-actions"><button disabled={busy || Boolean(data.active_run)} onClick={() => queue()}>Run now</button><button disabled={busy || Boolean(data.active_run)} onClick={() => queue(null, false, true)}>Test without publishing</button><button disabled={busy} onClick={() => { if (window.confirm(`${data.settings.enabled ? 'Disable' : 'Enable'} hourly automation?`)) perform(() => api('settings', 'PUT', { enabled: !data.settings.enabled, revision: data.settings.revision }), 'Automation updated.'); }}>{data.settings.enabled ? 'Disable' : 'Enable'} automation</button><Link href="/admin/logs">Run history</Link></div></section>
      <section className="admin-card"><h2>Recent activity</h2>{data.events.length ? data.events.map(e => <p key={e.id}>{date(e.timestamp)} · {e.message} · {e.status} {e.run && <Link href={`/admin/logs?run=${e.run}`}>Run #{e.run}</Link>}</p>) : <p>No activity recorded.</p>}</section>
      <h2>Latest articles</h2><div className="admin-table"><table><thead><tr><th>Title</th><th>Source / category</th><th>Publication</th><th>Status</th></tr></thead><tbody>{data.recent_articles.map(a => <tr key={a.id}><td><Link href={`/admin/articles?edit=${a.id}`}>{a.title}</Link></td><td>{a.source_name}<br />{a.category_names.join(', ')}</td><td>{date(a.published_at)}</td><td>{a.archived ? 'Archived' : 'Published'} {!a.archived && <Link href={`/news/${a.id}`}>View ↗</Link>}</td></tr>)}</tbody></table></div>
    </>}
    {['articles', 'categories', 'sources', 'logs'].includes(section) && <>
      <form className="admin-filters" onSubmit={e => { e.preventDefault(); setFilters(draftFilters); setPage(1); }}><input aria-label="Search" placeholder="Search…" value={draftFilters.search || ''} maxLength={200} onChange={e => setDraftFilters({ ...draftFilters, search: e.target.value })} />
      {section === 'articles' && <>{selectFilter('status', [['published', 'Published'], ['archived', 'Archived']])}{selectFilter('category', categories.map(c => [c.id, c.name]))}{selectFilter('sort', [['title', 'Title A–Z'], ['-title', 'Title Z–A'], ['-created_at', 'Newest added'], ['created_at', 'Oldest added'], ['-published_at', 'Newest published'], ['published_at', 'Oldest published']])}</>}
      {['articles', 'logs'].includes(section) && <>{selectFilter('source', sources.map(s => [s.id, s.name]))}<label>From<input type="date" value={draftFilters.after || ''} onChange={e => setDraftFilters({ ...draftFilters, after: e.target.value })} /></label><label>To<input type="date" value={draftFilters.before || ''} onChange={e => setDraftFilters({ ...draftFilters, before: e.target.value })} /></label></>}
      {section === 'sources' && selectFilter('enabled', [['true', 'Enabled'], ['false', 'Disabled']])}
      {section === 'logs' && <>{selectFilter('kind', [['crawl', 'Crawler'], ['source', 'Source'], ['publishing', 'Publishing'], ['audit', 'Admin audit']])}{selectFilter('severity', [['info', 'Info'], ['warning', 'Warning'], ['error', 'Error']])}{selectFilter('status', ['queued', 'success', 'partial', 'failed', 'published'].map(s => [s, title(s)]))}<input type="number" min="1" aria-label="Run ID" placeholder="Run ID" value={draftFilters.run || ''} onChange={e => setDraftFilters({ ...draftFilters, run: e.target.value })} /></>}
      <button disabled={busy}>Apply filters</button><button type="button" onClick={() => { setDraftFilters({}); setFilters({}); setPage(1); }}>Reset</button></form>
      {section !== 'logs' && <button onClick={() => setForm({ ...(section === 'articles' ? blankArticle : section === 'categories' ? blankCategory : blankSource) })}>Create {section === 'categories' ? 'category' : section.slice(0, -1)}</button>}
      <div className="admin-table"><table><thead><tr>{(section === 'articles' ? ['Article', 'Source / category', 'Publication', 'Status', 'Actions'] : section === 'categories' ? ['Category', 'Slug', 'Articles', 'Actions'] : section === 'sources' ? ['Source / feed', 'Health', 'Last attempt / success', 'Retrieved', 'Actions'] : ['Timestamp', 'Event / severity', 'Message / details', 'Status']).map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>
      {rows.map(row => <tr key={row.id}>{section === 'articles' ? <><td>{row.title}<br /><small>#{row.id} · {row.imported ? 'Imported · source fields protected' : 'Editorial / legacy'}</small>{row.duplicate_ids?.length > 0 && <p>Possible duplicates: {row.duplicate_ids.join(', ')}</p>}</td><td>{row.source_name}<br />{row.category_names.join(', ')}</td><td>{date(row.published_at)}</td><td>{row.archived ? 'Archived' : 'Published'}{preparationFor(row.id)?.status === 'blocked' && <p><strong>Needs review</strong><br /><small>{preparationFor(row.id).error}</small></p>}{row.quality && <p><small>{row.quality.word_count} words · {row.quality.passed ? 'Article structure passed' : 'Full article upgrade needed'}</small></p>}</td><td><button disabled={busy} onClick={() => setForm({ ...row, _originalContent: row.content })}>View / edit</button><button disabled={busy} onClick={() => { if (window.confirm(`${row.archived ? 'Restore publication of' : 'Archive'} this article?`)) perform(() => api(`articles/${row.id}`, 'PUT', { archived: !row.archived, revision: row.revision }), 'Publication status updated.'); }}>{row.archived ? 'Publish' : 'Archive'}</button>{!row.archived && <Link href={`/news/${row.id}`}>Public ↗</Link>} {row.article_url && <a href={row.article_url} target="_blank" rel="noopener noreferrer">Original ↗</a>}{canDelete && <button disabled={busy} onClick={() => remove(row)}>Delete</button>}</td></> : section === 'categories' ? <><td>{row.name}<br />{row.description}</td><td>{row.slug || 'Not assigned'}</td><td>{row.article_count}</td><td><button onClick={() => setForm({ ...row, _originalContent: row.content })}>Edit</button>{canDelete && <button disabled={busy} onClick={() => remove(row)}>Delete</button>}</td></> : section === 'sources' ? <><td>{row.name}<br /><small>#{row.id} · RSS / Atom</small><br />{row.feed_url || 'Attribution only: no feed configured'}<br /><a href={row.url} target="_blank" rel="noopener noreferrer">Website ↗</a></td><td>{row.last_error ? 'Failed check' : row.last_success ? 'Last check passed' : 'Untested'}<br /><small>{row.last_error}</small></td><td>{date(row.last_attempt)}<br />{date(row.last_success)}</td><td>{row.retrieved}<br /><small>{row.article_count} stored articles</small></td><td><button onClick={() => setForm({ ...row, _originalContent: row.content })}>Edit</button><button disabled={busy} onClick={() => { if (window.confirm('Change scheduled fetching for this source?')) perform(() => api(`sources/${row.id}`, 'PUT', { enabled: !row.enabled }), 'Source updated.'); }}>{row.enabled ? 'Disable' : 'Enable'}</button><button disabled={busy || !row.feed_url} onClick={() => queue(row.id, true)}>Test feed</button><button disabled={busy || !row.enabled} onClick={() => queue(row.id)}>Fetch now</button><Link href={`/admin/logs?source=${row.id}`}>Errors / logs</Link></td></> : <><td>{date(row.timestamp)}</td><td>{row.kind}<br />{row.severity}</td><td>{row.message}<details><summary>Details</summary><pre>{JSON.stringify(row.details, null, 2)}</pre>{row.run && <p>Run #{row.run}</p>}{row.source && <Link href="/admin/sources">Source #{row.source}</Link>}{row.article && <Link href={`/admin/articles?edit=${row.article}`}>Article #{row.article}</Link>}</details></td><td>{row.status}</td></>}</tr>)}
      </tbody></table>{!rows.length && !loading && <p>No matching records.</p>}</div>
      <div className="admin-pagination"><button disabled={page <= 1 || loading} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} · {data?.count ?? 0} records</span><button disabled={!data?.next || loading} onClick={() => setPage(page + 1)}>Next</button></div>
    </>}
    {section === 'articles' && <section className="admin-card"><h2>Full article preparation</h2><p>Summaries, headlines, dates and public URLs stay unchanged. New automated stories require source evidence and checks before publishing. A model review helps catch unsupported claims; it is not a substitute for editorial verification.</p>{preparationError && <p role="alert">{preparationError}</p>}{preparations && <><p>Writing service: {preparations.configured ? 'Configured' : 'Not configured — set OPENAI_API_KEY on the backend and worker'}</p><button disabled={busy} onClick={() => prepare()}>Upgrade existing short articles</button>{preparations.jobs.length ? Array.from(latestPreparations.values()).map(job => <p key={job.id}>Article #{job.article} · Preparation #{job.id} · {job.status}{job.word_count ? ` · ${job.word_count} words · SEO ${job.seo_score}/100` : ''}{job.error && ` · ${job.error}`}</p>) : <p>No preparation jobs recorded.</p>}</>}</section>}
    {section === 'logs' && <section className="admin-card"><h2>Crawler executions</h2><p>Queued jobs may be executing inside the worker transaction. Results become visible on commit; interrupted work rolls back and stays queued for retry.</p>{runs?.results.map(run => <details key={run.id}><summary>Run #{run.id} · {run.trigger} · {run.dry_run ? 'Test only' : 'Publishing'} · {run.status} · {date(run.created_at)}</summary><p>Start {date(run.started_at)} · Finish {date(run.completed_at)} · {run.duration?.toFixed(2) ?? 'Pending'} seconds</p><p>{run.error}</p><pre>{JSON.stringify(run.counts, null, 2)}</pre></details>)}<p><small>Run history uses the same page, source, status and date filters above. Audit and run records are retained for 90 days.</small></p></section>}
    {section === 'settings' && data && <section className="admin-card"><h2>System status</h2><p>Environment: {data.environment} · Database: {data.database}</p><p>Scheduler: {data.scheduler_healthy ? 'Worker recently seen' : 'No recent worker heartbeat; start or inspect the worker'}</p><p>Worker last seen: {date(data.worker_seen)}</p><p>{data.publishing_policy}</p><p>Concurrency: {data.concurrency} · Retention: {data.retention_days} days · Duplicates: canonical URL and source/headline · Missing required fields: rejected.</p><p>Administrator accounts and roles use the existing Django user system. Create and change roles with the backend administrator tools.</p></section>}
    {form && <section className="admin-card"><h2>{section === 'settings' ? 'Saved automation configuration' : `${form.id ? 'Edit' : 'Create'} ${section === 'categories' ? 'category' : section.slice(0, -1)}${form.id ? ` #${form.id}` : ''}`}</h2><form onSubmit={save} className="admin-form">
      {section === 'articles' && <>{form.imported && <p className="wide">Imported headline, byline, summary, source URL and original publication time are protected. Admin metadata is preserved during ingestion.</p>}{input('title', 'text', { required: true, maxLength: 255, disabled: form.imported })}{input('description', 'textarea', { required: true, disabled: form.imported })}{input('content', 'textarea', { required: true })}<p className="wide">Full article: at least 400 words, a factual lead, two descriptive ## headings and short paragraphs. Verify every claim against the source.</p>{form.id && <div className="wide"><label>Verified source text (optional)<textarea maxLength={60000} value={form._evidence || ''} onChange={e => field('_evidence', e.target.value)} /></label><p>Provide source material you may use if the original publisher cannot be retrieved. A short summary is insufficient.</p><label>Supporting source URLs (optional, up to two)<textarea value={form._references || ''} onChange={e => field('_references', e.target.value)} placeholder="One HTTPS URL per line, on the same publisher site" /></label><button type="button" disabled={busy || form.archived} onClick={() => prepare(form.id, form._evidence || '', (form._references || '').split(/\r?\n/).map(value => value.trim()).filter(Boolean))}>Prepare full article</button></div>}{input('author', 'text', { disabled: form.imported })}<label>Source<select aria-label="Source" required value={form.source} disabled={form.imported} onChange={e => field('source', Number(e.target.value))}><option value="">Choose source</option>{sources.map(s => <option key={s.id} value={s.id}>{s.name} (#{s.id})</option>)}</select></label><label>Categories<select aria-label="Categories" multiple value={form.categories.map(String)} onChange={e => field('categories', Array.from(e.target.selectedOptions, o => Number(o.value)))}>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>{input('article_url', 'url', { disabled: form.imported })}{input('location')}{input('focus_keyword', 'text', { maxLength: 100 })}{input('seo_title', 'text', { maxLength: 120 })}{input('seo_description', 'textarea', { maxLength: 320 })}{input('image_alt', 'text', { maxLength: 255 })}{form.id && <p>Source publication: {date(form.published_at)}<br />Imported/created: {date(form.created_at)}</p>}</>}
      {section === 'categories' && <>{input('name', 'text', { required: true, maxLength: 100 })}{input('slug', 'text', { maxLength: 120, pattern: '[a-z0-9]+(?:-[a-z0-9]+)*' })}{input('description', 'textarea')}</>}
      {section === 'sources' && <>{input('name', 'text', { required: true, maxLength: 255 })}{input('url', 'url', { required: true })}{input('feed_url', 'url')}{input('location')}<label>Default category<select aria-label="Default category" value={form.default_category || ''} onChange={e => field('default_category', e.target.value ? Number(e.target.value) : null)}><option value="">Uncategorized</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label><input type="checkbox" checked={form.enabled} onChange={e => field('enabled', e.target.checked)} />Enabled for scheduling</label><p className="wide">Use public HTTPS RSS/Atom feeds that you are permitted to syndicate. Credentials, query strings, private networks and redirects are blocked. Saving validates the URL; use Test feed to verify a real connection.</p></>}
      {section === 'settings' && <><label><input type="checkbox" checked={form.enabled} onChange={e => field('enabled', e.target.checked)} />Scheduled automation enabled</label>{input('interval_minutes', 'number', { min: 60, max: 1440, required: true })}{input('max_per_source', 'number', { min: 1, max: 100, required: true })}{input('timeout_seconds', 'number', { min: 2, max: 15, required: true })}</>}
      <div className="admin-actions wide"><button disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>{section !== 'settings' && <button type="button" onClick={() => setForm(null)}>Close editor</button>}</div></form></section>}
    <DeepLink section={section} setForm={setForm} setFilters={setFilters} setDraftFilters={setDraftFilters} setError={setError} />
  </>;
}
function DeepLink({ section, setForm, setFilters, setDraftFilters, setError }) {
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (section === 'articles' && /^\d+$/.test(q.get('edit') || '')) api(`articles/${q.get('edit')}`).then(row => setForm({ ...row, _originalContent: row.content })).catch(e => setError(e.message));
    if (section === 'logs') {
      const values = Object.fromEntries(['run', 'source'].filter(k => /^\d+$/.test(q.get(k) || '')).map(k => [k, q.get(k)]));
      if (Object.keys(values).length) { setFilters(values); setDraftFilters(values); }
    }
  }, [section, setForm, setFilters, setDraftFilters, setError]);
  return null;
}
