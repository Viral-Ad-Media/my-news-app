"use client";

import { useLanguage } from "../lib/i18n";

export default function HomeHero() {
  const { t } = useLanguage();
  return (
    <div className="mb-6 sm:mb-8">
      <h1 className="fluid-hero-title font-semibold tracking-tight text-balance">
        {t("home_title", "Your news, in focus.")}
      </h1>
      <p className="mt-2 text-sm sm:text-base text-muted-foreground">
        {t("home_subtitle", "Nigeria and beyond. Read the story, follow the source.")}
      </p>
    </div>
  );
}
