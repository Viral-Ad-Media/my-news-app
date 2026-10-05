import "server-only";
import { cookies } from "next/headers";
import { buildApiUrl } from "./api";

export function buildServerApiUrl(path) {
  const configured = process.env.API_SERVER_URL;
  if (!configured) return buildApiUrl(path);
  const origin = configured.replace(/\/+$/, "");
  return `${origin.endsWith("/api") ? origin : `${origin}/api`}${path.startsWith("/") ? path : `/${path}`}`;
}

export function sameOrigin(request) {
  const origin = request.headers.get("origin");
  return origin === new URL(request.url).origin;
}

export function setSession(response, data) {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };
  if (data.access)
    response.cookies.set("news_access", data.access, {
      ...options,
      maxAge: 3600,
    });
  if (data.refresh)
    response.cookies.set("news_refresh", data.refresh, {
      ...options,
      maxAge: 86400,
    });
}

export function clearSession(response) {
  response.cookies.delete("news_access");
  response.cookies.delete("news_refresh");
}

export async function readerRequest(path, options = {}) {
  const url = buildServerApiUrl(path);
  if (!url) throw new Error("API URL is not configured");
  const cookieStore = await cookies();
  const access = cookieStore.get("news_access")?.value;
  const headers = { "Content-Type": "application/json", ...options.headers };
  const send = (token) =>
    fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
  let response = await send(access);
  let session = null;
  const refresh = cookieStore.get("news_refresh")?.value;
  if (response.status === 401 && refresh) {
    const renewed = await fetch(buildServerApiUrl("/token/refresh/"), {
      method: "POST",
      headers,
      body: JSON.stringify({ refresh }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (renewed.ok) {
      session = await renewed.json();
      response = await send(session.access);
    }
  }
  return { response, session };
}
