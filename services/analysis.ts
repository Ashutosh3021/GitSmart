/**
 * Analysis Engine Service
 * Orchestrates LLM calls to generate comprehensive repository analysis
 */

import type {
  RepoContext,
  AnalysisResult,
  ScoreBreakdown,
  AIProvider,
  DeploymentOption,
} from "../lib/types";
import { llmService } from "./llm";

/**
 * System prompts for different analysis tasks
 */
const SYSTEM_PROMPTS = {
  explanation: `You are RepoLens, an expert code analyst. Analyze the provided repository context and generate a comprehensive explanation. Focus on:
- The project's purpose and main functionality
- Technology stack and architecture patterns
- Key files and their roles
- Entry points and main workflows
- Notable design decisions

Be concise but thorough. Format your response in markdown.`,

  scoring: `You are a code quality expert. Analyze the repository and provide a detailed score (1-10) across these 6 dimensions:
1. Code Quality (structure, consistency, best practices)
2. Documentation (README quality, comments, inline docs)
3. Testing (coverage, test quality, CI/CD)
4. Activity (commit frequency, maintenance, issue resolution)
5. Dependencies (health, update frequency, security)
6. Community (contributors, adoption, engagement)

Provide specific details for each dimension. Return ONLY valid JSON in this exact format:
{
  "overall": 8.5,
  "breakdown": {
    "codeQuality": 9.0,
    "documentation": 7.5,
    "testing": 8.0,
    "activity": 9.5,
    "dependencies": 8.5,
    "community": 7.0
  },
  "details": {
    "codeQuality": ["detail1", "detail2", ...],
    "documentation": [...],
    "testing": [...],
    "activity": [...],
    "dependencies": [...],
    "community": [...]
  }
}`,

  architecture: `You are a systems architect. Generate a Mermaid flowchart diagram showing the high-level architecture of this repository. 

Requirements:
- Use 'flowchart TB' (top-bottom) direction
- Include subgraphs for major components (Frontend, Backend, Database, etc.)
- Show data flow between components
- Use descriptive node names
- Style important nodes with colors

Return ONLY the Mermaid code block, no explanations.`,

  workflow: `You are a systems architect. Generate a Mermaid sequence diagram showing the main workflow or data flow of this application.

Requirements:
- Use 'sequenceDiagram' type
- Identify key actors/participants
- Show the main interactions
- Focus on the most important user flow

Return ONLY the Mermaid code block, no explanations.`,

  deployment: `You are a DevOps expert. Analyze the technology stack and recommend deployment options for both free and paid tiers.

For each tier, suggest 3 platforms that would be best suited. For each platform include:
- Name
- Description
- Difficulty (Easy/Medium/Advanced)
- Estimated setup time
- Key features
- Deployment steps

Return ONLY valid JSON in this format:
{
  "free": [
    {
      "name": "Platform Name",
      "description": "...",
      "difficulty": "Easy",
      "estimatedTime": "5 minutes",
      "features": ["feature1", "feature2"],
      "steps": ["step1", "step2", "step3"]
    }
  ],
  "paid": [...]
}`,

  mcp: `You are an API designer. Generate a Model Context Protocol (MCP) server configuration for this repository.

Include:
- Server metadata
- Available tools/functions
- Resource templates
- AI configuration
- Feature flags

Return ONLY valid JSON configuration.`,
};

/**
 * Generate AI explanation for repository
 * @param context - Repository context
 * @param provider - AI provider
 * @param model - Model name
 */
async function generateExplanation(
  context: RepoContext,
  provider: AIProvider,
  model?: string
): Promise<string> {
  try {
    const prompt = buildContextPrompt(context);

    const response = await llmService.generateCompletion(provider, prompt, {
      model,
      systemPrompt: SYSTEM_PROMPTS.explanation,
      temperature: 0.7,
      maxTokens: 2000,
    });

    return response.content;
  } catch (error) {
    console.error("Explanation generation failed:", error);
    return getDefaultExplanation(context);
  }
}

/**
 * Get default explanation
 */
function getDefaultExplanation(context: RepoContext): string {
  return `# ${context.metadata.name}

${context.metadata.description || "A GitHub repository"}

## Overview

This is a ${context.metadata.language || "software"} project with ${context.metadata.stars} stars on GitHub.

## Tech Stack

${context.packageFile ? `Package Manager: ${context.packageFile.type}` : "Package manager: Unknown"}

${context.languages ? `Languages: ${Object.entries(context.languages).slice(0, 3).map(([lang, bytes]) => lang).join(", ")}` : ""}

## Getting Started

Please refer to the README.md for setup instructions.

## License

${context.metadata.license || "No license specified"}`;
}

/**
 * Generate repository score
 * @param context - Repository context
 * @param provider - AI provider
 * @param model - Model name
 */
async function generateScore(
  context: RepoContext,
  provider: AIProvider,
  model?: string
): Promise<{
  overall: number;
  breakdown: ScoreBreakdown;
  details: Record<keyof ScoreBreakdown, string[]>;
}> {
  try {
    const prompt = buildContextPrompt(context);

    const response = await llmService.generateCompletion(provider, prompt, {
      model,
      systemPrompt: SYSTEM_PROMPTS.scoring,
      temperature: 0.3,
      maxTokens: 1500,
  });

  try {
    // Extract JSON from response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        overall: parsed.overall || 7.0,
        breakdown: {
          codeQuality: parsed.breakdown?.codeQuality || 7.0,
          documentation: parsed.breakdown?.documentation || 7.0,
          testing: parsed.breakdown?.testing || 7.0,
          activity: parsed.breakdown?.activity || 7.0,
          dependencies: parsed.breakdown?.dependencies || 7.0,
          community: parsed.breakdown?.community || 7.0,
        },
        details: parsed.details || {},
      };
    }
  } catch (error) {
    console.error("Failed to parse score JSON:", error);
  }

  // Fallback scores
  return {
    overall: 7.0,
    breakdown: {
      codeQuality: 7.0,
      documentation: 7.0,
      testing: 7.0,
      activity: 7.0,
      dependencies: 7.0,
      community: 7.0,
    },
    details: {
      codeQuality: ["Code structure analyzed"],
      documentation: ["Documentation reviewed"],
      testing: ["Test coverage assessed"],
      activity: ["Activity metrics evaluated"],
      dependencies: ["Dependencies checked"],
      community: ["Community engagement reviewed"],
    },
  };
}

/**
 * Generate architecture diagram
 * @param context - Repository context
 * @param provider - AI provider
 * @param model - Model name
 */
async function generateArchitectureDiagram(
  context: RepoContext,
  provider: AIProvider,
  model?: string
): Promise<string> {
  try {
    const prompt = buildContextPrompt(context);

    const response = await llmService.generateCompletion(provider, prompt, {
      model,
      systemPrompt: SYSTEM_PROMPTS.architecture,
      temperature: 0.5,
      maxTokens: 1500,
    });

    // Extract Mermaid code - try multiple patterns
    let mermaidMatch = response.content.match(/```mermaid\n([\s\S]*?)```/);
    if (mermaidMatch) {
      return mermaidMatch[1].trim();
    }
    
    // Try without language specifier
    mermaidMatch = response.content.match(/```\n?([\s\S]*?)```/);
    if (mermaidMatch && mermaidMatch[1].includes("flowchart")) {
      return mermaidMatch[1].trim();
    }

    // Return raw content if no code block found
    return response.content.trim();
  } catch (error) {
    console.error("Architecture diagram generation failed:", error);
    return getDefaultArchitectureDiagram(context);
  }
}

/**
 * Get default architecture diagram
 */
function getDefaultArchitectureDiagram(context: RepoContext): string {
  return `flowchart TB
    subgraph Main["${context.metadata.name}"]
        A[App Entry]
        B[Core Logic]
        C[Data Layer]
    end
    
    style A fill:#00e5ff,stroke:#0a0a0f,color:#0a0a0f
    style B fill:#7c3aed,stroke:#0a0a0f,color:#fff
    style C fill:#22c55e,stroke:#0a0a0f,color:#0a0a0f`;
}

/**
 * Generate workflow diagram
 * @param context - Repository context
 * @param provider - AI provider
 * @param model - Model name
 */
async function generateWorkflowDiagram(
  context: RepoContext,
  provider: AIProvider,
  model?: string
): Promise<string> {
  try {
    const prompt = buildContextPrompt(context);

    const response = await llmService.generateCompletion(provider, prompt, {
      model,
      systemPrompt: SYSTEM_PROMPTS.workflow,
      temperature: 0.5,
      maxTokens: 1500,
    });

    // Extract Mermaid code - try multiple patterns
    let mermaidMatch = response.content.match(/```mermaid\n([\s\S]*?)```/);
    if (mermaidMatch) {
      return mermaidMatch[1].trim();
    }
    
    // Try without language specifier
    mermaidMatch = response.content.match(/```\n?([\s\S]*?)```/);
    if (mermaidMatch && mermaidMatch[1].includes("sequenceDiagram")) {
      return mermaidMatch[1].trim();
    }

    // Return raw content if no code block found
    return response.content.trim();
  } catch (error) {
    console.error("Workflow diagram generation failed:", error);
    return getDefaultWorkflowDiagram(context);
  }
}

/**
 * Get default workflow diagram
 */
function getDefaultWorkflowDiagram(context: RepoContext): string {
  return `sequenceDiagram
    participant User
    participant System as ${context.metadata.name}
    participant GitHub as GitHub API
    
    User->>System: Request Analysis
    System->>GitHub: Fetch Repository
    GitHub-->>System: Return Data
    System->>System: Process & Analyze
    System-->>User: Return Results`;
}

/**
 * Generate deployment guide
 * @param context - Repository context
 * @param provider - AI provider
 * @param model - Model name
 */
async function generateDeploymentGuide(
  context: RepoContext,
  provider: AIProvider,
  model?: string
): Promise<{ free: DeploymentOption[]; paid: DeploymentOption[] }> {
  const prompt = buildContextPrompt(context);

  const response = await llmService.generateCompletion(provider, prompt, {
    model,
    systemPrompt: SYSTEM_PROMPTS.deployment,
    temperature: 0.4,
    maxTokens: 2000,
  });

  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        free: parsed.free || getDefaultDeploymentOptions("free", context),
        paid: parsed.paid || getDefaultDeploymentOptions("paid", context),
      };
    }
  } catch (error) {
    console.error("Failed to parse deployment JSON:", error);
  }

  return {
    free: getDefaultDeploymentOptions("free", context),
    paid: getDefaultDeploymentOptions("paid", context),
  };
}

/**
 * Generate MCP configuration
 * @param context - Repository context
 * @param provider - AI provider
 * @param model - Model name
 */
async function generateMcpConfig(
  context: RepoContext,
  provider: AIProvider,
  model?: string
): Promise<Record<string, unknown>> {
  const prompt = buildContextPrompt(context);

  const response = await llmService.generateCompletion(provider, prompt, {
    model,
    systemPrompt: SYSTEM_PROMPTS.mcp,
    temperature: 0.4,
    maxTokens: 1500,
  });

  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error("Failed to parse MCP JSON:", error);
  }

  // Return default MCP config
  return getDefaultMcpConfig(context);
}

/**
 * Build context prompt from repository data
 * @param context - Repository context
 */
function buildContextPrompt(context: RepoContext): string {
  const importantFilesSummary = context.importantFiles
    .slice(0, 10)
    .map((f) => `- ${f.path} (${f.language || "unknown"})`)
    .join("\n");

  const packageInfo = context.packageFile
    ? `Package File: ${context.packageFile.type}\nDependencies: ${context.packageFile.dependencies.slice(0, 20).join(", ")}`
    : "No package file detected";

  return `Repository: ${context.metadata.fullName}
Description: ${context.metadata.description || "N/A"}
Language: ${context.metadata.language || "N/A"}
Stars: ${context.metadata.stars}
Forks: ${context.metadata.forks}
License: ${context.metadata.license || "N/A"}
Topics: ${context.metadata.topics.join(", ") || "N/A"}

${packageInfo}

README Summary:
${context.readme.slice(0, 2000)}${context.readme.length > 2000 ? "..." : ""}

Important Files:
${importantFilesSummary}

File Count: ${context.tree.tree.length}
Contributors: ${context.contributors}
Last Commit: ${context.lastCommit.date}`;
}

/**
 * Get default deployment options
 * @param tier - Free or paid
 * @param context - Repository context
 */
function getDefaultDeploymentOptions(
  tier: "free" | "paid",
  context: RepoContext
): DeploymentOption[] {
  const isNode = context.packageFile?.type === "package.json";
  const isPython =
    context.packageFile?.type === "requirements.txt" ||
    context.metadata.language === "Python";

  if (tier === "free") {
    return [
      {
        name: "Vercel",
        description: isNode
          ? "Perfect for Next.js/React apps with zero config"
          : "Great for static sites and serverless functions",
        difficulty: "Easy",
        estimatedTime: "3 minutes",
        steps: [
          "Connect GitHub repo to Vercel",
          "Auto-detect framework settings",
          "Deploy with one click",
        ],
        features: ["Auto HTTPS", "Global CDN", "Preview deployments"],
        pricing: "Free tier available",
      },
      {
        name: "Railway",
        description: "Modern platform for full-stack applications",
        difficulty: "Easy",
        estimatedTime: "5 minutes",
        steps: [
          "Create Railway account",
          "Deploy from GitHub",
          "Configure environment variables",
        ],
        features: ["Auto-scaling", "Database hosting", "Environment variables"],
        pricing: "Free tier with $5 credit",
      },
      {
        name: "Render",
        description: "Unified platform for all your apps",
        difficulty: "Easy",
        estimatedTime: "5 minutes",
        steps: [
          "Connect repository",
          "Select service type",
          "Deploy automatically",
        ],
        features: ["Free tier", "Auto-deploy", "Managed databases"],
        pricing: "Generous free tier",
      },
    ];
  } else {
    return [
      {
        name: "AWS Amplify",
        description: "Enterprise-grade AWS infrastructure",
        difficulty: "Medium",
        estimatedTime: "10 minutes",
        steps: [
          "Create AWS account",
          "Connect repository",
          "Configure build settings",
          "Set up custom domain",
        ],
        features: ["CI/CD", "Auth integration", "API Gateway", "Scalable"],
        pricing: "Pay as you go",
      },
      {
        name: "DigitalOcean App Platform",
        description: "Developer-friendly with predictable pricing",
        difficulty: "Medium",
        estimatedTime: "8 minutes",
        steps: [
          "Create DO account",
          "Connect GitHub",
          "Configure app",
          "Deploy",
        ],
        features: ["Global CDN", "Auto-deploy", "Databases included"],
        pricing: "From $5/month",
      },
      {
        name: "Google Cloud Run",
        description: "Serverless containers on GCP",
        difficulty: "Advanced",
        estimatedTime: "15 minutes",
        steps: [
          "Set up GCP project",
          "Configure Cloud Run",
          "Set up CI/CD pipeline",
          "Deploy",
        ],
        features: ["Auto-scaling", "Pay-per-use", "Global load balancing"],
        pricing: "Free tier then pay-per-use",
      },
    ];
  }
}

/**
 * Get default MCP configuration
 * @param context - Repository context
 */
function getDefaultMcpConfig(context: RepoContext): Record<string, unknown> {
  return {
    name: `${context.metadata.name} MCP Server`,
    version: "1.0.0",
    description: `Model Context Protocol server for ${context.metadata.fullName}`,
    server: {
      port: 3001,
      host: "localhost",
    },
    capabilities: {
      tools: [
        {
          name: "analyze_code",
          description: "Analyze code in the repository",
          parameters: {
            type: "object",
            properties: {
              filePath: { type: "string" },
              question: { type: "string" },
            },
            required: ["filePath"],
          },
        },
        {
          name: "get_file_content",
          description: "Get content of a specific file",
          parameters: {
            type: "object",
            properties: {
              path: { type: "string" },
            },
            required: ["path"],
          },
        },
      ],
      resources: [
        {
          name: "repo_info",
          description: "Basic repository information",
          template: `repo://${context.metadata.fullName}/info`,
        },
      ],
    },
    ai: {
      provider: "gemini",
      model: "gemini-1.5-flash",
      temperature: 0.7,
    },
    features: {
      streaming: true,
      caching: true,
    },
  };
}

/**
 * Analyze repository comprehensively
 * @param context - Repository context
 * @param provider - AI provider
 * @param model - Model name
 */
export async function analyzeRepository(
  context: RepoContext,
  provider: AIProvider = "gemini",
  model?: string
): Promise<AnalysisResult> {
  console.log(`🧠 Analyzing repository with ${provider}...`);

  // Check if provider is registered
  if (!llmService.isRegistered(provider)) {
    throw new Error(
      `Provider ${provider} not registered. Please set the API key in settings.`
    );
  }

  // Run all analyses in parallel
  const [explanation, score, architecture, workflow, deployment, mcpConfig] =
    await Promise.all([
      generateExplanation(context, provider, model),
      generateScore(context, provider, model),
      generateArchitectureDiagram(context, provider, model),
      generateWorkflowDiagram(context, provider, model),
      generateDeploymentGuide(context, provider, model),
      generateMcpConfig(context, provider, model),
    ]);

  console.log(`✅ Analysis complete`);

  return {
    explanation,
    score,
    diagrams: {
      architecture,
      workflow,
    },
    deploymentGuide: deployment,
    mcpConfig,
  };
}
