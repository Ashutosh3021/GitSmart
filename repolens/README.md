# RepoLens

A modern, dark-themed web application for AI-powered GitHub repository analysis with comprehensive insights, visualizations, and documentation generation.

![RepoLens Screenshot](https://via.placeholder.com/1200x600/0a0a0f/00e5ff?text=RepoLens)

## Features

### Core Capabilities
- **AI Explanation** - Get intelligent summaries of any codebase architecture and logic
- **Score /10** - Comprehensive analysis across 6 dimensions with detailed breakdowns
- **Mermaid Diagrams** - Auto-generated architecture and workflow visualizations
- **README Generator** - Create professional READMEs with live preview and one-click push
- **Chat with Repo** - Ask questions about the codebase with contextual AI responses
- **Deploy Guide** - Step-by-step deployment instructions for any platform
- **MCP Server** - Generate Model Context Protocol configurations instantly
- **Security Audit** - Identify vulnerabilities and security best practices

### Design System
- Dark background (#0a0a0f) with cyan (#00e5ff) and purple (#7c3aed) accents
- Syne font for headings, JetBrains Mono for code
- Glassmorphism cards with subtle grid background
- Fully responsive (mobile-first design)
- Glowing borders on focus/hover

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **Diagrams**: Mermaid.js
- **Fonts**: Syne (headings), JetBrains Mono (code)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd repolens
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
```

The static export will be generated in the `dist/` directory.

## Project Structure

```
repolens/
├── app/                      # Next.js app router pages
│   ├── dashboard/           # Dashboard with tabs
│   │   ├── tabs/           # Tab components
│   │   │   ├── overview-tab.tsx
│   │   │   ├── score-tab.tsx
│   │   │   ├── diagrams-tab.tsx
│   │   │   ├── readme-tab.tsx
│   │   │   ├── chat-tab.tsx
│   │   │   ├── deploy-tab.tsx
│   │   │   └── mcp-tab.tsx
│   │   ├── page.tsx
│   │   └── dashboard-content.tsx
│   ├── settings/           # Settings page
│   │   └── page.tsx
│   ├── page.tsx            # Landing page
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── shared/             # Shared custom components
│       ├── navbar.tsx
│       ├── code-block.tsx
│       ├── mermaid-renderer.tsx
│       ├── score-dial.tsx
│       ├── repo-card.tsx
│       ├── badge-strip.tsx
│       ├── chat-bubble.tsx
│       └── provider-selector.tsx
├── lib/
│   └── utils.ts           # Utility functions
├── public/                # Static assets
└── package.json
```

## Pages

### 1. Landing Page (`/`)
- Animated hero with tagline "Understand Any Repo, Instantly"
- URL input bar with "Analyze" button
- Feature cards grid (8 features)
- How it works flow (6 steps)
- GitHub OAuth login button

### 2. Dashboard (`/dashboard`)
- Sidebar with repo stats (stars, forks, language, contributors)
- Tab navigation: Overview | Score | Diagrams | README | Chat | Deploy | MCP
- Each tab contains specialized functionality

### 3. Settings (`/settings`)
- GitHub OAuth connection status
- API Key inputs for: Gemini, OpenAI, Anthropic, Groq
- Model selector per provider
- Memory management for saved chats
- Theme toggle (dark only for now)

## Components

### Shared Components

#### Navbar
- Logo and brand
- GitHub OAuth status
- Settings icon link
- User dropdown menu

#### CodeBlock
- Syntax-highlighted code display
- Line numbers (optional)
- Copy button with feedback
- Language indicator

#### MermaidRenderer
- Renders Mermaid diagrams
- Dark theme customization
- Architecture and workflow support

#### ScoreDial
- Radial dial showing score /10
- Animated progress ring
- Color-coded based on score
- Glow effect

#### RepoCard
- Repository information display
- Stars, forks, language
- Last updated timestamp
- Hover lift effect

#### ChatBubble
- User and assistant variants
- Avatar display
- Timestamp
- Different styling per type

#### ProviderSelector
- Dropdown for AI providers
- Model selection per provider
- Default providers: OpenAI, Anthropic, Gemini, Groq

## Environment Variables

Create a `.env.local` file:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# AI Provider API Keys (optional for demo)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
```

## Customization

### Colors
Edit `app/globals.css`:
```css
:root {
  --background: #0a0a0f;
  --primary: #00e5ff;    /* Cyan accent */
  --secondary: #7c3aed;   /* Purple accent */
}
```

### Fonts
Google Fonts are loaded in `globals.css`. Modify the import URL to change fonts.

### Components
All shadcn/ui components are in `components/ui/`. Customize them as needed.

## Backend Integration

This frontend is designed to integrate with a backend API. Mock data is currently used for demonstration.

To connect to a real backend:

1. Create API utility functions in `lib/api.ts`
2. Replace mock data with actual API calls
3. Update environment variables for API endpoints
4. Implement proper error handling and loading states

### Expected API Endpoints

```typescript
// Example API structure
GET /api/repo/:owner/:name          // Get repository data
GET /api/repo/:owner/:name/score    // Get quality score
GET /api/repo/:owner/:name/explain  // Get AI explanation
POST /api/repo/:owner/:name/chat    // Send chat message
GET /api/repo/:owner/:name/diagram  // Get Mermaid diagrams
POST /api/repo/:owner/:name/readme  // Generate README
```

## Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

### Static Hosting
The project exports to static HTML:
```bash
npm run build
# Upload dist/ folder to any static host
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)
- Diagrams powered by [Mermaid](https://mermaid.js.org/)

---

Built with ❤️ for developers who want to understand code faster.
