"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Provider {
  id: string;
  name: string;
  models: string[];
}

interface ProviderSelectorProps {
  providers?: Provider[];
  selectedProvider: string;
  selectedModel: string;
  onProviderChange: (provider: string) => void;
  onModelChange: (model: string) => void;
  className?: string;
}

const defaultProviders: Provider[] = [
  {
    id: "openai",
    name: "OpenAI",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    models: ["claude-3-5-sonnet", "claude-3-opus", "claude-3-haiku"],
  },
  {
    id: "gemini",
    name: "Google Gemini",
    models: ["gemini-1.5-pro", "gemini-1.5-flash"],
  },
  {
    id: "groq",
    name: "Groq",
    models: ["llama-3.1-70b", "llama-3.1-8b", "mixtral-8x7b"],
  },
];

export function ProviderSelector({
  providers = defaultProviders,
  selectedProvider,
  selectedModel,
  onProviderChange,
  onModelChange,
  className = "",
}: ProviderSelectorProps) {
  const currentProvider = providers.find((p) => p.id === selectedProvider);

  return (
    <div className={`flex gap-2 ${className}`}>
      <Select value={selectedProvider} onValueChange={onProviderChange}>
        <SelectTrigger className="w-[140px] bg-[#1a1a2e] border-[#2d2d44] text-slate-200">
          <SelectValue placeholder="Provider" />
        </SelectTrigger>
        <SelectContent className="bg-[#1a1a2e] border-[#2d2d44]">
          {providers.map((provider) => (
            <SelectItem
              key={provider.id}
              value={provider.id}
              className="text-slate-200 focus:bg-cyan-500/20 focus:text-cyan-400"
            >
              {provider.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger className="w-[160px] bg-[#1a1a2e] border-[#2d2d44] text-slate-200">
          <SelectValue placeholder="Model" />
        </SelectTrigger>
        <SelectContent className="bg-[#1a1a2e] border-[#2d2d44]">
          {currentProvider?.models.map((model) => (
            <SelectItem
              key={model}
              value={model}
              className="text-slate-200 focus:bg-cyan-500/20 focus:text-cyan-400"
            >
              {model}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
