"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { buildApiUrl, listItems, resolveApiAssetUrl } from "../lib/api";
import useSavedStories from "../lib/use-saved-stories";
import NewsImage from "./NewsImage";
import SaveStoryButton from "./SaveStoryButton";

export default function NewsList({
  title = "News",
  endpoint = "/news/",
  query = "",
  privateFeed = false,
  saved = false,
}) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    setPage(1);
  }, [query, endpoint]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const params = new URLSearchParams(query);
    params.set("page", page);
    const url = privateFeed
      ? `/api/reader${endpoint}?${params}`
      : buildApiUrl(`${endpoint}?${params}`);
    if (!url) {
      setError("News service is not configured.");
      setLoading(false);
      return;
    }
    fetch(url, { signal: controller.signal })
      .then(async (response) => {
        if (response.status === 401)
          throw new Error("Please login to view your feed.");
        if (!response.ok) throw new Error("Unable to load stories.");
        return response.json();
      })
      .then(setData)
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [endpoint, query, page, privateFeed, reload]);
  const articles = listItems(data);
  const savedIds = useSavedStories(articles.map((article) => article.id));
  return (
    <section className="my-6">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {loading ? (
        <p>Loading stories…</p>
      ) : error ? (
        <p role="alert">
          {error}{" "}
          {privateFeed && (
            <Link className="underline" href="/login">
              Login
            </Link>
          )}
        </p>
      ) : (
        <>
          {!articles.length && <p>No stories available for these filters.</p>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {articles.map((article) => (
              <article key={article.id} className="border rounded p-4">
                <Link href={`/news/${article.id}`}>
                  <NewsImage
                    src={
                      resolveApiAssetUrl(article.image_url || article.image) ||
                      "/images/Placeholder.webp"
                    }
                    alt={article.title}
                    width={640}
                    height={360}
                    className="w-full h-40 object-cover rounded"
                  />
                  <h3 className="font-bold text-lg mt-3">{article.title}</h3>
                </Link>
                <p className="text-sm my-2">{article.description}</p>
                <p className="text-xs text-gray-600 mb-2">
                  {article.source?.name} ·{" "}
                  {new Date(article.published_at).toLocaleDateString()}
                </p>
                <SaveStoryButton
                  articleId={article.id}
                  initiallySaved={saved || savedIds.includes(article.id)}
                  onChange={() => {
                    if (saved) setReload((value) => value + 1);
                  }}
                />
              </article>
            ))}
          </div>
          <div className="flex gap-4 items-center mt-4">
            <button
              disabled={page === 1}
              className="underline disabled:opacity-40"
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <span>Page {page}</span>
            <button
              disabled={!data?.next}
              className="underline disabled:opacity-40"
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  );
}
