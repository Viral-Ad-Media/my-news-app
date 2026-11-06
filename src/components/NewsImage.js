"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useReadingPreferences } from "./ReadingPreferences";
import { getArticleImageCandidates, isPlaceholderImage, resolveApiAssetUrl } from "../lib/api";

const pending = new Map();
function loadPhoto(id, fallback) {
  const key = `${id}:${fallback}`;
  if (!pending.has(key)) {
    pending.set(key, fetch(`/api/reader/article-photos/${id}${fallback ? '?fallback=1' : ''}`)
      .then(async (response) => response.ok && response.status !== 202 ? response.json() : null)
      .catch(() => null).finally(() => pending.delete(key)));
  }
  return pending.get(key);
}

export default function NewsImage({ src, alt, article, className = "", linkCredit = false, ...props }) {
  const { lowData, ready } = useReadingPreferences();
  const identity = String(article?.id ?? src ?? alt);
  const [failed, setFailed] = useState([]);
  const [resolved, setResolved] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const candidates = [...new Set([resolveApiAssetUrl(src), ...getArticleImageCandidates(article)]
    .filter((value) => value && !isPlaceholderImage(value)))];
  const source = candidates.find((value) => !failed.includes(value));
  const photo = resolved?.identity === identity ? resolved.photo : null;
  const current = source || (photo?.image_url && !failed.includes(photo.image_url) ? photo.image_url : '');
  const illustrative = !source ? photo?.image_origin === 'topic' : article?.image_origin === 'topic';
  const credit = !source ? photo?.image_credit : article?.image_credit;
  const reference = !source ? photo?.image_reference_url : article?.image_reference_url;

  useEffect(() => { setFailed([]); setResolved(null); setAttempt(0); }, [identity]);
  useEffect(() => {
    if (!ready || lowData || current || !article?.id || attempt >= 12) return;
    let active = true;
    let timer;
    async function resolve() {
      if (document.hidden) return;
      const result = await loadPhoto(article.id, candidates.length > 0);
      if (!active) return;
      if (result?.image_url && !failed.includes(result.image_url) && !isPlaceholderImage(result.image_url)) setResolved({ identity, photo: result });
      else timer = setTimeout(() => setAttempt((value) => value + 1), Math.min(60000, 2000 * 2 ** attempt));
    }
    function visible() {
      clearTimeout(timer);
      if (!document.hidden) resolve();
    }
    resolve();
    document.addEventListener("visibilitychange", visible);
    return () => { active = false; clearTimeout(timer); document.removeEventListener("visibilitychange", visible); };
  // Candidates are represented by their joined URL values to avoid repeated fetches.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity, article?.id, ready, lowData, current, attempt, candidates.join('|'), failed.join('|')]);

  if (!ready || lowData) return <span className={`news-photo news-photo-placeholder ${className}`} aria-hidden="true">{lowData ? "Image hidden · low-data mode" : ""}</span>;
  return (
    <span className={`news-photo relative block overflow-hidden ${className}`} aria-busy={!current}>
      {current && <Image {...props} src={current} unoptimized={/^https?:\/\//i.test(current)}
        className="block h-full w-full object-cover"
        alt={illustrative ? `${photo?.image_alt || article?.image_alt || alt || 'Topic photograph'}. Illustrative photograph; not the reported event.` : (alt ?? "")}
        onError={() => { setFailed((previous) => [...previous, current]); setResolved(null); }} />}
      {illustrative && <span className="news-photo-label">Illustrative photo</span>}
      {credit && (illustrative || linkCredit) && <span className="absolute bottom-0 left-0 right-0 block text-[10px] px-2 py-1 bg-background/90 text-foreground" title={reference || undefined}>{credit}{linkCredit && reference && <> · <a href={reference} target="_blank" rel="noopener noreferrer">Photo &amp; licence</a></>}</span>}
    </span>
  );
}
