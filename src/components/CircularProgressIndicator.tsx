import React from "react";

interface CircularProgressIndicatorProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  showPercentageText?: boolean;
  sublabel?: string;
  activePillarIcon?: React.ReactNode;
  className?: string;
  colorVariant?: "emerald" | "teal" | "cyan" | "indigo";
}

export const CircularProgressIndicator: React.FC<CircularProgressIndicatorProps> = ({
  progress,
  size = 96,
  strokeWidth = 8,
  showPercentageText = true,
  sublabel,
  activePillarIcon,
  className = "",
  colorVariant = "emerald",
}) => {
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

  const gradientId = `circular-grad-${colorVariant}-${size}`;

  const gradientStops = {
    emerald: { start: "#10b981", end: "#059669" },
    teal: { start: "#14b8a6", end: "#0d9488" },
    cyan: { start: "#06b6d4", end: "#0891b2" },
    indigo: { start: "#6366f1", end: "#4f46e5" },
  }[colorVariant];

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(normalizedProgress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Analysis progress: ${Math.round(normalizedProgress)}%`}
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90 origin-center"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientStops.start} />
            <stop offset="100%" stopColor={gradientStops.end} />
          </linearGradient>
        </defs>

        {/* Background Track Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100"
        />

        {/* Animated Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
      </svg>

      {/* Center Label & Icon */}
      {showPercentageText && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-1">
          {activePillarIcon && (
            <div className="mb-0.5 transform scale-90 text-emerald-600 transition-transform duration-300">
              {activePillarIcon}
            </div>
          )}
          <span
            className="font-black font-mono tracking-tight text-slate-900 leading-none"
            style={{ fontSize: size > 80 ? "1.25rem" : size > 50 ? "0.875rem" : "0.75rem" }}
          >
            {Math.round(normalizedProgress)}%
          </span>
          {sublabel && size >= 75 && (
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mt-0.5 truncate max-w-[80%]">
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
