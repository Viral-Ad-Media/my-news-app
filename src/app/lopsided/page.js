import LopsidedStories from "../../components/LopsidedStories";
import Sidebar from "../../components/Sidebar";
import Link from "next/link";

export const metadata = {
  title: "Lopsided & Multi-Perspective Coverage | AbokiNews",
  description:
    "Explore historical coverage labels and use developing stories for editor-curated source comparison.",
};

export default function LopsidedPage() {
  return (
    <div className="space-y-8">
      <header className="border-b border-border pb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          <span>Coverage archive</span>
          <span aria-hidden="true">·</span>
          <span>Historical labels</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-balance">
          Lopsided Coverage &amp; Headline Roundups
        </h1>
        <p className="mt-2.5 text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
          These historic coverage labels are not independently verified bias measurements.
          For editor-curated events with linked evidence, timelines, and publisher comparisons,
          visit <Link className="underline" href="/stories">Developing stories</Link>.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-3 min-w-0">
          <LopsidedStories mode="full" />
        </div>
        <aside
          aria-label="Explore topics and ask questions"
          className="min-w-0"
        >
          <Sidebar />
        </aside>
      </div>
    </div>
  );
}
