/**
 * Landing Page
 * 
 * Main landing page with:
 * - Hero section with animated tagline
 * - URL input bar with GitHub prefix
 * - Feature cards grid
 * - How it works section (6 steps)
 * - GitHub OAuth CTA
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
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
  Zap,
  ChevronRight,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Explanation",
    description: "Get instant, natural language explanations of any codebase",
    color: "#00e5ff",
  },
  {
    icon: BarChart3,
    title: "Score /10",
    description: "Multi-dimensional repository scoring across 6 key areas",
    color: "#7c3aed",
  },
  {
    icon: GitGraph,
    title: "Mermaid Diagrams",
    description: "Auto-generated architecture and workflow visualizations",
    color: "#22c55e",
  },
  {
    icon: FileText,
    title: "README Generator",
    description: "AI-powered README creation with live markdown preview",
    color: "#f59e0b",
  },
  {
    icon: MessageSquare,
    title: "Chat with Repo",
    description: "Ask questions and get contextual answers about the code",
    color: "#ec4899",
  },
  {
    icon: Rocket,
    title: "Deploy Guide",
    description: "Step-by-step deployment instructions for any platform",
    color: "#38bdf8",
  },
  {
    icon: Server,
    title: "MCP Server",
    description: "Model Context Protocol integration for AI assistants",
    color: "#a855f7",
  },
  {
    icon: Shield,
    title: "Security Audit",
    description: "Automated security analysis and vulnerability detection",
    color: "#ef4444",
  },
];

const steps = [
  {
    number: "01",
    title: "Paste URL",
    description: "Enter any GitHub repository URL",
  },
  {
    number: "02",
    title: "AI Analysis",
    description: "Our AI analyzes the codebase instantly",
  },
  {
    number: "03",
    title: "Get Score",
    description: "See overall score and breakdown",
  },
  {
    number: "04",
    title: "Explore",
    description: "Browse diagrams and explanations",
  },
  {
    number: "05",
    title: "Chat",
    description: "Ask questions about the code",
  },
  {
    number: "06",
    title: "Deploy",
    description: "Follow deployment guides",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!repoUrl.trim()) return;

    let fullUrl = repoUrl.trim();
    if (!fullUrl.startsWith("http")) {
      fullUrl = `https://github.com/${fullUrl}`;
    }

    setIsAnalyzing(true);
    setError("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: fullUrl,
          provider: "gemini",
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "Failed to analyze repository");
        setIsAnalyzing(false);
        return;
      }

      sessionStorage.setItem("repoData", JSON.stringify(result.data));
      router.push("/dashboard");
    } catch (err) {
      setError("Failed to analyze repository. Please try again.");
      setIsAnalyzing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAnalyze();
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00e5ff]/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-[#7c3aed]/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge
              variant="secondary"
              className="mb-6 bg-[#00e5ff]/10 text-[#00e5ff] border-[#00e5ff]/20 hover:bg-[#00e5ff]/20"
            >
              <Zap className="w-3 h-3 mr-1" />
              Powered by AI
            </Badge>
          </motion.div>

          {/* Tagline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
          >
            <span className="text-white">Understand Any </span>
            <span className="gradient-text glow-cyan-text">Repo</span>
            <span className="text-white">, Instantly</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10"
          >
            AI-powered GitHub repository analysis. Get explanations, diagrams,
            scores, and deployment guides in seconds.
          </motion.p>

          {/* URL Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-xl mx-auto"
          >
            <div className="glass-card rounded-2xl p-2 glow-cyan-sm">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 text-slate-400 font-mono text-sm">
                  <Github className="w-4 h-4" />
                  <span className="hidden sm:inline">github.com/</span>
                </div>
                <Input
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="user/repository"
                  className="flex-1 bg-transparent border-0 text-white placeholder:text-slate-500 focus-visible:ring-0"
                />
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !repoUrl.trim()}
                  className="bg-[#00e5ff] hover:bg-[#00b8d4] text-[#0a0a0f] font-semibold px-6"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#0a0a0f]/30 border-t-[#0a0a0f] rounded-full animate-spin mr-2" />
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
            </div>

            <p className="text-sm text-slate-500 mt-3">
              Try: facebook/react, vercel/next.js, or microsoft/vscode
            </p>
            {error && (
              <p className="text-sm text-red-400 mt-3">{error}</p>
            )}
          </motion.div>

          {/* GitHub OAuth CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8"
          >
            <Button
              variant="outline"
              size="lg"
              className="border-white/[0.08] hover:bg-white/[0.05] text-slate-300"
            >
              <Github className="w-5 h-5 mr-2" />
              Continue with GitHub
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-slate-400">
              Comprehensive repository analysis powered by cutting-edge AI
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="glass-card glass-card-hover h-full p-5 group">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${feature.color}15` }}
                  >
                    <feature.icon
                      className="w-5 h-5"
                      style={{ color: feature.color }}
                    />
                  </div>
                  <h3 className="font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-400">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-slate-400">
              Get comprehensive repository insights in 6 simple steps
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="glass-card p-6 relative overflow-hidden group">
                  {/* Step Number */}
                  <span className="absolute top-4 right-4 text-4xl font-bold text-white/[0.03] font-mono">
                    {step.number}
                  </span>

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-full bg-[#00e5ff]/10 flex items-center justify-center mb-4 group-hover:bg-[#00e5ff]/20 transition-colors">
                      <span className="text-[#00e5ff] font-mono font-bold">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-400">{step.description}</p>
                  </div>

                  {/* Arrow */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20">
                      <ChevronRight className="w-6 h-6 text-[#00e5ff]/30" />
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="glass-card p-8 sm:p-12 text-center relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/5 to-[#7c3aed]/5" />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Analyze Your First Repo?
              </h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                Join thousands of developers using RepoLens to understand
                codebases faster and ship better software.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="bg-[#00e5ff] hover:bg-[#00b8d4] text-[#0a0a0f] font-semibold px-8"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/[0.08] hover:bg-white/[0.05] text-slate-300"
                >
                  <Github className="w-5 h-5 mr-2" />
                  View on GitHub
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-[#00e5ff]" />
            <span className="font-heading font-bold">
              <span className="text-white">Repo</span>
              <span className="text-[#00e5ff]">Lens</span>
            </span>
          </div>
          <p className="text-sm text-slate-500">
            © 2024 RepoLens. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
