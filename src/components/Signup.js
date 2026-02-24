"use client";

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
    <div className="bg-gray-100 p-6 rounded-md shadow-md">
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
      <form onSubmit={handleSignup}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="w-full px-4 py-2 border rounded"
            autoComplete="username"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password1" className="block text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password1"
            value={password1}
            onChange={(event) => setPassword1(event.target.value)}
            className="w-full px-4 py-2 border rounded"
            autoComplete="new-password"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password2" className="block text-gray-700">
            Confirm Password
          </label>
          <input
            type="password"
            id="password2"
            value={password2}
            onChange={(event) => setPassword2(event.target.value)}
            className="w-full px-4 py-2 border rounded"
            autoComplete="new-password"
            required
          />
        </div>
        {error && <p className="text-red-500 mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white py-2 px-4 rounded disabled:opacity-70"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}
