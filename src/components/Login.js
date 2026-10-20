"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError(null);

    const loginUrl = "/api/session";
    setLoading(true);
    try {
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const apiError =
          data?.non_field_errors?.[0] ||
          data?.detail ||
          "Login failed. Check your credentials.";
        setError(apiError);
        return;
      }

      localStorage.removeItem("token");
      window.dispatchEvent(new Event("news-session"));
      router.push("/");
    } catch {
      setError("Unable to login right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin}>
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
            <Label htmlFor="password" className="block text-gray-700">
              Password
            </Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(error)}
              autoComplete="current-password"
              required
            />
          </div>
          {error && (
            <p role="alert" className="text-destructive mb-3">
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
