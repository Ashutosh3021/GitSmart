# RepoLens

A modern, dark-themed web application for AI-powered GitHub repository analysis. Built with Next.js 14, Tailwind CSS, and shadcn/ui.

![RepoLens](https://img.shields.io/badge/RepoLens-AI%20Powered-00e5ff)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4)

## ✨ Features

- **AI Explanation**: Get instant, natural language explanations of any codebase
- **Repository Scoring**: Multi-dimensional /10 scoring across 6 key areas
- **Mermaid Diagrams**: Auto-generated architecture and workflow visualizations
- **README Generator**: AI-powered README creation with live markdown preview
- **Chat with Repository**: Ask questions and get contextual answers about the code
- **Deployment Guides**: Step-by-step deployment instructions for multiple platforms
- **MCP Server**: Model Context Protocol integration configuration
- **Security Audit**: Automated security analysis (planned)

## 🎨 Design System

- **Background**: #0a0a0f (Deep dark)
- **Primary Accent**: #00e5ff (Cyan)
- **Secondary**: #7c3aed (Purple)
- **Typography**: 
  - Headings: Syne
  - Code/Labels: JetBrains Mono
- **Features**: Glassmorphism cards, subtle grid background, glowing borders

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Navigate to project directory
cd my-app

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
my-app/
├── app/                      # Next.js App Router
│   ├── dashboard/           # Dashboard page with tabs
│   ├── settings/            # Settings page
│   ├── globals.css          # Global styles & design system
│   ├── layout.tsx           # Root layout with fonts
│   └── page.tsx             # Landing page
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── dashboard-tabs/      # Dashboard tab components
│   ├── navbar.tsx           # Navigation bar
│   ├── code-block.tsx       # Syntax-highlighted code blocks
│   ├── chat-bubble.tsx      # Chat message bubbles
│   ├── score-dial.tsx       # Animated score dial
│   ├── mermaid-renderer.tsx # Mermaid diagram renderer
│   ├── repo-card.tsx        # Repository card component
│   ├── badge-strip.tsx      # Shields.io-style badges
│   └── provider-selector.tsx # AI provider selector
├── lib/
│   └── utils.ts             # Utility functions
├── public/                  # Static assets
└── next.config.js          # Next.js configuration
```

## 🏗️ Architecture

### Pages

1. **Landing Page** (`/`)
   - Hero with animated tagline
   - GitHub URL input with prefix
   - Feature cards grid (8 features)
   - How it works flow (6 steps horizontal)
   - GitHub OAuth login

2. **Dashboard** (`/dashboard`)
   - Sidebar with repo stats (stars, language, commits, contributors)
   - 7 tabs: Overview, Score, Diagrams, README, Chat, Deploy, MCP
   
3. **Settings** (`/settings`)
   - GitHub OAuth connection status
   - API key management for AI providers
   - Model selection per provider
   - Memory management (chat history)
   - Theme toggle

### Components

- **Navbar**: Fixed navigation with logo, OAuth status, settings link
- **RepoCard**: Repository information card
- **ScoreDial**: Animated radial dial showing /10 score
- **ScoreBar**: Linear progress bars for score breakdown
- **MermaidRenderer**: Renders architecture and workflow diagrams
- **ChatBubble**: Message bubbles with markdown support
- **ChatInput**: Input field with send button
- **CodeBlock**: Syntax-highlighted code with copy button
- **BadgeStrip**: Shields.io-style badges for README
- **ProviderSelector**: AI provider dropdown with model selection

## 🔧 Technologies Used

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animation**: Framer Motion
- **Diagrams**: Mermaid.js
- **Markdown**: react-markdown, remark-gfm
- **Icons**: Lucide React

## 📝 Key Features Implementation

### Glassmorphism Design
```css
.glass-card {
  background: rgba(15, 15, 25, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

### Cyan Glow Effects
- Primary accent: `#00e5ff`
- Glow shadows with opacity
- Focus states with cyan rings

### Responsive Design
- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Sidebar hidden on mobile
- Stacked tabs on small screens

## 🔌 Backend Integration Points

The application is built with mock data and ready for backend integration:

1. **Repository Analysis API**
   - Endpoint: `/api/analyze`
   - Accepts: GitHub repository URL
   - Returns: Analysis data, scores, diagrams

2. **AI Chat API**
   - Endpoint: `/api/chat`
   - Streaming responses supported
   - Memory management for context

3. **Authentication**
   - GitHub OAuth integration
   - JWT token storage
   - Private repository access

4. **AI Providers**
   - Google Gemini
   - OpenAI (GPT-4)
   - Anthropic Claude
   - Groq

## 🎯 Customization

### Adding New Features

1. Create component in `components/` or `components/dashboard-tabs/`
2. Add route/page in `app/` if needed
3. Update navigation in `components/navbar.tsx`
4. Add tab in dashboard if applicable

### Modifying Colors

Edit `app/globals.css`:
```css
:root {
  --cyan: #00e5ff;
  --purple: #7c3aed;
  /* ... other colors */
}
```

### Changing Fonts

Update `app/globals.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Your+Font&display=swap');

:root {
  --font-syne: 'Your Font', sans-serif;
}
```

## 📄 File Overview

### Core Application Files

- `app/page.tsx` - Landing page with hero, features, how it works
- `app/dashboard/page.tsx` - Main dashboard with sidebar and tabs
- `app/settings/page.tsx` - Settings with API keys and preferences
- `app/layout.tsx` - Root layout with navigation
- `app/globals.css` - Design system and global styles

### Component Files

- `components/navbar.tsx` - Fixed navigation bar
- `components/code-block.tsx` - Code display with copy
- `components/chat-bubble.tsx` - Chat messages
- `components/score-dial.tsx` - Animated score display
- `components/mermaid-renderer.tsx` - Diagram rendering
- `components/repo-card.tsx` - Repository cards
- `components/badge-strip.tsx` - README badges
- `components/provider-selector.tsx` - AI provider dropdown

### Dashboard Tab Components

- `components/dashboard-tabs/overview-tab.tsx` - Repository overview
- `components/dashboard-tabs/score-tab.tsx` - Score breakdown
- `components/dashboard-tabs/diagrams-tab.tsx` - Mermaid diagrams
- `components/dashboard-tabs/readme-tab.tsx` - README editor/preview
- `components/dashboard-tabs/chat-tab.tsx` - AI chat interface
- `components/dashboard-tabs/deploy-tab.tsx` - Deployment guides
- `components/dashboard-tabs/mcp-tab.tsx` - MCP configuration

## 🚧 Known Limitations

- **Mock Data**: All data is currently mocked
- **No Real AI**: Chat responses are hardcoded
- **No Backend**: No actual API integration
- **Static Export**: Ready for static deployment

## 📚 Next Steps

1. **Backend Integration**
   - Set up API routes in `app/api/`
   - Implement GitHub API integration
   - Add AI provider SDKs

2. **Authentication**
   - Implement NextAuth.js
   - GitHub OAuth provider
   - Protected routes

3. **Database**
   - Add PostgreSQL or MongoDB
   - Store chat history
   - Cache analysis results

4. **Real-time Features**
   - WebSocket for chat streaming
   - Live analysis progress
   - Real-time notifications

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Next.js](https://nextjs.org/) for the React framework
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Mermaid](https://mermaid.js.org/) for diagrams

---

Built with ❤️ by the RepoLens Team
