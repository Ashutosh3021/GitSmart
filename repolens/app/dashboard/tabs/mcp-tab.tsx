"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/shared/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Server, FileJson, Copy, Check, Terminal } from "lucide-react";
import { useState } from "react";

// Mock MCP configuration
const mcpConfig = {
  mcpServers: {
    "github-repo-analyzer": {
      command: "npx",
      args: ["-y", "@repolens/mcp-server"],
      env: {
        GITHUB_TOKEN: "${GITHUB_TOKEN}",
        OPENAI_API_KEY: "${OPENAI_API_KEY}",
      },
    },
  },
};

const claudeDesktopConfig = `{
  "mcpServers": {
    "repolens": {
      "command": "npx",
      "args": ["-y", "@repolens/mcp-server"],
      "env": {
        "GITHUB_TOKEN": "your-github-token-here",
        "OPENAI_API_KEY": "your-openai-key-here"
      }
    }
  }
}`;

export function McpTab() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(mcpConfig, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading font-semibold text-lg text-slate-200">
            MCP Server Configuration
          </h3>
          <p className="text-sm text-slate-500">
            Model Context Protocol server setup for AI assistants
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleCopy}
          className="border-[#2d2d44] text-slate-300 hover:bg-[#1f1f2e]"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy Config
            </>
          )}
        </Button>
      </div>

      {/* Configuration Display */}
      <Card className="p-6 bg-glass border-[#2d2d44]">
        <Tabs defaultValue="json" className="w-full">
          <TabsList className="bg-[#1a1a2e] mb-4">
            <TabsTrigger
              value="json"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <FileJson className="w-4 h-4 mr-2" />
              JSON Config
            </TabsTrigger>
            <TabsTrigger
              value="claude"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
            >
              <Server className="w-4 h-4 mr-2" />
              Claude Desktop
            </TabsTrigger>
          </TabsList>

          <TabsContent value="json">
            <CodeBlock
              code={JSON.stringify(mcpConfig, null, 2)}
              language="json"
            />
          </TabsContent>

          <TabsContent value="claude">
            <CodeBlock
              code={claudeDesktopConfig}
              language="json"
            />
          </TabsContent>
        </Tabs>
      </Card>

      {/* Setup Instructions */}
      <Card className="p-6 bg-glass border-[#2d2d44]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 flex items-center justify-center">
            <Terminal className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h4 className="font-heading font-semibold text-slate-200">
              Setup Instructions
            </h4>
            <p className="text-sm text-slate-500">
              Get started with MCP in minutes
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-[#1a1a2e] rounded-lg">
            <h5 className="font-medium text-cyan-400 mb-2">1. Install the MCP Server</h5>
            <code className="font-mono text-sm text-slate-300">
              npm install -g @repolens/mcp-server
            </code>
          </div>

          <div className="p-4 bg-[#1a1a2e] rounded-lg">
            <h5 className="font-medium text-cyan-400 mb-2">2. Set Environment Variables</h5>
            <code className="font-mono text-sm text-slate-300 block">
              export GITHUB_TOKEN=ghp_your_token_here
            </code>
            <code className="font-mono text-sm text-slate-300 block mt-1">
              export OPENAI_API_KEY=sk-your_key_here
            </code>
          </div>

          <div className="p-4 bg-[#1a1a2e] rounded-lg">
            <h5 className="font-medium text-cyan-400 mb-2">3. Configure Claude Desktop</h5>
            <p className="text-sm text-slate-400 mb-2">
              Add the configuration to your Claude Desktop config file:
            </p>
            <code className="font-mono text-sm text-slate-300">
              ~/Library/Application Support/Claude/claude_desktop_config.json
            </code>
          </div>

          <div className="p-4 bg-[#1a1a2e] rounded-lg">
            <h5 className="font-medium text-cyan-400 mb-2">4. Restart Claude Desktop</h5>
            <p className="text-sm text-slate-400">
              After updating the configuration, restart Claude Desktop to load the MCP server.
              You'll see a hammer icon in the bottom left when it's ready.
            </p>
          </div>
        </div>
      </Card>

      {/* Available Tools */}
      <Card className="p-6 bg-glass border-[#2d2d44]">
        <h4 className="font-heading font-semibold text-slate-200 mb-4">
          Available MCP Tools
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { name: "analyze_repo", description: "Analyze a GitHub repository" },
            { name: "get_score", description: "Get repository quality score" },
            { name: "generate_diagram", description: "Generate architecture diagrams" },
            { name: "chat_with_repo", description: "Chat about repository code" },
            { name: "generate_readme", description: "Generate README content" },
            { name: "security_audit", description: "Run security audit" },
          ].map((tool) => (
            <div
              key={tool.name}
              className="p-3 bg-[#1a1a2e] rounded-lg border border-[#2d2d44]"
            >
              <code className="font-mono text-sm text-cyan-400">{tool.name}</code>
              <p className="text-sm text-slate-500 mt-1">{tool.description}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
