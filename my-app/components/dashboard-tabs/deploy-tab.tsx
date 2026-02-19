/**
 * DeployTab Component
 * 
 * Dashboard Deploy tab content:
 * - Two columns: Free vs Paid
 * - Step-by-step deployment cards per platform
 * - Platform-specific instructions
 */

"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/code-block";
import {
  Cloud,
  Rocket,
  DollarSign,
  Check,
  ExternalLink,
  Server,
  Globe,
  Zap,
  Cpu,
  Shield,
} from "lucide-react";

interface DeployPlatform {
  name: string;
  icon: React.ElementType;
  description: string;
  difficulty: "Easy" | "Medium" | "Advanced";
  steps: string[];
  features: string[];
  estimatedTime: string;
  pricing: string;
}

const freePlatforms: DeployPlatform[] = [
  {
    name: "Vercel",
    icon: Zap,
    description: "Best for Next.js applications with zero configuration",
    difficulty: "Easy",
    estimatedTime: "2 minutes",
    pricing: "Free tier available",
    steps: [
      "Connect your GitHub repository to Vercel",
      "Import your project",
      "Vercel auto-detects Next.js settings",
      "Deploy with one click",
      "Get your production URL instantly",
    ],
    features: [
      "Automatic HTTPS",
      "Global CDN",
      "Preview deployments",
      "Serverless functions",
    ],
  },
  {
    name: "Netlify",
    icon: Globe,
    description: "Popular platform with generous free tier",
    difficulty: "Easy",
    estimatedTime: "3 minutes",
    pricing: "Free tier available",
    steps: [
      "Sign up for Netlify account",
      "Connect to GitHub",
      "Select your repository",
      "Configure build settings (npm run build)",
      "Deploy site",
    ],
    features: [
      "Form handling",
      "Edge functions",
      "Split testing",
      "Analytics",
    ],
  },
  {
    name: "GitHub Pages",
    icon: Server,
    description: "Free hosting directly from your GitHub repository",
    difficulty: "Medium",
    estimatedTime: "10 minutes",
    pricing: "Always free",
    steps: [
      "Enable GitHub Pages in repository settings",
      "Select source branch (main or gh-pages)",
      "Add GitHub Actions workflow",
      "Configure build and deploy",
      "Access your site at username.github.io/repo",
    ],
    features: [
      "GitHub integration",
      "Custom domains",
      "Jekyll support",
      "Built-in CI/CD",
    ],
  },
];

const paidPlatforms: DeployPlatform[] = [
  {
    name: "AWS Amplify",
    icon: Cloud,
    description: "Enterprise-grade hosting with AWS infrastructure",
    difficulty: "Medium",
    estimatedTime: "5 minutes",
    pricing: "Pay as you go",
    steps: [
      "Create AWS account",
      "Open Amplify Console",
      "Connect GitHub repository",
      "Configure build settings",
      "Deploy and configure domain",
    ],
    features: [
      "CI/CD pipeline",
      "Auth integration",
      "API gateway",
      "Scalable hosting",
    ],
  },
  {
    name: "Railway",
    icon: Cpu,
    description: "Modern platform for full-stack applications",
    difficulty: "Easy",
    estimatedTime: "3 minutes",
    pricing: "From $5/month",
    steps: [
      "Create Railway account",
      "Start new project",
      "Deploy from GitHub",
      "Configure environment variables",
      "Add custom domain",
    ],
    features: [
      "Automatic scaling",
      "Database hosting",
      "Environment variables",
      "Team collaboration",
    ],
  },
  {
    name: "DigitalOcean App Platform",
    icon: Shield,
    description: "Developer-friendly platform with predictable pricing",
    difficulty: "Medium",
    estimatedTime: "5 minutes",
    pricing: "From $5/month",
    steps: [
      "Create DigitalOcean account",
      "Navigate to App Platform",
      "Create new app from source",
      "Select GitHub repository",
      "Configure and deploy",
    ],
    features: [
      "Databases included",
      "Auto-deploy from Git",
      "Vertical scaling",
      "Global CDN",
    ],
  },
];

export function DeployTab() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-lg p-6 border-l-4 border-[#00e5ff]">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-[#00e5ff]/10">
            <Rocket className="w-6 h-6 text-[#00e5ff]" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Deployment Guide
            </h3>
            <p className="text-slate-400 max-w-2xl">
              Choose the deployment platform that best fits your needs. We&apos;ve
              curated the most popular options with step-by-step instructions.
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Free Tier */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-white/[0.08]">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Check className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Free Tier</h3>
              <p className="text-sm text-slate-400">Best for side projects</p>
            </div>
          </div>

          <div className="space-y-4">
            {freePlatforms.map((platform, index) => (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <DeployCard platform={platform} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Paid Tier */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-white/[0.08]">
            <div className="p-2 rounded-lg bg-[#7c3aed]/10">
              <DollarSign className="w-5 h-5 text-[#7c3aed]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Paid Tier</h3>
              <p className="text-sm text-slate-400">
                For production applications
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {paidPlatforms.map((platform, index) => (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }}
              >
                <DeployCard platform={platform} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DeployCard({ platform }: { platform: DeployPlatform }) {
  const Icon = platform.icon;

  return (
    <Card className="glass-card p-5 hover:border-[#00e5ff]/20 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-white/[0.05]">
            <Icon className="w-5 h-5 text-[#00e5ff]" />
          </div>
          <div>
            <h4 className="font-semibold text-white">{platform.name}</h4>
            <p className="text-sm text-slate-400">{platform.description}</p>
          </div>
        </div>
        <Badge
          variant="secondary"
          className={`
            ${
              platform.difficulty === "Easy"
                ? "bg-green-500/10 text-green-400"
                : platform.difficulty === "Medium"
                ? "bg-yellow-500/10 text-yellow-400"
                : "bg-red-500/10 text-red-400"
            }
          `}
        >
          {platform.difficulty}
        </Badge>
      </div>

      {/* Steps */}
      <div className="space-y-2 mb-4">
        <p className="text-sm font-medium text-slate-300 mb-2">
          Deployment Steps:
        </p>
        {platform.steps.map((step, index) => (
          <div key={index} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#00e5ff]/10 text-[#00e5ff] text-xs flex items-center justify-center font-mono mt-0.5">
              {index + 1}
            </span>
            <span className="text-sm text-slate-400">{step}</span>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="flex flex-wrap gap-2 mb-4">
        {platform.features.map((feature) => (
          <span
            key={feature}
            className="text-xs px-2 py-1 rounded-full bg-white/[0.05] text-slate-400"
          >
            {feature}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span>⏱️ {platform.estimatedTime}</span>
          <span>💰 {platform.pricing}</span>
        </div>
        <Button
          size="sm"
          className="bg-[#00e5ff] hover:bg-[#00b8d4] text-[#0a0a0f]"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Deploy Now
        </Button>
      </div>
    </Card>
  );
}
