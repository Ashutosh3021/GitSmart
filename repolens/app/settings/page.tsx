"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Navbar } from "@/components/shared/navbar";
import {
  Github,
  Key,
  Trash2,
  Database,
  Moon,
  Check,
  AlertCircle,
  MemoryStick,
} from "lucide-react";

// Mock saved chats
const mockSavedChats = [
  { id: 1, repo: "vercel/next.js", messages: 24, lastAccessed: "2 hours ago" },
  { id: 2, repo: "facebook/react", messages: 18, lastAccessed: "1 day ago" },
  { id: 3, repo: "microsoft/vscode", messages: 12, lastAccessed: "3 days ago" },
];

const providers = [
  { id: "gemini", name: "Google Gemini", keyPlaceholder: "AIza..." },
  { id: "openai", name: "OpenAI", keyPlaceholder: "sk-..." },
  { id: "anthropic", name: "Anthropic", keyPlaceholder: "sk-ant-..." },
  { id: "groq", name: "Groq", keyPlaceholder: "gsk_..." },
];

const models = {
  gemini: ["gemini-1.5-pro", "gemini-1.5-flash"],
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"],
  anthropic: ["claude-3-5-sonnet", "claude-3-opus", "claude-3-haiku"],
  groq: ["llama-3.1-70b", "llama-3.1-8b", "mixtral-8x7b"],
};

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [selectedModels, setSelectedModels] = useState<Record<string, string>>({
    gemini: "gemini-1.5-pro",
    openai: "gpt-4o",
    anthropic: "claude-3-5-sonnet",
    groq: "llama-3.1-70b",
  });
  const [isConnected, setIsConnected] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleSaveKey = (providerId: string, key: string) => {
    setApiKeys((prev) => ({ ...prev, [providerId]: key }));
  };

  const handleClearMemory = (chatId: number) => {
    // Mock clear memory
    console.log("Clearing memory for chat", chatId);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold text-slate-100 mb-2">
              Settings
            </h1>
            <p className="text-slate-400">
              Manage your account, API keys, and preferences
            </p>
          </div>

          <div className="space-y-6">
            {/* GitHub Connection */}
            <Card className="p-6 bg-glass border-[#2d2d44]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                    <Github className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-lg text-slate-200">
                      GitHub Connection
                    </h3>
                    <p className="text-sm text-slate-500">
                      Access private repositories and enhanced features
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isConnected ? (
                    <>
                      <Badge className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                        <Check className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                      <Button
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        onClick={() => setIsConnected(false)}
                      >
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white">
                      <Github className="w-4 h-4 mr-2" />
                      Connect GitHub
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* API Keys */}
            <Card className="p-6 bg-glass border-[#2d2d44]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <Key className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg text-slate-200">
                    API Keys
                  </h3>
                  <p className="text-sm text-slate-500">
                    Configure AI provider API keys for enhanced analysis
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {providers.map((provider) => (
                  <div
                    key={provider.id}
                    className="p-4 bg-[#1a1a2e] rounded-lg border border-[#2d2d44]"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1">
                        <Label className="text-slate-200 mb-2 block">
                          {provider.name}
                        </Label>
                        <Input
                          type="password"
                          placeholder={provider.keyPlaceholder}
                          value={apiKeys[provider.id] || ""}
                          onChange={(e) =>
                            handleSaveKey(provider.id, e.target.value)
                          }
                          className="bg-[#0d0d14] border-[#2d2d44] text-slate-200"
                        />
                      </div>
                      <div className="sm:w-48">
                        <Label className="text-slate-200 mb-2 block">
                          Model
                        </Label>
                        <Select
                          value={selectedModels[provider.id]}
                          onValueChange={(value) =>
                            setSelectedModels((prev) => ({
                              ...prev,
                              [provider.id]: value,
                            }))
                          }
                        >
                          <SelectTrigger className="bg-[#0d0d14] border-[#2d2d44] text-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a1a2e] border-[#2d2d44]">
                            {models[provider.id as keyof typeof models].map(
                              (model) => (
                                <SelectItem
                                  key={model}
                                  value={model}
                                  className="text-slate-200 focus:bg-cyan-500/20 focus:text-cyan-400"
                                >
                                  {model}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Memory Management */}
            <Card className="p-6 bg-glass border-[#2d2d44]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <MemoryStick className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg text-slate-200">
                    Memory Management
                  </h3>
                  <p className="text-sm text-slate-500">
                    View and manage saved chat memories per repository
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {mockSavedChats.map((chat) => (
                  <div
                    key={chat.id}
                    className="flex items-center justify-between p-4 bg-[#1a1a2e] rounded-lg border border-[#2d2d44]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 flex items-center justify-center">
                        <Database className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="font-mono text-sm text-slate-300">
                          {chat.repo}
                        </p>
                        <p className="text-xs text-slate-500">
                          {chat.messages} messages · Last accessed{" "}
                          {chat.lastAccessed}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleClearMemory(chat.id)}
                      className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-400 font-medium mb-1">
                      Storage Limit
                    </p>
                    <p className="text-sm text-slate-400">
                      Free tier includes memory for up to 10 repositories. 
                      Upgrade to Pro for unlimited storage.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Theme Settings */}
            <Card className="p-6 bg-glass border-[#2d2d44]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                    <Moon className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-lg text-slate-200">
                      Theme
                    </h3>
                    <p className="text-sm text-slate-500">
                      Choose your preferred color scheme
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-400">
                    {isDarkMode ? "Dark" : "Light"}
                  </span>
                  <Switch
                    checked={isDarkMode}
                    onCheckedChange={setIsDarkMode}
                    className="data-[state=checked]:bg-cyan-500"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4">
                Note: Light theme coming soon. Currently dark mode only.
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
