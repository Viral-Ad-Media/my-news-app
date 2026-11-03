"use client";

import { useState } from "react";
import Image from "next/image";
import { useReadingPreferences } from "./ReadingPreferences";
import { getArticleFallbackImage, getArticleImageCandidates, isPlaceholderImage, resolveApiAssetUrl } from "../lib/api";

export default function NewsImage({ src, alt, article, className = "", ...props }) {
  const { lowData, ready } = useReadingPreferences();
  const [failed, setFailed] = useState([]);
  const fallback = getArticleFallbackImage(article || { title: alt });
  const candidates = [...new Set([resolveApiAssetUrl(src), ...getArticleImageCandidates(article)]
    .filter((value) => value && !isPlaceholderImage(value)))];
  const current = candidates.find((value) => !failed.includes(value)) || fallback;
  const illustrative = current.startsWith('/api/news-illustration?');
  const subject = illustrative ? new URLSearchParams(current.split('?')[1]).get('topic') : '';

  // Wait for browser preferences before mounting an image, so low-data mode
  // avoids the network request rather than merely hiding a downloaded image.
  if (!ready || lowData) return <span className={`news-photo news-photo-placeholder ${className}`} aria-hidden="true">{lowData ? "Image hidden · low-data mode" : ""}</span>;

  return (
    <span className={`news-photo relative block overflow-hidden ${className}`}>
      <Image
        {...props}
        src={current}
        unoptimized={illustrative || /^https?:\/\//i.test(current)}
        className="block h-full w-full object-cover"
        alt={illustrative ? `${subject} topic illustration for ${article?.title || alt || "this report"}. Not a photograph of the reported event.` : (alt ?? "")}
        onError={() => {
          if (current !== fallback) setFailed((previous) => [...previous, current]);
        }}
      />
      {illustrative && <span className="news-photo-label">Topic illustration</span>}
    </span>
  );
}
