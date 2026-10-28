import { redirect } from 'next/navigation';
import { readerRequest } from '../../../lib/server-api';
import AdminShell from '../../../components/AdminShell';
export const dynamic = 'force-dynamic';
export default async function Layout({ children }) {
  let response;
  try { ({ response } = await readerRequest('/admin/me/')); }
  catch { return <p role="alert">Administration service unavailable. Retry shortly.</p>; }
  if ([401, 403].includes(response.status)) redirect('/admin/login');
  if (!response.ok) return <p role="alert">Administration service unavailable. Retry shortly.</p>;
  const user = await response.json();
  return <AdminShell user={user}>{children}</AdminShell>;
}
