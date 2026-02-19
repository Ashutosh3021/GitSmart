/**
 * MermaidRenderer Component
 * 
 * Renders Mermaid diagrams with:
 * - Diagram preview
 * - Raw code view with copy button
 * - Toggle between Architecture and Workflow diagrams
 * 
 * Props:
 * - diagram: string - Mermaid diagram code
 * - type?: "architecture" | "workflow" - Diagram type
 */

"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { CodeBlock } from "./code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers, Workflow } from "lucide-react";

interface MermaidRendererProps {
  architectureDiagram: string;
  workflowDiagram: string;
}

export function MermaidRenderer({
  architectureDiagram,
  workflowDiagram,
}: MermaidRendererProps) {
  const architectureRef = useRef<HTMLDivElement>(null);
  const workflowRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      themeVariables: {
        primaryColor: "#00e5ff",
        primaryTextColor: "#0a0a0f",
        primaryBorderColor: "#00e5ff",
        lineColor: "#7c3aed",
        secondaryColor: "#7c3aed",
        tertiaryColor: "#0f0f19",
        background: "#0a0a0f",
        mainBkg: "#0f0f19",
        secondBkg: "#1a1a2e",
        tertiaryBkg: "#0f0f19",
        nodeBorder: "#00e5ff",
        clusterBkg: "rgba(124, 58, 237, 0.1)",
        clusterBorder: "#7c3aed",
        titleColor: "#f8fafc",
        edgeLabelBackground: "#0a0a0f",
        nodeTextColor: "#f8fafc",
      },
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: "basis",
      },
      sequence: {
        useMaxWidth: true,
      },
      gantt: {
        useMaxWidth: true,
      },
    });
  }, []);

  useEffect(() => {
    if (mounted && architectureRef.current) {
      mermaid.render("architecture", architectureDiagram).then(({ svg }) => {
        if (architectureRef.current) {
          architectureRef.current.innerHTML = svg;
        }
      });
    }
  }, [mounted, architectureDiagram]);

  useEffect(() => {
    if (mounted && workflowRef.current) {
      mermaid.render("workflow", workflowDiagram).then(({ svg }) => {
        if (workflowRef.current) {
          workflowRef.current.innerHTML = svg;
        }
      });
    }
  }, [mounted, workflowDiagram]);

  if (!mounted) {
    return <div className="h-64 animate-pulse bg-white/[0.05] rounded-lg" />;
  }

  return (
    <Tabs defaultValue="architecture" className="w-full">
      <TabsList className="bg-white/[0.03] border border-white/[0.08] mb-4">
        <TabsTrigger
          value="architecture"
          className="data-[state=active]:bg-[#00e5ff]/10 data-[state=active]:text-[#00e5ff]"
        >
          <Layers className="w-4 h-4 mr-2" />
          Architecture
        </TabsTrigger>
        <TabsTrigger
          value="workflow"
          className="data-[state=active]:bg-[#00e5ff]/10 data-[state=active]:text-[#00e5ff]"
        >
          <Workflow className="w-4 h-4 mr-2" />
          Workflow
        </TabsTrigger>
      </TabsList>

      <TabsContent value="architecture" className="mt-0 space-y-4">
        <div className="glass-card rounded-lg p-6 overflow-x-auto">
          <div
            ref={architectureRef}
            className="mermaid-container flex justify-center min-h-[300px]"
          />
        </div>
        <CodeBlock
          code={architectureDiagram}
          language="mermaid"
          filename="architecture.mmd"
        />
      </TabsContent>

      <TabsContent value="workflow" className="mt-0 space-y-4">
        <div className="glass-card rounded-lg p-6 overflow-x-auto">
          <div
            ref={workflowRef}
            className="mermaid-container flex justify-center min-h-[300px]"
          />
        </div>
        <CodeBlock
          code={workflowDiagram}
          language="mermaid"
          filename="workflow.mmd"
        />
      </TabsContent>
    </Tabs>
  );
}
