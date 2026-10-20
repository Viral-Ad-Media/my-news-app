"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "color-scheme";

function getSystemScheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredScheme() {
  if (typeof window === "undefined") return null;
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    return val === "light" || val === "dark" ? val : null;
  } catch {
    return null;
  }
}

export function applyColorSchemeToDocument(storedScheme) {
  if (typeof document === "undefined") return "light";
  const sys = getSystemScheme();
  const resolved = storedScheme || sys;

  const meta = document.querySelector('meta[name="color-scheme"]');
  if (meta) {
    meta.content = storedScheme || "light dark";
  }

  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.classList.toggle("light", storedScheme === "light");
  return resolved;
}

export default function ThemeToggle() {
  const [resolvedScheme, setResolvedScheme] = useState("light");

  useEffect(() => {
    const syncFromEnvironment = () => {
      const stored = getStoredScheme();
      const resolved = applyColorSchemeToDocument(stored);
      setResolvedScheme(resolved);
    };

    syncFromEnvironment();

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    // Do NOT remove stored override when system preference changes to match it
    const handleMediaChange = () => {
      const stored = getStoredScheme();
      const resolved = applyColorSchemeToDocument(stored);
      setResolvedScheme(resolved);
    };

    const handleStorage = (event) => {
      if (!event.key || event.key === STORAGE_KEY) {
        syncFromEnvironment();
      }
    };

    mql.addEventListener("change", handleMediaChange);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("news-theme-change", syncFromEnvironment);

    return () => {
      mql.removeEventListener("change", handleMediaChange);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("news-theme-change", syncFromEnvironment);
    };
  }, []);

  function toggleScheme() {
    const stored = getStoredScheme();
    const sys = getSystemScheme();
    const currentlyRendered = stored || sys;
    const target = currentlyRendered === "dark" ? "light" : "dark";

    try {
      // Check divergence only at storage time: if target matches current system preference,
      // remove the stored override so the site follows system again.
      if (target === sys) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, target);
      }
    } catch {
      // Ignore storage quota / privacy mode errors; still apply to document
    }

    const nextStored = target === sys ? null : target;
    const resolved = applyColorSchemeToDocument(nextStored);
    setResolvedScheme(resolved);
    window.dispatchEvent(new Event("news-theme-change"));
  }

  const isDark = resolvedScheme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggleScheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="gap-1.5 px-2.5"
    >
      {isDark ? (
        <>
          <Sun className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline text-xs">Light</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline text-xs">Dark</span>
        </>
      )}
    </Button>
  );
}
