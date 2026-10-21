import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildServerApiUrl, setSession } from "../../../../../lib/server-api";
import {
  GOOGLE_STATE_COOKIE, GOOGLE_FLOW_COOKIE, GOOGLE_VERIFIER_COOKIE,
  googleCallbackUrl, googleFailure, clearGoogleFlow,
} from "../../../../../lib/google-auth";

export const runtime = "nodejs";

export async function GET(request) {
  const store = await cookies();
  const [mode, remember] = (store.get(GOOGLE_FLOW_COOKIE)?.value || "login:0").split(":");
  const params = new URL(request.url).searchParams;
  const state = params.get("state") || "";
  const savedState = store.get(GOOGLE_STATE_COOKIE)?.value || "";
  const verifier = store.get(GOOGLE_VERIFIER_COOKIE)?.value;
  if (!savedState || !state || !verifier || Buffer.byteLength(state) !== Buffer.byteLength(savedState) || !timingSafeEqual(Buffer.from(state), Buffer.from(savedState)))
    return googleFailure(request, mode, "expired");
  if (params.has("error")) return googleFailure(request, mode, "cancelled");
  if (!params.get("code")) return googleFailure(request, mode, "failed");
  const backendUrl = buildServerApiUrl("/auth/google/");
  if (!backendUrl || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET)
    return googleFailure(request, mode, "unavailable");

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: params.get("code"),
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: googleCallbackUrl(request),
        grant_type: "authorization_code",
        code_verifier: verifier,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!tokenResponse.ok) return googleFailure(request, mode, "failed");
    const tokens = await tokenResponse.json();
    if (!tokens.access_token || !tokens.id_token) return googleFailure(request, mode, "failed");
    const backend = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token: tokens.access_token, id_token: tokens.id_token }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!backend.ok) return googleFailure(request, mode, backend.status === 503 ? "unavailable" : "failed");
    const session = await backend.json();
    if (!session.access || !session.refresh) return googleFailure(request, mode, "failed");
    const user = session.user || {};
    const destination = user.is_staff || user.is_superuser ? "/superadmin" : "/dashboard";
    const response = NextResponse.redirect(new URL(destination, googleCallbackUrl(request)));
    clearGoogleFlow(response);
    setSession(response, session, remember === "1");
    return response;
  } catch {
    return googleFailure(request, mode, "failed");
  }
}
