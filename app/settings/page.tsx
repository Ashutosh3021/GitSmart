/**
 * Settings Page
 * 
 * User settings with:
 * - GitHub OAuth connection status
 * - API Key inputs for AI providers
 * - Model selector per provider
 * - Memory management (saved chats per repo)
 * - Theme toggle (dark only for now)
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  ProviderSelector,
  AIProvider,
  ProviderBadge,
} from "@/components/provider-selector";
import {
  Github,
  Key,
  Brain,
  Trash2,
  Save,
  Check,
  AlertCircle,
  Moon,
  Sun,
  Database,
  Lock,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock saved chats
const mockSavedChats = [
  {
    id: "1",
    repoName: "facebook/react",
    lastMessage: "What is the virtual DOM?",
    timestamp: "2 hours ago",
    messageCount: 24,
  },
  {
    id: "2",
    repoName: "vercel/next.js",
    lastMessage: "Explain server components",
    timestamp: "Yesterday",
    messageCount: 12,
  },
  {
    id: "3",
    repoName: "microsoft/vscode",
    lastMessage: "How does the extension API work?",
    timestamp: "3 days ago",
    messageCount: 8,
  },
];

interface APIKeyFieldProps {
  provider: AIProvider;
  label: string;
  value: string;
  onChange: (value: string) => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

function APIKeyField({
  provider,
  label,
  value,
  onChange,
  isVisible,
  onToggleVisibility,
}: APIKeyFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-slate-400 flex items-center gap-2">
        <ProviderBadge provider={provider} />
        <span>API Key</span>
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type={isVisible ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter your ${label} API key`}
            className="bg-white/[0.03] border-white/[0.08] focus:border-[#00e5ff]/50 font-mono pr-20"
          />
          {value && (
            <Badge
              variant="secondary"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-green-500/10 text-green-400 text-xs"
            >
              <Check className="w-3 h-3 mr-1" />
              Saved
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleVisibility}
          className="border-white/[0.08] hover:bg-white/[0.05]"
        >
          {isVisible ? (
            <Lock className="w-4 h-4 text-slate-400" />
          ) : (
            <Key className="w-4 h-4 text-slate-400" />
          )}
        </Button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [isGithubConnected, setIsGithubConnected] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>("gemini");
  const [selectedModel, setSelectedModel] = useState("gemini-1.5-pro");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [saved, setSaved] = useState(false);

  // API Keys state
  const [apiKeys, setApiKeys] = useState({
    gemini: "",
    openai: "",
    anthropic: "",
    groq: "",
  });

  const [visibleKeys, setVisibleKeys] = useState({
    gemini: false,
    openai: false,
    anthropic: false,
    groq: false,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearMemory = () => {
    // Mock clear memory
    alert("Chat memory cleared successfully!");
  };

  const toggleKeyVisibility = (provider: keyof typeof visibleKeys) => {
    setVisibleKeys((prev) => ({
      ...prev,
      [provider]: !prev[provider],
    }));
  };

  return (
    <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400">
            Manage your integrations, API keys, and preferences
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* GitHub Connection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-card p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "p-3 rounded-xl",
                      isGithubConnected
                        ? "bg-green-500/10"
                        : "bg-white/[0.05]"
                    )}
                  >
                    <Github
                      className={cn(
                        "w-6 h-6",
                        isGithubConnected ? "text-green-400" : "text-slate-400"
                      )}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">
                        GitHub Connection
                      </h3>
                      <Badge
                        variant="secondary"
                        className={cn(
                          isGithubConnected
                            ? "bg-green-500/10 text-green-400"
                            : "bg-yellow-500/10 text-yellow-400"
                        )}
                      >
                        {isGithubConnected ? "Connected" : "Not Connected"}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">
                      {isGithubConnected
                        ? "Your GitHub account is connected. You can analyze private repositories."
                        : "Connect your GitHub account to analyze private repositories and save preferences."}
                    </p>
                    <Button
                      variant={isGithubConnected ? "outline" : "default"}
                      onClick={() => setIsGithubConnected(!isGithubConnected)}
                      className={
                        isGithubConnected
                          ? "border-white/[0.08] hover:bg-white/[0.05]"
                          : "bg-[#00e5ff] hover:bg-[#00b8d4] text-[#0a0a0f]"
                      }
                    >
                      {isGithubConnected ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Reconnect
                        </>
                      ) : (
                        <>
                          <Github className="w-4 h-4 mr-2" />
                          Connect GitHub
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* AI Provider Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-[#00e5ff]/10">
                  <Brain className="w-5 h-5 text-[#00e5ff]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">AI Providers</h3>
                  <p className="text-sm text-slate-400">
                    Configure API keys for AI providers
                  </p>
                </div>
              </div>

              {/* Default Provider Selector */}
              <div className="mb-6 p-4 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                <ProviderSelector
                  value={selectedProvider}
                  onChange={(provider) => {
                    setSelectedProvider(provider);
                    // Update default model
                    const models = {
                      gemini: "gemini-1.5-pro",
                      openai: "gpt-4o",
                      anthropic: "claude-3-5-sonnet",
                      groq: "llama-3.1-70b",
                    };
                    setSelectedModel(models[provider]);
                  }}
                  showModelSelector={true}
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                />
              </div>

              <Separator className="bg-white/[0.08] my-6" />

              {/* API Keys */}
              <div className="space-y-4">
                <APIKeyField
                  provider="gemini"
                  label="Google Gemini"
                  value={apiKeys.gemini}
                  onChange={(value) =>
                    setApiKeys((prev) => ({ ...prev, gemini: value }))
                  }
                  isVisible={visibleKeys.gemini}
                  onToggleVisibility={() => toggleKeyVisibility("gemini")}
                />
                <APIKeyField
                  provider="openai"
                  label="OpenAI"
                  value={apiKeys.openai}
                  onChange={(value) =>
                    setApiKeys((prev) => ({ ...prev, openai: value }))
                  }
                  isVisible={visibleKeys.openai}
                  onToggleVisibility={() => toggleKeyVisibility("openai")}
                />
                <APIKeyField
                  provider="anthropic"
                  label="Anthropic Claude"
                  value={apiKeys.anthropic}
                  onChange={(value) =>
                    setApiKeys((prev) => ({ ...prev, anthropic: value }))
                  }
                  isVisible={visibleKeys.anthropic}
                  onToggleVisibility={() => toggleKeyVisibility("anthropic")}
                />
                <APIKeyField
                  provider="groq"
                  label="Groq"
                  value={apiKeys.groq}
                  onChange={(value) =>
                    setApiKeys((prev) => ({ ...prev, groq: value }))
                  }
                  isVisible={visibleKeys.groq}
                  onToggleVisibility={() => toggleKeyVisibility("groq")}
                />
              </div>
            </Card>
          </motion.div>

          {/* Memory Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-[#7c3aed]/10">
                  <Database className="w-5 h-5 text-[#7c3aed]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Memory Management</h3>
                  <p className="text-sm text-slate-400">
                    Manage saved chat history per repository
                  </p>
                </div>
              </div>

              {/* Saved Chats List */}
              <div className="space-y-3 mb-6">
                {mockSavedChats.map((chat) => (
                  <div
                    key={chat.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white text-sm">
                          {chat.repoName}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-white/[0.05]"
                        >
                          {chat.messageCount} messages
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        Last: {chat.lastMessage}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">
                        {chat.timestamp}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-400/10"
                        onClick={() => {
                          /* Delete chat */
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={handleClearMemory}
                className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Memory
              </Button>
            </Card>
          </motion.div>

          {/* Appearance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-white/[0.05]">
                    {isDarkMode ? (
                      <Moon className="w-5 h-5 text-slate-400" />
                    ) : (
                      <Sun className="w-5 h-5 text-yellow-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Theme</h3>
                    <p className="text-sm text-slate-400">
                      Dark mode is currently the only available theme
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={isDarkMode}
                    onCheckedChange={setIsDarkMode}
                    disabled={true}
                    className="data-[state=checked]:bg-[#00e5ff]"
                  />
                  <span className="text-sm text-slate-500">Dark</span>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-400">
                  Light theme is coming soon. Stay tuned for updates!
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-end"
          >
            <Button
              size="lg"
              onClick={handleSave}
              className={cn(
                "min-w-[140px]",
                saved
                  ? "bg-green-500 hover:bg-green-500"
                  : "bg-[#00e5ff] hover:bg-[#00b8d4] text-[#0a0a0f]"
              )}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
