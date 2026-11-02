"use client";

import Link from "next/link";
import { useLanguage } from "../lib/i18n";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-border py-6 mt-12 text-sm text-muted-foreground">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="font-bold text-foreground">AbokiNews</span>
          <Link href="/editorial-policy" className="hover:underline">Editorial approach &amp; corrections</Link>
          <Link href="/history" className="hover:underline">Reading history</Link>
          <Link href="/feed" className="hover:text-foreground hover:underline">
            {t("nav_feed", "My Feed")}
          </Link>
          <Link
            href="/lopsided"
            className="hover:text-foreground hover:underline"
          >
            {t("nav_lopsided", "Lopsided Desk")}
          </Link>
          <Link
            href="/news/saved"
            className="hover:text-foreground hover:underline"
          >
            {t("nav_saved", "Saved Stories")}
          </Link>
          <Link
            href="/topics?manage=1#followed-categories"
            className="hover:text-foreground hover:underline"
          >
            {t("choose_topics", "Choose Topics")}
          </Link>
          <Link
            href="/local-news"
            className="hover:text-foreground hover:underline"
          >
            {t("nav_local", "Local News")}
          </Link>
          <Link
            href="/timelines"
            className="hover:text-foreground hover:underline"
          >
            {t("nav_timelines", "Timelines")}
          </Link>
          <Link
            href="/dashboard"
            className="hover:text-foreground hover:underline"
          >
            {t("reader_dashboard", "Reader Dashboard")}
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          {t(
            "footer_context_tagline",
            "Your country. Clear context. Attributed reporting.",
          )}
        </p>
      </div>
    </footer>
  );
}
