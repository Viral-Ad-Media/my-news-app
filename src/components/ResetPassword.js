'use client';
import { useState } from 'react';
import Link from 'next/link';
export default function ResetPassword({ uid, token }) {
  const [error, setError] = useState(''), [done, setDone] = useState(false), [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); if (busy) return; setError('');
    const form = new FormData(e.currentTarget);
    if (form.get('password1') !== form.get('password2')) { setError('Passwords do not match.'); return; }
    setBusy(true);
    try {
      const res = await fetch('/api/account/reset-confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid, token, password1: form.get('password1'), password2: form.get('password2') }) });
      const data = await res.json();
      if (!res.ok) throw Error(data.detail || Object.values(data).flat().join(' '));
      setDone(true); window.dispatchEvent(new Event('news-session'));
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <section className="reset-password-panel"><p className="editorial-eyebrow">Account recovery</p><h1>Choose a new password</h1>{done ? <div role="status"><p>Your password has been reset. Sign in with your new password.</p><Link href="/login">Return to Sign In</Link></div> : <><p>Use a unique password of at least eight characters.</p><form onSubmit={submit}><label>New password<input name="password1" type="password" autoComplete="new-password" minLength={8} maxLength={4096} required /></label><label>Confirm new password<input name="password2" type="password" autoComplete="new-password" minLength={8} maxLength={4096} required /></label>{error && <p role="alert">{error}</p>}<button disabled={busy}>{busy ? 'Resetting…' : 'Reset password'}</button></form><Link href="/forgot-password">Request a new reset link</Link></>}</section>;
}
