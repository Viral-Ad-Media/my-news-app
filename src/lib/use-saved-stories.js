"use client";
import { useEffect, useState } from "react";

export default function useSavedStories(ids) {
  const key = ids.join(",");
  const [savedIds, setSavedIds] = useState([]);
  useEffect(() => {
    const controller = new AbortController();
    if (!key) {
      setSavedIds([]);
      return;
    }
    fetch(`/api/reader/saved-status?ids=${encodeURIComponent(key)}`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : { saved_ids: [] }))
      .then((data) => setSavedIds(data.saved_ids))
      .catch(() => {});
    return () => controller.abort();
  }, [key]);
  return savedIds;
}
