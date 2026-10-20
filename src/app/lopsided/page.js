import LopsidedStories from "../../components/LopsidedStories";
import Sidebar from "../../components/Sidebar";

export const metadata = {
  title: "Lopsided & Multi-Perspective Coverage | AbokiNews",
  description:
    "Compare Left, Center, and Right headlines side-by-side and uncover lopsided media blindspots.",
};

export default function LopsidedPage() {
  return (
    <div className="space-y-8">
      <header className="border-b border-border pb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          <span>Unbiased &amp; Balanced News Desk</span>
          <span aria-hidden="true">·</span>
          <span>Inspired by AllSides</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-balance">
          Lopsided Coverage &amp; Headline Roundups
        </h1>
        <p className="mt-2.5 text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
          Every major story looks different depending on which newsroom tells
          it. Compare{" "}
          <strong className="font-semibold text-foreground">
            From the Left
          </strong>
          ,{" "}
          <strong className="font-semibold text-foreground">
            From the Center
          </strong>
          , and{" "}
          <strong className="font-semibold text-foreground">
            From the Right
          </strong>{" "}
          reporting side-by-side—and spot{" "}
          <strong className="font-semibold text-foreground">
            coverage blindspots
          </strong>{" "}
          where one side of the spectrum dominates or ignores a developing story.
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
