'use client';

import Link from 'next/link';
import { Activity, ArrowUpRight, Clock3, Layers3, Plus, Radio, Rss, ShieldCheck, SlidersHorizontal, Trash2 } from 'lucide-react';

const date = value => value ? new Date(value).toLocaleString() : 'Not recorded';
const numeric = value => value === '' ? '' : Number(value);
function readableError(error) {
  try {
    const strings = value => typeof value === 'string' ? [value] : Object.values(value || {}).flatMap(strings);
    return strings(JSON.parse(error)).join(' ') || error;
  } catch { return error; }
}

export default function AutomationSettingsPanel({ form, data, sources, categories, busy, loading, error, message, onChange, onSave, onRetry }) {
  const rules = form?.publishing_rules || [];
  const intervalLabel = `${form?.interval_minutes || '—'} ${Number(form?.interval_minutes) === 1 ? 'minute' : 'minutes'}`;
  const update = (key, value) => onChange({ ...form, [key]: value });
  const changeRule = (index, key, value) => update('publishing_rules', rules.map((rule, row) => row === index ? { ...rule, [key]: value } : rule));
  const configuredSources = new Set(rules.map(rule => Number(rule.source)));
  const allSources = configuredSources.has(0);
  const enabledSources = sources.filter(source => source.enabled && source.feed_url);
  const publishingSources = rules.length && !allSources ? enabledSources.filter(source => configuredSources.has(source.id)) : enabledSources;
  const target = publishingSources.reduce((total, source) => total + ((allSources || configuredSources.has(source.id)) ? rules.filter(rule => Number(rule.source) === 0 || Number(rule.source) === source.id).reduce((sum, rule) => sum + Number(rule.limit || 0) * (rule.category == null ? categories.length : 1), 0) : Number(form?.publish_per_source || 0)), 0);
  const dirty = form && data && ['enabled', 'interval_minutes', 'max_per_source', 'publish_per_source', 'publishing_rules', 'timeout_seconds'].some(key => JSON.stringify(form[key]) !== JSON.stringify(data[key]));

  return <div className="automation-settings">
    <header className="automation-hero">
      <div><span className="automation-eyebrow"><SlidersHorizontal size={14} /> YOUR EDITORIAL CONTROL ROOM</span><h1>Settings<span>Set the pace.<br />Choose the stories.</span></h1><p>Decide what each source publishes, how much goes live, and when the next cycle begins.</p></div>
      <div className="automation-hero-mark" aria-hidden="true"><Radio size={54} /><span>ABOKINEWS<br />PUBLISHING DESK</span></div>
    </header>
    {error && <div className="admin-message" role="alert">{readableError(error)}</div>}
    {message && <div className="automation-success" role="status"><ShieldCheck size={18} />{message}</div>}
    {loading && <p role="status">Loading saved settings…</p>}
    {!form && !loading && <button onClick={onRetry}>Retry settings</button>}
    {form && <form onSubmit={onSave}>
      <fieldset disabled={busy || loading} className="automation-fieldset">
        <section className="automation-card automation-schedule">
          <div className="automation-section-heading"><div className="automation-icon"><Clock3 size={21} /></div><div><span className="automation-step">01 / SCHEDULE</span><h2>Publishing rhythm</h2></div><span className={`automation-badge ${form.enabled ? 'is-active' : ''}`}>{form.enabled ? 'Automation on' : 'Paused'}</span></div>
          <div className="automation-toggle-row"><div><h3 id="automation-toggle-title">Scheduled automation enabled</h3><p id="automation-toggle-help">Turn on scheduled publishing. Turning it off pauses future scheduled batches.</p></div><button type="button" role="switch" aria-label="Scheduled automation enabled" aria-describedby="automation-toggle-help" aria-checked={Boolean(form.enabled)} className="automation-switch" onClick={() => update('enabled', !form.enabled)}><span /></button></div>
          <div className="automation-field-grid">
            <div className="automation-field"><label htmlFor="automation-interval">Interval minutes</label><div className="automation-number"><input id="automation-interval" type="number" min="1" max="1000" required value={form.interval_minutes} onChange={event => update('interval_minutes', numeric(event.target.value))} /><span>minutes</span></div><p>Choose any interval from 1 to 1000 minutes.</p></div>
            <div className="automation-schedule-preview"><span>NEXT SAVED CYCLE</span><strong>{data.enabled ? date(data.next_run) : 'Schedule paused'}</strong><p>{dirty ? 'Save your changes to update the schedule.' : `Publishing limits renew every ${intervalLabel}.`}</p></div>
          </div>
        </section>

        <section className="automation-card">
          <div className="automation-section-heading"><div className="automation-icon"><Layers3 size={21} /></div><div><span className="automation-step">02 / PUBLISHING LIMITS</span><h2>A little or a lot. You decide.</h2></div></div>
          <div className="automation-default-limit"><div><label htmlFor="automation-default-limit">Default publish limit per source</label><p>{rules.length ? 'Custom rules are active. Only the listed sources and categories publish; this default applies when no rules are set.' : 'With no custom rules, every enabled source uses this limit for new stories per interval.'}</p></div><div className="automation-number"><input id="automation-default-limit" type="number" min="1" max="100" required value={form.publish_per_source} onChange={event => update('publish_per_source', numeric(event.target.value))} /><span>stories</span></div></div>
          <div className="automation-presets" aria-label="Default publishing limit presets">{[1, 5, 10, 25, 50, 100].map(value => <button type="button" key={value} aria-pressed={Number(form.publish_per_source) === value} onClick={() => update('publish_per_source', value)}>{value}</button>)}</div>
          <div className="automation-rule-heading"><div><h3>Source & category rules</h3><p>Choose all enabled sources or specific sources and categories. Sources not listed stay out of the schedule while rules are active.</p></div><button type="button" className="automation-add-rule" onClick={() => update('publishing_rules', [...rules, { source: 0, category: null, limit: 1 }])}><Plus size={16} />Add rule</button></div>
          {!rules.length && <div className="automation-empty"><Rss size={26} /><h3>Your sources, your mix.</h3><p>Add a rule to publish, for example, one Sports story from Nairametrics every 60 minutes. Otherwise, enabled sources use your default limit.</p></div>}
          <div className="automation-rules">{rules.map((rule, index) => {
            const source = sources.find(source => source.id === Number(rule.source));
            return <div className="automation-rule" key={index}>
              <div className="automation-rule-number">{String(index + 1).padStart(2, '0')}</div>
              <div><label htmlFor={`rule-source-${index}`}>Source {index + 1}</label><select id={`rule-source-${index}`} required value={rule.source ?? 0} onChange={event => changeRule(index, 'source', numeric(event.target.value))}><option value="0">All sources</option>{sources.map(source => <option key={source.id} value={source.id}>{source.name}</option>)}{Boolean(rule.source) && !source && <option value={rule.source ?? 0}>Missing source #{rule.source} — remove this rule</option>}</select>{source && <small className={source.enabled && source.feed_url ? 'automation-source-ready' : 'automation-source-paused'}>{source.enabled && source.feed_url ? 'Enabled for publishing' : 'Paused — enable this feed in Sources'}</small>}</div>
              <div><label htmlFor={`rule-category-${index}`}>Category {index + 1}</label><select id={`rule-category-${index}`} value={rule.category ?? '*'} onChange={event => changeRule(index, 'category', event.target.value === '*' ? null : Number(event.target.value))}><option value="*">All categories</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}{rule.category && !categories.some(category => category.id === rule.category) && <option value={rule.category}>Missing category — remove this rule</option>}</select></div>
              <div><label htmlFor={`rule-limit-${index}`}>Publish limit {index + 1}</label><input id={`rule-limit-${index}`} type="number" min="1" max="100" required value={rule.limit} onChange={event => changeRule(index, 'limit', numeric(event.target.value))} /><small>{rule.category == null ? 'per category, per interval' : 'per interval'}</small></div>
              <button type="button" className="automation-remove-rule" aria-label={`Remove rule ${index + 1}`} onClick={() => update('publishing_rules', rules.filter((_, row) => row !== index))}><Trash2 size={17} /></button>
            </div>;
          })}</div>
          <p className="automation-rule-note">“All categories” applies the limit separately to every matching category for each enabled source, every interval. For example, limit 1 allows one Sports, one World and one Entertainment article per source. Individual category rules keep their own limits, up to 100 combined per source. <Link href="/admin/sources">Manage sources <ArrowUpRight size={13} /></Link></p>
        </section>

        <div className="automation-bottom-grid">
          <section className="automation-card"><div className="automation-section-heading"><div className="automation-icon"><Activity size={21} /></div><div><span className="automation-step">03 / DELIVERY</span><h2>The publishing plan</h2></div></div><div className="automation-plan-stats"><div><strong>{publishingSources.length}</strong><span>publishing sources</span></div><div><strong>{target}</strong><span>maximum stories / interval</span></div></div><p>The maximum assumes every selected category has matching new stories. Matching stories publish in small batches until the limits or interval end. Fewer may publish when feeds lack matching stories or sufficient source evidence. Duplicate articles do not use your quota.</p></section>
          <section className="automation-card"><div className="automation-section-heading"><div className="automation-icon"><ShieldCheck size={21} /></div><div><span className="automation-step">SYSTEM STATUS</span><h2>Ready when you are</h2></div></div><div className="automation-health"><span className={`automation-health-dot ${data.scheduler_healthy ? 'is-healthy' : ''}`} /><strong>{data.scheduler_healthy ? 'Worker connected' : 'Worker not recently seen'}</strong></div><p>Last heartbeat: {date(data.worker_seen)}</p><div className="automation-system-meta"><span>{data.environment}</span><span>Database: {data.database}</span></div><Link href="/admin/logs">View publishing activity <ArrowUpRight size={14} /></Link></section>
        </div>
        <details className="automation-advanced"><summary>Advanced feed controls</summary><div className="automation-field-grid"><div className="automation-field"><label htmlFor="automation-scan-limit">Feed scan limit</label><input id="automation-scan-limit" type="number" min="1" max="100" required value={form.max_per_source} onChange={event => update('max_per_source', numeric(event.target.value))} /><p>Entries to inspect per feed. This automatically increases to accommodate your publishing limits.</p></div><div className="automation-field"><label htmlFor="automation-timeout">Feed timeout seconds</label><input id="automation-timeout" type="number" min="2" max="15" required value={form.timeout_seconds} onChange={event => update('timeout_seconds', numeric(event.target.value))} /><p>Time allowed for a feed response, from 2 to 15 seconds.</p></div></div></details>
      </fieldset>
      <footer className="automation-save-bar"><div><strong>{dirty ? 'Your changes are ready to save' : 'Settings are up to date'}</strong><span>{form.enabled ? `Schedule: every ${intervalLabel}` : 'Scheduled automation is paused'}</span></div><button type="submit" disabled={busy || loading}>{busy ? 'Saving…' : 'Save changes'}</button></footer>
    </form>}
  </div>;
}
