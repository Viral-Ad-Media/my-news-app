"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { buildApiUrl, listItems } from "../../../lib/api";
import NewsList from "../../../components/NewsList";

export default function TopicPreferences() {
  const [topics, setTopics] = useState([]);
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [ready, setReady] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/reader/preferences", { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok)
          throw new Error(
            res.status === 401
              ? "Please login to save your topics."
              : "Unable to load preferences.",
          );
        return res.json();
      })
      .then((data) => {
        setSelected(data.categories);
        setReady(true);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setMessage(err.message);
      });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const url = buildApiUrl(`/categories/?page=${page}`);
    if (!url) {
      setMessage("News service is not configured.");
      setLoading(false);
      return;
    }
    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Unable to load topics.");
        return res.json();
      })
      .then((data) => {
        setTopics(listItems(data));
        setHasNext(Boolean(data.next));
      })
      .catch((err) => {
        if (err.name !== "AbortError") setMessage(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [page]);
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/reader/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: selected }),
      });
      if (!res.ok)
        throw new Error("Unable to save topics. Please login and try again.");
      setMessage("Topics saved. Your feed has been updated.");
      setRevision(revision + 1);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <h1 className="text-2xl font-bold">Choose Your Topics</h1>
      <p>
        Choose topics to filter your feed. With no topics selected, your feed
        shows the latest stories.
      </p>
      {message && (
        <p role="status" className="my-3">
          {message}{" "}
          {!ready && (
            <Link className="underline" href="/login">
              Login
            </Link>
          )}
        </p>
      )}
      <form onSubmit={save}>
        {loading ? (
          <p>Loading topics…</p>
        ) : (
          topics.map((topic) => (
            <label className="block my-2" key={topic.id}>
              <input
                type="checkbox"
                disabled={!ready}
                checked={selected.includes(topic.id)}
                onChange={(event) =>
                  setSelected(
                    event.target.checked
                      ? [...selected, topic.id]
                      : selected.filter((id) => id !== topic.id),
                  )
                }
              />{" "}
              {topic.name}
            </label>
          ))
        )}
        <div className="flex gap-4 my-3">
          <button
            type="button"
            disabled={page === 1 || loading}
            onClick={() => setPage(page - 1)}
          >
            Previous topics
          </button>
          <button
            type="button"
            disabled={!hasNext || loading}
            onClick={() => setPage(page + 1)}
          >
            More topics
          </button>
        </div>
        <button
          disabled={!ready || busy}
          className="bg-black text-white px-4 py-2 disabled:opacity-40"
        >
          {busy ? "Saving…" : "Save Topics"}
        </button>
      </form>
      {ready && (
        <NewsList
          key={revision}
          title="Your News Feed"
          endpoint="/feed/"
          privateFeed
        />
      )}
    </section>
  );
}
