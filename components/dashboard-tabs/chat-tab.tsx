/**
 * ChatTab Component
 * 
 * Dashboard Chat tab content:
 * - ChatGPT-style chat interface
 * - Message bubbles (user + assistant)
 * - Input bar
 * - Provider label
 * - Memory indicator
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ChatBubble, ChatInput } from "@/components/chat-bubble";
import { ProviderBadge } from "@/components/provider-selector";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Trash2,
  Brain,
  Sparkles,
  Zap,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Mock initial messages
const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Hi! I'm your AI assistant for analyzing this repository. I can help you understand the codebase, explain specific functions, suggest improvements, or answer any questions you have about the project.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
];

// Mock responses for demo
const mockResponses: Record<string, string> = {
  default:
    "Based on the repository analysis, this appears to be a well-structured Next.js application. The code follows modern React patterns with proper TypeScript usage. Would you like me to explain any specific part of the codebase?",
  structure:
    "The project follows a standard Next.js 14 structure with the App Router. Key directories include:\n\n- **app/**: Main application pages\n- **components/**: Reusable UI components\n- **lib/**: Utility functions and configurations\n- **types/**: TypeScript type definitions\n\nThe architecture separates concerns well between UI components, business logic, and data fetching.",
  performance:
    "From analyzing the code, here are some performance observations:\n\n✅ **Strengths:**\n- Uses React Server Components where appropriate\n- Implements proper code splitting\n- Static generation for appropriate pages\n\n⚠️ **Areas for improvement:**\n- Some client components could be server components\n- Consider implementing proper caching strategies",
};

export function ChatTab() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [memoryCount, setMemoryCount] = useState(12);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      let responseContent = mockResponses.default;

      // Simple keyword matching for demo
      const lowerContent = content.toLowerCase();
      if (lowerContent.includes("structure") || lowerContent.includes("folder")) {
        responseContent = mockResponses.structure;
      } else if (lowerContent.includes("performance") || lowerContent.includes("optimize")) {
        responseContent = mockResponses.performance;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
      setMemoryCount((prev) => Math.min(prev + 1, 50));
    }, 1500);
  };

  const handleClearChat = () => {
    setMessages([initialMessages[0]]);
    setMemoryCount(0);
  };

  return (
    <div className="h-[calc(100vh-280px)] min-h-[500px] flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08]">
            <MessageSquare className="w-4 h-4 text-[#00e5ff]" />
            <span className="text-sm text-slate-300">Chat with Repository</span>
          </div>
          <ProviderBadge provider="gemini" />
        </div>

        <div className="flex items-center gap-2">
          {/* Memory Indicator */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
              memoryCount > 40
                ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                : "bg-[#7c3aed]/10 border-[#7c3aed]/30 text-[#7c3aed]"
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">
              {memoryCount} messages remembered
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            className="text-slate-400 hover:text-red-400 hover:bg-red-400/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      {/* Chat Messages */}
      <Card className="glass-card flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <ChatBubble
                  content={message.content}
                  role={message.role}
                  timestamp={message.timestamp}
                />
              </motion.div>
            ))}

            {isLoading && (
              <ChatBubble
                content=""
                role="assistant"
                isLoading={true}
              />
            )}
          </div>
        </ScrollArea>

        {/* Suggested Prompts */}
        {messages.length < 3 && (
          <div className="px-4 py-3 border-t border-white/[0.08]">
            <p className="text-xs text-slate-500 mb-2">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "Explain the project structure",
                "How does authentication work?",
                "What are the main components?",
                "Suggest improvements",
              ].map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendMessage(prompt)}
                  className="text-xs border-white/[0.08] hover:bg-white/[0.05] hover:border-[#00e5ff]/30"
                >
                  <Sparkles className="w-3 h-3 mr-1.5 text-[#00e5ff]" />
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-white/[0.08]">
          <ChatInput
            onSend={handleSendMessage}
            disabled={isLoading}
            placeholder="Ask about this repository..."
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-slate-500">
              Powered by{" "}
              <span className="text-[#00e5ff]">Google Gemini</span>
            </p>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Zap className="w-3 h-3" />
              <span>Fast response mode</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
