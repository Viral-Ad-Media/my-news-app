import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.EXCHANGE_API_KEY;
  if (!key)
    return NextResponse.json(
      { detail: "Exchange rates are not configured" },
      { status: 503 },
    );
  try {
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${encodeURIComponent(key)}/latest/NGN`,
      {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!response.ok) throw new Error("Exchange provider failed");
    const data = await response.json();
    if (data.result !== "success" || !data.conversion_rates)
      throw new Error("Invalid exchange response");
    const rates = {};
    for (const currency of ["USD", "CAD", "AUD", "GBP", "AED", "CNY", "EGP"]) {
      const value = data.conversion_rates[currency];
      if (typeof value !== "number" || !Number.isFinite(value) || value <= 0)
        throw new Error("Invalid rate");
      rates[currency] = value;
    }
    return NextResponse.json({
      conversion_rates: rates,
      updated_at: data.time_last_update_utc,
    });
  } catch {
    return NextResponse.json(
      { detail: "Exchange rates are temporarily unavailable" },
      { status: 502 },
    );
  }
}
