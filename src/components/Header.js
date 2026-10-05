"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
const links = [
  ["Home", "/"],
  ["My Feed", "/feed"],
  ["Saved News", "/news/saved"],
  ["Topics", "/news/custom"],
  ["Local News", "/local-news"],
  ["Timelines", "/timelines"],
  ["Lopsided", "/lopsided"],
];
export default function Header() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState("ng");
  useEffect(() => {
    setLocation(localStorage.getItem("news-location") || "ng");
    const update = () =>
      fetch("/api/session")
        .then((res) => (res.ok ? res.json() : null))
        .then(setUser)
        .catch(() => setUser(null));
    update();
    window.addEventListener("news-session", update);
    return () => window.removeEventListener("news-session", update);
  }, []);
  async function logout() {
    const response = await fetch("/api/session", { method: "DELETE" });
    if (response.ok) {
      setUser(null);
      window.dispatchEvent(new Event("news-session"));
      window.location.assign("/");
    }
  }
  return (
    <header className="bg-gray-100 border-b p-4">
      <div className="container mx-auto flex flex-wrap gap-4 items-center">
        <Link href="/">
          <Image
            src="/images/logo.png"
            width={120}
            height={32}
            alt="AbokiNews"
          />
        </Link>
        <button
          className="lg:hidden underline"
          aria-expanded={open}
          aria-controls="news-nav"
          onClick={() => setOpen(!open)}
        >
          Menu
        </button>
        <nav
          id="news-nav"
          className={`${open ? "flex" : "hidden"} lg:flex flex-wrap gap-4`}
        >
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="hover:underline"
            >
              {label}
            </Link>
          ))}
        </nav>
        <form action="/search" className="flex gap-2">
          <input
            name="q"
            maxLength={200}
            aria-label="Search stories"
            placeholder="Search stories"
            className="border p-1 w-36"
          />
          <button className="underline">Search</button>
        </form>
        <label className="text-sm">
          Country{" "}
          <select
            value={location}
            onChange={(event) => {
              const value = event.target.value;
              setLocation(value);
              localStorage.setItem("news-location", value);
              window.dispatchEvent(new Event("news-location"));
            }}
          >
            <option value="ng">Nigeria</option>
            <option value="us">United States</option>
            <option value="gb">United Kingdom</option>
          </select>
        </label>
        {user ? (
          <>
            <span>{user.username}</span>
            <button onClick={logout} className="underline">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="underline">
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-black text-white px-3 py-1 rounded"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
