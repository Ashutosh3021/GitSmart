"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export function CodeBlock({
  code,
  language = "text",
  showLineNumbers = true,
  className = "",
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split("\n");

  return (
    <div className={`relative group ${className}`}>
      {/* Header with language and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a2e] border-b border-[#2d2d44] rounded-t-lg">
        <span className="text-xs font-mono text-slate-400 uppercase">
          {language}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 px-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 mr-1" />
              <span className="text-xs">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 mr-1" />
              <span className="text-xs">Copy</span>
            </>
          )}
        </Button>
      </div>

      {/* Code content */}
      <div className="relative bg-[#0d0d14] rounded-b-lg overflow-x-auto">
        <pre className="p-4 text-sm font-mono leading-relaxed">
          <code>
            {lines.map((line, index) => (
              <div key={index} className="table-row">
                {showLineNumbers && (
                  <span className="table-cell text-right pr-4 text-slate-600 select-none w-12">
                    {index + 1}
                  </span>
                )}
                <span className="table-cell text-slate-300 whitespace-pre">
                  {line || " "}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
