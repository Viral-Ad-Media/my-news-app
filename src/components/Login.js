"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Lock,
  User,
  ArrowRight,
  BookmarkCheck,
  Scale,
  Sparkles,
  AlertCircle,
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

const REMEMBER_USER_KEY = "news-remembered-username";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedUsername = localStorage.getItem(REMEMBER_USER_KEY);
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const handleUsernameBlur = () => {
    if (username && username.trim().length < 2) {
      setFieldError("Enter at least 2 characters for your username.");
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError(null);
    setFieldError("");

    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) {
      setError("Please enter both your username and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: trimmedUsername,
          password,
          rememberMe,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const apiError =
          data?.non_field_errors?.[0] ||
          data?.detail ||
          "Sign in failed. Please check your username and password.";
        setError(apiError);
        return;
      }

      localStorage.removeItem("token");
      if (rememberMe) {
        localStorage.setItem(REMEMBER_USER_KEY, trimmedUsername);
      } else {
        localStorage.removeItem(REMEMBER_USER_KEY);
      }
      window.dispatchEvent(new Event("news-session"));
      router.push("/dashboard");
    } catch {
      setError("Unable to sign in right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start py-4">
      <div className="lg:col-span-6 lg:col-start-1 order-1 lg:order-2">
        <Card className="border border-border shadow-none">
          <CardHeader className="space-y-1.5 pb-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              Reader Account
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Sign in to AbokiNews
            </CardTitle>
            <CardDescription>
              Access your personalized briefing, saved stories, and bias
              spectrum dashboard.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleLogin}
              method="POST"
              action="/api/session"
              className="space-y-5"
            >
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
                      if (fieldError) setFieldError("");
                      if (error) setError(null);
                    }}
                    onBlur={handleUsernameBlur}
                    aria-invalid={Boolean(error || fieldError)}
                    aria-describedby={
                      fieldError ? "login-username-error" : "login-username-hint"
                    }
                    autoComplete="username"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    enterKeyHint="next"
                    placeholder="Enter your username"
                    className="pl-9 h-11 text-base"
                    required
                  />
                </div>
                {fieldError ? (
                  <p
                    id="login-username-error"
                    role="alert"
                    className="text-xs text-destructive flex items-center gap-1 mt-1"
                  >
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {fieldError}
                  </p>
                ) : (
                  <p
                    id="login-username-hint"
                    className="text-xs text-muted-foreground"
                  >
                    Use the username associated with your AbokiNews profile.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="current-password" className="font-medium">
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-foreground underline underline-offset-4 hover:text-muted-foreground"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <Lock
                    className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="current-password"
                    name="password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (error) setError(null);
                    }}
                    aria-invalid={Boolean(error)}
                    autoComplete="current-password"
                    enterKeyHint="done"
                    placeholder="Enter your password"
                    className="pl-9 pr-11 h-11 text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-pressed={showPassword}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-describedby="login-password-toggle-warning"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                  <span id="login-password-toggle-warning" className="sr-only">
                    Warning: this will display your password on the screen.
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2.5">
                  <Checkbox
                    id="remember-me"
                    name="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked === true)
                    }
                  />
                  <Label
                    htmlFor="remember-me"
                    className="text-sm font-normal cursor-pointer select-none"
                  >
                    Remember me for 30 days
                  </Label>
                </div>
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
                {loading ? "Signing in…" : "Sign In"}
                {!loading && (
                  <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground pt-2 border-t border-border">
                New to AbokiNews?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-foreground underline underline-offset-4 hover:text-muted-foreground"
                >
                  Create your account
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Editorial benefits panel placed second on mobile so virtual keyboards never cover form controls */}
      <aside
        aria-label="Reader account benefits"
        className="lg:col-span-6 order-2 lg:order-1 rounded-xl border border-border bg-muted/40 p-6 sm:p-8 space-y-6"
      >
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wider">
            AbokiNews Reader Desk
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-balance">
            Every perspective, tailored to your reading habits.
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Sign in to customize your topic beats, bookmark investigative
            roundups, and track the Left · Center · Right balance of your daily
            news diet.
          </p>
        </div>

        <div className="space-y-4 pt-2 border-t border-border">
          <div className="flex items-start gap-3">
            <div className="rounded-lg border border-border bg-background p-2 shrink-0">
              <Scale className="h-5 w-5 text-foreground" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">
                Personal Bias &amp; Blindspot Radar
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                See how your personalized feed distributes across Left, Center,
                and Right sources in real time.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-lg border border-border bg-background p-2 shrink-0">
              <BookmarkCheck
                className="h-5 w-5 text-foreground"
                aria-hidden="true"
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold">
                Saved Stories &amp; Topic Subscriptions
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Bookmark stories for offline-ready reading and filter your feed
                by Nigeria, US, and global beats.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-lg border border-border bg-background p-2 shrink-0">
              <Sparkles className="h-5 w-5 text-foreground" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">
                AI Newsroom Briefing Assistant
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Ask questions across current headlines and jump directly to
                cited primary sources.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
