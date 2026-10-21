"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, User, ArrowRight, AlertCircle } from "lucide-react";
import AuthFrame from "./AuthFrame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import AuthLayout, { AuthError, GoogleButton, PasswordInput } from "./auth/AuthLayout";

const REMEMBER_USER_KEY = "news-remembered-username";

export default function Login({
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
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let savedUsername;
    try {
      savedUsername = localStorage.getItem(REMEMBER_USER_KEY);
    } catch {}
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

      try {
        localStorage.removeItem("token");
        if (rememberMe) {
          localStorage.setItem(REMEMBER_USER_KEY, trimmedUsername);
        } else {
          localStorage.removeItem(REMEMBER_USER_KEY);
        }
      } catch {}
      window.dispatchEvent(new Event("news-session"));
      onComplete?.();
      if (data?.is_superuser || data?.is_staff) {
        router.push("/superadmin");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Unable to sign in right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFrame mode="login" embedded={embedded}>
      <div className="mb-6">
        {embedded ? (
          <h2 className="text-2xl font-semibold tracking-tight">
            Sign in to AbokiNews
          </h2>
        ) : (
          <h1 className="text-2xl font-semibold tracking-tight">
            Sign in to AbokiNews
          </h1>
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          Your saved stories and topics, right where you left them.
        </p>
      </div>
      <form
        aria-busy={loading}
        onSubmit={handleLogin}
        method="POST"
        action="/api/session"
        className="space-y-5"
      >
        <div className="space-y-1.5">
          <Label htmlFor={fieldId("username")} className="font-medium">
            Username or Email
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
                if (fieldError) setFieldError("");
                if (error) setError(null);
              }}
              onBlur={handleUsernameBlur}
              aria-invalid={Boolean(error || fieldError)}
              aria-describedby={
                fieldError
                  ? fieldId("login-username-error")
                  : fieldId("login-username-hint")
              }
              autoComplete="username"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              enterKeyHint="next"
              placeholder="Enter your username or email"
              className="pl-9 h-11 text-base"
              required
            />
          </div>
          {fieldError ? (
            <p
              id={fieldId("login-username-error")}
              role="alert"
              className="text-xs text-destructive flex items-center gap-1 mt-1"
            >
              <AlertCircle
                className="h-3.5 w-3.5 shrink-0"
                aria-hidden="true"
              />
              {fieldError}
            </p>
          ) : (
            <p
              id={fieldId("login-username-hint")}
              className="text-xs text-muted-foreground"
            >
              Use the username associated with your AbokiNews profile.
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label
              htmlFor={fieldId("current-password")}
              className="font-medium"
            >
              Password
            </Label>
            <Link
              href="/forgot-password"
              onClick={onComplete}
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
              id={fieldId("current-password")}
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
              aria-describedby={fieldId("login-password-toggle-warning")}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
            <span
              id={fieldId("login-password-toggle-warning")}
              className="sr-only"
            >
              Warning: this will display your password on the screen.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2.5">
            <Checkbox
              id={fieldId("remember-me")}
              name="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
            />
            <Label
              htmlFor={fieldId("remember-me")}
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
            onClick={
              onNavigate
                ? (event) => {
                    event.preventDefault();
                    onNavigate("signup");
                  }
                : undefined
            }
            className="font-semibold text-foreground underline underline-offset-4 hover:text-muted-foreground"
          >
            Create your account
          </Link>
        </p>
      </form>
    </AuthFrame>
    <AuthLayout mode="login" title="Welcome back." description="Your stories, your interests. Pick up where you left off.">
      <GoogleButton mode="login" rememberMe={rememberMe} />
      <div className="auth-divider"><span>or sign in with your account</span></div>
      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="username">Username or email</Label>
          <Input id="username" name="username" value={username} onChange={(event) => { setUsername(event.target.value); setFieldError(""); setError(null); }} onBlur={handleUsernameBlur} autoComplete="username" autoCapitalize="off" spellCheck={false} placeholder="Your username or email" className="auth-input" required aria-invalid={Boolean(fieldError)} aria-describedby={fieldError ? "login-username-error" : undefined} />
          {fieldError && <p id="login-username-error" role="alert" className="text-xs text-destructive">{fieldError}</p>}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="current-password">Password</Label>
            <Link href="/forgot-password" className="auth-text-link text-xs">Forgot password?</Link>
          </div>
          <PasswordInput id="current-password" name="password" value={password} onChange={(event) => { setPassword(event.target.value); setError(null); }} visible={showPassword} onToggle={() => setShowPassword(!showPassword)} autoComplete="current-password" placeholder="Your password" />
        </div>
        <div className="flex items-center gap-2.5">
          <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked === true)} />
          <Label htmlFor="remember-me" className="text-sm font-normal text-muted-foreground cursor-pointer">Remember me for 30 days</Label>
        </div>
        <AuthError error={error} />
        <Button type="submit" disabled={loading} className="auth-submit">{loading ? "Signing in…" : "Sign in"}</Button>
      </form>
      <p className="auth-switch">New to AbokiNews? <Link href="/signup" className="auth-text-link">Create an account</Link></p>
    </AuthLayout>
  );
}
