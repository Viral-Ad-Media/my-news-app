"use client";
import { useEffect, useState } from "react";
import { inferBrowserCountry, normalizeCountry } from "./countries";
let detection;
function storedCountry() {
  try { return normalizeCountry(localStorage.getItem("news-location")); } catch { return ""; }
}
export function selectCountry(value) {
  const country = normalizeCountry(value);
  if (!country) return;
  try { localStorage.setItem("news-location", country); } catch {}
  document.cookie = `news-country=${country}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
  window.dispatchEvent(new CustomEvent("news-location", { detail: country }));
}
export default function useCountry() {
  const [country, setCountry] = useState("");
  useEffect(() => {
    let active = true;
    const sync = event => setCountry(normalizeCountry(event?.detail) || storedCountry());
    window.addEventListener("news-location", sync);
    window.addEventListener("storage", sync);
    const stored = storedCountry();
    if (stored) { setCountry(stored); selectCountry(stored); }
    else {
      detection ||= fetch("/api/edition", { cache: "no-store" }).then(response => response.ok ? response.json() : {}).catch(() => ({}));
      detection.then(data => {
        if (!active) return;
        const detected = storedCountry() || normalizeCountry(data.country) || inferBrowserCountry(Intl.DateTimeFormat().resolvedOptions().timeZone, navigator.language);
        selectCountry(detected);
      });
    }
    return () => { active = false; window.removeEventListener("news-location", sync); window.removeEventListener("storage", sync); };
  }, []);
  return country;
}
