import type { Metadata } from "next";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/navbar";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "RepoLens - Understand Any Repo, Instantly",
  description: "AI-powered GitHub repository analysis tool with explanations, diagrams, README generation, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen gradient-dark grid-bg">
        <SessionProvider>
          <TooltipProvider>
            <Navbar />
            {children}
          </TooltipProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
