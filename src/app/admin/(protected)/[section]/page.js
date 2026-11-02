import { notFound } from 'next/navigation';
import AdminPanel from '../../../../components/AdminPanel';
import EditorialAdmin from '../../../../components/EditorialAdmin';
import CoverageMonitor from '../../../../components/CoverageMonitor';
export default async function Page({ params }) {
  const { section } = await params;
  if (section === 'editorial') return <EditorialAdmin />;
  if (section === 'coverage') return <CoverageMonitor />;
  if (!['articles', 'categories', 'sources', 'logs', 'settings'].includes(section)) notFound();
  return <AdminPanel key={section} section={section} />;
}
