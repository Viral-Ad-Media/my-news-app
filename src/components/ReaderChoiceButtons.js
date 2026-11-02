"use client";
import { useState } from "react";
import Link from "next/link";
import { useReaderChoices } from "../lib/reader-choices";

export default function ReaderChoiceButtons({ sourceId, storyId }) {
  const { choices, ready, busy, change } = useReaderChoices();
  const [error, setError] = useState("");
  if (!ready) return <span className="text-xs text-muted-foreground">Loading follow options…</span>;
  if (!choices) return <Link className="text-sm underline" href="/login">Sign in to follow {storyId ? "this story" : "this publisher"}</Link>;
  const kind = storyId ? "stories" : "sources", id = storyId || sourceId;
  const followed = choices[kind]?.includes(id), muted = choices.muted_sources?.includes(sourceId);
  async function toggle(key, enabled) { setError(""); try { await change(key, id, enabled); } catch (e) { setError(e.message); } }
  return <div className="choice-buttons">
    <button type="button" disabled={busy} aria-pressed={!!followed} onClick={() => toggle(kind, !followed)}>{followed ? (storyId ? "Following story" : "Following publisher") : (storyId ? "Follow this story" : "Follow publisher")}</button>
    {sourceId && <button type="button" disabled={busy} aria-pressed={!!muted} onClick={() => toggle("muted_sources", !muted)}>{muted ? "Unmute publisher" : "Show less: mute publisher"}</button>}
    {error && <p role="alert">{error}</p>}
  </div>;
}
