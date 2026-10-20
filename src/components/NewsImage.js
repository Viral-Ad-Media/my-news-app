"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { resolveApiAssetUrl } from "../lib/api";

const FALLBACK_IMAGE = "/images/Placeholder.webp";

export default function NewsImage({ src, alt, ...props }) {
  const resolved = resolveApiAssetUrl(src) || FALLBACK_IMAGE;
  const [currentSrc, setCurrentSrc] = useState(resolved);

  useEffect(() => {
    setCurrentSrc(resolveApiAssetUrl(src) || FALLBACK_IMAGE);
  }, [src]);

  return (
    <Image
      {...props}
      src={currentSrc}
      unoptimized={/^https?:\/\//i.test(currentSrc)}
      alt={alt ?? "News image"}
      onError={() => {
        if (currentSrc !== FALLBACK_IMAGE) {
          setCurrentSrc(FALLBACK_IMAGE);
        }
      }}
    />
  );
}
