"use client";
import Link from "next/link";
import { categoryLinks } from "../lib/categories";
export default function SimilarNewsTopics({ topics }) {
  const items = categoryLinks(Array.isArray(topics) ? topics : []);
  return (
    <section className="explore-categories mt-6" aria-labelledby="explore-categories-heading">
      <h2 id="explore-categories-heading" className="text-lg font-semibold mb-3">Explore categories</h2>
      <div className="category-links">
        {items.map(category => <Link key={category.name} href={category.href}>{category.name}</Link>)}
      </div>
    </section>
  );
}
