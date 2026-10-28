import { NextResponse } from "next/server";
import { normalizeCountry } from "../../../lib/countries";
export function GET(request) {
  const country = normalizeCountry(request.headers.get("x-vercel-ip-country"));
  return NextResponse.json({ country }, { headers: { "Cache-Control": "private, no-store", Vary: "x-vercel-ip-country" } });
}
