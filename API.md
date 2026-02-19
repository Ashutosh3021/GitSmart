# RepoLens Backend API Documentation

Complete backend for RepoLens - GitHub repository intelligence tool with AI analysis.

## 🏗️ Architecture Overview

```
my-app/
├── app/api/                  # Next.js API Routes
│   ├── analyze/route.ts     # Main analysis endpoint
│   ├── repo/[owner]/[repo]/ # Cached repo data
│   ├── readme/generate/     # README generation
│   ├── readme/push/         # Push to GitHub
│   ├── chat/[repoId]/       # Chat history
│   ├── chat/[repoId]/send/  # Send message
│   ├── settings/keys/       # API key management
│   └── auth/[...nextauth]/  # GitHub OAuth
├── services/                 # Business logic
│   ├── llm.ts              # AI provider service
│   ├── github.ts           # GitHub scraper
│   ├── github-push.ts      # GitHub push operations
│   ├── analysis.ts         # Analysis engine
│   ├── readme.ts           # README generator
│   └── chat.ts             # Chat service
├── lib/
│   ├── types/              # TypeScript definitions
│   ├── db/                 # SQLite database
│   ├── redis/              # Upstash Redis cache
│   └── auth.ts             # NextAuth config
└── data/                   # SQLite database file
```

## 🔧 Services

### 1. GitHub Scraper Service (`services/github.ts`)

Scrapes GitHub repositories for metadata, file tree, README, and important files.

**Key Functions:**
- `parseRepoUrl(url)` - Parse owner/repo from GitHub URL
- `scrapeRepository(url, accessToken)` - Full repository scraping
- `fetchRepoMetadata(owner, repo, accessToken)` - Repository metadata
- `fetchRepoTree(owner, repo, branch, accessToken)` - File tree
- `fetchFileContent(owner, repo, path, branch, accessToken)` - File content
- `fetchReadme(owner, repo, branch, accessToken)` - README content
- `getImportantFiles(tree, owner, repo, branch, language, limit, accessToken)` - Important files
- `detectPackageFile(tree, owner, repo, branch, accessToken)` - Detect dependencies

### 2. LLM Provider Service (`services/llm.ts`)

Handles multiple AI providers with unified interface.

**Supported Providers:**
- Google Gemini (default)
- OpenAI (GPT-4, GPT-3.5)
- Anthropic Claude
- Groq

**Usage:**
```typescript
import { llmService } from "@/services/llm";

// Register provider
llmService.registerProvider("gemini", {
  apiKey: "your-api-key",
  model: "gemini-1.5-flash"
});

// Generate completion
const response = await llmService.generateCompletion("gemini", "Your prompt here", {
  temperature: 0.7,
  maxTokens: 2000
});
```

### 3. Analysis Engine Service (`services/analysis.ts`)

Orchestrates LLM calls for comprehensive repository analysis.

**Outputs:**
- AI explanation (purpose, stack, architecture)
- Repository score (/10 with 6 dimensions)
- Mermaid architecture diagram
- Mermaid workflow diagram
- Deployment guide (free & paid)
- MCP server configuration

**Usage:**
```typescript
import { analyzeRepository } from "@/services/analysis";

const analysis = await analyzeRepository(
  repoContext,      // From github service
  "gemini",         // Provider
  "gemini-1.5-flash" // Model
);
```

### 4. README Generator Service (`services/readme.ts`)

Generates professional README.md with badges, banners, and sections.

**Features:**
- Shields.io badges (stars, forks, language, license)
- Centered banner with tagline
- Table of contents
- Project overview
- Tech stack table
- Installation instructions (auto-detected)
- Architecture section with Mermaid diagrams
- Contributing guide
- License section

**Usage:**
```typescript
import { generateReadme, generateReadmeWithAI } from "@/services/readme";

// Basic generation
const readme = generateReadme(context, analysis, options);

// AI-enhanced generation
const aiReadme = await generateReadmeWithAI(
  context, analysis, "gemini", undefined, options
);
```

### 5. Chat Service (`services/chat.ts`)

Manages chat history and LLM-powered responses.

**Features:**
- SQLite persistence per repository
- Context-aware responses (last 20 messages)
- System prompt with repo context
- Streaming support (simulated)

**Usage:**
```typescript
import { sendMessage, getChatHistory, clearChatHistory } from "@/services/chat";

// Get history
const messages = getChatHistory("owner/repo", 20);

// Send message
const result = await sendMessage(
  "owner/repo",
  "Explain the authentication system",
  repoContext,
  explanation,
  "gemini"
);

// Clear history
clearChatHistory("owner/repo");
```

### 6. GitHub Push Service (`services/github-push.ts`)

Pushes content to GitHub repositories via OAuth.

**Functions:**
- `pushToGitHub(owner, repo, path, content, message, branch, accessToken)`
- `pushReadme(url, content, message, branch, accessToken)`
- `createPullRequest(owner, repo, title, head, base, body, accessToken)`
- `createBranch(owner, repo, branch, fromBranch, accessToken)`

## 🛣️ API Routes

### POST /api/analyze
Main analysis endpoint.

**Request:**
```json
{
  "url": "https://github.com/owner/repo",
  "provider": "gemini",      // Optional, default: gemini
  "model": "gemini-1.5-flash", // Optional
  "forceRefresh": false       // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "context": { /* RepoContext */ },
    "analysis": { /* AnalysisResult */ },
    "timestamp": "2024-01-01T00:00:00Z"
  },
  "cached": false
}
```

### GET /api/repo/:owner/:repo
Get cached repository data.

**Response:**
```json
{
  "success": true,
  "data": { /* Cached analysis */ }
}
```

### POST /api/readme/generate
Generate README content.

**Request:**
```json
{
  "owner": "facebook",
  "repo": "react",
  "includeBadges": true,
  "includeBanner": true,
  "includeToc": true,
  "tone": "professional",
  "useAI": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": "# React...",
    "owner": "facebook",
    "repo": "react"
  }
}
```

### POST /api/readme/push
Push README to GitHub.

**Request:**
```json
{
  "owner": "facebook",
  "repo": "react",
  "content": "# React...",
  "message": "Update README",
  "branch": "main"
}
```

**Headers:**
```
Authorization: Bearer <github_access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://github.com/facebook/react/blob/main/README.md",
    "message": "README pushed successfully"
  }
}
```

### GET /api/chat/:repoId
Get chat history.

**Response:**
```json
{
  "success": true,
  "data": {
    "repoId": "owner/repo",
    "messages": [...],
    "count": 10
  }
}
```

### POST /api/chat/:repoId/send
Send a message.

**Request:**
```json
{
  "message": "What does this function do?",
  "provider": "gemini",
  "model": "gemini-1.5-flash"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "repoId": "owner/repo",
    "response": "The function...",
    "messages": [...]
  }
}
```

### DELETE /api/chat/:repoId
Clear chat history.

**Response:**
```json
{
  "success": true,
  "message": "Chat history cleared successfully"
}
```

### POST /api/settings/keys
Save API key.

**Request:**
```json
{
  "provider": "gemini",
  "apiKey": "your-api-key",
  "model": "gemini-1.5-flash"
}
```

**Response:**
```json
{
  "success": true,
  "message": "gemini API key saved successfully",
  "data": {
    "provider": "gemini",
    "model": "gemini-1.5-flash",
    "validated": true
  }
}
```

### GET /api/settings/keys
Get saved API keys (masked).

**Response:**
```json
{
  "success": true,
  "data": {
    "provider": "gemini",
    "apiKeys": {
      "gemini": "AIza...xYzA",
      "openai": null,
      "anthropic": null,
      "groq": null
    }
  }
}
```

### GET/POST /api/auth/[...nextauth]
GitHub OAuth authentication (NextAuth.js).

## 💾 Database Schema

### chats
```sql
CREATE TABLE chats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  repo_id TEXT NOT NULL,
  user_id TEXT,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### user_settings
```sql
CREATE TABLE user_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT UNIQUE NOT NULL,
  provider TEXT DEFAULT 'gemini',
  model TEXT,
  api_key_gemini TEXT,
  api_key_openai TEXT,
  api_key_anthropic TEXT,
  api_key_groq TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### analysis_cache
```sql
CREATE TABLE analysis_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  repo_full_name TEXT UNIQUE NOT NULL,
  data TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL
);
```

## 🚀 Deployment

### Environment Variables

See `.env.example` for all required variables.

**Required:**
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET` - GitHub OAuth app
- `NEXTAUTH_SECRET` - Random 32+ character string
- `NEXTAUTH_URL` - Your app URL
- At least one AI API key (GEMINI_API_KEY recommended)

**Optional but Recommended:**
- `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN` - For caching
- `GITHUB_TOKEN` - Personal access token for API calls

### Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start
```

## 🔒 Security Notes

1. **API Keys**: Never commit API keys to git. Use environment variables.
2. **GitHub OAuth**: Configure callback URL in GitHub app settings.
3. **Rate Limiting**: GitHub API has rate limits. Use authenticated requests when possible.
4. **CORS**: API routes include CORS headers for cross-origin requests.

## 🧪 Testing

```bash
# Test GitHub scraping
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com/facebook/react"}'

# Test chat
curl -X POST http://localhost:3000/api/chat/facebook/react/send \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the main purpose?"}'
```

## 📊 Performance

- **Caching**: Redis (24hr TTL) with SQLite fallback
- **Database**: better-sqlite3 for synchronous, fast operations
- **Rate Limiting**: Respects GitHub API limits
- **Lazy Loading**: Important files fetched on-demand

## 🔧 Customization

### Adding New AI Providers

1. Add to `AIProvider` type in `lib/types/index.ts`
2. Add initialization in `services/llm.ts`
3. Add API call method
4. Update settings validation

### Modifying Analysis Prompts

Edit `SYSTEM_PROMPTS` in `services/analysis.ts`:
```typescript
const SYSTEM_PROMPTS = {
  explanation: `Your custom prompt...`,
  scoring: `Your custom prompt...`,
  // ...
};
```

### Custom Deployment Guides

Modify `getDefaultDeploymentOptions()` in `services/analysis.ts` to add platform-specific recommendations.
