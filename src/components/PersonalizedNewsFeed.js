"use client";
import Link from "next/link";
import NewsList from "./NewsList";
export default function PersonalizedNewsFeed() {
  return (
    <div>
      <Link href="/news/custom" className="underline">
        Choose your topics
      </Link>
      <NewsList title="Your News Feed" endpoint="/feed/" privateFeed />
    </div>
  );
}
