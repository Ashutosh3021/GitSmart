"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  BarChart3,
  GitGraph,
  FileText,
  MessageSquare,
  Rocket,
  Server,
  Shield,
  Github,
  ArrowRight,
  Search,
  Zap,
  Brain,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/shared/navbar";

const features = [
  {
    icon: Brain,
    title: "AI Explanation",
    description: "Get intelligent summaries of any codebase architecture and logic",
  },
  {
    icon: BarChart3,
    title: "Score /10",
    description: "Comprehensive analysis across 6 dimensions with detailed breakdowns",
  },
  {
    icon: GitGraph,
    title: "Mermaid Diagrams",
    description: "Auto-generated architecture and workflow visualizations",
  },
  {
    icon: FileText,
    title: "README Generator",
    description: "Create professional READMEs with live preview and one-click push",
  },
  {
    icon: MessageSquare,
    title: "Chat with Repo",
    description: "Ask questions about the codebase with contextual AI responses",
  },
  {
    icon: Rocket,
    title: "Deploy Guide",
    description: "Step-by-step deployment instructions for any platform",
  },
  {
    icon: Server,
    title: "MCP Server",
    description: "Generate Model Context Protocol configurations instantly",
  },
  {
    icon: Shield,
    title: "Security Audit",
    description: "Identify vulnerabilities and security best practices",
  },
];

const steps = [
  { step: 1, title: "Paste URL", description: "Enter any GitHub repo link" },
  { step: 2, title: "AI Analysis", description: "We scan and analyze the code" },
  { step: 3, title: "Get Score", description: "See the overall quality rating" },
  { step: 4, title: "View Diagrams", description: "Explore architecture visually" },
  { step: 5, title: "Chat & Learn", description: "Ask questions interactively" },
  { step: 6, title: "Deploy", description: "Get deployment instructions" },
];

export default function LandingPage() {
  const [repoUrl, setRepoUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const router = useRouter();

  const handleAnalyze = async () => {
    if (!repoUrl.trim()) return;
    
    setIsAnalyzing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Navigate to dashboard with the repo URL
    const encodedUrl = encodeURIComponent(repoUrl);
    router.push(`/dashboard?repo=${encodedUrl}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] grid-bg">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <Badge
            variant="outline"
            className="mb-6 px-4 py-1.5 bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Powered by Advanced AI
          </Badge>
          
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-7xl font-bold mb-6">
            <span className="text-gradient">Understand Any Repo,</span>
            <br />
            <span className="text-slate-100">Instantly</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            AI-powered analysis, visualization, and documentation for any GitHub repository. 
            Get insights in seconds, not hours.
          </p>

          {/* URL Input */}
          <Card className="max-w-2xl mx-auto p-2 bg-glass glow-border">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center px-4 bg-[#0d0d14] rounded-lg border border-[#1f1f2e]">
                <span className="text-slate-500 font-mono text-sm">github.com/</span>
                <Input
                  type="text"
                  placeholder="owner/repository"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                  className="border-0 bg-transparent text-slate-200 placeholder:text-slate-600 focus-visible:ring-0 focus-visible:ring-offset-0 font-mono"
                />
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !repoUrl.trim()}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white border-0 px-8 h-12"
              >
                {isAnalyzing ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-pulse" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* GitHub OAuth */}
          <div className="mt-6">
            <Button
              variant="outline"
              className="border-[#2d2d44] text-slate-300 hover:bg-[#1f1f2e] hover:text-slate-100"
            >
              <Github className="w-4 h-4 mr-2" />
              Sign in with GitHub for private repos
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-100 mb-4">
              Everything You Need
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Comprehensive toolkit for understanding, analyzing, and documenting repositories
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 bg-glass hover-lift group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 flex items-center justify-center mb-4 group-hover:from-cyan-500/30 group-hover:to-purple-600/30 transition-all">
                  <feature.icon className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-slate-200 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0d0d14]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-100 mb-4">
              How It Works
            </h2>
            <p className="text-slate-400">
              From URL to insights in 6 simple steps
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {steps.map((item, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/20">
                    <span className="font-bold text-white text-xl">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-200 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-7 left-full w-full h-0.5 bg-gradient-to-r from-cyan-500/50 to-purple-600/50 -translate-x-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="p-12 bg-gradient-to-br from-cyan-500/10 via-purple-600/10 to-[#0a0a0f] border-[#2d2d44]">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-100 mb-4">
              Ready to analyze your first repo?
            </h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              Join thousands of developers who use RepoLens to understand codebases faster
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white border-0 px-8"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[#1f1f2e]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-cyan-400" />
            <span className="font-heading font-bold text-slate-200">
              RepoLens
            </span>
          </div>
          <p className="text-sm text-slate-500">
            © 2025 RepoLens. Built for developers.
          </p>
        </div>
      </footer>
    </div>
  );
}
