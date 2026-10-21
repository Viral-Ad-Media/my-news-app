"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import AuthLayout, { AuthError, GoogleButton, PasswordInput } from "./auth/AuthLayout";

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
