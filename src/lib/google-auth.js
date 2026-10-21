import "server-only";
import { NextResponse } from "next/server";

export const GOOGLE_STATE_COOKIE = "news_google_state";
export const GOOGLE_FLOW_COOKIE = "news_google_flow";
export const GOOGLE_VERIFIER_COOKIE = "news_google_verifier";
export const googleCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/api/auth/google",
  maxAge: 600,
};

export function googleCallbackUrl(request) {
  // Explicit in production; local development follows the frontend origin.
  return process.env.GOOGLE_REDIRECT_URI || new URL("/api/auth/google/callback", request.url).toString();
}

export function googleFailure(request, mode, code) {
  const url = new URL(mode === "signup" ? "/signup" : "/login", googleCallbackUrl(request));
  url.searchParams.set("google_error", code);
  const response = NextResponse.redirect(url);
  clearGoogleFlow(response);
  return response;
}

export function clearGoogleFlow(response) {
  for (const name of [GOOGLE_STATE_COOKIE, GOOGLE_FLOW_COOKIE, GOOGLE_VERIFIER_COOKIE]) {
    response.cookies.set(name, "", { ...googleCookieOptions, maxAge: 0 });
  }
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
}
