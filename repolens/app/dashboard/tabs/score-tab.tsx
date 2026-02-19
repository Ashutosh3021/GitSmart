"use client";

import { Card } from "@/components/ui/card";
import { ScoreDial } from "@/components/shared/score-dial";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

// Mock score data
const scoreData = {
  overall: 8.7,
  breakdown: [
    { dimension: "Code Quality", score: 9.2, description: "Well-structured, follows best practices" },
    { dimension: "Documentation", score: 8.5, description: "Comprehensive README and inline docs" },
    { dimension: "Tests", score: 7.8, description: "Good coverage, could use more integration tests" },
    { dimension: "Activity", score: 9.5, description: "Very active, frequent commits" },
    { dimension: "Dependencies", score: 8.0, description: "Mostly up-to-date, few vulnerabilities" },
    { dimension: "Community", score: 9.0, description: "Large community, good contribution guidelines" },
  ],
};

export function ScoreTab() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Overall Score */}
      <Card className="p-8 bg-glass border-[#2d2d44]">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <ScoreDial score={scoreData.overall} size={220} strokeWidth={16} />
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-heading text-2xl font-bold text-slate-200 mb-2">
              Overall Score
            </h3>
            <p className="text-slate-400 mb-4">
              This repository demonstrates excellent code quality and maintainability.
              It follows modern development practices and has an active community.
            </p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-sm">
                Production Ready
              </span>
              <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-full text-sm">
                Well Maintained
              </span>
              <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-full text-sm">
                Community Favorite
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Score Breakdown */}
      <Card className="p-6 bg-glass border-[#2d2d44]">
        <h3 className="font-heading font-semibold text-lg text-slate-200 mb-6">
          Score Breakdown
        </h3>
        <div className="space-y-6">
          {scoreData.breakdown.map((item, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium text-slate-200">{item.dimension}</p>
                  <p className="text-sm text-slate-500">{item.description}</p>
                </div>
                <span
                  className={`font-bold text-lg ${
                    item.score >= 9
                      ? "text-emerald-400"
                      : item.score >= 7
                      ? "text-cyan-400"
                      : item.score >= 5
                      ? "text-amber-400"
                      : "text-red-400"
                  }`}
                >
                  {item.score}
                </span>
              </div>
              <div className="relative h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
                <div
                  className={`absolute h-full rounded-full transition-all duration-1000 ${
                    item.score >= 9
                      ? "bg-emerald-500"
                      : item.score >= 7
                      ? "bg-cyan-500"
                      : item.score >= 5
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${item.score * 10}%` }}
                />
              </div>
              {index < scoreData.breakdown.length - 1 && (
                <Separator className="mt-6 bg-[#2d2d44]" />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="p-6 bg-glass border-[#2d2d44]">
        <h3 className="font-heading font-semibold text-lg text-slate-200 mb-4">
          Recommendations
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-cyan-400 text-xs">1</span>
            </span>
            <p className="text-slate-300">
              <span className="font-medium text-slate-200">Increase test coverage</span> - 
              Add more integration tests for critical paths
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-cyan-400 text-xs">2</span>
            </span>
            <p className="text-slate-300">
              <span className="font-medium text-slate-200">Update dependencies</span> - 
              3 packages have minor security updates available
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-cyan-400 text-xs">3</span>
            </span>
            <p className="text-slate-300">
              <span className="font-medium text-slate-200">Add API documentation</span> - 
              Consider using OpenAPI/Swagger for API endpoints
            </p>
          </li>
        </ul>
      </Card>
    </div>
  );
}
