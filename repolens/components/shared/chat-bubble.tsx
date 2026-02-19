"use client";

import { Bot, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
  className?: string;
}

export function ChatBubble({
  message,
  isUser,
  timestamp,
  className = "",
}: ChatBubbleProps) {
  return (
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""} ${className}`}
    >
      {/* Avatar */}
      <Avatar className={`w-8 h-8 flex-shrink-0 ${isUser ? "ring-2 ring-purple-500/30" : "ring-2 ring-cyan-500/30"}`}>
        {isUser ? (
          <>
            <AvatarImage src="https://github.com/ghost.png" />
            <AvatarFallback className="bg-purple-600">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </>
        ) : (
          <>
            <AvatarImage src="/bot-avatar.png" />
            <AvatarFallback className="bg-cyan-600">
              <Bot className="w-4 h-4" />
            </AvatarFallback>
          </>
        )}
      </Avatar>

      {/* Message content */}
      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[80%]`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? "bg-purple-600/20 border border-purple-500/30 text-slate-200 rounded-br-md"
              : "bg-[#1a1a2e] border border-[#2d2d44] text-slate-200 rounded-bl-md"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
        </div>
        {timestamp && (
          <span className="text-xs text-slate-500 mt-1">{timestamp}</span>
        )}
      </div>
    </div>
  );
}
