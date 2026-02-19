/**
 * ChatBubble Component
 * 
 * Message bubbles for the chat interface:
 * - User variant (right-aligned, cyan accent)
 * - Assistant variant (left-aligned, purple accent)
 * - Markdown rendering support
 * - Timestamps
 * 
 * Props:
 * - content: string - Message content
 * - role: "user" | "assistant" - Message sender
 * - timestamp?: Date - Message timestamp
 * - isLoading?: boolean - Show loading state
 */

"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ChatBubbleProps {
  content: string;
  role: "user" | "assistant";
  timestamp?: Date;
  isLoading?: boolean;
}

export function ChatBubble({
  content,
  role,
  timestamp,
  isLoading = false,
}: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex gap-3 max-w-[90%]",
        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser
            ? "bg-gradient-to-br from-[#00e5ff] to-[#00b8d4]"
            : "bg-gradient-to-br from-[#7c3aed] to-[#6d28d9]"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-[#0a0a0f]" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className="flex flex-col gap-1">
        <div
          className={cn(
            "px-4 py-3 rounded-2xl",
            isUser
              ? "bg-[#00e5ff]/10 border border-[#00e5ff]/20 rounded-tr-sm"
              : "bg-white/[0.05] border border-white/[0.08] rounded-tl-sm"
          )}
        >
          {isLoading ? (
            <div className="flex items-center gap-2 py-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-[#00e5ff] rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-[#00e5ff] rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-[#00e5ff] rounded-full animate-bounce" />
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "prose prose-invert prose-sm max-w-none",
                "prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0",
                "prose-code:text-[#00e5ff] prose-code:bg-[#00e5ff]/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded"
              )}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Timestamp */}
        {timestamp && (
          <span
            className={cn(
              "text-xs text-slate-500",
              isUser ? "text-right" : "text-left"
            )}
          >
            {timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
    </motion.div>
  );
}

/**
 * ChatInput Component
 * 
 * Input bar for the chat interface
 */
import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({
  onSend,
  placeholder = "Ask about this repository...",
  disabled = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-[80px] pr-14 resize-none bg-white/[0.03] border-white/[0.08] focus:border-[#00e5ff]/50 focus:ring-[#00e5ff]/20 text-slate-200 placeholder:text-slate-500"
      />
      <Button
        type="submit"
        size="icon"
        disabled={!message.trim() || disabled}
        className="absolute bottom-3 right-3 h-9 w-9 bg-[#00e5ff] hover:bg-[#00b8d4] text-[#0a0a0f] disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
