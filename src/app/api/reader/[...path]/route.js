import { NextResponse } from "next/server";
import {
  readerRequest,
  sameOrigin,
  setSession,
} from "../../../../lib/server-api";

async function proxy(request, { params }) {
  const { path: segments } = await params;
  const path = segments.join("/");
  const allowed = {
    "saved-status": ["GET"],
    feed: ["GET"],
    saved: ["GET"],
    preferences: ["GET", "PUT"],
    ask: ["POST"],
  };
  const methods = /^saved\/\d+$/.test(path)
    ? ["GET", "PUT", "DELETE"]
    : allowed[path];
  if (!methods?.includes(request.method))
    return NextResponse.json({ detail: "Not found" }, { status: 404 });
  if (request.method !== "GET" && !sameOrigin(request))
    return NextResponse.json({ detail: "Invalid origin" }, { status: 403 });
  try {
    const search = new URL(request.url).search;
    const body = ["POST", "PUT"].includes(request.method)
      ? JSON.stringify(await request.json())
      : undefined;
    const { response, session } = await readerRequest(`/${path}/${search}`, {
      method: request.method,
      body,
    });
    const result =
      response.status === 204
        ? new NextResponse(null, { status: 204 })
        : NextResponse.json(await response.json(), { status: response.status });
    result.headers.set("Cache-Control", "private, no-store");
    if (session) setSession(result, session);
    return result;
  } catch {
    return NextResponse.json(
      { detail: "News service is unavailable" },
      { status: 502 },
    );
  }
}
export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
