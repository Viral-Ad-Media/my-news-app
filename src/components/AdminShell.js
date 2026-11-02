'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Activity, Layers3, LayoutDashboard, Newspaper, Radio, Rss, SlidersHorizontal } from 'lucide-react';
const icons = { Dashboard: LayoutDashboard, Editorial: Newspaper, Coverage: Activity, Articles: Newspaper, Categories: Layers3, Sources: Radio, RSS: Rss, Logs: Activity, Settings: SlidersHorizontal };
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
  return <div className="admin-app"><aside className="admin-nav"><Link className="admin-brand" href="/admin">AbokiNews<span>Administration</span></Link><nav aria-label="Admin navigation">{['Dashboard', 'Editorial', 'Coverage', 'Articles', 'Categories', 'Sources', 'RSS', 'Logs', 'Settings'].map(label => {
    const href = label === 'Dashboard' ? '/admin' : `/admin/${label.toLowerCase()}`;
    const Icon = icons[label];
    return <Link key={label} href={href} aria-current={path === href ? 'page' : undefined}><Icon size={17} aria-hidden="true" /><span>{label}</span></Link>;
  })}</nav><p>{user.username}</p><button onClick={logout}>Logout</button><Link href="/">View public site ↗</Link>{error && <p role="alert">{error}</p>}</aside><main className="admin-main">{children}</main></div>;
}
