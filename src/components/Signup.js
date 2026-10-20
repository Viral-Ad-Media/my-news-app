"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { buildApiUrl } from "../lib/api";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (event) => {
    event.preventDefault();
    setError(null);

    if (password1 !== password2) {
      setError("Passwords do not match");
      return;
    }

    const signupUrl = buildApiUrl("/auth/registration/");
    if (!signupUrl) {
      setError("API base URL is not configured.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(signupUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password1, password2 }),
      });

      const data = await response.json();
      if (!response.ok) {
        const apiError =
          data?.non_field_errors?.[0] ||
          data?.username?.[0] ||
          data?.detail ||
          "Signup failed";
        setError(apiError);
        return;
      }

      router.push("/login");
    } catch {
      setError("Unable to sign up right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <Label htmlFor="username" className="block text-gray-700">
              Username
            </Label>
            <Input
              type="text"
              id="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              aria-invalid={Boolean(error)}
              autoComplete="username"
              required
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="password1" className="block text-gray-700">
              Password
            </Label>
            <Input
              type="password"
              id="password1"
              value={password1}
              onChange={(event) => setPassword1(event.target.value)}
              aria-invalid={Boolean(error)}
              autoComplete="new-password"
              required
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="password2" className="block text-gray-700">
              Confirm Password
            </Label>
            <Input
              type="password"
              id="password2"
              value={password2}
              onChange={(event) => setPassword2(event.target.value)}
              aria-invalid={Boolean(error)}
              autoComplete="new-password"
              required
            />
          </div>
          {error && (
            <p role="alert" className="text-destructive mb-3">
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
