"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

const CURRENCY_META = [
  { currency: "USD", symbol: "$", name: "US Dollar", fallbackRate: 1615.5 },
  { currency: "GBP", symbol: "£", name: "British Pound", fallbackRate: 2098.25 },
  { currency: "CAD", symbol: "C$", name: "Canadian Dollar", fallbackRate: 1172.4 },
  { currency: "AUD", symbol: "A$", name: "Australian Dollar", fallbackRate: 1084.1 },
  { currency: "AED", symbol: "د.إ", name: "UAE Dirham", fallbackRate: 439.85 },
  { currency: "CNY", symbol: "¥", name: "Chinese Yuan", fallbackRate: 226.3 },
  { currency: "EGP", symbol: "E£", name: "Egyptian Pound", fallbackRate: 33.25 },
];

export default function ExchangeRate() {
  const [exchangeRates, setExchangeRates] = useState(
    CURRENCY_META.map((item) => ({
      ...item,
      rate: item.fallbackRate.toFixed(2),
    })),
  );
  const [updatedAt, setUpdatedAt] = useState("2026-10-19T12:00:00Z");
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchRates = async () => {
      try {
        const response = await fetch("/api/exchange-rates", {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        if (data?.conversion_rates) {
          const transformed = CURRENCY_META.map((item) => {
            const rawRate = data.conversion_rates[item.currency];
            const ngnRate = rawRate ? 1 / rawRate : item.fallbackRate;
            return {
              ...item,
              rate: ngnRate.toFixed(2),
            };
          });
          setExchangeRates(transformed);
          setUpdatedAt(data.updated_at || "2026-10-19T12:00:00Z");
          setIsLive(true);
        }
      } catch (fetchError) {
        if (fetchError.name === "AbortError") return;
        setIsLive(false);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchRates();
    return () => controller.abort();
  }, []);

  return (
    <section
      className="rounded-xl border border-border bg-muted/30 p-4 space-y-3"
      aria-labelledby="exchange-rates-heading"
      aria-busy={loading}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 id="exchange-rates-heading" className="text-base font-bold">
            Naira Exchange Rates
          </h3>
          <p className="text-xs text-muted-foreground">
            NGN (₦) foreign exchange desk
          </p>
        </div>
        <Badge variant="outline" className="text-[10px]">
          {isLive ? "Live FX" : "NAFEX Ref"}
        </Badge>
      </div>

      <table className="w-full text-left text-xs">
        <thead className="border-b border-border text-muted-foreground">
          <tr>
            <th scope="col" className="py-1.5 font-semibold">
              CURRENCY
            </th>
            <th scope="col" className="py-1.5 text-right font-semibold">
              RATE (₦)
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {exchangeRates.map((rate) => (
            <tr key={rate.currency}>
              <td className="py-2 flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-flex h-5 w-7 items-center justify-center rounded bg-background border border-border text-[10px] font-bold text-foreground shrink-0"
                >
                  {rate.symbol}
                </span>
                <div>
                  <span className="font-semibold text-foreground">
                    {rate.currency}
                  </span>
                  <span className="sr-only"> ({rate.name})</span>
                </div>
              </td>
              <td className="py-2 text-right font-mono font-semibold tabular-nums">
                ₦{Number(rate.rate).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-[11px] text-muted-foreground pt-1">
        Benchmark rates in{" "}
        <span className="font-semibold text-foreground">NGN</span>{" "}
        {updatedAt ? "· Oct 19, 2026" : ""}
      </p>
    </section>
  );
}
