import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";

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
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
