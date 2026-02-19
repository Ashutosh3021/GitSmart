/**
 * ScoreTab Component
 * 
 * Dashboard Score tab content:
 * - Radial dial showing /10 score
 * - Breakdown bars for each dimension
 * - Detailed scoring criteria
 */

"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ScoreDial, ScoreBar } from "@/components/score-dial";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Code2,
  FileText,
  TestTube,
  Activity,
  Package,
  Users,
  Info,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

// Mock score data
const scoreData = {
  overall: 8.5,
  breakdown: {
    codeQuality: {
      score: 9.0,
      label: "Code Quality",
      description:
        "Code structure, consistency, readability, and adherence to best practices",
      trend: "up",
      details: [
        "Clean architecture patterns",
        "Consistent naming conventions",
        "Good TypeScript coverage (95%)",
        "ESLint rules followed",
      ],
    },
    documentation: {
      score: 7.5,
      label: "Documentation",
      description: "README quality, inline comments, and API documentation",
      trend: "neutral",
      details: [
        "Comprehensive README",
        "Missing some JSDoc comments",
        "Good usage examples",
        "Changelog maintained",
      ],
    },
    testing: {
      score: 8.0,
      label: "Testing",
      description: "Test coverage, test quality, and CI integration",
      trend: "up",
      details: [
        "Unit tests present",
        "85% code coverage",
        "E2E tests configured",
        "CI/CD pipeline",
      ],
    },
    activity: {
      score: 9.5,
      label: "Activity",
      description: "Commit frequency, issue resolution, and maintenance",
      trend: "up",
      details: [
        "Daily commits",
        "Quick issue resolution",
        "Active maintenance",
        "Regular releases",
      ],
    },
    dependencies: {
      score: 8.5,
      label: "Dependencies",
      description: "Dependency health, update frequency, and security",
      trend: "neutral",
      details: [
        "Mostly up-to-date",
        "No security vulnerabilities",
        "Minimal dependency bloat",
        "Good dependency choices",
      ],
    },
    community: {
      score: 7.0,
      label: "Community",
      description: "Contributors, discussions, and adoption metrics",
      trend: "down",
      details: [
        "8 active contributors",
        "Growing star count",
        "Active discussions",
        "Good first issues labeled",
      ],
    },
  },
  history: [
    { date: "2024-01", score: 7.5 },
    { date: "2024-02", score: 7.8 },
    { date: "2024-03", score: 8.0 },
    { date: "2024-04", score: 8.2 },
    { date: "2024-05", score: 8.5 },
  ],
};

export function ScoreTab() {
  return (
    <div className="space-y-6">
      {/* Overall Score Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Score Dial */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass-card p-8 flex flex-col items-center justify-center min-h-[320px]">
            <ScoreDial score={scoreData.overall} size={200} strokeWidth={14} />
            <div className="mt-6 text-center">
              <Badge
                variant="secondary"
                className="bg-[#00e5ff]/10 text-[#00e5ff] border-[#00e5ff]/20"
              >
                Excellent
              </Badge>
              <p className="text-sm text-slate-400 mt-2">
                Based on 6 key dimensions
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Score Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg">Score Breakdown</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-slate-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Scores are calculated based on automated analysis</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="space-y-5">
              {Object.entries(scoreData.breakdown).map(
                ([key, data], index) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <ScoreIcon type={key} />
                        <span className="font-medium text-slate-200">
                          {data.label}
                        </span>
                        <TrendIcon trend={data.trend} />
                      </div>
                      <span className="text-sm text-slate-400">
                        {data.score}/10
                      </span>
                    </div>
                    <ScoreBar label={data.label} score={data.score} maxScore={10} />
                    <p className="text-xs text-slate-500 mt-1">
                      {data.description}
                    </p>
                  </motion.div>
                )
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(scoreData.breakdown).map(([key, data], index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
          >
            <Card className="glass-card p-5 hover:border-[#00e5ff]/20 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ScoreIcon type={key} />
                  <h4 className="font-medium">{data.label}</h4>
                </div>
                <span
                  className={`text-lg font-bold ${
                    data.score >= 8
                      ? "text-[#00e5ff]"
                      : data.score >= 6
                      ? "text-[#7c3aed]"
                      : data.score >= 4
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                >
                  {data.score}
                </span>
              </div>
              <ul className="space-y-1.5">
                {data.details.map((detail, i) => (
                  <li
                    key={i}
                    className="text-sm text-slate-400 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#00e5ff]" />
                    {detail}
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ScoreIcon({ type }: { type: string }) {
  const icons = {
    codeQuality: Code2,
    documentation: FileText,
    testing: TestTube,
    activity: Activity,
    dependencies: Package,
    community: Users,
  };

  const Icon = icons[type as keyof typeof icons] || Code2;
  return <Icon className="w-4 h-4 text-[#00e5ff]" />;
}

function TrendIcon({
  trend,
}: {
  trend: string;
}) {
  const icons = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus,
  };

  const colors = {
    up: "text-green-400",
    down: "text-red-400",
    neutral: "text-slate-400",
  };

  const Icon = icons[trend as keyof typeof icons];
  const colorClass = colors[trend as keyof typeof colors];
  return <Icon className={`w-3.5 h-3.5 ${colorClass}`} />;
}
