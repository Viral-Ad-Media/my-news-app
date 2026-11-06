"use client";
import { useEffect, useState } from "react";
import { sharedJSON } from "./shared-json";
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
        const data = await sharedJSON(url, { privateFeed, force: retry > 0 });
        if (!controller.signal.aborted) setState({ key, data, loading: false, error: "", updatedAt: new Date().toISOString() });
      } catch (error) {
        if ([401,403].includes(error.status)) unauthorized = true;
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
    function sessionChanged() { if (privateFeed) setRetry(value => value + 1); }
    if (privateFeed) window.addEventListener('news-session', sessionChanged);
    load();
    if (refreshMs) document.addEventListener("visibilitychange", visibilityChanged);
    return () => { controller.abort(); clearTimeout(timer); document.removeEventListener("visibilitychange", visibilityChanged); window.removeEventListener("news-session", sessionChanged); };
  }, [key, endpoint, query, country, privateFeed, enabled, refreshMs, revision, retry]);
  return { ...(state.key === key ? state : { loading: enabled && !!country }), refresh: () => setRetry(value => value + 1) };
}
