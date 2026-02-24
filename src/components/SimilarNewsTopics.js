"use client";

export default function SimilarNewsTopics({ topics }) {
  const normalizedTopics = Array.isArray(topics) ? topics : [];

  return (
    <div className="mt-6">
      <h3 className="text-2xl font-bold mt-6 mb-1">Similar News Topics</h3>
      <div className="flex flex-col space-y-1 mb-6">
        <div className="h-0.5 w-full bg-gray-700"></div>
        <div className="h-0.5 w-full bg-gray-400"></div>
        <div className="h-0.5 w-full bg-gray-200"></div>
      </div>
      <div className="flex flex-wrap gap-2">
        {normalizedTopics.map((topic) => (
          <div key={topic.id} className="flex items-center bg-gray-100 border p-2 rounded-lg shadow-sm">
            <span className="text-sm font-semibold">{topic.name}</span>
            <button className="text-gray-500 ml-2">+</button>
          </div>
        ))}
      </div>
    </div>
  );
}
