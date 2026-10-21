"use client";

import { useState } from "react";
import Link from "next/link";
import {
  KeyRound,
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buildApiUrl } from "../lib/api";

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const trimmed = identifier.trim();
    if (!trimmed) {
      setError("Please enter your username or email address.");
      return;
    }

    setLoading(true);
    try {
      const resetUrl = buildApiUrl("/password-reset/");
      if (resetUrl) {
        const res = await fetch(resetUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: trimmed }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(
            data?.detail ||
              data?.identifier?.[0] ||
              "Unable to process password reset request right now."
          );
        }
        setStatusMessage(
          data?.detail ||
            "If an account matches that username or email, password recovery instructions have been sent."
        );
      } else {
        setStatusMessage(
          "If an account matches that username or email, password recovery instructions have been sent."
        );
      }
      setSubmitted(true);
    } catch (err) {
      setError(
        err.message || "Unable to send recovery instructions right now."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-6">
      <Card className="border border-border shadow-none">
        <CardHeader className="space-y-1.5 pb-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
            Account Recovery
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Forgot your password?
          </CardTitle>
          <CardDescription>
            Enter the username or email address linked to your AbokiNews
            account and we will send password recovery instructions.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {submitted ? (
            <div
              role="status"
              aria-live="polite"
              className="space-y-5"
            >
              <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/30 p-4 text-sm text-emerald-950 dark:text-emerald-100 flex items-start gap-3">
                <CheckCircle2
                  className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div className="space-y-1">
                  <p className="font-semibold">Recovery request received</p>
                  <p className="text-xs sm:text-sm leading-relaxed">
                    {statusMessage}
                  </p>
                  <p className="text-xs text-emerald-900/80 dark:text-emerald-200/80 pt-1">
                    Submitted for:{" "}
                    <strong className="font-semibold">{identifier}</strong>
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSubmitted(false);
                    setError("");
                  }}
                >
                  Try another username or email
                </Button>
                <Button asChild className="flex-1">
                  <Link href="/login">Return to Sign In</Link>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} method="POST" className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="recovery-identifier" className="font-medium">
                  Username or Email address
                </Label>
                <div className="relative">
                  <Mail
                    className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <Input
                    type="text"
                    id="recovery-identifier"
                    name="identifier"
                    value={identifier}
                    onChange={(event) => {
                      setIdentifier(event.target.value);
                      if (error) setError("");
                    }}
                    aria-invalid={Boolean(error)}
                    aria-describedby="recovery-identifier-hint"
                    autoComplete="username"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    enterKeyHint="done"
                    placeholder="username or you@example.com"
                    className="pl-9 h-11 text-base"
                    required
                  />
                </div>
                <p
                  id="recovery-identifier-hint"
                  className="text-xs text-muted-foreground"
                >
                  We will send a secure reset link if an email address is on
                  file for your account.
                </p>
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
                <Send className="h-4 w-4 mr-1.5" aria-hidden="true" />
                {loading
                  ? "Sending instructions…"
                  : "Send Recovery Instructions"}
              </Button>

              <div className="pt-3 border-t border-border flex items-center justify-between text-sm">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 font-semibold text-foreground hover:underline underline-offset-4"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Back to Sign In
                </Link>
                <Link
                  href="/signup"
                  className="text-muted-foreground hover:text-foreground hover:underline underline-offset-4"
                >
                  Create account
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
