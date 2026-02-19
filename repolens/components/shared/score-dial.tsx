"use client";

interface ScoreDialProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function ScoreDial({
  score,
  size = 200,
  strokeWidth = 12,
  className = "",
}: ScoreDialProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 10) * circumference;

  // Color based on score
  const getColor = (s: number) => {
    if (s >= 8) return "#00e5ff"; // Cyan
    if (s >= 6) return "#7c3aed"; // Purple
    if (s >= 4) return "#f59e0b"; // Amber
    return "#ef4444"; // Red
  };

  const color = getColor(score);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1f1f2e"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 10px ${color}50)`,
          }}
        />
      </svg>
      {/* Score text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-5xl font-bold font-heading"
          style={{ color }}
        >
          {score}
        </span>
        <span className="text-sm text-slate-400 font-mono">/ 10</span>
      </div>
    </div>
  );
}
