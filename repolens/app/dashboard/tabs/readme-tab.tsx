"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BadgeStrip } from "@/components/shared/badge-strip";
import { Github, Eye, Upload, RefreshCw } from "lucide-react";

// Mock README content
const defaultReadme = `# Next.js

<p align="center">
  <a href="https://nextjs.org">
    <img src="https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_light_background.png" height="128">
    <h1 align="center">Next.js</h1>
  </a>
</p>

<p align="center">
  <a aria-label="Vercel logo" href="https://vercel.com">
    <img src="https://img.shields.io/badge/MADE%20BY%20Vercel-000000.svg?style=for-the-badge&logo=Vercel&labelColor=000">
  </a>
  <a aria-label="NPM version" href="https://www.npmjs.com/package/next">
    <img alt="" src="https://img.shields.io/npm/v/next.svg?style=for-the-badge&label=NPM&logo=npm&labelColor=000&color=C12127">
  </a>
  <a aria-label="License" href="https://github.com/vercel/next.js/blob/canary/license.md">
    <img alt="" src="https://img.shields.io/npm/l/next.svg?style=for-the-badge&labelColor=000000&color=C12127">
  </a>
</p>

## Getting Started

Visit <a aria-label="next.js learn" href="https://nextjs.org/learn">https://nextjs.org/learn</a> to get started with Next.js.

## Documentation

Visit [**https://nextjs.org/docs**](https://nextjs.org/docs) to view the full documentation.

## Contributing

Please see our [contributing.md](/contributing.md).

## Authors

- Tim Neutkens ([@timneutkens](https://twitter.com/timneutkens))
- Naoyuki Kanezawa ([@nkzawa](https://twitter.com/nkzawa))
- Guillermo Rauch ([@rauchg](https://twitter.com/rauchg))
- Arunoda Susiripala ([@arunoda](https://twitter.com/arunoda))
- Tony Kovanen ([@tonykovanen](https://twitter.com/tonykovanen))
- Dan Zajdband ([@impronunciable](https://twitter.com/impronunciable))

## Security

If you believe you have found a security vulnerability in Next.js, we encourage you to responsibly disclose this and not open a public issue. We will investigate all legitimate reports.

Email: **security@vercel.com**

---

<a aria-label="Vercel" href="https://vercel.com">
  <img src="https://badgen.net/badge/powered%20by/Vercel/black?icon=vercel">
</a>`;

const mockBadges = [
  "https://img.shields.io/badge/MADE%20BY%20Vercel-000000.svg?style=for-the-badge&logo=Vercel&labelColor=000",
  "https://img.shields.io/npm/v/next.svg?style=for-the-badge&label=NPM&logo=npm&labelColor=000&color=C12127",
  "https://img.shields.io/npm/l/next.svg?style=for-the-badge&labelColor=000000&color=C12127",
];

export function ReadmeTab() {
  const [markdown, setMarkdown] = useState(defaultReadme);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  const handlePushToGitHub = () => {
    // Mock push functionality
    alert("README would be pushed to GitHub (mock functionality)");
  };

  return (
    <div className="space-y-6 h-[calc(100vh-220px)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading font-semibold text-lg text-slate-200">
            README Generator
          </h3>
          <p className="text-sm text-slate-500">
            Edit and preview your README before pushing to GitHub
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="border-[#2d2d44] text-slate-300 hover:bg-[#1f1f2e]"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Regenerate
          </Button>
          <Button
            onClick={handlePushToGitHub}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white"
          >
            <Upload className="w-4 h-4 mr-2" />
            Push to GitHub
          </Button>
        </div>
      </div>

      {/* Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* Editor */}
        <Card className="flex flex-col bg-glass border-[#2d2d44] overflow-hidden">
          <div className="px-4 py-2 bg-[#1a1a2e] border-b border-[#2d2d44] flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500">README.md</span>
          </div>
          <Textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="flex-1 resize-none border-0 bg-transparent font-mono text-sm text-slate-300 focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Enter your README content here..."
          />
        </Card>

        {/* Preview */}
        <Card className="flex flex-col bg-glass border-[#2d2d44] overflow-hidden">
          <div className="px-4 py-2 bg-[#1a1a2e] border-b border-[#2d2d44] flex items-center gap-2">
            <Eye className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-mono text-slate-500">Preview</span>
          </div>
          <div className="flex-1 overflow-auto p-6">
            <div className="prose prose-invert prose-sm max-w-none">
              {/* Rendered Markdown Preview */}
              <div className="markdown-preview">
                <h1 className="text-3xl font-bold text-slate-100 mb-4">
                  Next.js
                </h1>
                
                {/* Badges Preview */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {mockBadges.map((badge, index) => (
                    <img key={index} src={badge} alt="badge" className="h-6" />
                  ))}
                </div>

                <h2 className="text-xl font-semibold text-slate-200 mt-6 mb-3">
                  Getting Started
                </h2>
                <p className="text-slate-300 mb-4">
                  Visit <a href="https://nextjs.org/learn" className="text-cyan-400 hover:underline">https://nextjs.org/learn</a> to get started with Next.js.
                </p>

                <h2 className="text-xl font-semibold text-slate-200 mt-6 mb-3">
                  Documentation
                </h2>
                <p className="text-slate-300 mb-4">
                  Visit <a href="https://nextjs.org/docs" className="text-cyan-400 hover:underline">https://nextjs.org/docs</a> to view the full documentation.
                </p>

                <h2 className="text-xl font-semibold text-slate-200 mt-6 mb-3">
                  Contributing
                </h2>
                <p className="text-slate-300 mb-4">
                  Please see our contributing.md
                </p>

                <h2 className="text-xl font-semibold text-slate-200 mt-6 mb-3">
                  Security
                </h2>
                <p className="text-slate-300 mb-4">
                  If you believe you have found a security vulnerability in Next.js, 
                  we encourage you to responsibly disclose this and not open a public issue.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
