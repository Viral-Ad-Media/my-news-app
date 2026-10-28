"use client";
import { useEffect, useState } from "react";
import { buildApiUrl } from "./api";

// Poll the published-news API without overlapping requests or polling hidden tabs.
export default function useNewsStream({ endpoint = "/news/", query = "", country, privateFeed = false, enabled = true, refreshMs = 0, revision = 0 }) {
  const [state, setState] = useState({});
  const [retry, setRetry] = useState(0);
  const key = `${endpoint}|${query}|${country}|${privateFeed}|${enabled}`;
  useEffect(() => {
    if (!enabled || !country) return;
    const controller = new AbortController();
    let timer;
    let pending = false;
    let unauthorized = false;
    const params = new URLSearchParams(query);
    params.set("location", country);
    const url = privateFeed ? `/api/reader${endpoint}?${params}` : buildApiUrl(`${endpoint}?${params}`);
    if (!url) {
      setState({ key, loading: false, error: "News service is not configured." });
      return () => controller.abort();
    }
    async function load() {
      if (pending || controller.signal.aborted) return;
      pending = true;
      clearTimeout(timer);
      setState(previous => previous.key === key ? { ...previous, error: "", loading: !previous.data } : { key, loading: true });
      try {
        const response = await fetch(url, { signal: controller.signal, cache: "no-store" });
        if (controller.signal.aborted) return;
        if (response.status === 401 || response.status === 403) {
          unauthorized = true;
          setState({ key, loading: false, error: "Please login to view this feed." });
          return;
        }
        if (!response.ok) throw new Error("Unable to load stories. Please try again.");
        const data = await response.json();
        if (!controller.signal.aborted) setState({ key, data, loading: false, error: "", updatedAt: new Date().toISOString() });
      } catch (error) {
        if (error.name !== "AbortError" && !controller.signal.aborted) setState(previous => ({ ...(previous.key === key ? previous : {}), key, loading: false, error: error.message }));
      } finally {
        pending = false;
        if (refreshMs && !unauthorized && !controller.signal.aborted && !document.hidden) timer = setTimeout(load, refreshMs);
      }
    }
    function visibilityChanged() {
      clearTimeout(timer);
      if (!document.hidden && !unauthorized) load();
    }
    load();
    if (refreshMs) document.addEventListener("visibilitychange", visibilityChanged);
    return () => { controller.abort(); clearTimeout(timer); document.removeEventListener("visibilitychange", visibilityChanged); };
  }, [key, endpoint, query, country, privateFeed, enabled, refreshMs, revision, retry]);
  return { ...(state.key === key ? state : { loading: enabled && !!country }), refresh: () => setRetry(value => value + 1) };
}
