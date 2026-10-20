import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border py-6 mt-12 text-sm text-muted-foreground">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="font-bold text-foreground">AbokiNews</span>
          <Link href="/feed" className="hover:text-foreground hover:underline">
            My Feed
          </Link>
          <Link
            href="/lopsided"
            className="hover:text-foreground hover:underline"
          >
            Lopsided Desk
          </Link>
          <Link
            href="/news/saved"
            className="hover:text-foreground hover:underline"
          >
            Saved Stories
          </Link>
          <Link
            href="/news/custom"
            className="hover:text-foreground hover:underline"
          >
            Choose Topics
          </Link>
          <Link
            href="/local-news"
            className="hover:text-foreground hover:underline"
          >
            Local News
          </Link>
          <Link
            href="/timelines"
            className="hover:text-foreground hover:underline"
          >
            Timelines
          </Link>
          <Link
            href="/dashboard"
            className="hover:text-foreground hover:underline"
          >
            Reader Dashboard
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          Multi-perspective reporting · Left · Center · Right
        </p>
      </div>
    </footer>
  );
}
