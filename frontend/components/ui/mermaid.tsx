"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Loader2 } from "lucide-react";

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  securityLevel: "strict",
  fontFamily: "var(--font-mono)",
});
interface MermaidProps {
  chart: string;
}

export function Mermaid({ chart }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const renderChart = async () => {
      if (!chart) {
        setLoading(false);
        setSvg("");
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Generate a unique ID for each diagram
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        
        // Render the diagram
        const { svg } = await mermaid.render(id, chart);
        if (cancelled) return;
        setSvg(svg);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error("Mermaid rendering error:", err);
        setError("Failed to render diagram");
        setLoading(false);
      }
    };

    renderChart();

    return () => {
      cancelled = true;
    };
  }, [chart]);

  if (error) {
    return (
      <div className="p-4 border border-red-500/20 bg-red-500/10 rounded text-red-400 text-xs font-mono">
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8 text-muted-foreground/50">
        <Loader2 className="animate-spin w-4 h-4" />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="mermaid-diagram overflow-x-auto py-4 flex justify-center bg-background/50 rounded-lg border border-border/50"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
