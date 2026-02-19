"use client";

import { Github, Settings, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

// Mock auth state - replace with actual auth logic
const mockUser = {
  isLoggedIn: true,
  name: "John Doe",
  email: "john@example.com",
  avatar: "https://github.com/ghost.png",
};

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center">
              <Github className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-gradient">
              RepoLens
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Settings Link */}
            <Link href="/settings">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </Link>

            {/* Auth Status */}
            {mockUser.isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                  >
                    <Avatar className="h-9 w-9 ring-2 ring-cyan-400/30">
                      <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
                      <AvatarFallback className="bg-purple-600 text-white">
                        {mockUser.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 bg-[#13131f] border-[#1f1f2e]"
                  align="end"
                  forceMount
                >
                  <div className="flex items-center gap-2 p-2">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-medium text-slate-200">
                        {mockUser.name}
                      </p>
                      <p className="text-xs text-slate-400">{mockUser.email}</p>
                    </div>
                  </div>
                  <DropdownMenuItem className="text-slate-400 focus:text-cyan-400 focus:bg-cyan-400/10 cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-slate-400 focus:text-red-400 focus:bg-red-400/10 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white border-0"
              >
                <Github className="w-4 h-4 mr-2" />
                Sign in with GitHub
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
