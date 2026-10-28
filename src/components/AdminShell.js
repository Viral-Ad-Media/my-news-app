'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
export default function AdminShell({ user, children }) {
  const path = usePathname(), router = useRouter();
  const [error, setError] = useState('');
  async function logout() {
    try {
      const response = await fetch('/api/session', { method: 'DELETE' });
      if (!response.ok) throw Error('Logout failed. Please retry.');
      router.replace('/admin/login'); router.refresh();
    } catch (e) { setError(e.message); }
  }
  return <div className="admin-app"><aside className="admin-nav"><Link className="admin-brand" href="/admin">AbokiNews<span>Administration</span></Link><nav aria-label="Admin navigation">{['Dashboard', 'Articles', 'Categories', 'Sources', 'Logs', 'Settings'].map(label => {
    const href = label === 'Dashboard' ? '/admin' : `/admin/${label.toLowerCase()}`;
    return <Link key={label} href={href} aria-current={path === href ? 'page' : undefined}>{label}</Link>;
  })}</nav><p>{user.username}</p><button onClick={logout}>Logout</button><Link href="/">View public site ↗</Link>{error && <p role="alert">{error}</p>}</aside><main className="admin-main">{children}</main></div>;
}
