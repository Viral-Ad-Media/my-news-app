"use client";

import useCountry, { selectCountry } from "../lib/use-country";
import { COUNTRIES, countryName } from "../lib/countries";
import { Globe2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import NewsList from "./NewsList";

export default function LocalNews() {
  const location = useCountry();
  const activeDesk = { label: countryName(location), description: `Reporting from ${countryName(location)}. Other countries are excluded from this edition.` };
  const REGIONAL_DESKS = COUNTRIES.filter(country => ["ng", "us", "gb", location].includes(country.code)).map(country => ({ ...country, label: country.name }));
  const selectDesk = selectCountry;

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-border bg-muted/40 p-5 sm:p-6 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge className="uppercase tracking-wider text-[11px]">
              <MapPin className="h-3 w-3 mr-1" aria-hidden="true" />
              Regional Editions
            </Badge>
            <span className="text-xs text-muted-foreground">
              Active desk: {activeDesk.label}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Regional &amp; Local News Desks
          </h1>
          <p className="text-sm text-muted-foreground">
            Stories for your selected country. Change the country in the
            navigation or switch regional desks below.
          </p>
        </div>

        <div
          className="flex flex-wrap gap-2 pt-3 border-t border-border/70"
          role="group"
          aria-label="Select regional news desk"
        >
          {REGIONAL_DESKS.map((desk) => {
            const isSelected = location === desk.code;
            return (
              <Button
                key={desk.code || "all"}
                type="button"
                size="sm"
                variant={isSelected ? "default" : "outline"}
                onClick={() => selectDesk(desk.code)}
                aria-pressed={isSelected}
                className="h-8 text-xs gap-1.5"
              >
                <Globe2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{desk.label}</span>
              </Button>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground">{activeDesk.description}</p>
      </header>

      <NewsList
        title={`Local News — ${activeDesk.label}`}
        query={location ? `location=${encodeURIComponent(location)}` : ""}
      />
    </div>
  );
}
