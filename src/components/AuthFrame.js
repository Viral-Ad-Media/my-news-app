"use client";

import Link from "next/link";
import { Bookmark, ArrowLeft, ListFilter, ArrowUpRight } from "lucide-react";

export default function AuthFrame({
  children,
  mode = "login",
  embedded = false,
}) {
  if (embedded)
    return <div className="auth-form-panel p-5 sm:p-8">{children}</div>;
  return (
    <div className="mx-auto max-w-[1040px] py-4 sm:py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm mb-6">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to the news
      </Link>
      {/* 1040 = 457.6 + 582.4. The form leads on phones; both panels share one frame. */}
      <div className="grid lg:grid-cols-[minmax(0,.88fr)_minmax(0,1.12fr)] overflow-hidden rounded-2xl bg-muted/50">
        <aside
          className="hidden lg:flex flex-col gap-8 p-10"
          aria-label="Your AbokiNews reading desk"
        >
          <div>
            <p className="text-sm text-muted-foreground">
              AbokiNews · Your reading desk
            </p>
            <h2 className="mt-4 text-2xl font-semibold leading-snug">
              A little more context.
              <br />A clearer perspective.
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              Keep the stories that matter close. Follow your interests, then go
              straight to the source.
            </p>
          </div>
          <div className="space-y-6">
            {[
              [
                Bookmark,
                "Pick up where you left off",
                "Save stories to return to from your reading dashboard.",
              ],
              [
                ListFilter,
                "Make room for your interests",
                "Build a feed around the topics you follow.",
              ],
              [
                ArrowUpRight,
                "Keep the source in sight",
                "Read the original reporting behind each summary.",
              ],
            ].map(([Icon, title, copy]) => (
              <div className="flex gap-3" key={title}>
                <Icon className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {copy}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {mode === "signup"
              ? "Your next good read starts here."
              : "Welcome back to your reading routine."}
          </p>
        </aside>
        <div className="auth-form-panel bg-card p-5 sm:p-8 lg:p-10">
          {children}
        </div>
      </div>
    </div>
  );
}
