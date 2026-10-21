"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Languages, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ThemeToggle from "./ThemeToggle";
import AuthDialog from "./AuthDialog";
import { SUPPORTED_LANGUAGES, useLanguage } from "../lib/i18n";
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

export default function Header() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState("ng");
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const pathname = usePathname();
  const { lang, setLanguage, t } = useLanguage();

  const links = [
    [t("nav_home", "Home"), "/"],
    [t("nav_feed", "My Feed"), "/feed"],
    [t("nav_saved", "Saved News"), "/news/saved"],
    [t("nav_topics", "Topics"), "/news/custom"],
    [t("nav_local", "Local News"), "/local-news"],
    [t("nav_timelines", "Timelines"), "/timelines"],
    [t("nav_lopsided", "Lopsided"), "/lopsided"],
    ["RSS", "/rss"],
  ];

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
      <div className="w-full max-w-[1600px] mx-auto px-4 py-3.5 sm:px-6 sm:py-4 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Link
            href="/"
            aria-label="AbokiNews home"
            className="mr-auto shrink-0"
          >
            <Image
              src="/images/logo.png"
              width={120}
              height={32}
              alt="AbokiNews"
              priority
              className="dark:invert w-24 sm:w-[120px] h-auto"
            />
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
            <ThemeToggle />
            {user ? (
              <>
                {(user.is_superuser || user.is_staff) && (
                  <Button
                    variant={
                      pathname === "/superadmin" ? "default" : "secondary"
                    }
                    size="sm"
                    asChild
                    className="px-2.5 sm:px-3"
                  >
                    <Link href="/superadmin">Superadmin</Link>
                  </Button>
                )}
                <Button
                  variant={pathname === "/dashboard" ? "secondary" : "outline"}
                  size="sm"
                  asChild
                  className="px-2.5 sm:px-3"
                >
                  <Link href="/dashboard">
                    <span>{t("nav_dashboard", "Dashboard")}</span>
                    <span className="hidden sm:inline text-muted-foreground max-w-28 truncate">
                      · {user.username}
                    </span>
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  disabled={loggingOut}
                  className="px-2 sm:px-3"
                >
                  {loggingOut
                    ? t("nav_logging_out", "Logging out…")
                    : t("nav_logout", "Logout")}
                </Button>
              </>
            ) : (
              <>
                <AuthDialog initialMode="login">
                  {t("nav_login", "Login")}
                </AuthDialog>
                <AuthDialog initialMode="signup">
                  {t("nav_signup", "Sign Up")}
                </AuthDialog>
              </>
            )}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden shrink-0"
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
          <div className="w-full flex flex-col gap-2.5 sm:flex-row sm:items-center pt-2">
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
                placeholder={t("header_search_placeholder", "Search stories")}
                type="search"
                className="min-w-0"
              />
              <Button
                type="submit"
                variant="outline"
                aria-label="Search"
                className="shrink-0"
              >
                <Search aria-hidden="true" />
                <span className="hidden sm:inline">
                  {t("header_search_btn", "Search")}
                </span>
              </Button>
            </form>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
                <Label
                  htmlFor="news-country"
                  className="text-xs sm:text-sm truncate"
                >
                  {t("header_country", "Country")}
                </Label>
                <Select
                  value={location}
                  onValueChange={(value) => {
                    setLocation(value);
                    localStorage.setItem("news-location", value);
                    window.dispatchEvent(new Event("news-location"));
                  }}
                >
                  <SelectTrigger
                    id="news-country"
                    className="w-full sm:w-40 min-w-0"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="news-select">
                    <SelectItem value="ng">
                      {t("country_ng", "Nigeria")}
                    </SelectItem>
                    <SelectItem value="us">
                      {t("country_us", "United States")}
                    </SelectItem>
                    <SelectItem value="gb">
                      {t("country_gb", "United Kingdom")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
                <Label
                  htmlFor="news-language"
                  className="inline-flex items-center gap-1 text-xs sm:text-sm truncate"
                >
                  <Languages
                    className="h-3.5 w-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{t("header_language", "Language")}</span>
                </Label>
                <Select value={lang} onValueChange={setLanguage}>
                  <SelectTrigger
                    id="news-language"
                    className="w-full sm:w-36 min-w-0"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="news-select">
                    {SUPPORTED_LANGUAGES.map((item) => (
                      <SelectItem key={item.code} value={item.code}>
                        {item.nativeLabel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        <nav
          aria-label="Main navigation"
          className="hidden lg:flex flex flex-wrap gap-1 mt-3"
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
