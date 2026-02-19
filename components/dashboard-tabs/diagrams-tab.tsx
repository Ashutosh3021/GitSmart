/**
 * DiagramsTab Component
 * 
 * Dashboard Diagrams tab content:
 * - Mermaid diagram renderer
 * - Toggle between Architecture and Workflow
 * - Raw code block with copy button
 */

"use client";

import { MermaidRenderer } from "@/components/mermaid-renderer";

// Mock Mermaid diagrams
const architectureDiagram = `flowchart TB
    subgraph Frontend["Frontend Layer"]
        A[Next.js 14 App]
        B[React Components]
        C[Tailwind CSS]
        D[shadcn/ui]
    end

    subgraph State["State Management"]
        E[React Hooks]
        F[Context API]
    end

    subgraph Backend["Backend Services"]
        G[API Routes]
        H[GitHub API]
        I[AI Providers]
    end

    subgraph Data["Data Layer"]
        J[Repository Data]
        K[Analysis Cache]
        L[User Preferences]
    end

    A --> B
    B --> C
    B --> D
    A --> E
    E --> F
    A --> G
    G --> H
    G --> I
    G --> J
    J --> K
    F --> L

    style A fill:#00e5ff,stroke:#0a0a0f,color:#0a0a0f
    style G fill:#7c3aed,stroke:#0a0a0f,color:#fff
    style H fill:#22c55e,stroke:#0a0a0f,color:#0a0a0f
    style I fill:#f59e0b,stroke:#0a0a0f,color:#0a0a0f`;

const workflowDiagram = `sequenceDiagram
    actor User
    participant Frontend as RepoLens UI
    participant API as Next.js API
    participant GitHub as GitHub API
    participant AI as AI Service
    participant Cache as Redis Cache

    User->>Frontend: Enter Repository URL
    Frontend->>API: POST /api/analyze
    
    API->>Cache: Check cache
    alt Cache hit
        Cache-->>API: Return cached data
    else Cache miss
        API->>GitHub: Fetch repository data
        GitHub-->>API: Repository metadata
        
        API->>GitHub: Fetch file tree
        GitHub-->>API: File structure
        
        API->>GitHub: Fetch README
        GitHub-->>API: README content
        
        API->>AI: Analyze repository
        AI-->>API: Analysis results
        
        API->>Cache: Store results
    end
    
    API-->>Frontend: Analysis complete
    Frontend-->>User: Display results
    
    User->>Frontend: Request diagram
    Frontend->>API: POST /api/generate-diagram
    API->>AI: Generate Mermaid diagram
    AI-->>API: Diagram code
    API-->>Frontend: Diagram data
    Frontend-->>User: Render diagram`;

export function DiagramsTab() {
  return (
    <div className="space-y-6">
      {/* Info Card */}
      <div className="glass-card rounded-lg p-4 border-l-4 border-[#00e5ff]">
        <h3 className="font-semibold text-white mb-2">
          Architecture & Workflow Diagrams
        </h3>
        <p className="text-sm text-slate-400">
          AI-generated diagrams showing the repository structure and data flow.
          Toggle between Architecture overview and Workflow sequence diagram.
        </p>
      </div>

      {/* Mermaid Renderer */}
      <MermaidRenderer
        architectureDiagram={architectureDiagram}
        workflowDiagram={workflowDiagram}
      />
    </div>
  );
}
