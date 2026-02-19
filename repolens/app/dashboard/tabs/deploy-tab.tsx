"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Cloud, 
  Server, 
  Container, 
  Globe, 
  Check, 
  ArrowRight,
  Zap,
  DollarSign
} from "lucide-react";

interface Platform {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  difficulty: "Easy" | "Medium" | "Advanced";
  estimatedTime: string;
  steps: string[];
}

const freePlatforms: Platform[] = [
  {
    id: "vercel",
    name: "Vercel",
    icon: Zap,
    description: "Zero-config deployment for Next.js apps",
    difficulty: "Easy",
    estimatedTime: "2 minutes",
    steps: [
      "Connect your GitHub repository to Vercel",
      "Import the project and select the repository",
      "Vercel auto-detects Next.js and configures build settings",
      "Deploy with a single click",
      "Get your production URL instantly",
    ],
  },
  {
    id: "netlify",
    name: "Netlify",
    icon: Cloud,
    description: "Static hosting with edge functions support",
    difficulty: "Easy",
    estimatedTime: "3 minutes",
    steps: [
      "Create a Netlify account and connect GitHub",
      "Select 'Add new site' → 'Import an existing project'",
      "Choose your repository from the list",
      "Configure build command: 'npm run build'",
      "Set publish directory: 'out' or 'dist'",
      "Deploy and get your site URL",
    ],
  },
  {
    id: "github-pages",
    name: "GitHub Pages",
    icon: Globe,
    description: "Free hosting directly from your repository",
    difficulty: "Medium",
    estimatedTime: "5 minutes",
    steps: [
      "Enable GitHub Pages in repository settings",
      "Select source branch (usually 'main' or 'gh-pages')",
      "Configure GitHub Actions workflow for build",
      "Add deployment script to package.json",
      "Push changes to trigger automatic deployment",
      "Access your site at username.github.io/repo-name",
    ],
  },
];

const paidPlatforms: Platform[] = [
  {
    id: "aws",
    name: "AWS",
    icon: Cloud,
    description: "Enterprise-grade cloud infrastructure",
    difficulty: "Advanced",
    estimatedTime: "30 minutes",
    steps: [
      "Set up AWS account and configure IAM roles",
      "Create an S3 bucket for static hosting",
      "Configure CloudFront CDN for global distribution",
      "Set up Route 53 for custom domain (optional)",
      "Configure CodePipeline for CI/CD automation",
      "Deploy using AWS CLI or GitHub Actions",
    ],
  },
  {
    id: "gcp",
    name: "Google Cloud Platform",
    icon: Server,
    description: "Google's scalable cloud services",
    difficulty: "Advanced",
    estimatedTime: "25 minutes",
    steps: [
      "Create GCP project and enable Cloud Run API",
      "Build container image with Cloud Build",
      "Push image to Google Container Registry",
      "Deploy to Cloud Run with auto-scaling",
      "Configure Cloud Load Balancing",
      "Set up Cloud CDN for performance",
    ],
  },
  {
    id: "docker",
    name: "Docker + VPS",
    icon: Container,
    description: "Full control with containerization",
    difficulty: "Advanced",
    estimatedTime: "45 minutes",
    steps: [
      "Create Dockerfile for your application",
      "Build Docker image: 'docker build -t myapp .'",
      "Set up VPS (DigitalOcean, Linode, etc.)",
      "Install Docker on the VPS",
      "Push image to Docker Hub or private registry",
      "Deploy with docker-compose and configure Nginx",
      "Set up SSL with Let's Encrypt",
    ],
  },
];

export function DeployTab() {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const renderPlatformCard = (platform: Platform) => (
    <Card
      key={platform.id}
      className={`p-5 bg-glass border-[#2d2d44] cursor-pointer transition-all hover:border-cyan-500/50 ${
        selectedPlatform === platform.id ? "border-cyan-500 ring-1 ring-cyan-500/30" : ""
      }`}
      onClick={() => setSelectedPlatform(platform.id)}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center flex-shrink-0">
          <platform.icon className="w-6 h-6 text-slate-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-slate-200">{platform.name}</h4>
            <Badge
              variant="outline"
              className={`text-xs ${
                platform.difficulty === "Easy"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : platform.difficulty === "Medium"
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
            >
              {platform.difficulty}
            </Badge>
          </div>
          <p className="text-sm text-slate-400 mb-2">{platform.description}</p>
          <p className="text-xs text-slate-500">
            Estimated time: {platform.estimatedTime}
          </p>
        </div>
      </div>

      {selectedPlatform === platform.id && (
        <div className="mt-4 pt-4 border-t border-[#2d2d44]">
          <h5 className="font-medium text-slate-200 mb-3">Deployment Steps:</h5>
          <ol className="space-y-2">
            {platform.steps.map((step, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-400">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-cyan-400 text-xs">{index + 1}</span>
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <Button className="mt-4 w-full bg-cyan-500 hover:bg-cyan-600 text-white">
            Start Deployment
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </Card>
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-heading font-semibold text-lg text-slate-200">
            Deployment Guide
          </h3>
          <p className="text-sm text-slate-500">
            Step-by-step instructions for deploying to various platforms
          </p>
        </div>
      </div>

      <Tabs defaultValue="free" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-[#1a1a2e]">
          <TabsTrigger
            value="free"
            className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Free Options
          </TabsTrigger>
          <TabsTrigger
            value="paid"
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
          >
            <Server className="w-4 h-4 mr-2" />
            Enterprise
          </TabsTrigger>
        </TabsList>

        <TabsContent value="free" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {freePlatforms.map(renderPlatformCard)}
          </div>
        </TabsContent>

        <TabsContent value="paid" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {paidPlatforms.map(renderPlatformCard)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
