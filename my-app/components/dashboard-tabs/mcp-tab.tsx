/**
 * McpTab Component
 * 
 * Dashboard MCP tab content:
 * - Generated JSON config in code block
 * - Copy button
 * - Setup instructions
 * - Model Context Protocol configuration
 */

"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/code-block";
import { Badge } from "@/components/ui/badge";
import {
  Terminal,
  Copy,
  Download,
  RefreshCw,
  Check,
  AlertCircle,
  Server,
  Cpu,
  Settings,
} from "lucide-react";
import { useState } from "react";

// Mock MCP configuration
const mcpConfig = {
  name: "RepoLens MCP Server",
  version: "1.0.0",
  description: "Model Context Protocol server for repository analysis",
  server: {
    port: 3001,
    host: "localhost",
    cors: {
      origins: ["http://localhost:3000"],
      methods: ["GET", "POST"],
    },
  },
  capabilities: {
    tools: [
      {
        name: "analyze_repository",
        description: "Analyze a GitHub repository",
        parameters: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "GitHub repository URL",
            },
            depth: {
              type: "string",
              enum: ["basic", "detailed", "comprehensive"],
              default: "detailed",
            },
          },
          required: ["url"],
        },
      },
      {
        name: "generate_diagram",
        description: "Generate architecture diagram",
        parameters: {
          type: "object",
          properties: {
            repoUrl: {
              type: "string",
              description: "Repository URL",
            },
            type: {
              type: "string",
              enum: ["architecture", "workflow", "dataflow"],
              default: "architecture",
            },
          },
          required: ["repoUrl"],
        },
      },
      {
        name: "chat_with_repo",
        description: "Ask questions about the repository",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "User question",
            },
            context: {
              type: "string",
              description: "Additional context",
            },
          },
          required: ["query"],
        },
      },
    ],
    resources: [
      {
        name: "repository_info",
        description: "Basic repository information",
        template: "repo://{owner}/{name}/info",
      },
      {
        name: "file_content",
        description: "Repository file content",
        template: "repo://{owner}/{name}/file/{path}",
      },
    ],
  },
  ai: {
    provider: "gemini",
    model: "gemini-1.5-pro",
    temperature: 0.7,
    maxTokens: 4096,
  },
  features: {
    streaming: true,
    caching: true,
    rateLimit: {
      requestsPerMinute: 60,
      burstSize: 10,
    },
  },
};

const mcpConfigString = JSON.stringify(mcpConfig, null, 2);

export function McpTab() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(mcpConfigString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([mcpConfigString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mcp-config.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Info Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass-card p-6 border-l-4 border-[#7c3aed]">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-[#7c3aed]/10">
              <Server className="w-6 h-6 text-[#7c3aed]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold text-white">
                  Model Context Protocol (MCP)
                </h3>
                <Badge
                  variant="secondary"
                  className="bg-[#00e5ff]/10 text-[#00e5ff]"
                >
                  v1.0.0
                </Badge>
              </div>
              <p className="text-slate-400 max-w-2xl">
                MCP enables AI assistants to interact with your repository
                analysis tools. This configuration file defines the available
                tools, resources, and capabilities.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Configuration Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Config Display */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#00e5ff]" />
                <span className="text-sm font-mono text-slate-400">
                  mcp-config.json
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-8 text-slate-400 hover:text-[#00e5ff] hover:bg-[#00e5ff]/10"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="h-8 text-slate-400 hover:text-[#00e5ff] hover:bg-[#00e5ff]/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>

            {/* Code */}
            <div className="p-0">
              <CodeBlock
                code={mcpConfigString}
                language="json"
                className="border-0 rounded-none"
              />
            </div>
          </Card>
        </motion.div>

        {/* Setup Instructions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {/* Setup Steps */}
          <Card className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-[#00e5ff]" />
              <h4 className="font-semibold">Setup Instructions</h4>
            </div>

            <div className="space-y-4">
              <Step
                number={1}
                title="Install MCP CLI"
                description="npm install -g @modelcontextprotocol/cli"
              />
              <Step
                number={2}
                title="Save Config File"
                description="Download and save the configuration to your project root"
              />
              <Step
                number={3}
                title="Start MCP Server"
                description="mcp start --config mcp-config.json"
              />
              <Step
                number={4}
                title="Connect Client"
                description="Configure your AI client to use the MCP server endpoint"
              />
            </div>
          </Card>

          {/* Capabilities */}
          <Card className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-5 h-5 text-[#7c3aed]" />
              <h4 className="font-semibold">Available Tools</h4>
            </div>

            <div className="space-y-2">
              {mcpConfig.capabilities.tools.map((tool) => (
                <div
                  key={tool.name}
                  className="flex items-center gap-2 p-2 rounded bg-white/[0.03]"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00e5ff]" />
                  <span className="text-sm font-mono text-[#00e5ff]">
                    {tool.name}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Note */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-400">
              Ensure your AI client supports MCP protocol version 1.0 or higher
              for full compatibility.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#00e5ff]/10 text-[#00e5ff] text-xs flex items-center justify-center font-mono">
        {number}
      </div>
      <div>
        <h5 className="text-sm font-medium text-white">{title}</h5>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
    </div>
  );
}
