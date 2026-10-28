import { redirect } from "next/navigation";
import { readerRequest } from "../../lib/server-api";
import SuperadminDashboard from "../../components/SuperadminDashboard";

export const metadata = {
  robots: { index: false, follow: false },
  title: "Superadmin Command Center | AbokiNews",
  description:
    "Publish and manage blog posts, categories, news sources, and reader accounts across AbokiNews.",
};

export const dynamic = "force-dynamic";
export default async function SuperadminPage() {
  let response;
  try { ({ response } = await readerRequest("/admin/me/")); }
  catch { return <p role="alert">Administration service unavailable. Retry shortly.</p>; }
  if ([401, 403].includes(response.status)) redirect("/admin/login");
  if (!response.ok) return <p role="alert">Administration service unavailable. Retry shortly.</p>;
  return <SuperadminDashboard />;
}
