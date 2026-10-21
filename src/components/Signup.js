"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  CheckCircle2,
  Circle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import AuthFrame from "./AuthFrame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import { buildApiUrl } from "../lib/api";

export default function Signup({
  embedded = false,
  onNavigate,
  onComplete,
} = {}) {
  const usernameRef = useRef(null);
  const fieldId = (name) => (embedded ? `account-dialog-${name}` : name);
  useEffect(() => {
    if (embedded) usernameRef.current?.focus();
  }, [embedded]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [blurErrors, setBlurErrors] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const passwordChecks = useMemo(() => {
    const minLen = password1.length >= 8;
    const notNumericOnly = password1.length > 0 && !/^\d+$/.test(password1);
    const hasMix = /[A-Za-z]/.test(password1) && /[^A-Za-z]/.test(password1);
    const matches = password2.length > 0 && password1 === password2;
    return { minLen, notNumericOnly, hasMix, matches };
  }, [password1, password2]);

  const handleSignup = async (event) => {
    event.preventDefault();
    setError(null);

    if (password1 !== password2) {
      setError("Passwords do not match.");
      return;
    }

    if (password1.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    const signupUrl = buildApiUrl("/auth/registration/");
    if (!signupUrl) {
      setError("API base URL is not configured.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        username: username.trim(),
        password1,
        password2,
      };
      if (email.trim()) {
        payload.email = email.trim();
      }

      const response = await fetch(signupUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        const apiError =
          data?.non_field_errors?.[0] ||
          data?.username?.[0] ||
          data?.email?.[0] ||
          data?.password1?.[0] ||
          data?.detail ||
          "Unable to create account. Please review your details.";
        setError(apiError);
        return;
      }

      // Automatically establish an HttpOnly reader session after registration
      const sessionRes = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password1,
          rememberMe,
        }),
      }).catch(() => null);

      if (sessionRes?.ok) {
        try {
          if (rememberMe) {
            localStorage.setItem("news-remembered-username", username.trim());
          }
        } catch {}
        window.dispatchEvent(new Event("news-session"));
        onComplete?.();
        router.push("/dashboard");
      } else {
        onComplete?.();
        router.push("/login");
      }
    } catch {
      setError("Unable to sign up right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFrame mode="signup" embedded={embedded}>
      <div className="mb-6">
        {embedded ? (
          <h2 className="text-2xl font-semibold tracking-tight">
            Create your account
          </h2>
        ) : (
          <h1 className="text-2xl font-semibold tracking-tight">
            Create your account
          </h1>
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          Make space for the stories you want to follow.
        </p>
      </div>
      <form aria-busy={loading} onSubmit={handleSignup} method="POST" className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor={fieldId("username")} className="font-medium">
            Username
          </Label>
          <div className="relative">
            <User
              className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <Input
              type="text"
              id={fieldId("username")}
              ref={usernameRef}
              name="username"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                if (blurErrors.username)
                  setBlurErrors((prev) => ({ ...prev, username: "" }));
                if (error) setError(null);
              }}
              onBlur={() => {
                if (username && username.trim().length < 3) {
                  setBlurErrors((prev) => ({
                    ...prev,
                    username: "Choose a username with at least 3 characters.",
                  }));
                }
              }}
              aria-invalid={Boolean(error || blurErrors.username)}
              aria-describedby={fieldId("signup-username-hint")}
              autoComplete="username"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              enterKeyHint="next"
              placeholder="Choose a unique username"
              className="pl-9 h-11 text-base"
              required
            />
          </div>
          <p
            id={fieldId("signup-username-hint")}
            className={`text-xs ${
              blurErrors.username
                ? "text-destructive font-medium"
                : "text-muted-foreground"
            }`}
          >
            {blurErrors.username ||
              "Letters, digits, and @/./+/-/_ characters supported."}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={fieldId("email")} className="font-medium">
            Email address{" "}
            <span className="text-xs font-normal text-muted-foreground">
              (optional, for password recovery)
            </span>
          </Label>
          <div className="relative">
            <Mail
              className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <Input
              type="email"
              id={fieldId("email")}
              name="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError(null);
              }}
              autoComplete="email"
              spellCheck={false}
              enterKeyHint="next"
              placeholder="Your email address"
              className="pl-9 h-11 text-base"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={fieldId("new-password")} className="font-medium">
            Password
          </Label>
          <div className="relative">
            <Lock
              className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <Input
              type={showPassword ? "text" : "password"}
              id={fieldId("new-password")}
              name="new-password"
              value={password1}
              onChange={(event) => {
                setPassword1(event.target.value);
                if (blurErrors.password1)
                  setBlurErrors((prev) => ({ ...prev, password1: "" }));
                if (error) setError(null);
              }}
              onBlur={() => {
                if (password1 && password1.length < 8) {
                  setBlurErrors((prev) => ({
                    ...prev,
                    password1: "Use at least 8 characters.",
                  }));
                }
              }}
              aria-invalid={Boolean(error || blurErrors.password1)}
              aria-describedby={fieldId("password-requirements")}
              autoComplete="new-password"
              minLength={8}
              enterKeyHint="next"
              placeholder="Create a strong password"
              className="pl-9 pr-11 h-11 text-base"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-pressed={showPassword}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-describedby={fieldId("signup-password-toggle-warning")}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
            <span
              id={fieldId("signup-password-toggle-warning")}
              className="sr-only"
            >
              Warning: this will display your password on the screen.
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={fieldId("password2")} className="font-medium">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock
              className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <Input
              type={showConfirmPassword ? "text" : "password"}
              id={fieldId("password2")}
              name="password2"
              value={password2}
              onChange={(event) => {
                setPassword2(event.target.value);
                if (blurErrors.password2)
                  setBlurErrors((prev) => ({ ...prev, password2: "" }));
                if (error) setError(null);
              }}
              onBlur={() => {
                if (password2 && password1 !== password2) {
                  setBlurErrors((prev) => ({
                    ...prev,
                    password2: "Passwords do not match yet.",
                  }));
                }
              }}
              aria-invalid={Boolean(error || blurErrors.password2)}
              autoComplete="new-password"
              minLength={8}
              enterKeyHint="done"
              placeholder="Re-enter your password"
              className="pl-9 pr-11 h-11 text-base"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-pressed={showConfirmPassword}
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
              className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {blurErrors.password2 && (
            <p role="alert" className="text-xs text-destructive">
              {blurErrors.password2}
            </p>
          )}
        </div>

        {/* Password strength & requirement checklist using both iconography and text */}
        <div
          id={fieldId("password-requirements")}
          className="rounded-lg border border-border bg-muted/40 p-3.5 space-y-1.5 text-xs"
        >
          <p className="font-semibold text-foreground">
            Password security checklist:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
            <li className="flex items-center gap-1.5 text-muted-foreground">
              {passwordChecks.minLen ? (
                <CheckCircle2
                  className="h-3.5 w-3.5 text-emerald-700 shrink-0"
                  aria-hidden="true"
                />
              ) : (
                <Circle
                  className="h-3.5 w-3.5 text-muted-foreground shrink-0"
                  aria-hidden="true"
                />
              )}
              <span
                className={
                  passwordChecks.minLen ? "text-foreground font-medium" : ""
                }
              >
                8 or more characters
              </span>
            </li>
            <li className="flex items-center gap-1.5 text-muted-foreground">
              {passwordChecks.notNumericOnly ? (
                <CheckCircle2
                  className="h-3.5 w-3.5 text-emerald-700 shrink-0"
                  aria-hidden="true"
                />
              ) : (
                <Circle
                  className="h-3.5 w-3.5 text-muted-foreground shrink-0"
                  aria-hidden="true"
                />
              )}
              <span
                className={
                  passwordChecks.notNumericOnly
                    ? "text-foreground font-medium"
                    : ""
                }
              >
                Not entirely numeric
              </span>
            </li>
            <li className="flex items-center gap-1.5 text-muted-foreground">
              {passwordChecks.hasMix ? (
                <CheckCircle2
                  className="h-3.5 w-3.5 text-emerald-700 shrink-0"
                  aria-hidden="true"
                />
              ) : (
                <Circle
                  className="h-3.5 w-3.5 text-muted-foreground shrink-0"
                  aria-hidden="true"
                />
              )}
              <span
                className={
                  passwordChecks.hasMix ? "text-foreground font-medium" : ""
                }
              >
                Mix of letters &amp; numbers/symbols
              </span>
            </li>
            <li className="flex items-center gap-1.5 text-muted-foreground">
              {passwordChecks.matches ? (
                <CheckCircle2
                  className="h-3.5 w-3.5 text-emerald-700 shrink-0"
                  aria-hidden="true"
                />
              ) : (
                <Circle
                  className="h-3.5 w-3.5 text-muted-foreground shrink-0"
                  aria-hidden="true"
                />
              )}
              <span
                className={
                  passwordChecks.matches ? "text-foreground font-medium" : ""
                }
              >
                Confirmation matches
              </span>
            </li>
          </ul>
        </div>

        <div className="flex items-center gap-2.5 pt-1">
          <Checkbox
            id={fieldId("signup-remember-me")}
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
          />
          <Label
            htmlFor={fieldId("signup-remember-me")}
            className="text-sm font-normal cursor-pointer select-none"
          >
            Keep me signed in for 30 days on this device
          </Label>
        </div>

        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="rounded-lg border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive flex items-start gap-2"
          >
            <AlertCircle
              className="h-4 w-4 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 text-base font-semibold"
        >
          {loading ? "Creating account…" : "Sign Up"}
          {!loading && (
            <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground pt-2 border-t border-border">
          Already have an account?{" "}
          <Link
            href="/login"
            onClick={
              onNavigate
                ? (event) => {
                    event.preventDefault();
                    onNavigate("login");
                  }
                : undefined
            }
            className="font-semibold text-foreground underline underline-offset-4 hover:text-muted-foreground"
          >
            Sign in here
          </Link>
        </p>
      </form>
    </AuthFrame>
  );
}
