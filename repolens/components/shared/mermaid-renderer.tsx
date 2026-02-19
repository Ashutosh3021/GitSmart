"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

interface MermaidRendererProps {
  chart: string;
  className?: string;
}

export function MermaidRenderer({ chart, className = "" }: MermaidRendererProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      securityLevel: "loose",
      themeVariables: {
        primaryColor: "#13131f",
        primaryTextColor: "#f8fafc",
        primaryBorderColor: "#00e5ff",
        lineColor: "#7c3aed",
        secondaryColor: "#1f1f2e",
        tertiaryColor: "#0a0a0f",
        background: "#0a0a0f",
        mainBkg: "#13131f",
        secondBkg: "#1f1f2e",
        nodeBorder: "#00e5ff",
        clusterBkg: "#13131f",
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

    const renderChart = async () => {
      if (!chart) return;
      
      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
        setError("");
      } catch (err) {
        setError("Failed to render diagram");
        console.error("Mermaid render error:", err);
      }
    };

    renderChart();
  }, [chart]);

  if (error) {
    return (
      <div className={`p-4 bg-red-500/10 border border-red-500/30 rounded-lg ${className}`}>
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`mermaid-container flex justify-center ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
