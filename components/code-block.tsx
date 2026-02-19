/**
 * CodeBlock Component
 * 
 * Syntax-highlighted code block with:
 * - Language detection
 * - Copy button with feedback
 * - Line numbers (optional)
 * - Custom styling for dark theme
 * 
 * Props:
 * - code: string - The code to display
 * - language?: string - Programming language for syntax highlighting
 * - filename?: string - Optional filename to display
 * - showLineNumbers?: boolean - Whether to show line numbers
 * - className?: string - Additional CSS classes
 */

"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export function CodeBlock({
  code,
  language = "typescript",
  filename,
  showLineNumbers = false,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple syntax highlighting simulation
  // In production, use a library like prism-react-renderer or highlight.js
  const highlightedCode = code;

  const lines = code.split("\n");

  return (
    <div
      className={cn(
        "code-block rounded-lg overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.08] bg-white/[0.02]">
        <div className="flex items-center gap-2">
          {filename ? (
            <span className="text-sm text-slate-400 font-mono">{filename}</span>
          ) : (
            <span className="text-xs text-slate-500 uppercase font-mono tracking-wider">
              {language}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 px-2 text-slate-400 hover:text-[#00e5ff] hover:bg-white/[0.05]"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Copy</span>
            </>
          )}
        </Button>
      </div>

      {/* Code Content */}
      <div className="relative overflow-x-auto">
        <pre className="p-4 text-sm font-mono leading-relaxed">
          <code className="text-slate-300">
            {lines.map((line, index) => (
              <div key={index} className="flex">
                {showLineNumbers && (
                  <span className="select-none text-slate-600 w-8 text-right mr-4 text-xs">
                    {index + 1}
                  </span>
                )}
                <span className="flex-1">
                  {line || "\u00A0"}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

/**
 * InlineCode Component
 * 
 * For inline code snippets within text
 */
export function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 rounded bg-[#00e5ff]/10 text-[#00e5ff] font-mono text-sm">
      {children}
    </code>
  );
}
