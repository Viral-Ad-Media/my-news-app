"use client";

import { useState } from "react";
import Image from "next/image";
import { getArticleFallbackImage, getArticleImageCandidates, isPlaceholderImage, resolveApiAssetUrl } from "../lib/api";

export default function NewsImage({ src, alt, article, className = "", ...props }) {
  const [failed, setFailed] = useState([]);
  const fallback = getArticleFallbackImage(article || { title: alt });
  const candidates = [...new Set([resolveApiAssetUrl(src), ...getArticleImageCandidates(article)]
    .filter((value) => value && !isPlaceholderImage(value)))];
  const current = candidates.find((value) => !failed.includes(value)) || fallback;
  const illustrative = current.startsWith("/images/editorial/");
  const illustrationSubjects = {
    energy: "Solar panels", health: "A medical professional with a stethoscope",
    sport: "A football on a pitch", education: "School books and classroom materials",
    business: "A laptop displaying analytics", world: "City streets and buildings",
    news: "Newspapers", refinery: "An oil refinery", network: "Data network infrastructure",
    electricity: "Electricity transmission lines", finance: "Financial documents and a calculator",
    space: "Earth seen from space", london: "London cityscape",
    clipper: "NASA’s Europa Clipper spacecraft in a clean room (NASA/JPL-Caltech)",
  };
  const subject = illustrationSubjects[current.split("/").pop()?.replace(".webp", "")] || "Editorial photograph";

  return (
    <span className={`news-photo relative block overflow-hidden ${className}`}>
      <Image
        {...props}
        src={current}
        unoptimized={/^https?:\/\//i.test(current)}
        className="block h-full w-full object-cover"
        alt={illustrative ? `${subject}. Illustrative photograph, not of the reported event.` : (alt ?? "")}
        onError={() => {
          if (current !== fallback) setFailed((previous) => [...previous, current]);
        }}
      />
      {illustrative && <span className="news-photo-label">Illustrative photo</span>}
    </span>
  );
}
