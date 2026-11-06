"use client";
import { useEffect, useState } from "react";
import { Radio, LockKeyhole } from "lucide-react";
import AuthDialog from "./AuthDialog";
import NewsList from "./NewsList";
import useCountry from "../lib/use-country";
import { countryName } from "../lib/countries";
import useCategories from '../lib/use-categories';
import { Button } from "@/components/ui/button";

export default function LiveNews() {
  const country = useCountry();
  const { categories, error: categoriesError } = useCategories();
  const [session, setSession] = useState({ checking: true, user: null, error: "" });
  const [category, setCategory] = useState("");
  const [allNews, setAllNews] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let requestNumber = 0;
    async function check() {
      const current = ++requestNumber;
      try {
        const response = await fetch("/api/session", { cache: "no-store", signal: controller.signal });
        if (response.status === 401) { if (current === requestNumber) setSession({ checking: false, user: null, error: "" }); return; }
        if (!response.ok) throw new Error("Unable to check your account. Please try again.");
        const data = await response.json();
        if (!controller.signal.aborted && current === requestNumber) setSession({ checking: false, user: data?.authenticated === false ? null : data, error: "" });
      } catch (error) {
        if (error.name !== "AbortError" && current === requestNumber) setSession({ checking: false, user: null, error: error.message });
      }
    }
    check();
    window.addEventListener("news-session", check);
    return () => { controller.abort(); window.removeEventListener("news-session", check); };
  }, [revision]);
  return <div className="space-y-6">
    <header className="stream-page-heading"><p className="editorial-eyebrow inline-flex items-center gap-2"><Radio size={14} aria-hidden="true" />The live desk</p><h1>Live news</h1><p>Every published report across all countries, topics and categories. Choose your edition to narrow the feed.</p></header>
    {session.checking ? <p role="status">Checking your account…</p> : session.error ? <p role="alert">{session.error} <Button variant="outline" onClick={() => setRevision(value => value + 1)}>Retry</Button></p> : !session.user ? <section className="live-account-gate" aria-labelledby="live-account-title"><LockKeyhole size={24} aria-hidden="true" /><p className="editorial-eyebrow">For AbokiNews members</p><h2 id="live-account-title">Sign in to follow the live desk.</h2><p>Keep up with new reporting across all categories. Your account gives you access to the automatically updating news feed.</p><div className="flex flex-wrap gap-3 mt-6"><AuthDialog initialMode="login" className="live-signin">Login</AuthDialog><AuthDialog initialMode="signup">Create account</AuthDialog></div></section> : <>
      {categoriesError && <p role="alert">{categoriesError}</p>}
      <div className="stream-filter"><label htmlFor="live-edition">Edition</label><select id="live-edition" value={allNews ? "all" : "local"} onChange={event => setAllNews(event.target.value === "all")}><option value="all">All published news</option><option value="local">Your {countryName(country)} edition</option></select><label htmlFor="live-category">Category</label><select id="live-category" value={category} onChange={event => setCategory(event.target.value)}><option value="">All categories</option>{categories.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}</select></div>
      <NewsList edition={allNews ? "world" : country} title="Live updates" endpoint="/live/" privateFeed refreshMs={30000} showCategories query={category ? `category=${encodeURIComponent(category)}` : ""} />
    </>}
  </div>;
}
