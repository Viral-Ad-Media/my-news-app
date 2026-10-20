"use client";

import { useEffect, useState } from "react";
import { Globe2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import NewsList from "./NewsList";

const REGIONAL_DESKS = [
  {
    code: "ng",
    label: "Nigeria",
    badge: "NG",
    description:
      "Abuja, Lagos, and nationwide Nigerian economy, energy, governance, and sports coverage.",
  },
  {
    code: "us",
    label: "United States",
    badge: "US",
    description:
      "Washington policy, Federal Reserve, US markets, technology, and national roundups.",
  },
  {
    code: "gb",
    label: "United Kingdom & Europe",
    badge: "GB",
    description:
      "UK, European, and international wire dispatches across economy, climate, and diplomacy.",
  },
  {
    code: "",
    label: "All Global Desks",
    badge: "ALL",
    description:
      "Combined domestic and international newsroom wire across all regions.",
  },
];

export default function LocalNews() {
  const [location, setLocation] = useState("ng");

  useEffect(() => {
    const update = () =>
      setLocation(localStorage.getItem("news-location") ?? "ng");
    update();
    window.addEventListener("news-location", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("news-location", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  function selectDesk(code) {
    setLocation(code);
    if (code) {
      localStorage.setItem("news-location", code);
      window.dispatchEvent(new Event("news-location"));
    }
  }

  const activeDesk =
    REGIONAL_DESKS.find((d) => d.code === location) || REGIONAL_DESKS[0];

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
