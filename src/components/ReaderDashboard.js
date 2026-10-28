'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import NewsList from './NewsList';
import Sidebar from './Sidebar';
import TopicPreferences from './TopicPreferences';
import useCategories from '../lib/use-categories';
import useCountry from '../lib/use-country';

export default function ReaderDashboard() {
  const country = useCountry();
  const [session, setSession] = useState(null), [checking, setChecking] = useState(true), [error, setError] = useState('');
  const [view, setView] = useState('overview'), [revision, setRevision] = useState(0), [busy, setBusy] = useState(false);
  const { categories, loading, error: categoriesError } = useCategories();
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/session', { signal: controller.signal, cache: 'no-store' }).then(async res => {
      if (!res.ok) throw Error('Unable to check your session. Please sign in again.');
      return res.json();
    }).then(data => setSession(data.authenticated === false ? null : data)).catch(err => { if (!controller.signal.aborted) setError(err.message); }).finally(() => { if (!controller.signal.aborted) setChecking(false); });
    return () => controller.abort();
  }, []);
  async function logout() {
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/session', { method: 'DELETE' });
      if (!res.ok) throw Error('Unable to sign out. Please retry.');
      window.dispatchEvent(new Event('news-session')); window.location.assign('/');
    } catch (err) { setError(err.message); setBusy(false); }
  }
  if (checking) return <p role="status">Loading reader dashboard…</p>;
  if (!session) return <section className="live-account-gate"><p className="editorial-eyebrow">Your personal edition</p><h1>Sign in to view your personalized dashboard</h1><p>Follow categories, save stories and read your feed.</p>{error && <p role="alert">{error}</p>}<Link href="/login" className="underline">Sign In</Link> · <Link href="/signup">Create Account</Link></section>;
  return <div className="reader-workspace"><header className="stream-page-heading"><p className="editorial-eyebrow">Your personal edition · AbokiNews</p><h1>Welcome back, {session.username}</h1><p>Your followed categories, saved reporting and current headlines in one place.</p><div className="reader-workspace-actions"><Link href="/topics?manage=1#followed-categories">Manage followed categories</Link><Link href="/timelines">Browse the timeline</Link><button onClick={logout} disabled={busy}>{busy ? 'Signing out…' : 'Sign Out'}</button></div></header>
    {error && <p role="alert">{error}</p>}
    <nav className="category-links reader-workspace-tabs" aria-label="Dashboard sections">{[['overview', 'Overview & My Feed'], ['saved', 'Saved Reading List'], ['topics', 'Topic Subscriptions']].map(([key, label]) => <button key={key} onClick={() => setView(key)} aria-pressed={view === key}>{label}</button>)}</nav>
    <div className="reader-workspace-grid"><div className="min-w-0">{view === 'topics' ? <><TopicPreferences categories={categories} loading={loading} onSaved={() => setRevision(n => n + 1)} />{categoriesError && <p role="alert">{categoriesError}</p>}</> : <NewsList key={`${view}-${revision}`} title={view === 'saved' ? 'Saved Reading List' : 'Your News Feed'} endpoint={view === 'saved' ? '/saved/' : '/feed/'} privateFeed saved={view === 'saved'} showCategories />}
    <section className="reader-spectrum"><h2>My Reading Spectrum</h2><p>Source coverage is shown on articles that have multiple recorded perspectives. No reading-bias score is inferred from your bookmarks.</p><Link href="/lopsided">Compare source coverage ↗</Link></section></div><aside aria-label="Reader tools"><Sidebar /></aside></div>
    {!country && <p>Choose a country in the masthead to load its stories.</p>}
  </div>;
}
