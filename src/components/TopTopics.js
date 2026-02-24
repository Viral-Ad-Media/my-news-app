"use client";
import Link from 'next/link';
import Image from 'next/image';
import { resolveApiAssetUrl } from '../lib/api';


export default function TopTopics({ topics }) {
  const visibleTopics = Array.isArray(topics) ? topics.slice(0, 4) : [];
  
  return (
    <div>
      <h3 className="text-2xl font-bold mt-6 mb-1">Top Topics</h3>
      <div className="flex flex-col space-y-1 mb-6">
        <div className="h-0.5 w-full bg-gray-700"></div>
        <div className="h-0.5 w-full bg-gray-400"></div>
        <div className="h-0.5 w-full bg-gray-200"></div>
      </div>
      <div className="flex flex-col space-y-4">
        {visibleTopics.map((topic) => (
          <Link key={topic.id} href={`/categories/${topic.id}`}>
            <div className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center space-x-3">
                <Image
                  src={
                    topic.image_url
                      ? resolveApiAssetUrl(topic.image_url)
                      : '/images/Placeholder.webp'
                  }
                  alt={topic.name}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <p className="text-md font-semibold">{topic.name}</p>
              </div>
              <button className="text-gray-500">+</button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
