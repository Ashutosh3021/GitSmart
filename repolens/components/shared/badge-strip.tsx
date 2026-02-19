"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface BadgeStripProps {
  badges: string[];
  className?: string;
}

// Map of common badge shields
const badgeMapping: Record<string, string> = {
  "build-passing": "https://img.shields.io/badge/build-passing-brightgreen?style=flat-square",
  "npm-version": "https://img.shields.io/npm/v/next?style=flat-square&logo=npm&color=cyan",
  "license-mit": "https://img.shields.io/badge/license-MIT-blue?style=flat-square",
  "coverage-90": "https://img.shields.io/badge/coverage-90%25-brightgreen?style=flat-square",
  "stars": "https://img.shields.io/github/stars/vercel/next.js?style=flat-square&logo=github&color=yellow",
  "forks": "https://img.shields.io/github/forks/vercel/next.js?style=flat-square&logo=github&color=blue",
  "typescript": "https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white",
  "react": "https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB",
  "nextjs": "https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white",
  "tailwind": "https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white",
  "prisma": "https://img.shields.io/badge/Prisma-3982CE?style=flat-square&logo=Prisma&logoColor=white",
  "docker": "https://img.shields.io/badge/Docker-2CA5E0?style=flat-square&logo=docker&logoColor=white",
  "vercel": "https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white",
};

export function BadgeStrip({ badges, className = "" }: BadgeStripProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {badges.map((badge, index) => {
        const badgeUrl = badgeMapping[badge] || badge;
        
        // If it's a URL, render as image
        if (badgeUrl.startsWith("http")) {
          return (
            <img
              key={index}
              src={badgeUrl}
              alt={badge}
              className="h-5"
            />
          );
        }
        
        // Otherwise render as text badge
        return (
          <Badge
            key={index}
            variant="outline"
            className="bg-[#1a1a2e] border-[#2d2d44] text-slate-300"
          >
            {badge}
          </Badge>
        );
      })}
    </div>
  );
}
