import Link from "next/link";
export default function Footer() {
  return (
    <footer className="border-t p-6 mt-8">
      <div className="container mx-auto flex flex-wrap gap-6">
        <span>AbokiNews</span>
        <Link href="/feed">My Feed</Link>
        <Link href="/news/saved">Saved Stories</Link>
        <Link href="/news/custom">Choose Topics</Link>
        <Link href="/local-news">Local News</Link>
        <Link href="/timelines">Timelines</Link>
      </div>
    </footer>
  );
}
