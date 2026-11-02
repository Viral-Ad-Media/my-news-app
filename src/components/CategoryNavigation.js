'use client';
import Link from 'next/link';
import useCategories from '../lib/use-categories';
import { categoryLinks } from '../lib/categories';

export default function CategoryNavigation({ selected = '' }) {
  const { categories, loading, error } = useCategories();
  if (loading) return <p role="status">Loading categories…</p>;
  if (error) return <p role="alert">{error}</p>;
  return <nav aria-label="News categories" className="category-links">{categoryLinks(categories).map(item => <Link key={item.id} href={item.href} aria-current={item.name === selected ? 'page' : undefined}>{item.name}</Link>)}</nav>;
}
