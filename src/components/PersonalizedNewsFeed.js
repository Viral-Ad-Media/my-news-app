// components/PersonalizedNewsFeed.js
"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Use next/navigation in client components

export default function PersonalizedNewsFeed() {
  const [isLocked, setIsLocked] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Only access localStorage if we're on the client side (browser)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem('token');
      if (token) {
        setIsLocked(false);
      }
    }
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mt-6 mb-1 pt-6">Personalized News Feed</h2>

      <div className="flex flex-col space-y-1 mb-6">
        <div className="h-0.5 w-full bg-gray-700"></div>
        <div className="h-0.5 w-full bg-gray-400"></div>
        <div className="h-0.5 w-full bg-gray-200"></div>
      </div>

      {isLocked ? (
        <div className="flex flex-col items-center justify-center">
          <p className="text-lg font-semibold mb-2">
            Sign Up to unlock access to the Personalized News Feed and much more
          </p>
          <button
            onClick={() => router.push('/signup')} // Use router.push on click
            className="bg-black text-white font-bold py-2 px-6 rounded hover:bg-gray-800"
          >
            Sign Up
          </button>
          <p className="mt-4">
            Already have an account?{' '}
            <button onClick={() => router.push('/login')} className="text-blue-500">
              Login
            </button>
          </p>
        </div>
      ) : (
        <div>
          {/* Render personalized news feed */}
          <p>Welcome to your personalized news feed!</p>
        </div>
      )}
    </div>
  );
}
