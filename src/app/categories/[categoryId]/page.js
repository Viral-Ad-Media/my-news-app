"use client";
import { use, useEffect, useState } from "react";
import { buildApiUrl } from "../../../lib/api";
import NewsList from "../../../components/NewsList";
export default function CategoryDetails({ params }) {
  const [category, setCategory] = useState(null);
  const [error, setError] = useState("");
  const { categoryId } = use(params);
  useEffect(() => {
    const controller = new AbortController();
    setCategory(null);
    setError("");
    const url = buildApiUrl(`/categories/${categoryId}/`);
    if (!url) {
      setError("News service is not configured.");
      return;
    }
    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok)
          throw new Error(
            res.status === 404
              ? "Category not found."
              : "Unable to load category.",
          );
        return res.json();
      })
      .then(setCategory)
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message);
      });
    return () => controller.abort();
  }, [categoryId]);
  return error ? (
    <p role="alert">{error}</p>
  ) : !category ? (
    <p>Loading category…</p>
  ) : (
    <NewsList
      title={category.name}
      query={`category_id=${encodeURIComponent(categoryId)}`}
    />
  );
}
