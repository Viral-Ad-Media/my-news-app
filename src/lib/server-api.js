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
  const expected = new URL(request.url);
  if (origin === expected.origin) return true;
  // Next's dev server normalizes its Request URL to localhost even when the
  // browser uses 127.0.0.1. Keep production strict and match the actual dev Host.
  if (
    process.env.NODE_ENV !== "production" &&
    expected.hostname === "localhost"
  ) {
    try {
      const actual = new URL(origin);
      return (
        ["127.0.0.1", "[::1]"].includes(actual.hostname) &&
        actual.port === expected.port &&
        actual.protocol === expected.protocol &&
        origin === `${expected.protocol}//${request.headers.get("host")}`
      );
    } catch {
      return false;
    }
  }
  return false;
}

export function setSession(response, data, rememberMe = false) {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };
  const refreshMaxAge = rememberMe ? 30 * 86400 : 86400;
  if (data.access)
    response.cookies.set("news_access", data.access, {
      ...options,
      maxAge: 3600,
    });
  if (data.refresh)
    response.cookies.set("news_refresh", data.refresh, {
      ...options,
      maxAge: refreshMaxAge,
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
