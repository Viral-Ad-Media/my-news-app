"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
export default function TopTopics({ topics }) {
  const visibleTopics = Array.isArray(topics) ? topics.slice(0, 6) : [];
  return (
    <section className="mt-6" aria-labelledby="topics-title">
      <h2 id="topics-title" className="text-lg font-semibold mb-3">
        Explore topics
      </h2>
      {visibleTopics.length ? (
        <ul className="space-y-1">
          {visibleTopics.map((topic) => (
            <li key={topic.id}>
              <Link
                href={`/categories/${topic.id}`}
                className="flex items-center justify-between gap-3 py-3 px-2 rounded-md hover:bg-muted"
              >
                <span>{topic.name}</span>
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="tabular-nums">
                    {topic.article_count ?? ""}
                  </span>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          Topics will appear when stories are available.
        </p>
      )}
    </section>
  );
}
