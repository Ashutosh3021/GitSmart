/**
 * Analysis Engine
 * Generates AI analysis of repositories using LLMs
 */

import { RepoContext, AnalysisResult, LLMProvider, UserSettings } from '@/types';
import { initLLMClient, generateText, getApiKey, getDefaultModel } from '@/services/llm';

/**
 * System prompt for repository analysis
 */
const ANALYSIS_SYSTEM_PROMPT = `You are RepoLens, an expert code analysis AI. Analyze the provided repository and generate structured insights.

Your responses must be:
- Accurate and based on the actual code provided
- Technical but accessible
- Focused on practical insights developers need
- Structured in the requested format`;

/**
 * Build context from repository data
 */
function buildRepoContext(repo: RepoContext): string {
  const parts = [
    `Repository: ${repo.owner}/${repo.repo}`,
    `Description: ${repo.metadata.description || 'N/A'}`,
    `Language: ${repo.metadata.language || 'N/A'}`,
    `Stars: ${repo.metadata.stargazers_count}`,
    `Forks: ${repo.metadata.forks_count}`,
    `Files: ${repo.stats.totalFiles}`,
    `Languages: ${Object.entries(repo.stats.languages).map(([lang, bytes]) => `${lang} (${Math.round(bytes / 1024)}KB)`).join(', ')}`,
    '',
    '=== DEPENDENCIES ===',
    repo.dependencies ? JSON.stringify(repo.dependencies, null, 2) : 'None detected',
    '',
    '=== FILE TREE ===',
    repo.fileTree
      .filter(f => f.type === 'blob')
      .slice(0, 50)
      .map(f => f.path)
      .join('\n'),
    '',
    '=== IMPORTANT FILES ===',
  ];
  
  // Add important file contents
  for (const file of repo.importantFiles.slice(0, 10)) {
    parts.push(`\n--- ${file.path} ---`);
    parts.push(file.content.slice(0, 1000));
  }
  
  if (repo.readme) {
    parts.push('\n=== README (truncated) ===');
    parts.push(repo.readme.slice(0, 2000));
  }
  
  return parts.join('\n');
}

/**
 * Generate AI explanation
 */
async function generateExplanation(
  repo: RepoContext,
  client: ReturnType<typeof initLLMClient>,
  model: string
): Promise<string> {
  const context = buildRepoContext(repo);
  
  const prompt = `Analyze this repository and provide a comprehensive explanation optimized for pasting into another AI:

${context}

Generate an explanation covering:
1. Purpose and main functionality
2. Tech stack and frameworks
3. Architecture overview
4. Key files and their roles
5. Entry points
6. Notable patterns or approaches

Format in markdown with clear sections. Be concise but thorough.`;

  return generateText(client, prompt, model, ANALYSIS_SYSTEM_PROMPT);
}

/**
 * Generate repository score
 */
async function generateScore(
  repo: RepoContext,
  client: ReturnType<typeof initLLMClient>,
  model: string
): Promise<AnalysisResult['score']> {
  const context = buildRepoContext(repo);
  
  const prompt = `Analyze this repository and score it on a scale of 1-10 across 6 dimensions:

${context}

Score each dimension 1-10:
1. Code Quality - readability, organization, best practices
2. Documentation - README quality, inline docs, examples
3. Tests - coverage, test quality, CI/CD
4. Activity - recent commits, maintenance, issues response
5. Dependencies - up-to-date, secure, minimal bloat
6. Community - stars, forks, contribution guidelines

Return ONLY a JSON object in this exact format:
{
  "overall": 8.5,
  "breakdown": {
    "codeQuality": 9,
    "documentation": 8,
    "tests": 7,
    "activity": 9,
    "dependencies": 8,
    "community": 9
  },
  "recommendations": [
    "Add more integration tests",
    "Update outdated dependencies"
  ]
}`;

  const response = await generateText(client, prompt, model, ANALYSIS_SYSTEM_PROMPT);
  
  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        overall: parsed.overall || 5,
        breakdown: {
          codeQuality: parsed.breakdown?.codeQuality || parsed.codeQuality || 5,
          documentation: parsed.breakdown?.documentation || parsed.documentation || 5,
          tests: parsed.breakdown?.tests || parsed.tests || 5,
          activity: parsed.breakdown?.activity || parsed.activity || 5,
          dependencies: parsed.breakdown?.dependencies || parsed.dependencies || 5,
          community: parsed.breakdown?.community || parsed.community || 5,
        },
        recommendations: parsed.recommendations || [],
      };
    }
  } catch (error) {
    console.error('Failed to parse score JSON:', error);
  }
  
  // Fallback
  return {
    overall: 5,
    breakdown: {
      codeQuality: 5,
      documentation: 5,
      tests: 5,
      activity: 5,
      dependencies: 5,
      community: 5,
    },
    recommendations: ['Unable to generate detailed analysis'],
  };
}

/**
 * Generate architecture diagram
 */
async function generateArchitectureDiagram(
  repo: RepoContext,
  client: ReturnType<typeof initLLMClient>,
  model: string
): Promise<string> {
  const context = buildRepoContext(repo);
  
  const prompt = `Generate a Mermaid flowchart showing the architecture of this repository:

${context}

Create a flowchart that shows:
- Main components/modules
- Data flow between components
- External dependencies
- Entry points

Use Mermaid flowchart syntax (graph TB). Include only the Mermaid code, no markdown code blocks.`;

  return generateText(client, prompt, model, ANALYSIS_SYSTEM_PROMPT);
}

/**
 * Generate workflow sequence diagram
 */
async function generateWorkflowDiagram(
  repo: RepoContext,
  client: ReturnType<typeof initLLMClient>,
  model: string
): Promise<string> {
  const context = buildRepoContext(repo);
  
  const prompt = `Generate a Mermaid sequence diagram showing the main workflow of this application:

${context}

Create a sequence diagram that shows:
- Typical request/response flow
- User interactions
- Database/API calls
- Main processing steps

Use Mermaid sequence diagram syntax. Include only the Mermaid code, no markdown code blocks.`;

  return generateText(client, prompt, model, ANALYSIS_SYSTEM_PROMPT);
}

/**
 * Generate deployment guide
 */
async function generateDeploymentGuide(
  repo: RepoContext,
  client: ReturnType<typeof initLLMClient>,
  model: string
): Promise<AnalysisResult['deployment']> {
  const context = buildRepoContext(repo);
  
  const prompt = `Generate deployment recommendations for this repository:

${context}

Suggest deployment options for both free and paid tiers based on the tech stack detected.

Return ONLY a JSON object in this format:
{
  "free": [
    {
      "platform": "Vercel",
      "difficulty": "Easy",
      "estimatedTime": "5 minutes",
      "steps": ["Step 1", "Step 2", "Step 3"]
    }
  ],
  "paid": [
    {
      "platform": "AWS",
      "difficulty": "Advanced",
      "estimatedTime": "30 minutes",
      "steps": ["Step 1", "Step 2", "Step 3"]
    }
  ]
}

Include 2-3 options for each tier.`;

  const response = await generateText(client, prompt, model, ANALYSIS_SYSTEM_PROMPT);
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Failed to parse deployment JSON:', error);
  }
  
  // Fallback
  return {
    free: [
      {
        platform: 'Vercel',
        difficulty: 'Easy',
        estimatedTime: '5 minutes',
        steps: ['Connect GitHub repo', 'Deploy'],
      },
    ],
    paid: [
      {
        platform: 'AWS',
        difficulty: 'Advanced',
        estimatedTime: '30 minutes',
        steps: ['Set up AWS account', 'Configure services', 'Deploy'],
      },
    ],
  };
}

/**
 * Generate MCP server config
 */
async function generateMCPConfig(
  repo: RepoContext,
  client: ReturnType<typeof initLLMClient>,
  model: string
): Promise<object> {
  return {
    mcpServers: {
      repolens: {
        command: 'npx',
        args: ['-y', '@repolens/mcp-server'],
        env: {
          GITHUB_TOKEN: '${GITHUB_TOKEN}',
          REPO_OWNER: repo.owner,
          REPO_NAME: repo.repo,
        },
      },
    },
  };
}

/**
 * Analyze repository using LLM
 */
export async function analyzeRepository(
  repo: RepoContext,
  provider: LLMProvider = 'gemini',
  userSettings?: UserSettings
): Promise<AnalysisResult> {
  console.log(`Analyzing repository with ${provider}...`);
  
  // Get API key
  const apiKey = getApiKey(provider, userSettings);
  if (!apiKey) {
    throw new Error(`No API key available for ${provider}`);
  }
  
  // Initialize LLM client
  const client = initLLMClient(provider, apiKey);
  
  // Get model (from settings or default)
  const model = userSettings?.preferredModels?.[provider] || getDefaultModel(provider);
  
  // Run all analyses in parallel
  const [
    explanation,
    score,
    architectureDiagram,
    workflowDiagram,
    deployment,
    mcp,
  ] = await Promise.all([
    generateExplanation(repo, client, model),
    generateScore(repo, client, model),
    generateArchitectureDiagram(repo, client, model),
    generateWorkflowDiagram(repo, client, model),
    generateDeploymentGuide(repo, client, model),
    generateMCPConfig(repo, client, model),
  ]);
  
  console.log('Analysis complete');
  
  return {
    explanation,
    score,
    diagrams: {
      architecture: architectureDiagram,
      workflow: workflowDiagram,
    },
    deployment,
    mcp: { config: mcp },
  };
}
