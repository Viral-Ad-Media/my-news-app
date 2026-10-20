"use client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
export default function SimilarNewsTopics({ topics }) {
  const items = Array.isArray(topics) ? topics : [];
  if (!items.length) return null;
  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold mb-3">More to explore</h2>
      <div className="flex flex-wrap gap-2">
        {items.map((topic) => (
          <Link key={topic.id} href={`/categories/${topic.id}`}>
            <Badge
              variant="secondary"
              className="font-normal text-sm py-1.5 px-3"
            >
              {topic.name}
            </Badge>
          </Link>
        ))}
      </div>
    </section>
  );
}
