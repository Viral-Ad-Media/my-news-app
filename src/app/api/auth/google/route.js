import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import {
  GOOGLE_STATE_COOKIE, GOOGLE_FLOW_COOKIE, GOOGLE_VERIFIER_COOKIE,
  googleCookieOptions, googleCallbackUrl, googleFailure,
} from "../../../../lib/google-auth";

export const runtime = "nodejs";

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const mode = params.get("mode") === "signup" ? "signup" : "login";
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET)
    return googleFailure(request, mode, "unavailable");

  const state = randomBytes(32).toString("hex");
  const verifier = randomBytes(32).toString("base64url");
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: googleCallbackUrl(request),
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: createHash("sha256").update(verifier).digest("base64url"),
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();
  const response = NextResponse.redirect(url);
  response.headers.set("Cache-Control", "private, no-store");
  response.cookies.set(GOOGLE_STATE_COOKIE, state, googleCookieOptions);
  response.cookies.set(GOOGLE_VERIFIER_COOKIE, verifier, googleCookieOptions);
  response.cookies.set(GOOGLE_FLOW_COOKIE, `${mode}:${params.get("remember") === "1" ? "1" : "0"}`, googleCookieOptions);
  return response;
}
