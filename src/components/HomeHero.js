"use client";

import useCountry from "../lib/use-country";
import { countryName } from "../lib/countries";
import { useLanguage } from "../lib/i18n";

export default function HomeHero() {
  const { t, lang } = useLanguage();
  const country = useCountry();
  return (
    <div className="edition-heading">
      <p className="editorial-eyebrow"><span className="edition-dot" aria-hidden="true" />The daily edition</p>
      <h1 className="edition-title">
        {t("home_title", "Your news, in focus.")}
      </h1>
      <p className="edition-description">
        {country ? `${countryName(country, lang)}. ${t("home_source", "Read the story, follow the source.")}` : "Choose your country above to open your news edition."}
      </p>
    </div>
  );
}
