/**
 * OverviewTab Component
 * 
 * Dashboard Overview tab content:
 * - AI-generated project explanation
 * - Dependency map visualization
 * - Key repository statistics
 */

"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { CodeBlock } from "@/components/code-block";
import {
  FolderTree,
  Package,
  GitCommit,
  Users,
  FileCode,
  ExternalLink,
} from "lucide-react";

// Mock data - replace with actual API data
const overviewData = {
  explanation: `# Next.js Repository Analyzer

This is a modern web application built with **Next.js 14** and the App Router. The project demonstrates best practices for building scalable React applications.

## Key Features

- **App Router**: Uses the latest Next.js 14 app directory structure
- **Server Components**: Leverages React Server Components for optimal performance
- **TypeScript**: Fully typed codebase for better developer experience
- **Tailwind CSS**: Utility-first styling with custom design system
- **shadcn/ui**: Beautiful, accessible UI components

## Architecture

The application follows a clean architecture pattern with:
- Clear separation of concerns
- Reusable component library
- Type-safe API integration
- Responsive design patterns

## Performance

- Static generation for landing pages
- Dynamic rendering for dashboard
- Optimized images and assets
- Efficient state management`,
  dependencies: {
    total: 42,
    direct: 12,
    dev: 30,
    top: [
      { name: "next", version: "14.0.0" },
      { name: "react", version: "18.2.0" },
      { name: "typescript", version: "5.3.0" },
      { name: "tailwindcss", version: "3.4.0" },
      { name: "@radix-ui/react-slot", version: "1.0.2" },
    ],
  },
  stats: {
    files: 156,
    commits: 234,
    contributors: 8,
    languages: ["TypeScript", "CSS", "JavaScript"],
  },
};

const mockDependencyGraph = `graph TD
    A[App Entry] --> B[Next.js 14]
    A --> C[React 18]
    A --> D[Tailwind CSS]
    B --> E[Server Components]
    B --> F[App Router]
    C --> G[Client Hooks]
    C --> H[Server Rendering]
    D --> I[Custom Config]
    D --> J[Design System]`;

export function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={FileCode}
          label="Files"
          value={overviewData.stats.files}
          color="cyan"
        />
        <StatCard
          icon={GitCommit}
          label="Commits"
          value={overviewData.stats.commits}
          color="purple"
        />
        <StatCard
          icon={Users}
          label="Contributors"
          value={overviewData.stats.contributors}
          color="green"
        />
        <StatCard
          icon={Package}
          label="Dependencies"
          value={overviewData.dependencies.total}
          color="yellow"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Project Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="glass-card p-6 h-full">
            <div className="flex items-center gap-2 mb-4">
              <ExternalLink className="w-5 h-5 text-[#00e5ff]" />
              <h3 className="font-semibold text-lg">AI Explanation</h3>
            </div>
            <div className="markdown-content prose prose-invert prose-sm max-w-none">
              <div
                dangerouslySetInnerHTML={{
                  __html: overviewData.explanation
                    .replace(/# (.*)/, '<h1 class="text-2xl font-bold mb-4 text-white">$1</h1>')
                    .replace(/## (.*)/g, '<h2 class="text-lg font-semibold mt-6 mb-3 text-[#00e5ff]">$1</h2>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#00e5ff]">$1</strong>')
                    .replace(/- (.*)/g, '<li class="ml-4 text-slate-300">$1</li>')
                    .replace(/\n/g, '<br/>')
                }}
              />
            </div>
          </Card>
        </motion.div>

        {/* Dependencies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-6"
        >
          {/* Top Dependencies */}
          <Card className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <FolderTree className="w-5 h-5 text-[#7c3aed]" />
              <h3 className="font-semibold text-lg">Top Dependencies</h3>
            </div>
            <div className="space-y-3">
              {overviewData.dependencies.top.map((dep, index) => (
                <div
                  key={dep.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 font-mono text-sm">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-[#00e5ff]">{dep.name}</span>
                  </div>
                  <span className="text-sm text-slate-400">{dep.version}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Dependency Summary */}
          <Card className="glass-card p-6">
            <h3 className="font-semibold text-lg mb-4">Dependency Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-[#00e5ff]/5 border border-[#00e5ff]/10">
                <div className="text-2xl font-bold text-[#00e5ff]">
                  {overviewData.dependencies.total}
                </div>
                <div className="text-xs text-slate-400 mt-1">Total</div>
              </div>
              <div className="p-4 rounded-lg bg-[#7c3aed]/5 border border-[#7c3aed]/10">
                <div className="text-2xl font-bold text-[#7c3aed]">
                  {overviewData.dependencies.direct}
                </div>
                <div className="text-xs text-slate-400 mt-1">Production</div>
              </div>
              <div className="p-4 rounded-lg bg-white/[0.05] border border-white/[0.08]">
                <div className="text-2xl font-bold text-white">
                  {overviewData.dependencies.dev}
                </div>
                <div className="text-xs text-slate-400 mt-1">Development</div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: "cyan" | "purple" | "green" | "yellow";
}) {
  const colorClasses = {
    cyan: "text-[#00e5ff] bg-[#00e5ff]/10 border-[#00e5ff]/20",
    purple: "text-[#7c3aed] bg-[#7c3aed]/10 border-[#7c3aed]/20",
    green: "text-green-400 bg-green-400/10 border-green-400/20",
    yellow: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`glass-card p-4 text-center border ${colorClasses[color]}`}
      >
        <Icon className="w-5 h-5 mx-auto mb-2 opacity-80" />
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs opacity-70 mt-0.5">{label}</div>
      </Card>
    </motion.div>
  );
}
