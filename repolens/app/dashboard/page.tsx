"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DashboardContent from "./dashboard-content";

// Loading component for Suspense fallback
function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full border-4 border-cyan-500/30 border-t-cyan-500 animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Loading dashboard...</p>
      </div>
    </div>
  );
}

// Wrapper component that uses search params
function DashboardWithParams() {
  const searchParams = useSearchParams();
  const repoUrl = searchParams.get("repo") || "";
  
  return <DashboardContent repoUrl={repoUrl} />;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardWithParams />
    </Suspense>
  );
}
