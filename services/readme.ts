/**
 * README Generator Service
 * Generates professional README.md content with badges, banners, and sections
 */

import type {
  RepoContext,
  AnalysisResult,
  AIProvider,
} from "../lib/types";
import { llmService } from "./llm";

/**
 * README generation options
 */
interface ReadmeOptions {
  includeBadges: boolean;
  includeBanner: boolean;
  includeToc: boolean;
  tone: "professional" | "casual" | "technical";
}

/**
 * Generate shields.io badge URLs
 * @param context - Repository context
 */
function generateBadges(context: RepoContext): string {
  const { metadata } = context;
  const encodedRepo = encodeURIComponent(metadata.fullName);

  const badges = [
    // Stars badge
    `[![Stars](https://img.shields.io/github/stars/${encodedRepo}?style=flat&color=00e5ff)](https://github.com/${metadata.fullName}/stargazers)`,
    // Forks badge
    `[![Forks](https://img.shields.io/github/forks/${encodedRepo}?style=flat&color=7c3aed)](https://github.com/${metadata.fullName}/network/members)`,
    // Language badge
    metadata.language &&
      `[![Language](https://img.shields.io/github/languages/top/${encodedRepo}?style=flat&color=22c55e)](https://github.com/${metadata.fullName})`,
    // License badge
    metadata.license &&
      `[![License](https://img.shields.io/github/license/${encodedRepo}?style=flat&color=f59e0b)](https://github.com/${metadata.fullName}/blob/main/LICENSE)`,
    // Last commit badge
    `[![Last Commit](https://img.shields.io/github/last-commit/${encodedRepo}?style=flat&color=ec4899)](https://github.com/${metadata.fullName}/commits)`,
    // Issues badge
    `[![Issues](https://img.shields.io/github/issues/${encodedRepo}?style=flat&color=38bdf8)](https://github.com/${metadata.fullName}/issues)`,
  ].filter(Boolean);

  return badges.join("\n");
}

/**
 * Generate banner/header section
 * @param context - Repository context
 * @param analysis - Analysis result
 */
function generateBanner(context: RepoContext, analysis: AnalysisResult): string {
  const { metadata } = context;

  // Extract first sentence from explanation as tagline
  const tagline =
    analysis.explanation
      .split(".")[0]
      .replace(/^#+\s*/, "")
      .trim() || metadata.description || "A powerful open-source project";

  return `<div align="center">

# ${metadata.name}

${tagline}

[Demo](https://example.com) • [Documentation](https://docs.example.com) • [Report Bug](https://github.com/${metadata.fullName}/issues)

</div>`;
}

/**
 * Generate table of contents
 * @param sections - Available sections
 */
function generateToc(sections: string[]): string {
  const tocItems = sections.map((section) => {
    const anchor = section.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return `- [${section}](#${anchor})`;
  });

  return `## 📑 Table of Contents

${tocItems.join("\n")}`;
}

/**
 * Generate overview section
 * @param analysis - Analysis result
 */
function generateOverview(analysis: AnalysisResult): string {
  return `## 🎯 Overview

${analysis.explanation}`;
}

/**
 * Generate tech stack table
 * @param context - Repository context
 */
function generateTechStack(context: RepoContext): string {
  const { metadata, packageFile, languages } = context;

  // Build tech stack items
  const stack: string[] = [];

  // Primary language
  if (metadata.language) {
    stack.push(`- **Language**: ${metadata.language}`);
  }

  // Framework based on package file
  if (packageFile) {
    if (packageFile.type === "package.json") {
      try {
        const pkg = JSON.parse(packageFile.content);
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };

        if (deps.next) stack.push("- **Framework**: Next.js");
        else if (deps.react) stack.push("- **Framework**: React");
        else if (deps.vue) stack.push("- **Framework**: Vue.js");
        else if (deps.express) stack.push("- **Framework**: Express.js");
        else if (deps.nestjs) stack.push("- **Framework**: NestJS");
      } catch {
        // Ignore parsing error
      }
    } else if (packageFile.type === "requirements.txt") {
      const hasDjango = packageFile.content.toLowerCase().includes("django");
      const hasFlask = packageFile.content.toLowerCase().includes("flask");
      const hasFastAPI = packageFile.content.toLowerCase().includes("fastapi");

      if (hasDjango) stack.push("- **Framework**: Django");
      else if (hasFlask) stack.push("- **Framework**: Flask");
      else if (hasFastAPI) stack.push("- **Framework**: FastAPI");
    } else if (packageFile.type === "Cargo.toml") {
      stack.push("- **Framework**: Rust");
    } else if (packageFile.type === "go.mod") {
      stack.push("- **Framework**: Go");
    }
  }

  // Add top 3 languages
  const topLanguages = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([lang]) => lang);

  if (topLanguages.length > 1) {
    stack.push(`- **Languages**: ${topLanguages.join(", ")}`);
  }

  return `## 🛠️ Tech Stack

${stack.join("\n")}`;
}

/**
 * Generate installation section
 * @param context - Repository context
 */
function generateInstallation(context: RepoContext): string {
  const { metadata, packageFile } = context;

  let installInstructions = "";

  if (packageFile?.type === "package.json") {
    try {
      const pkg = JSON.parse(packageFile.content);
      const hasLockfile = context.tree.tree.some(
        (f) => f.path === "package-lock.json" || f.path === "yarn.lock"
      );

      installInstructions = `### Prerequisites

- Node.js 18+ 
- ${hasLockfile ? "npm" : "npm/yarn/pnpm"}

### Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/${metadata.fullName}.git
cd ${metadata.name}

# Install dependencies
${hasLockfile ? "npm ci" : "npm install"}

# Run development server
${pkg.scripts?.dev ? "npm run dev" : "npm start"}
\`\`\``;
    } catch {
      installInstructions = `### Installation

\`\`\`bash
git clone https://github.com/${metadata.fullName}.git
cd ${metadata.name}
npm install
\`\`\``;
    }
  } else if (packageFile?.type === "requirements.txt") {
    installInstructions = `### Prerequisites

- Python 3.8+
- pip

### Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/${metadata.fullName}.git
cd ${metadata.name}

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

# Install dependencies
pip install -r requirements.txt
\`\`\``;
  } else if (packageFile?.type === "Cargo.toml") {
    installInstructions = `### Prerequisites

- Rust 1.70+
- Cargo

### Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/${metadata.fullName}.git
cd ${metadata.name}

# Build the project
cargo build --release

# Run tests
cargo test
\`\`\``;
  } else {
    installInstructions = `### Installation

\`\`\`bash
git clone https://github.com/${metadata.fullName}.git
cd ${metadata.name}
\`\`\`

See the project documentation for detailed setup instructions.`;
  }

  return `## 🚀 Installation

${installInstructions}`;
}

/**
 * Generate architecture section
 * @param analysis - Analysis result
 */
function generateArchitecture(analysis: AnalysisResult): string {
  return `## 🏗️ Architecture

${analysis.diagrams.architecture}

<details>
<summary>View Workflow Diagram</summary>

${analysis.diagrams.workflow}

</details>`;
}

/**
 * Generate API reference section (if applicable)
 * @param context - Repository context
 */
function generateApiReference(context: RepoContext): string {
  // Check for common API patterns
  const hasApiRoutes = context.importantFiles.some(
    (f) =>
      f.path.includes("/api/") ||
      f.path.includes("/routes/") ||
      f.path.includes("Controller")
  );

  if (!hasApiRoutes) {
    return "";
  }

  return `## 📚 API Reference

### Endpoints

API documentation is available in the project. Common endpoints include:

- \`GET /api/health\` - Health check
- \`GET /api/status\` - Service status

See the source code in \`src/routes\` or \`src/api\` for detailed endpoint documentation.`;
}

/**
 * Generate contributing section
 * @param context - Repository context
 */
function generateContributing(context: RepoContext): string {
  return `## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your Changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the Branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.`;
}

/**
 * Generate license section
 * @param context - Repository context
 */
function generateLicense(context: RepoContext): string {
  const license = context.metadata.license || "MIT";

  return `## 📝 License

This project is licensed under the ${license} License - see the [LICENSE](LICENSE) file for details.`;
}

/**
 * Generate footer/acknowledgments
 * @param context - Repository context
 */
function generateFooter(context: RepoContext): string {
  return `---

<div align="center">

Made with ❤️ by the [${context.owner}](https://github.com/${context.owner}) team

⭐ Star this repo if you find it helpful!

</div>`;
}

/**
 * Generate complete README content
 * @param context - Repository context
 * @param analysis - Analysis result
 * @param options - Generation options
 */
export function generateReadme(
  context: RepoContext,
  analysis: AnalysisResult,
  options: ReadmeOptions = {
    includeBadges: true,
    includeBanner: true,
    includeToc: true,
    tone: "professional",
  }
): string {
  console.log(`📝 Generating README...`);

  const sections: string[] = [];

  // Banner
  if (options.includeBanner) {
    sections.push(generateBanner(context, analysis));
  }

  // Badges
  if (options.includeBadges) {
    sections.push(generateBadges(context));
  }

  // Table of Contents
  const tocSections = [
    "Overview",
    "Tech Stack",
    "Installation",
    "Architecture",
    context.importantFiles.some(
      (f) => f.path.includes("/api/") || f.path.includes("Controller")
    )
      ? "API Reference"
      : null,
    "Contributing",
    "License",
  ].filter(Boolean) as string[];

  if (options.includeToc) {
    sections.push(generateToc(tocSections));
  }

  // Main content
  sections.push(generateOverview(analysis));
  sections.push(generateTechStack(context));
  sections.push(generateInstallation(context));
  sections.push(generateArchitecture(analysis));

  // Optional sections
  const apiRef = generateApiReference(context);
  if (apiRef) {
    sections.push(apiRef);
  }

  sections.push(generateContributing(context));
  sections.push(generateLicense(context));
  sections.push(generateFooter(context));

  const readme = sections.join("\n\n---\n\n");

  console.log(`✅ README generated (${readme.length} characters)`);

  return readme;
}

/**
 * Generate README using AI for enhanced content
 * @param context - Repository context
 * @param analysis - Analysis result
 * @param provider - AI provider
 * @param model - Model name
 * @param options - Generation options
 */
export async function generateReadmeWithAI(
  context: RepoContext,
  analysis: AnalysisResult,
  provider: AIProvider = "gemini",
  model?: string,
  options: ReadmeOptions = {
    includeBadges: true,
    includeBanner: true,
    includeToc: true,
    tone: "professional",
  }
): Promise<string> {
  console.log(`🤖 Generating AI-enhanced README with ${provider}...`);

  // Generate base README
  const baseReadme = generateReadme(context, analysis, options);

  // Prepare AI prompt
  const prompt = `Given this repository information, generate an enhanced README.md:

Repository: ${context.metadata.fullName}
Description: ${context.metadata.description}
Language: ${context.metadata.language}

Base README Structure:
${baseReadme.slice(0, 3000)}...

Please enhance the "Overview" and "Architecture" sections with more detail while maintaining the overall structure. Tone should be ${options.tone}.

Return the complete README content.`;

  try {
    const response = await llmService.generateCompletion(provider, prompt, {
      model,
      temperature: 0.7,
      maxTokens: 4000,
    });

    console.log(`✅ AI-enhanced README generated`);
    return response.content;
  } catch (error) {
    console.warn("AI enhancement failed, using base README:", error);
    return baseReadme;
  }
}
