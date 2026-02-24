"use client";

export default function DailyIndex({ indexValue, sentiment }) {
  return (
    <div className="mb-6">
      <h3 className="text-2xl font-bold mb-1">Daily Index</h3>
      <div className="flex flex-col space-y-1 mb-6">
        <div className="h-0.5 w-full bg-gray-700"></div>
        <div className="h-0.5 w-full bg-gray-400"></div>
        <div className="h-0.5 w-full bg-gray-200"></div>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold">{indexValue}</div>
        <div className="text-md font-semibold">{sentiment}</div>
      </div>
      <div className="relative w-full h-2 bg-gray-300 rounded-full mb-4">
        <div
          className="absolute top-0 h-2 bg-black rounded-full"
          style={{ width: `${indexValue}%` }}
        />
      </div>
      <div className="flex justify-between text-sm text-gray-500 mb-2">
        <span>Negative</span>
        <span>Neutral</span>
        <span>Optimistic</span>
        <span>Positive</span>
      </div>

      
    </div>
  );
}
