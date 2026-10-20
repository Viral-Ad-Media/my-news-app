import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import NewsList from "../../components/NewsList";

export default async function Page({ searchParams }) {
  const q = String((await searchParams).q || "").slice(0, 200);
  return (
    <div className="space-y-4">
      <header className="rounded-xl border border-border bg-muted/40 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <Badge variant="secondary" className="text-[11px] uppercase">
            Archive Search
          </Badge>
          <p className="text-sm text-muted-foreground">
            {q
              ? `Showing stories matching “${q}” across headlines and summaries.`
              : "Browsing all stored headlines."}
          </p>
        </div>
        {q && (
          <Button variant="outline" size="sm" asChild>
            <Link href="/">Clear search</Link>
          </Button>
        )}
      </header>

      <NewsList
        title={`Search: ${q || "All stories"}`}
        query={`search=${encodeURIComponent(q)}`}
      />
    </div>
  );
}
