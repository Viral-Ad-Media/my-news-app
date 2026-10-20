"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const pathname = usePathname();
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
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  async function logout() {
    setLoggingOut(true);
    setError("");
    try {
      const response = await fetch("/api/session", { method: "DELETE" });
      if (!response.ok) throw new Error();
      setUser(null);
      window.dispatchEvent(new Event("news-session"));
      window.location.assign("/");
    } catch {
      setError("Unable to log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  }
  function navigation(mobile = false) {
    return links.map(([label, href]) => (
      <Button
        key={href}
        variant={pathname === href ? "secondary" : "ghost"}
        asChild
        className={mobile ? "justify-start w-full" : ""}
      >
        <Link
          href={href}
          aria-current={pathname === href ? "page" : undefined}
          onClick={() => setOpen(false)}
        >
          {label}
        </Link>
      </Button>
    ));
  }
  return (
    <header className="border-b bg-background">
      <div className="w-full max-w-[1100px] mx-auto px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/" aria-label="AbokiNews home" className="mr-auto">
            <Image
              src="/images/logo.png"
              width={120}
              height={32}
              alt="AbokiNews"
              priority
            />
          </Link>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button
                  variant={pathname === "/dashboard" ? "secondary" : "outline"}
                  size="sm"
                  asChild
                >
                  <Link href="/dashboard">
                    <span>Dashboard</span>
                    <span className="hidden sm:inline text-muted-foreground max-w-28 truncate">
                      · {user.username}
                    </span>
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={logout} disabled={loggingOut}>
                  {loggingOut ? "Logging out…" : "Logout"}
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Open navigation"
                >
                  <Menu aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="news-sheet w-[min(88vw,360px)]"
              >
                <SheetHeader>
                  <SheetTitle>Explore AbokiNews</SheetTitle>
                  <SheetDescription>
                    Your stories, topics, and saved news.
                  </SheetDescription>
                </SheetHeader>
                <nav
                  aria-label="Mobile navigation"
                  className="mt-6 flex flex-col gap-1"
                >
                  {navigation(true)}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          <div className="w-full flex flex-col gap-3 sm:flex-row sm:items-center pt-2">
            <form
              action="/search"
              className="flex flex-1 gap-2 min-w-0"
              role="search"
            >
              <Label htmlFor="header-search" className="sr-only">
                Search stories
              </Label>
              <Input
                id="header-search"
                name="q"
                maxLength={200}
                placeholder="Search stories"
                type="search"
                className="min-w-0"
              />
              <Button type="submit" variant="outline" aria-label="Search">
                <Search aria-hidden="true" />
                <span className="hidden sm:inline">Search</span>
              </Button>
            </form>
            <div className="flex items-center gap-2">
              <Label htmlFor="news-country">Country</Label>
              <Select
                value={location}
                onValueChange={(value) => {
                  setLocation(value);
                  localStorage.setItem("news-location", value);
                  window.dispatchEvent(new Event("news-location"));
                }}
              >
                <SelectTrigger id="news-country" className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="news-select">
                  <SelectItem value="ng">Nigeria</SelectItem>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="gb">United Kingdom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <nav
          aria-label="Main navigation"
          className="hidden lg:flex flex-wrap gap-1 mt-3"
        >
          {navigation()}
        </nav>
        {error && (
          <p role="alert" className="text-sm text-destructive mt-2">
            {error}
          </p>
        )}
      </div>
    </header>
  );
}
