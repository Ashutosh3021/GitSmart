import type { Metadata } from "next";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "RepoLens - Understand Any Repo, Instantly",
  description: "AI-powered GitHub repository analysis tool with explanations, scores, diagrams, README generation, and chat capabilities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#0a0a0f] text-slate-50">
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
