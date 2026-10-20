"use client";

import { useMemo, useState } from "react";
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
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buildApiUrl } from "../lib/api";

export default function Signup() {
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
        if (rememberMe) {
          localStorage.setItem("news-remembered-username", username.trim());
        }
        window.dispatchEvent(new Event("news-session"));
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    } catch {
      setError("Unable to sign up right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start py-4">
      <div className="lg:col-span-7">
        <Card className="border border-border shadow-none">
          <CardHeader className="space-y-1.5 pb-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Free Reader Membership
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Create your account
            </CardTitle>
            <CardDescription>
              Join AbokiNews to build your custom topic feed, bookmark stories,
              and track multi-perspective coverage.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSignup} method="POST" className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username" className="font-medium">
                  Username
                </Label>
                <div className="relative">
                  <User
                    className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <Input
                    type="text"
                    id="username"
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
                    aria-describedby="signup-username-hint"
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
                  id="signup-username-hint"
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
                <Label htmlFor="email" className="font-medium">
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
                    id="email"
                    name="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (error) setError(null);
                    }}
                    autoComplete="email"
                    spellCheck={false}
                    enterKeyHint="next"
                    placeholder="you@example.com"
                    className="pl-9 h-11 text-base"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new-password" className="font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock
                    className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="new-password"
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
                    aria-describedby="password-requirements"
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
                    aria-describedby="signup-password-toggle-warning"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                  <span id="signup-password-toggle-warning" className="sr-only">
                    Warning: this will display your password on the screen.
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password2" className="font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock
                    className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    id="password2"
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
                id="password-requirements"
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
                        passwordChecks.minLen
                          ? "text-foreground font-medium"
                          : ""
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
                        passwordChecks.hasMix
                          ? "text-foreground font-medium"
                          : ""
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
                        passwordChecks.matches
                          ? "text-foreground font-medium"
                          : ""
                      }
                    >
                      Confirmation matches
                    </span>
                  </li>
                </ul>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <Checkbox
                  id="signup-remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked === true)
                  }
                />
                <Label
                  htmlFor="signup-remember-me"
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
                  className="font-semibold text-foreground underline underline-offset-4 hover:text-muted-foreground"
                >
                  Sign in here
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>

      <aside
        aria-label="What is included with your account"
        className="lg:col-span-5 rounded-xl border border-border bg-muted/40 p-6 sm:p-8 space-y-5"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wider">
          Reader Dashboard Included
        </span>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-balance">
          Step outside the echo chamber with your own newsroom desk.
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your free account unlocks a personalized command center designed
          around source transparency and multi-perspective journalism:
        </p>
        <ul className="space-y-3 text-sm pt-2 border-t border-border">
          <li className="flex items-start gap-2.5">
            <CheckCircle2
              className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <span>
              <strong>Logged-In Reader Dashboard:</strong> Track your subscribed
              beats, saved articles, and Left · Center · Right reading balance.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2
              className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <span>
              <strong>AllSides Blindspot Alerts:</strong> Spot when a breaking
              story is only being covered by one side of the political spectrum.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2
              className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <span>
              <strong>Privacy-First Sessions:</strong> HttpOnly encrypted session
              cookies with optional 30-day Remember Me persistence.
            </span>
          </li>
        </ul>
      </aside>
    </div>
  );
}
