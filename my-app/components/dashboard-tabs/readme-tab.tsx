/**
 * ReadmeTab Component
 * 
 * Dashboard README tab content:
 * - Split view with markdown editor and preview
 * - Live preview with badges
 * - Push to GitHub button
 * - AI-generated README content
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BadgeStrip } from "@/components/badge-strip";
import {
  Github,
  Save,
  RotateCcw,
  Sparkles,
  Eye,
  Edit3,
  Check,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

// Mock generated README content
const defaultReadme = `# RepoLens

[![build](https://img.shields.io/badge/build-passing-00e5ff)](https://github.com)
[![version](https://img.shields.io/badge/version-v1.0.0-7c3aed)](https://github.com)
[![license](https://img.shields.io/badge/license-MIT-22c55e)](https://github.com)
[![stars](https://img.shields.io/badge/stars-1.2k-f59e0b)](https://github.com)

> AI-powered GitHub repository analysis tool

## Overview

RepoLens is a modern web application that helps developers understand any GitHub repository instantly. Using advanced AI, it provides comprehensive analysis including code explanations, architecture diagrams, README generation, and deployment guides.

## Features

- **AI Explanation**: Get instant project summaries in natural language
- **Repository Scoring**: Multi-dimensional analysis with /10 scoring
- **Architecture Diagrams**: Auto-generated Mermaid diagrams
- **README Generator**: AI-powered README creation
- **Interactive Chat**: Ask questions about the codebase
- **Deployment Guides**: Platform-specific deployment instructions
- **MCP Server**: Model Context Protocol integration

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui components
- AI integration (Gemini, OpenAI, Claude, Groq)

## Getting Started

\`\`\`bash
# Clone the repository
git clone https://github.com/user/repo-lens.git

# Install dependencies
npm install

# Run development server
npm run dev
\`\`\`

## API Keys

To use RepoLens, you'll need API keys for at least one AI provider:

- Google Gemini
- OpenAI
- Anthropic Claude
- Groq

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by the RepoLens Team`;

export function ReadmeTab() {
  const [content, setContent] = useState(defaultReadme);
  const [isEditing, setIsEditing] = useState(true);
  const [saved, setSaved] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRegenerate = () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={() => setIsEditing(true)}
            className={
              isEditing
                ? "bg-[#00e5ff] hover:bg-[#00b8d4] text-[#0a0a0f]"
                : "border-white/[0.08] hover:bg-white/[0.05]"
            }
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant={!isEditing ? "default" : "outline"}
            size="sm"
            onClick={() => setIsEditing(false)}
            className={
              !isEditing
                ? "bg-[#00e5ff] hover:bg-[#00b8d4] text-[#0a0a0f]"
                : "border-white/[0.08] hover:bg-white/[0.05]"
            }
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="border-[#7c3aed]/30 text-[#7c3aed] hover:bg-[#7c3aed]/10"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Regenerate
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            className="border-white/[0.08] hover:bg-white/[0.05]"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 mr-2 text-green-400" />
                Saved
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save
              </>
            )}
          </Button>

          <Button
            size="sm"
            className="bg-[#00e5ff] hover:bg-[#00b8d4] text-[#0a0a0f]"
          >
            <Github className="w-4 h-4 mr-2" />
            Push to GitHub
          </Button>
        </div>
      </div>

      {/* Split View */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Editor */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className={`${!isEditing ? "hidden lg:block" : ""}`}
        >
          <Card className="glass-card overflow-hidden">
            <div className="px-4 py-2 border-b border-white/[0.08] bg-white/[0.02]">
              <span className="text-sm text-slate-400 font-mono">
                README.md
              </span>
            </div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[500px] border-0 rounded-none bg-transparent resize-none font-mono text-sm leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Write your README here..."
            />
          </Card>
        </motion.div>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={`${isEditing ? "hidden lg:block" : ""}`}
        >
          <Card className="glass-card overflow-hidden">
            <div className="px-4 py-2 border-b border-white/[0.08] bg-white/[0.02]">
              <span className="text-sm text-slate-400">Preview</span>
            </div>
            <div className="p-6 custom-scrollbar overflow-y-auto max-h-[500px]">
              {/* Badges Preview */}
              <div className="mb-6">
                <BadgeStrip />
              </div>

              {/* Markdown Preview */}
              <div className="markdown-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-3xl font-bold text-white mb-4 border-b border-white/[0.08] pb-2">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-semibold text-[#00e5ff] mt-6 mb-3">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-medium text-slate-200 mt-4 mb-2">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-slate-300 mb-4 leading-relaxed">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside mb-4 text-slate-300 space-y-1">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside mb-4 text-slate-300 space-y-1">
                        {children}
                      </ol>
                    ),
                    code: ({ children }) => (
                      <code className="bg-[#00e5ff]/10 text-[#00e5ff] px-1.5 py-0.5 rounded font-mono text-sm">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-[#0a0a0f] border border-[#00e5ff]/10 rounded-lg p-4 mb-4 overflow-x-auto">
                        {children}
                      </pre>
                    ),
                    a: ({ children, href }) => (
                      <a
                        href={href}
                        className="text-[#00e5ff] hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-[#7c3aed] pl-4 italic text-slate-400 my-4">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
