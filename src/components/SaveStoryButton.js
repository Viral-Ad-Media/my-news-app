"use client";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SaveStoryButton({
  articleId,
  initiallySaved = false,
  onChange,
}) {
  const [saved, setSaved] = useState(initiallySaved);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  useEffect(() => {
    setSaved(initiallySaved);
  }, [articleId, initiallySaved]);
  async function toggle(event) {
    event.preventDefault();
    event.stopPropagation();
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/reader/saved/${articleId}`, {
        method: saved ? "DELETE" : "PUT",
        ...(saved
          ? {}
          : { headers: { "Content-Type": "application/json" }, body: "{}" }),
      });
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      if (!response.ok) throw new Error("Unable to save story");
      setSaved(!saved);
      onChange?.(!saved);
    } catch {
      setError("Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <span className="inline-flex flex-col">
      <Button
        type="button"
        aria-pressed={saved}
        disabled={busy}
        onClick={toggle}
        variant={saved ? "secondary" : "outline"}
        size="sm"
        className="min-w-24"
        aria-busy={busy}
      >
        {saved ? (
          <BookmarkCheck aria-hidden="true" />
        ) : (
          <Bookmark aria-hidden="true" />
        )}
        {busy ? "Saving…" : saved ? "Unsave" : "Save"}
      </Button>
      {error && (
        <span role="alert" className="text-red-600 text-xs">
          {error}
        </span>
      )}
    </span>
  );
}
