"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatBubble } from "@/components/shared/chat-bubble";
import { ProviderSelector } from "@/components/shared/provider-selector";
import { Send, Bot, Sparkles } from "lucide-react";

// Mock chat messages
const initialMessages = [
  {
    id: 1,
    message: "Hi! I'm your AI assistant for analyzing this repository. I can help you understand the codebase, explain specific functions, or answer any questions about the architecture. What would you like to know?",
    isUser: false,
    timestamp: "Just now",
  },
];

export function ChatTab() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState("openai");
  const [model, setModel] = useState("gpt-4o");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      message: input,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        message: `Based on my analysis of this repository, ${input.toLowerCase().includes("architecture") 
          ? "this project uses a modern React-based architecture with Next.js. The App Router provides server-side rendering capabilities, while the API routes handle backend functionality. Key architectural decisions include using TypeScript for type safety, Tailwind CSS for styling, and a component-based structure that promotes reusability."
          : input.toLowerCase().includes("test")
          ? "The repository has comprehensive test coverage using Jest and React Testing Library. Tests are organized in a __tests__ directory following the co-location pattern. Unit tests cover individual components, while integration tests verify feature workflows."
          : "This codebase demonstrates excellent practices with clear separation of concerns, proper TypeScript typing, and well-documented functions. The project structure follows Next.js conventions with the App Router for modern React patterns."
        }`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="h-[calc(100vh-220px)] flex flex-col max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-slate-200">
              Chat with Repository
            </h3>
            <p className="text-sm text-slate-500">
              Ask questions about the codebase
            </p>
          </div>
        </div>
        <ProviderSelector
          selectedProvider={provider}
          selectedModel={model}
          onProviderChange={setProvider}
          onModelChange={setModel}
        />
      </div>

      {/* Chat Container */}
      <Card className="flex-1 flex flex-col bg-glass border-[#2d2d44] overflow-hidden">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                message={msg.message}
                isUser={msg.isUser}
                timestamp={msg.timestamp}
              />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-slate-500">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="text-sm">AI is thinking...</span>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Memory Indicator */}
        <div className="px-4 py-2 bg-[#1a1a2e] border-t border-[#2d2d44]">
          <p className="text-xs text-slate-500">
            <span className="text-cyan-400">{messages.length}</span> messages remembered · 
            Context: <span className="text-slate-400">vercel/next.js</span>
          </p>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[#2d2d44]">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Ask about the codebase..."
              className="flex-1 bg-[#0d0d14] border-[#1f1f2e] text-slate-200 placeholder:text-slate-600"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Provider Label */}
      <p className="text-center text-xs text-slate-500 mt-3">
        Powered by <span className="text-cyan-400 capitalize">{provider}</span> · {model}
      </p>
    </div>
  );
}
