'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

export default function TopicPreferences({ categories, loading = false, onSaved }) {
  const [selected, setSelected] = useState([]), [ready, setReady] = useState(false), [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(''), [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/reader/preferences', { signal: controller.signal, cache: 'no-store' }).then(async res => {
      if (!res.ok) throw Error(res.status === 401 || res.status === 403 ? 'Sign in to follow categories and personalize your feed.' : 'Unable to load followed categories. Please reload to retry.');
      return res.json();
    }).then(data => { setSelected(data.categories || []); setReady(true); }).catch(err => { if (!controller.signal.aborted) setError(err.message); });
    return () => controller.abort();
  }, []);
  async function save(e) {
    e.preventDefault(); if (busy) return; setBusy(true); setError(''); setStatus('');
    try {
      const res = await fetch('/api/reader/preferences', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ categories: selected }) });
      if (!res.ok) throw Error('Unable to save topics. Please sign in and try again.');
      const data = await res.json(); setSelected(data.categories); setStatus('Topics saved. Your feed has been updated.');
      window.dispatchEvent(new Event('news-preferences')); onSaved?.(data.categories);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <section id="followed-categories" className="reader-topic-preferences"><h2>Choose Your Topics</h2><p>Follow the categories you want in My Feed. Select none to see all published categories.</p>
    {error && <p role="alert">{error} {!ready && <Link href="/login">Sign in</Link>}</p>}
    {status && <p role="status">{status}</p>}
    <form onSubmit={save}><div className="reader-topic-options">{categories.map(topic => <label key={topic.id}><Checkbox disabled={!ready || busy} checked={selected.includes(topic.id)} onCheckedChange={checked => setSelected(ids => checked === true ? [...new Set([...ids, topic.id])] : ids.filter(id => id !== topic.id))} />{topic.name}</label>)}</div>
    {loading && <p>Loading categories…</p>}<Button disabled={!ready || loading || busy} type="submit">{busy ? 'Saving…' : 'Save Topics'}</Button></form>
  </section>;
}
