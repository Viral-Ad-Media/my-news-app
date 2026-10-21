import SuperadminDashboard from "../../components/SuperadminDashboard";

export const metadata = {
  robots: { index: false, follow: true },
  title: "Superadmin Command Center | AbokiNews",
  description:
    "Publish and manage blog posts, categories, news sources, and reader accounts across AbokiNews.",
};

export default function SuperadminPage() {
  return <SuperadminDashboard />;
}
