'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function Login() {
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const router = useRouter();
  async function submit(e) {
    e.preventDefault(); setError(''); setBusy(true);
    const data = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: data.get('username'), password: data.get('password') }) });
      const result = await res.json();
      if (!res.ok) throw Error('Sign-in failed. Check your credentials and retry.');
      if (!result.is_staff && !result.is_superuser) {
        await fetch('/api/session', { method: 'DELETE' });
        throw Error('This account is not authorized for administration.');
      }
      router.replace('/admin'); router.refresh();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <main className="admin-login"><form onSubmit={submit}><p>AbokiNews · Private administration</p><h1>Administrator sign in</h1><label>Username or email<input name="username" autoComplete="username" required maxLength={150} /></label><label>Password<input type="password" name="password" autoComplete="current-password" required maxLength={4096} /></label>{error && <p role="alert">{error}</p>}<button disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button><Link href="/">Return to news</Link></form></main>;
}
