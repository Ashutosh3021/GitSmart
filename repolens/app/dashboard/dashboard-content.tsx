"use client";

import { useState } from "react";
import {
  Github,
  Star,
  GitFork,
  Clock,
  Users,
  BookOpen,
  BarChart3,
  GitGraph,
  FileText,
  MessageSquare,
  Rocket,
  Server,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Navbar } from "@/components/shared/navbar";
import { OverviewTab } from "./tabs/overview-tab";
import { ScoreTab } from "./tabs/score-tab";
import { DiagramsTab } from "./tabs/diagrams-tab";
import { ReadmeTab } from "./tabs/readme-tab";
import { ChatTab } from "./tabs/chat-tab";
import { DeployTab } from "./tabs/deploy-tab";
import { McpTab } from "./tabs/mcp-tab";

// Mock repository data
const mockRepoData = {
  name: "next.js",
  owner: "vercel",
  description:
    "The React Framework for the Web. Used by some of the world's largest companies, Next.js enables you to create full-stack Web applications.",
  stars: 124532,
  forks: 26543,
  language: "TypeScript",
  languageColor: "#3178c6",
  lastCommit: "2 hours ago",
  contributors: 2847,
  topics: ["react", "framework", "javascript", "typescript", "server-side-rendering"],
};

interface DashboardContentProps {
  repoUrl: string;
}

export default function DashboardContent({ repoUrl }: DashboardContentProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Parse repo from URL or use default
  const parsedRepo = repoUrl || "vercel/next.js";

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />

      <div className="pt-16 flex h-screen overflow-hidden">
        {/* Mobile Sidebar Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-4 right-4 z-50 lg:hidden bg-cyan-500 text-white hover:bg-cyan-600"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>

        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-[#13131f] border-r border-[#1f1f2e] transform transition-transform duration-200 ease-in-out lg:transform-none pt-16 lg:pt-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <ScrollArea className="h-full">
            <div className="p-6">
              {/* Repo Header */}
              <div className="flex items-start gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center flex-shrink-0">
                  <Github className="w-6 h-6 text-slate-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-sm text-slate-500">{mockRepoData.owner}</p>
                  <h2 className="font-heading font-bold text-lg text-slate-200 truncate">
                    {mockRepoData.name}
                  </h2>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-[#1a1a2e] rounded-lg">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Star className="w-4 h-4" />
                    <span className="text-xs">Stars</span>
                  </div>
                  <p className="font-semibold text-slate-200">
                    {(mockRepoData.stars / 1000).toFixed(1)}k
                  </p>
                </div>
                <div className="p-3 bg-[#1a1a2e] rounded-lg">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <GitFork className="w-4 h-4" />
                    <span className="text-xs">Forks</span>
                  </div>
                  <p className="font-semibold text-slate-200">
                    {(mockRepoData.forks / 1000).toFixed(1)}k
                  </p>
                </div>
                <div className="p-3 bg-[#1a1a2e] rounded-lg">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">Last Commit</span>
                  </div>
                  <p className="font-semibold text-slate-200">
                    {mockRepoData.lastCommit}
                  </p>
                </div>
                <div className="p-3 bg-[#1a1a2e] rounded-lg">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-xs">Contributors</span>
                  </div>
                  <p className="font-semibold text-slate-200">
                    {mockRepoData.contributors.toLocaleString()}
                  </p>
                </div>
              </div>

              <Separator className="bg-[#2d2d44] mb-6" />

              {/* Language */}
              <div className="mb-6">
                <p className="text-sm text-slate-500 mb-2">Primary Language</p>
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: mockRepoData.languageColor }}
                  />
                  <span className="text-slate-200">{mockRepoData.language}</span>
                </div>
              </div>

              {/* Topics */}
              <div>
                <p className="text-sm text-slate-500 mb-2">Topics</p>
                <div className="flex flex-wrap gap-1.5">
                  {mockRepoData.topics.map((topic) => (
                    <Badge
                      key={topic}
                      variant="outline"
                      className="bg-[#1a1a2e] border-[#2d2d44] text-slate-400 text-xs"
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col"
          >
            {/* Tab Navigation */}
            <div className="border-b border-[#1f1f2e] bg-[#13131f]/50">
              <ScrollArea className="w-full whitespace-nowrap">
                <TabsList className="h-14 bg-transparent p-0 px-4 justify-start">
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none px-4 py-3 text-slate-400 hover:text-slate-200"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="score"
                    className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none px-4 py-3 text-slate-400 hover:text-slate-200"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Score
                  </TabsTrigger>
                  <TabsTrigger
                    value="diagrams"
                    className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none px-4 py-3 text-slate-400 hover:text-slate-200"
                  >
                    <GitGraph className="w-4 h-4 mr-2" />
                    Diagrams
                  </TabsTrigger>
                  <TabsTrigger
                    value="readme"
                    className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none px-4 py-3 text-slate-400 hover:text-slate-200"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    README
                  </TabsTrigger>
                  <TabsTrigger
                    value="chat"
                    className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none px-4 py-3 text-slate-400 hover:text-slate-200"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger
                    value="deploy"
                    className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none px-4 py-3 text-slate-400 hover:text-slate-200"
                  >
                    <Rocket className="w-4 h-4 mr-2" />
                    Deploy
                  </TabsTrigger>
                  <TabsTrigger
                    value="mcp"
                    className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none px-4 py-3 text-slate-400 hover:text-slate-200"
                  >
                    <Server className="w-4 h-4 mr-2" />
                    MCP
                  </TabsTrigger>
                </TabsList>
              </ScrollArea>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <TabsContent value="overview" className="m-0">
                    <OverviewTab repoData={mockRepoData} />
                  </TabsContent>
                  <TabsContent value="score" className="m-0">
                    <ScoreTab />
                  </TabsContent>
                  <TabsContent value="diagrams" className="m-0">
                    <DiagramsTab />
                  </TabsContent>
                  <TabsContent value="readme" className="m-0">
                    <ReadmeTab />
                  </TabsContent>
                  <TabsContent value="chat" className="m-0">
                    <ChatTab />
                  </TabsContent>
                  <TabsContent value="deploy" className="m-0">
                    <DeployTab />
                  </TabsContent>
                  <TabsContent value="mcp" className="m-0">
                    <McpTab />
                  </TabsContent>
                </div>
              </ScrollArea>
            </div>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
