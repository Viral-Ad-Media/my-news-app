"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
      <form onSubmit={save} className="mt-5 space-y-3 max-w-2xl">
        {loading ? (
          <p>Loading topics…</p>
        ) : (
          topics.map((topic) => (
            <Label
              className="flex gap-3 items-center p-4 rounded-lg bg-muted/60 cursor-pointer"
              key={topic.id}
            >
              <Checkbox
                disabled={!ready}
                checked={selected.includes(topic.id)}
                onCheckedChange={(checked) =>
                  setSelected(
                    checked === true
                      ? [...selected, topic.id]
                      : selected.filter((id) => id !== topic.id),
                  )
                }
              />{" "}
              {topic.name}
            </Label>
          ))
        )}
        <div className="flex gap-4 my-3">
          <Button
            type="button"
            variant="outline"
            disabled={page === 1 || loading}
            onClick={() => setPage(page - 1)}
          >
            Previous topics
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!hasNext || loading}
            onClick={() => setPage(page + 1)}
          >
            More topics
          </Button>
        </div>
        <Button disabled={!ready || busy} className="mt-2">
          {busy ? "Saving…" : "Save Topics"}
        </Button>
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
