"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Package, Layers } from "lucide-react";

interface OverviewTabProps {
  repoData: {
    name: string;
    owner: string;
    description: string;
    language: string;
  };
}

// Mock AI-generated explanation
const mockExplanation = `
Next.js is a powerful React framework that enables developers to build full-stack web applications with ease. 

**Key Architecture Components:**

1. **App Router**: A modern file-system based router built on React Server Components that supports layouts, nested routing, loading states, and error handling.

2. **Server Components**: React components that render exclusively on the server, reducing the JavaScript bundle size sent to the client.

3. **Data Fetching**: Flexible data fetching patterns including async/await in Server Components, and the fetch() API with caching controls.

4. **Rendering Strategies**: Supports Static Site Generation (SSG), Server-Side Rendering (SSR), and Client-Side Rendering (CSR) with incremental static regeneration.

5. **API Routes**: Built-in API route support for creating backend endpoints within the same project.

**Project Structure:**
- \`app/\`: Contains the main application using the App Router
- \`pages/\`: Legacy Pages Router (still supported)
- \`public/\`: Static assets
- \`components/\`: Reusable React components

This is a mature, production-ready framework used by companies like Netflix, TikTok, and Hulu.
`;

// Mock dependency data
const mockDependencies = [
  { name: "react", version: "^18.2.0", type: "production" },
  { name: "react-dom", version: "^18.2.0", type: "production" },
  { name: "typescript", version: "^5.0.0", type: "dev" },
  { name: "@types/node", version: "^20.0.0", type: "dev" },
  { name: "eslint", version: "^8.0.0", type: "dev" },
  { name: "prettier", version: "^3.0.0", type: "dev" },
  { name: "tailwindcss", version: "^3.3.0", type: "dev" },
  { name: "jest", version: "^29.0.0", type: "dev" },
];

export function OverviewTab({ repoData }: OverviewTabProps) {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* AI Explanation Card */}
      <Card className="p-6 bg-glass border-[#2d2d44]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-lg text-slate-200">
              AI-Generated Explanation
            </h3>
            <p className="text-sm text-slate-500">
              Powered by advanced language models
            </p>
          </div>
        </div>
        <div className="prose prose-invert prose-sm max-w-none">
          <div className="text-slate-300 leading-relaxed whitespace-pre-line">
            {mockExplanation}
          </div>
        </div>
      </Card>

      {/* Dependencies Section */}
      <Card className="p-6 bg-glass border-[#2d2d44]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center">
            <Package className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-lg text-slate-200">
              Dependency Overview
            </h3>
            <p className="text-sm text-slate-500">
              Key dependencies and their versions
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {mockDependencies.map((dep) => (
            <div
              key={dep.name}
              className="flex items-center justify-between p-3 bg-[#1a1a2e] rounded-lg"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-slate-300">
                  {dep.name}
                </span>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    dep.type === "production"
                      ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                      : "bg-purple-500/10 border-purple-500/30 text-purple-400"
                  }`}
                >
                  {dep.type}
                </Badge>
              </div>
              <span className="font-mono text-sm text-slate-500">
                {dep.version}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Tech Stack */}
      <Card className="p-6 bg-glass border-[#2d2d44]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
            <Layers className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-lg text-slate-200">
              Tech Stack
            </h3>
            <p className="text-sm text-slate-500">
              Technologies used in this project
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {["React", "TypeScript", "Node.js", "Webpack", "Babel", "ESLint", "Jest", "Tailwind CSS"].map(
            (tech) => (
              <Badge
                key={tech}
                className="px-3 py-1 bg-[#1a1a2e] text-slate-300 border-[#2d2d44] hover:bg-[#252538] cursor-default"
              >
                {tech}
              </Badge>
            )
          )}
        </div>
      </Card>
    </div>
  );
}
