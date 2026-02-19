/**
 * README Generator Service
 * Generates professional README markdown
 */

import { RepoContext, ReadmeResult, LLMProvider, UserSettings } from '@/types';
import { initLLMClient, generateText, getApiKey, getDefaultModel } from '@/services/llm';
import { pushFileToRepo } from '@/lib/github';

/**
 * Generate shields.io badges
 */
function generateBadges(repo: RepoContext): string[] {
  const badges: string[] = [];
  const { owner, repo: name } = repo;
  
  // Language badge
  if (repo.metadata.language) {
    badges.push(
      `![Language](https://img.shields.io/badge/language-${encodeURIComponent(repo.metadata.language)}-blue)`
    );
  }
  
  // Stars badge
  badges.push(
    `![Stars](https://img.shields.io/github/stars/${owner}/${name}?style=social)`
  );
  
  // License badge (try to detect)
  if (repo.fileTree.some(f => f.path.toLowerCase().includes('license'))) {
    badges.push(
      `![License](https://img.shields.io/github/license/${owner}/${name})`
    );
  }
  
  // Last commit badge
  badges.push(
    `![Last Commit](https://img.shields.io/github/last-commit/${owner}/${name})`
  );
  
  // Issues badge
  badges.push(
    `![Issues](https://img.shields.io/github/issues/${owner}/${name})`
  );
  
  return badges;
}

/**
 * Generate installation instructions based on dependencies
 */
function generateInstallInstructions(repo: RepoContext): string {
  const deps = repo.dependencies;
  
  if (!deps) {
    return `## Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/${repo.owner}/${repo.repo}.git
cd ${repo.repo}
\`\`\`

2. Follow the project's setup instructions.`;
  }
  
  if (deps.type === 'npm') {
    const hasYarn = repo.fileTree.some(f => f.path === 'yarn.lock');
    const hasPnpm = repo.fileTree.some(f => f.path === 'pnpm-lock.yaml');
    
    let installCmd = 'npm install';
    if (hasYarn) installCmd = 'yarn install';
    else if (hasPnpm) installCmd = 'pnpm install';
    
    let devCmd = 'npm run dev';
    if (deps.scripts?.dev) devCmd = `${installCmd.split(' ')[0]} run dev`;
    else if (deps.scripts?.start) devCmd = `${installCmd.split(' ')[0]} start`;
    
    return `## Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/${repo.owner}/${repo.repo}.git
cd ${repo.repo}
\`\`\`

2. Install dependencies:
\`\`\`bash
${installCmd}
\`\`\`

3. Start the development server:
\`\`\`bash
${devCmd}
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.`;
  }
  
  if (deps.type === 'python') {
    return `## Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/${repo.owner}/${repo.repo}.git
cd ${repo.repo}
\`\`\`

2. Create a virtual environment (optional but recommended):
\`\`\`bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
\`\`\`

3. Install dependencies:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

4. Run the application:
\`\`\`bash
python main.py
\`\`\``;
  }
  
  if (deps.type === 'rust') {
    return `## Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/${repo.owner}/${repo.repo}.git
cd ${repo.repo}
\`\`\`

2. Build the project:
\`\`\`bash
cargo build --release
\`\`\`

3. Run the application:
\`\`\`bash
cargo run
\`\`\``;
  }
  
  return `## Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/${repo.owner}/${repo.repo}.git
cd ${repo.repo}
\`\`\`

2. Follow the project's setup instructions in the documentation.`;
}

/**
 * Generate tech stack table
 */
function generateTechStack(repo: RepoContext): string {
  const techs: string[] = [];
  
  // Primary language
  if (repo.metadata.language) {
    techs.push(`| Language | ${repo.metadata.language} | Primary programming language |`);
  }
  
  // Framework detection
  const files = repo.fileTree.map(f => f.path.toLowerCase());
  
  if (files.some(f => f.includes('react'))) {
    techs.push('| Framework | React | UI library |');
  }
  if (files.some(f => f.includes('next'))) {
    techs.push('| Framework | Next.js | React framework |');
  }
  if (files.some(f => f.includes('vue'))) {
    techs.push('| Framework | Vue.js | Progressive framework |');
  }
  if (files.some(f => f.includes('angular'))) {
    techs.push('| Framework | Angular | Platform framework |');
  }
  if (files.some(f => f.includes('express'))) {
    techs.push('| Backend | Express.js | Web framework |');
  }
  if (files.some(f => f.includes('fastapi'))) {
    techs.push('| Backend | FastAPI | Python API framework |');
  }
  if (files.some(f => f.includes('tailwind'))) {
    techs.push('| Styling | Tailwind CSS | Utility-first CSS |');
  }
  if (files.some(f => f.includes('docker'))) {
    techs.push('| DevOps | Docker | Containerization |');
  }
  
  if (techs.length === 0) {
    return '';
  }
  
  return `## Tech Stack

| Category | Technology | Description |
|----------|------------|-------------|
${techs.join('\n')}
`;
}

/**
 * Build README using LLM
 */
async function generateReadmeWithLLM(
  repo: RepoContext,
  explanation: string,
  client: ReturnType<typeof initLLMClient>,
  model: string
): Promise<string> {
  const context = `
Repository: ${repo.owner}/${repo.repo}
Description: ${repo.metadata.description || 'N/A'}
Explanation: ${explanation}

File Tree (top 30):
${repo.fileTree.filter(f => f.type === 'blob').slice(0, 30).map(f => f.path).join('\n')}

Dependencies:
${JSON.stringify(repo.dependencies, null, 2)}
`;

  const prompt = `Generate a professional README.md for this repository:

${context}

Requirements:
1. Professional, official tone
2. Clear project overview
3. Installation instructions (if package.json exists, infer npm/yarn/pnpm)
4. Usage examples
5. API documentation section (if routes detected)
6. Contributing guidelines
7. License information

Structure with proper markdown formatting. Do not include the badges section (that will be added separately).`;

  return generateText(client, prompt, model);
}

/**
 * Generate complete README
 */
export async function generateReadme(
  repo: RepoContext,
  explanation: string,
  provider: LLMProvider = 'gemini',
  userSettings?: UserSettings,
  options: {
    includeBadges?: boolean;
    includeBanner?: boolean;
    includeToc?: boolean;
  } = {}
): Promise<ReadmeResult> {
  console.log(`Generating README for ${repo.owner}/${repo.repo}...`);
  
  const { includeBadges = true, includeBanner = true, includeToc = true } = options;
  
  // Generate badges
  const badges = includeBadges ? generateBadges(repo) : [];
  
  // Generate sections
  const installSection = generateInstallInstructions(repo);
  const techStackSection = generateTechStack(repo);
  
  // Get API key and generate main content with LLM
  let mainContent = '';
  
  const apiKey = getApiKey(provider, userSettings);
  if (apiKey) {
    try {
      const client = initLLMClient(provider, apiKey);
      const model = userSettings?.preferredModels?.[provider] || getDefaultModel(provider);
      mainContent = await generateReadmeWithLLM(repo, explanation, client, model);
    } catch (error) {
      console.error('LLM generation failed, using template:', error);
    }
  }
  
  // If LLM failed or no API key, use template
  if (!mainContent) {
    mainContent = generateTemplateReadme(repo, explanation);
  }
  
  // Build final README
  const parts: string[] = [];
  
  // Banner/title
  if (includeBanner) {
    parts.push(`<div align="center">`);
    parts.push('');
    parts.push(`# ${repo.repo}`);
    parts.push('');
    if (repo.metadata.description) {
      parts.push(repo.metadata.description);
    }
    parts.push('');
    if (badges.length > 0) {
      parts.push(badges.join(' '));
      parts.push('');
    }
    parts.push('</div>');
    parts.push('');
  } else {
    parts.push(`# ${repo.repo}`);
    parts.push('');
  }
  
  // Table of contents
  if (includeToc) {
    parts.push('## Table of Contents');
    parts.push('');
    parts.push('- [Overview](#overview)');
    parts.push('- [Tech Stack](#tech-stack)');
    parts.push('- [Installation](#installation)');
    parts.push('- [Usage](#usage)');
    parts.push('- [Contributing](#contributing)');
    parts.push('- [License](#license)');
    parts.push('');
  }
  
  // Overview
  parts.push('## Overview');
  parts.push('');
  parts.push(explanation.slice(0, 1000));
  parts.push('');
  
  // Tech Stack
  if (techStackSection) {
    parts.push(techStackSection);
    parts.push('');
  }
  
  // Installation
  parts.push(installSection);
  parts.push('');
  
  // Main content from LLM
  parts.push(mainContent);
  
  // Contributing
  parts.push('## Contributing');
  parts.push('');
  parts.push(`Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.`);
  parts.push('');
  
  // License
  parts.push('## License');
  parts.push('');
  parts.push(`This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.`);
  parts.push('');
  
  const markdown = parts.join('\n');
  
  return {
    markdown,
    badges,
    sections: ['Overview', 'Tech Stack', 'Installation', 'Usage', 'Contributing', 'License'],
  };
}

/**
 * Generate template README when LLM is unavailable
 */
function generateTemplateReadme(repo: RepoContext, explanation: string): string {
  const parts: string[] = [];
  
  parts.push('## Usage');
  parts.push('');
  parts.push('```bash');
  parts.push('# Clone the repository');
  parts.push(`git clone https://github.com/${repo.owner}/${repo.repo}.git`);
  parts.push(`cd ${repo.repo}`);
  parts.push('```');
  parts.push('');
  parts.push('Refer to the installation section above for setup instructions.');
  parts.push('');
  
  return parts.join('\n');
}

/**
 * Push README to GitHub repository
 */
export async function pushReadmeToGitHub(
  owner: string,
  repo: string,
  content: string,
  message: string = 'docs: Update README via RepoLens',
  branch: string = 'main'
): Promise<void> {
  console.log(`Pushing README to ${owner}/${repo}...`);
  
  // Check if README already exists to get SHA
  let sha: string | undefined;
  try {
    const { fetchFileContent } = await import('@/lib/github');
    // Try to fetch existing README to get SHA
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/README.md?ref=${branch}`, {
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      sha = data.sha;
    }
  } catch {
    // README doesn't exist yet
  }
  
  await pushFileToRepo(owner, repo, 'README.md', content, message, branch, sha);
  
  console.log('README pushed successfully');
}
