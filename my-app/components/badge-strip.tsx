/**
 * BadgeStrip Component
 * 
 * Shields.io-style badges row for README preview:
 * - Multiple badge types (build, version, license, etc.)
 * - Styled to match shields.io appearance
 * - Used in README preview
 * 
 * Props:
 * - badges: Badge[] - Array of badge configurations
 * - className?: string - Additional CSS classes
 */

"use client";

import { cn } from "@/lib/utils";

interface Badge {
  label: string;
  message: string;
  color: string;
  logo?: string;
}

interface BadgeStripProps {
  badges?: Badge[];
  className?: string;
}

// Default badges for demo
const defaultBadges: Badge[] = [
  { label: "build", message: "passing", color: "00e5ff" },
  { label: "version", message: "v1.0.0", color: "7c3aed" },
  { label: "license", message: "MIT", color: "22c55e" },
  { label: "stars", message: "1.2k", color: "f59e0b" },
  { label: "coverage", message: "95%", color: "ec4899" },
];

export function BadgeStrip({ badges = defaultBadges, className }: BadgeStripProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {badges.map((badge, index) => (
        <BadgeItem key={index} badge={badge} />
      ))}
    </div>
  );
}

function BadgeItem({ badge }: { badge: Badge }) {
  const { label, message, color } = badge;

  return (
    <div
      className="inline-flex items-center rounded overflow-hidden text-xs font-mono"
      style={{ height: "20px" }}
    >
      {/* Label */}
      <span
        className="px-2 py-0.5 text-white/90"
        style={{ backgroundColor: "#555" }}
      >
        {label}
      </span>
      {/* Message */}
      <span
        className="px-2 py-0.5 text-white font-medium"
        style={{ backgroundColor: `#${color}` }}
      >
        {message}
      </span>
    </div>
  );
}

/**
 * DynamicBadge Component
 * 
 * Creates shields.io URL for a badge
 */
export function createShieldsUrl(
  label: string,
  message: string,
  color: string,
  style: "flat" | "flat-square" | "plastic" | "for-the-badge" = "flat"
): string {
  const encodedLabel = encodeURIComponent(label);
  const encodedMessage = encodeURIComponent(message);
  return `https://img.shields.io/badge/${encodedLabel}-${encodedMessage}-${color}?style=${style}`;
}

/**
 * GitHubBadges Component
 * 
 * Common GitHub repository badges
 */
interface GitHubBadgesProps {
  username: string;
  repo: string;
  className?: string;
}

export function GitHubBadges({ username, repo, className }: GitHubBadgesProps) {
  const badges = [
    {
      src: `https://img.shields.io/github/stars/${username}/${repo}?style=flat&color=00e5ff`,
      alt: "Stars",
    },
    {
      src: `https://img.shields.io/github/forks/${username}/${repo}?style=flat&color=7c3aed`,
      alt: "Forks",
    },
    {
      src: `https://img.shields.io/github/issues/${username}/${repo}?style=flat&color=f59e0b`,
      alt: "Issues",
    },
    {
      src: `https://img.shields.io/github/license/${username}/${repo}?style=flat&color=22c55e`,
      alt: "License",
    },
  ];

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {badges.map((badge, index) => (
        <img
          key={index}
          src={badge.src}
          alt={badge.alt}
          className="h-5"
        />
      ))}
    </div>
  );
}
