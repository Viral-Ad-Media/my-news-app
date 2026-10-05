import { NextResponse } from "next/server";
import {
  buildServerApiUrl,
  clearSession,
  readerRequest,
  sameOrigin,
  setSession,
} from "../../../lib/server-api";

export async function POST(request) {
  if (!sameOrigin(request))
    return NextResponse.json({ detail: "Invalid origin" }, { status: 403 });
  try {
    const { username, password } = await request.json();
    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username ||
      !password ||
      username.length > 150 ||
      password.length > 4096
    ) {
      return NextResponse.json(
        { detail: "Enter a valid username and password" },
        { status: 400 },
      );
    }
    const url = buildServerApiUrl("/token/");
    if (!url)
      return NextResponse.json(
        { detail: "API URL is not configured" },
        { status: 503 },
      );
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    const data = await upstream.json();
    if (!upstream.ok)
      return NextResponse.json(data, { status: upstream.status });
    const result = NextResponse.json({ authenticated: true });
    result.headers.set("Cache-Control", "private, no-store");
    setSession(result, data);
    return result;
  } catch {
    return NextResponse.json(
      { detail: "Unable to login right now" },
      { status: 502 },
    );
  }
}

export async function GET() {
  try {
    const { response, session } = await readerRequest("/auth/user/");
    const result = NextResponse.json(
      response.ok ? await response.json() : { detail: "Please login" },
      { status: response.status },
    );
    result.headers.set("Cache-Control", "private, no-store");
    if (session) setSession(result, session);
    if (response.status === 401) clearSession(result);
    return result;
  } catch {
    return NextResponse.json(
      { detail: "Session check unavailable" },
      { status: 502 },
    );
  }
}

export async function DELETE(request) {
  if (!sameOrigin(request))
    return NextResponse.json({ detail: "Invalid origin" }, { status: 403 });
  const result = NextResponse.json({ authenticated: false });
  clearSession(result);
  return result;
}
