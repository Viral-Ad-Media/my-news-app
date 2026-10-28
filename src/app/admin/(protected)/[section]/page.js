import { notFound } from 'next/navigation';
import AdminPanel from '../../../../components/AdminPanel';
export default async function Page({ params }) {
  const { section } = await params;
  if (!['articles', 'categories', 'sources', 'logs', 'settings'].includes(section)) notFound();
  return <AdminPanel key={section} section={section} />;
}
