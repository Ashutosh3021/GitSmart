"use client";

import { Github, Star, GitFork } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface RepoCardProps {
  name: string;
  owner: string;
  description?: string;
  stars: number;
  forks: number;
  language?: string;
  languageColor?: string;
  lastUpdated: string;
  className?: string;
}

export function RepoCard({
  name,
  owner,
  description,
  stars,
  forks,
  language,
  languageColor = "#00e5ff",
  lastUpdated,
  className = "",
}: RepoCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  return (
    <Card className={`p-4 bg-glass hover-lift cursor-pointer group ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center flex-shrink-0 group-hover:from-cyan-500/20 group-hover:to-purple-600/20 transition-all">
          <Github className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm text-slate-400">{owner}/</span>
            <span className="font-semibold text-slate-200 truncate">{name}</span>
          </div>
          
          {description && (
            <p className="text-sm text-slate-500 mt-1 line-clamp-2">
              {description}
            </p>
          )}
          
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            {language && (
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: languageColor }}
                />
                <span className="text-xs text-slate-400">{language}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1 text-slate-400">
              <Star className="w-3.5 h-3.5" />
              <span className="text-xs">{formatNumber(stars)}</span>
            </div>
            
            <div className="flex items-center gap-1 text-slate-400">
              <GitFork className="w-3.5 h-3.5" />
              <span className="text-xs">{formatNumber(forks)}</span>
            </div>
            
            <span className="text-xs text-slate-500 ml-auto">
              Updated {lastUpdated}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
