"use client";
import { useEffect, useState } from "react";
export default function StoryCoverage({ apiUrl }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    setError("");
    fetch(apiUrl, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Coverage unavailable");
        return response.json();
      })
      .then(setData)
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message);
      });
    return () => controller.abort();
  }, [apiUrl]);
  return (
    <section className="bg-gray-100 p-6 rounded">
      <h2 className="text-xl font-bold mb-3">Story Sources</h2>
      {error ? (
        <p role="alert">{error}</p>
      ) : !data ? (
        <p>Loading sources…</p>
      ) : (
        <>
          <p className="text-sm mb-3">
            Political-bias classifications are not available for these sources.
          </p>
          {(data.articles || []).map((article) => (
            <article key={article.id} className="bg-white p-4 mb-3">
              <h3 className="font-bold">{article.title}</h3>
              <p>{article.source}</p>
              {/^https?:\/\//.test(article.url || "") && (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Read original article
                </a>
              )}
            </article>
          ))}
          {!data.articles?.length && <p>No source links available.</p>}
        </>
      )}
    </section>
  );
}
