import Link from "next/link";
import NewsList from "../../components/NewsList";
import { NEWS_CATEGORIES } from "../../lib/categories";
export default async function CategoryEdition({ searchParams }) {
  const params = await searchParams;
  const category = String(params.category || "").trim().slice(0, 100);
  return <div className="space-y-6">
    <header className="stream-page-heading"><p className="editorial-eyebrow">Explore categories</p><h1>{category || "All categories"}</h1><p>Reporting from your selected country.</p></header>
    <nav aria-label="News categories" className="category-links">{NEWS_CATEGORIES.map(item => <Link key={item.name} href={`/categories?category=${encodeURIComponent(item.name)}`} aria-current={item.name === category ? "page" : undefined}>{item.name}</Link>)}</nav>
    <NewsList title={category ? `${category} news` : "Latest News"} query={category ? `category=${encodeURIComponent(category)}` : ""} />
  </div>;
}
