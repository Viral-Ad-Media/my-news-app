"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import { buildApiUrl } from "../lib/api";
import AuthLayout, { AuthError, GoogleButton, PasswordInput } from "./auth/AuthLayout";

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
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
    <AuthLayout
      embedded={embedded}
      mode="signup"
      title="Make room for better news."
      description="Create your free account. Keep the stories that matter close."
    >
      <GoogleButton mode="signup" rememberMe={rememberMe} />
      <div className="auth-divider"><span>or create an account with email</span></div>
      <form aria-busy={loading} onSubmit={handleSignup} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={fieldId("username")}>Username</Label>
            <Input
              ref={usernameRef}
              id={fieldId("username")}
              name="username"
              value={username}
              onChange={(event) => { setUsername(event.target.value); setError(null); }}
              autoComplete="username"
              autoCapitalize="off"
              spellCheck={false}
              placeholder="Choose a username"
              className="auth-input"
              maxLength={150}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={fieldId("email")}>Email address</Label>
            <Input
              id={fieldId("email")}
              name="email"
              type="email"
              value={email}
              onChange={(event) => { setEmail(event.target.value); setError(null); }}
              autoComplete="email"
              placeholder="you@example.com"
              className="auth-input"
              aria-describedby={fieldId("email-hint")}
            />
            <p id={fieldId("email-hint")} className="text-xs text-muted-foreground">Optional, for password recovery.</p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor={fieldId("password1")}>Password</Label>
          <PasswordInput
            id={fieldId("password1")}
            name="password1"
            value={password1}
            onChange={(event) => { setPassword1(event.target.value); setError(null); }}
            visible={showPassword}
            onToggle={() => setShowPassword(!showPassword)}
            autoComplete="new-password"
            placeholder="Create a password"
            minLength={8}
            aria-describedby={fieldId("password-requirements")}
          />
          <p id={fieldId("password-requirements")} className="text-xs text-muted-foreground leading-relaxed">At least 8 characters. Avoid common passwords or using only numbers.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor={fieldId("password2")}>Confirm password</Label>
          <PasswordInput
            id={fieldId("password2")}
            name="password2"
            value={password2}
            onChange={(event) => { setPassword2(event.target.value); setError(null); }}
            visible={showConfirmPassword}
            onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
            toggleLabel="confirm password"
            autoComplete="new-password"
            placeholder="Enter your password again"
            minLength={8}
          />
        </div>
        <div className="flex items-center gap-2.5">
          <Checkbox id={fieldId("signup-remember-me")} checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked === true)} />
          <Label htmlFor={fieldId("signup-remember-me")} className="text-sm font-normal text-muted-foreground cursor-pointer">Remember me for 30 days</Label>
        </div>
        <AuthError error={error} />
        <Button type="submit" disabled={loading} className="auth-submit">{loading ? "Creating account…" : "Create account"}</Button>
      </form>
      <p className="auth-switch">
        Already a reader?{" "}
        <Link
          href="/login"
          onClick={onNavigate ? (event) => { event.preventDefault(); onNavigate("login"); } : undefined}
          className="auth-text-link"
        >Sign in</Link>
      </p>
    </AuthLayout>
  );
}
