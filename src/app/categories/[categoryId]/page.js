"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { buildApiUrl, resolveApiAssetUrl } from "../../../lib/api";

function normalizeImage(imagePath) {
  if (!imagePath) return "/images/Placeholder.webp";
  return resolveApiAssetUrl(imagePath);
}

export default function CategoryDetails({ params }) {
  const { categoryId } = params;
  const [category, setCategory] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!categoryId) return undefined;

    const controller = new AbortController();
    const categoryUrl = buildApiUrl(`/categories/${categoryId}/`);

    if (!categoryUrl) {
      setError("API base URL is not configured.");
      setLoading(false);
      return () => controller.abort();
    }

    const fetchData = async () => {
      try {
        const response = await fetch(categoryUrl, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const categoryData = await response.json();
        setCategory(categoryData);

        const articleIds = Array.isArray(categoryData.articles)
          ? categoryData.articles
          : [];

        if (articleIds.length === 0) {
          setPosts([]);
          setError(null);
          return;
        }

        const articleResponses = await Promise.all(
          articleIds.map(async (id) => {
            const articleResponse = await fetch(buildApiUrl(`/news/${id}/`), {
              signal: controller.signal,
            });
            if (!articleResponse.ok) return null;
            return articleResponse.json();
          })
        );

        setPosts(articleResponses.filter(Boolean));
        setError(null);
      } catch (fetchError) {
        if (fetchError.name === "AbortError") return;
        setError("Failed to fetch category details.");
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [categoryId]);

  if (loading) return <p>Loading...</p>;

  if (error) {
    return (
      <div className="text-center text-red-500">
        <p>Error: {error}</p>
        <p>Please try again later.</p>
      </div>
    );
  }

  if (!category) {
    return <p className="text-center text-gray-500">Category not found.</p>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        {category.image_url && (
          <Image
            src={normalizeImage(category.image_url)}
            alt={category.name}
            width={64}
            height={64}
            className="w-16 h-16 rounded-full object-cover mr-4"
          />
        )}
        <h1 className="text-3xl font-bold">{category.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="bg-white p-4 rounded-lg shadow-md">
              <Image
                src={normalizeImage(post.image_url || post.image)}
                alt={post.title || "Default Image"}
                width={300}
                height={200}
                className="w-full h-40 object-cover rounded-md mb-4"
              />
              <h2 className="text-xl font-bold mb-2">{post.title || "Untitled"}</h2>
              <p className="text-sm text-gray-600 mb-4">
                {post.description || "No description available."}
              </p>
              <Link
                href={`/news/${post.id}`}
                className="text-blue-500 hover:underline text-sm font-semibold"
              >
                Read More &rarr;
              </Link>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            No posts available for this category.
          </p>
        )}
      </div>
    </div>
  );
}
