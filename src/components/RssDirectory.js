"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { COUNTRIES, countryName } from '../lib/countries';

export default function RssDirectory() {
  const [country, setCountry] = useState('ng');
  const [data, setData] = useState(null), [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/admin/source-coverage', { cache: 'no-store', signal: controller.signal }).then(async response => {
      if (!response.ok) throw Error('Unable to load RSS configuration. Sign in as an administrator and retry.');
      return response.json();
    }).then(value => { setData(value); setError(''); }).catch(error => { if (error.name !== 'AbortError') setError(error.message); });
    return () => controller.abort();
  }, [revision]);
  const coverage = data?.countries.find(item => item.code === country);
  const query = country === 'world' ? '' : `location=${country}`;
  return <>
    <header><small>PRIVATE WORKSPACE / ABOKINEWS</small><h1>RSS and source coverage</h1><p>Manage incoming feeds in <Link href="/admin/sources">Sources</Link>. Feed tests run through the background worker. XML exports below require an administrator session.</p></header>
    {error && <p role="alert">{error}</p>}
    <button onClick={() => setRevision(value => value + 1)}>Refresh coverage</button>
    {!data && !error && <p role="status">Loading saved configuration…</p>}
    {data && <>
      <section className="admin-card"><h2>Country edition</h2>
        <label htmlFor="rss-edition">Edition</label><select id="rss-edition" aria-label="Edition" value={country} onChange={event => setCountry(event.target.value)}><option value="world">All countries</option>{COUNTRIES.filter(country => country.code !== 'world').map(item => <option key={item.code} value={item.code}>{item.name}</option>)}</select>
        <p>{coverage?.configured_sources || 0} configured feeds · {coverage?.enabled_sources || 0} enabled · {coverage?.healthy_sources || 0} with a successful feed check in the last 24 hours.</p>
        {!coverage?.enabled_sources && <p role="status">No enabled country feed. Enable a tested source in Sources to populate this edition.</p>}
        <p><a href={`/admin/rss.xml${query ? `?${query}` : ''}`} target="_blank" rel="noopener noreferrer">Open edition RSS XML</a></p>
      </section>
      <section className="admin-card"><h2>Categories in {country === 'world' ? 'all editions' : countryName(country)}</h2>
        <p>These are the same saved categories used on the public site. Counts are published stories, not promises of future coverage. Topic feeds are specific to the chosen country.</p>
        <div className="admin-table"><table><thead><tr><th>Category</th><th>Published stories</th><th>RSS export</th></tr></thead><tbody>{data.categories.map(category => {
          const count = coverage?.published_categories[String(category.id)] || 0;
          const path = `/admin/rss.xml?${new URLSearchParams({ category: category.name, ...(country === 'world' ? {} : { location: country }) })}`;
          return <tr key={category.id}><td>{category.name}</td><td>{count}{count === 0 && <small> · Coverage gap</small>}</td><td><a href={path} target="_blank" rel="noopener noreferrer" aria-label={`${category.name} RSS XML`}>Open XML</a></td></tr>;
        })}</tbody></table></div>
      </section>
      <section className="admin-card"><h2>Regional source availability</h2><p>Catalogue checks: {data.catalogue_checked_on}. Reachability and sample article evidence were checked separately. Publisher access can change; a feed check does not guarantee every article can support a full report. Global topic feeds stay global unless an item explicitly identifies a country.</p>
        <div className="admin-table"><table><thead><tr><th>Edition</th><th>Configured</th><th>Enabled</th><th>Recent successful checks</th></tr></thead><tbody>{data.countries.filter(item => item.code !== 'world').map(item => <tr key={item.code}><td>{item.name}</td><td>{item.configured_sources}</td><td>{item.enabled_sources}</td><td>{item.healthy_sources}</td></tr>)}</tbody></table></div>
      </section>
    </>}
  </>;
}
