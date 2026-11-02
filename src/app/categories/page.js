import CategoryNavigation from '../../components/CategoryNavigation';
import NewsList from "../../components/NewsList";
export default async function CategoryEdition({ searchParams }) {
  const params = await searchParams;
  const category = String(params.category || "").trim().slice(0, 100);
  return <div className="space-y-6">
    <header className="stream-page-heading"><p className="editorial-eyebrow">Explore categories</p><h1>{category || "All categories"}</h1><p>Reporting from your selected country.</p></header>
    <CategoryNavigation selected={category} />
    <NewsList title={category ? `${category} news` : "Latest News"} query={category ? `category=${encodeURIComponent(category)}` : ""} />
  </div>;
}
