"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Input } from "@/components/ui/input";

const googleErrors = {
  unavailable: "Google sign-in is not available yet. Please use your username and password.",
  cancelled: "Google sign-in was cancelled. You can try again below.",
  failed: "We couldn’t complete Google sign-in. Please try again or use your username and password.",
  expired: "Your Google sign-in request expired. Please try again.",
};

export function AuthError({ error }) {
  return error ? <p role="alert" className="rounded-md border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm leading-relaxed text-destructive">{error}</p> : null;
}

export function GoogleButton({ mode, rememberMe }) {
  return (
    <a href={`/api/auth/google?mode=${mode}&remember=${rememberMe ? "1" : "0"}`} className="auth-google">
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.25 5.48-4.76 7.18l7.73 6c4.51-4.18 7.07-10.36 7.07-17.65Z" />
        <path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a24 24 0 0 0 0 21.56l7.98-6.19Z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
      </svg>
      Continue with Google
    </a>
  );
}

export function PasswordInput({ visible, onToggle, toggleLabel = "password", ...props }) {
  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} required className="auth-input pr-12" />
      <button type="button" onClick={onToggle} aria-label={`${visible ? "Hide" : "Show"} ${toggleLabel}`} aria-pressed={visible} className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
        {visible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
      </button>
    </div>
  );
}

export default function AuthLayout({ mode, title, description, children, embedded = false }) {
  const headingId = useId();
  const Heading = embedded ? "h2" : "h1";
  const [googleError, setGoogleError] = useState("");
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("google_error");
    setGoogleError(googleErrors[code] || "");
  }, []);
  const form = (
    <div className="auth-form-inner">
      <p className="auth-eyebrow">YOUR ABOKINEWS ACCOUNT</p>
      <Heading id={headingId} className="auth-form-heading">{title}</Heading>
      <p className="auth-description">{description}</p>
      {googleError && <div className="mb-5"><AuthError error={googleError} /></div>}
      {children}
      <p className="auth-security"><LockKeyhole size={12} aria-hidden="true" /> Your password stays private. Your reading stays yours.</p>
    </div>
  );
  if (embedded) {
    return <section className="auth-form-panel auth-embedded" aria-labelledby={headingId}>{form}</section>;
  }
  return (
    <section className={`auth-page auth-page--${mode}`} aria-labelledby={headingId}>
      <aside className="auth-editorial" aria-label="Your AbokiNews account">
        <div className="auth-edition"><span className="auth-edition-mark" /> THE READER’S EDITION <span>ABOKINEWS</span></div>
        <div className="auth-editorial-copy">
          <p className="auth-eyebrow">Stay curious. Read widely.</p>
          <h2>A little context.<br />A clearer view.</h2>
          <p>Follow your interests, discover another perspective, and keep the stories worth coming back to.</p>
        </div>
        <div className="auth-reading-list" aria-hidden="true">
          <div className="auth-reading-list-top"><span>YOUR READING LIST</span><ArrowUpRight size={16} /></div>
          <div className="auth-reading-list-story"><span>01</span><div><small>FOLLOW YOUR CURIOSITY</small><p>A feed shaped by your interests.</p></div></div>
          <div className="auth-reading-list-story"><span>02</span><div><small>KEEP WHAT MATTERS</small><p>Good stories deserve a second read.</p></div></div>
          <div className="auth-reading-list-story"><span>03</span><div><small>GO TO THE SOURCE</small><p>Find the original reporting.</p></div></div>
        </div>
        <div className="auth-editorial-footer"><span>Made for thoughtful readers.</span><span>NG / WORLD</span></div>
      </aside>
      <div className="auth-form-panel">
        <div className="auth-form-top"><Link href="/" className="auth-back">← Back to the news</Link><span>{mode === "login" ? "SIGN IN" : "JOIN US"}</span></div>
        {form}
      </div>
    </section>
  );
}
