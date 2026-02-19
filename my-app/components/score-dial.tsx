/**
 * ScoreDial Component
 * 
 * Animated radial dial showing repository score out of 10:
 * - Animated progress ring
 * - Centered score display
 * - Color-coded (cyan for high, purple for medium, red for low)
 * 
 * Props:
 * - score: number - Score value (0-10)
 * - size?: number - Diameter in pixels (default: 200)
 * - strokeWidth?: number - Thickness of the ring (default: 12)
 * - showLabel?: boolean - Show "Score" label (default: true)
 */

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScoreDialProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
}

export function ScoreDial({
  score,
  size = 200,
  strokeWidth = 12,
  showLabel = true,
  className,
}: ScoreDialProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  // Calculate circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (animatedScore / 10) * circumference;

  // Determine color based on score
  const getColor = () => {
    if (score >= 8) return "#00e5ff";
    if (score >= 6) return "#7c3aed";
    if (score >= 4) return "#f59e0b";
    return "#ef4444";
  };

  const color = getColor();

  return (
    <div
      className={cn("relative flex flex-col items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth={strokeWidth}
        />

        {/* Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            filter: `drop-shadow(0 0 10px ${color}40)`,
          }}
        />
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showLabel && (
          <span className="text-sm text-slate-400 uppercase tracking-wider mb-1">
            Score
          </span>
        )}
        <div className="flex items-baseline">
          <span
            className="text-5xl font-bold"
            style={{ color }}
          >
            {animatedScore.toFixed(1)}
          </span>
          <span className="text-2xl text-slate-500 ml-1">/10</span>
        </div>
      </div>

      {/* Glow Effect */}
      <div
        className="absolute inset-0 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: color }}
      />
    </div>
  );
}

/**
 * ScoreBar Component
 * 
 * Linear progress bar for individual score dimensions
 */
interface ScoreBarProps {
  label: string;
  score: number;
  maxScore?: number;
  className?: string;
}

export function ScoreBar({
  label,
  score,
  maxScore = 10,
  className,
}: ScoreBarProps) {
  const percentage = (score / maxScore) * 100;

  // Determine color based on score
  const getColor = () => {
    if (score >= 8) return "#00e5ff";
    if (score >= 6) return "#7c3aed";
    if (score >= 4) return "#f59e0b";
    return "#ef4444";
  };

  const color = getColor();

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <span className="text-sm text-slate-300">{label}</span>
        <span className="text-sm font-mono" style={{ color }}>
          {score}/{maxScore}
        </span>
      </div>
      <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            background: color,
            boxShadow: `0 0 10px ${color}40`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        />
      </div>
    </div>
  );
}
