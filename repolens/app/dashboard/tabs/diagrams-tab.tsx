"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MermaidRenderer } from "@/components/shared/mermaid-renderer";
import { CodeBlock } from "@/components/shared/code-block";
import { Layers, Workflow } from "lucide-react";

// Mock Mermaid diagrams
const architectureDiagram = `graph TB
    subgraph Client["Client Layer"]
        Browser[Browser]
        Mobile[Mobile App]
    end
    
    subgraph CDN["CDN Layer"]
        VercelEdge[Vercel Edge Network]
    end
    
    subgraph App["Application Layer"]
        NextApp[Next.js App]
        API[API Routes]
        Middleware[Middleware]
    end
    
    subgraph Data["Data Layer"]
        DB[(PostgreSQL)]
        Redis[(Redis Cache)]
        S3[S3 Storage]
    end
    
    Browser --> VercelEdge
    Mobile --> VercelEdge
    VercelEdge --> NextApp
    NextApp --> API
    API --> Middleware
    Middleware --> DB
    Middleware --> Redis
    Middleware --> S3`;

const workflowDiagram = `sequenceDiagram
    participant User
    participant Browser
    participant NextJS
    participant API
    participant DB
    
    User->>Browser: Visit page
    Browser->>NextJS: Request page
    NextJS->>API: Fetch data
    API->>DB: Query database
    DB-->>API: Return data
    API-->>NextJS: JSON response
    NextJS-->>Browser: Rendered HTML
    Browser-->>User: Display page`;

export function DiagramsTab() {
  const [activeDiagram, setActiveDiagram] = useState("architecture");

  const currentDiagram = activeDiagram === "architecture" 
    ? architectureDiagram 
    : workflowDiagram;

  return (
    <div className="space-y-6 max-w-5xl">
      <Card className="p-6 bg-glass border-[#2d2d44]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-heading font-semibold text-lg text-slate-200">
              Architecture & Workflow Diagrams
            </h3>
            <p className="text-sm text-slate-500">
              Auto-generated visualizations of the codebase structure
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={activeDiagram === "architecture" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveDiagram("architecture")}
              className={activeDiagram === "architecture" 
                ? "bg-cyan-500 hover:bg-cyan-600 text-white" 
                : "border-[#2d2d44] text-slate-400 hover:text-slate-200"
              }
            >
              <Layers className="w-4 h-4 mr-2" />
              Architecture
            </Button>
            <Button
              variant={activeDiagram === "workflow" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveDiagram("workflow")}
              className={activeDiagram === "workflow" 
                ? "bg-cyan-500 hover:bg-cyan-600 text-white" 
                : "border-[#2d2d44] text-slate-400 hover:text-slate-200"
              }
            >
              <Workflow className="w-4 h-4 mr-2" />
              Workflow
            </Button>
          </div>
        </div>

        {/* Diagram Display */}
        <div className="bg-[#0d0d14] rounded-lg border border-[#1f1f2e] p-6 mb-6 overflow-x-auto">
          <MermaidRenderer chart={currentDiagram} />
        </div>

        {/* Raw Code */}
        <div className="mt-6">
          <h4 className="font-medium text-slate-200 mb-3">Mermaid Source Code</h4>
          <CodeBlock 
            code={currentDiagram} 
            language="mermaid"
            showLineNumbers={true}
          />
        </div>
      </Card>

      {/* Additional Info */}
      <Card className="p-6 bg-glass border-[#2d2d44]">
        <h4 className="font-heading font-semibold text-slate-200 mb-4">
          About These Diagrams
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#1a1a2e] rounded-lg">
            <h5 className="font-medium text-cyan-400 mb-2">Architecture Diagram</h5>
            <p className="text-sm text-slate-400">
              Shows the high-level system architecture including client layers, 
              CDN, application servers, and data storage components.
            </p>
          </div>
          <div className="p-4 bg-[#1a1a2e] rounded-lg">
            <h5 className="font-medium text-purple-400 mb-2">Workflow Diagram</h5>
            <p className="text-sm text-slate-400">
              Illustrates the request/response flow through the system, 
              showing how data moves from user to database and back.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
