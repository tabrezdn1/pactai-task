import React from "react";

interface ProgressBarProps {
  /** Percentage (0-100) */
  value: number;
}

export function ProgressBar({ value }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-purple-600 transition-all duration-150"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
} 