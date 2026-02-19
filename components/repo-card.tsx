/**
 * RepoCard Component
 * 
 * Repository card for comparison and listing:
 * - Repo name and owner
 * - Star count
 * - Primary language
 * - Last update
 * - Brief description
 * 
 * Props:
 * - repo: Repository object with details
 * - onClick?: () => void - Click handler
 * - isSelected?: boolean - Selection state
 */

"use client";

import { Star, GitBranch, Clock, Code2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Repository {
  id: string;
  name: string;
  owner: string;
  fullName: string;
  description: string;
  stars: number;
  language: string;
  lastUpdated: string;
  forks?: number;
  score?: number;
}

interface RepoCardProps {
  repo: Repository;
  onClick?: () => void;
  isSelected?: boolean;
  className?: string;
}

export function RepoCard({
  repo,
  onClick,
  isSelected = false,
  className,
}: RepoCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <Card
      onClick={onClick}
      className={cn(
        "glass-card glass-card-hover p-5 cursor-pointer transition-all duration-300",
        isSelected && "border-[#00e5ff]/50 bg-[#00e5ff]/5",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate text-lg">
            {repo.name}
          </h3>
          <p className="text-sm text-slate-400">{repo.owner}</p>
        </div>
        {repo.score !== undefined && (
          <Badge
            variant="secondary"
            className={cn(
              "ml-2 font-mono",
              repo.score >= 8 && "bg-[#00e5ff]/20 text-[#00e5ff]",
              repo.score >= 6 &&
                repo.score < 8 &&
                "bg-[#7c3aed]/20 text-[#7c3aed]",
              repo.score < 6 && "bg-yellow-500/20 text-yellow-500"
            )}
          >
            {repo.score}/10
          </Badge>
        )}
      </div>

      {/* Description */}
      <p className="text-slate-300 text-sm mb-4 line-clamp-2">
        {repo.description || "No description available"}
      </p>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-slate-400">
        <div className="flex items-center gap-1.5">
          <Star className="w-4 h-4 text-yellow-500" />
          <span>{formatNumber(repo.stars)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Code2 className="w-4 h-4 text-[#00e5ff]" />
          <span>{repo.language}</span>
        </div>

        {repo.forks !== undefined && (
          <div className="flex items-center gap-1.5">
            <GitBranch className="w-4 h-4 text-[#7c3aed]" />
            <span>{formatNumber(repo.forks)}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 ml-auto">
          <Clock className="w-4 h-4 text-slate-500" />
          <span className="text-xs">{formatDate(repo.lastUpdated)}</span>
        </div>
      </div>
    </Card>
  );
}

/**
 * RepoCardSkeleton
 * 
 * Loading state for RepoCard
 */
export function RepoCardSkeleton() {
  return (
    <Card className="glass-card p-5">
      <div className="space-y-4">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="h-5 w-32 bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-20 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="h-6 w-12 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="flex gap-4">
          <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
          <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
          <div className="h-4 w-20 bg-white/5 rounded animate-pulse ml-auto" />
        </div>
      </div>
    </Card>
  );
}
