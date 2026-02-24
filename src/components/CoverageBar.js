"use client";

export default function CoverageBar({ leftCoverage, sources }) {
  return (
    <div className="flex flex-col items-start mt-2 space-y-1">
      {/* Coverage Bar */}
      <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-2 bg-blue-600"
          style={{ width: `${leftCoverage}%` }}
        ></div>
        <div
          className="absolute right-0 top-0 h-2 bg-red-600"
          style={{ width: `${100 - leftCoverage}%` }}
        ></div>
      </div>

      {/* Coverage Text */}
      <div className="flex justify-between w-full text-xs font-semibold text-gray-800">
        <span>{leftCoverage}% left coverage</span>
        <span>{sources} sources</span>
      </div>
    </div>
  );
}
