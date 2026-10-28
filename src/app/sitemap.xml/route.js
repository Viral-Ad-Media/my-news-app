import { buildServerApiUrl } from "../../lib/server-api";

export async function GET() {
  const url = buildServerApiUrl("/sitemap/");
  if (!url) return new Response("Sitemap unavailable", { status: 503 });
  try {
    const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(15000) });
    if (!response.ok) return new Response("Sitemap unavailable", { status: 502 });
    return new Response(await response.text(), { headers: { "Content-Type": "application/xml", "Cache-Control": "no-store" } });
  } catch {
    return new Response("Sitemap unavailable", { status: 502 });
  }
}
