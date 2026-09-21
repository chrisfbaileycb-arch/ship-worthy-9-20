import React, { useState, useRef, useEffect } from "react";
import {
  NovaChatMessage,
  NovaArtifact,
  NovaToolCall,
} from "../types";
import {
  Bot,
  Send,
  Sparkles,
  Terminal,
  FileCode,
  Check,
  Copy,
  Layers,
  Code,
  Globe,
  RefreshCw,
  Cpu,
  Shield,
  Zap,
  Maximize2,
  Minimize2,
  Sliders,
  ExternalLink,
} from "lucide-react";

interface NovaAgentWorkspaceViewProps {
  initialPrompt?: string;
  onNavigateToCertification?: () => void;
}

export const NovaAgentWorkspaceView: React.FC<NovaAgentWorkspaceViewProps> = ({
  initialPrompt = "",
  onNavigateToCertification,
}) => {
  const [messages, setMessages] = useState<NovaChatMessage[]>([
    {
      id: "msg-1",
      role: "system",
      content:
        "Nova Agent Orchestrator initialized with MCP Server & AGENTS.md protocol enforcement. Ready for natural language vibe coding, architecture synthesis, and artifact generation.",
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: "msg-2",
      role: "assistant",
      content:
        "Welcome to the Nova Agent & Artifact Workspace! What are we building today? You can ask me to write a full-stack Spotify playlist synchronization app, design a Next.js landing page with OKLCH tokens, generate Playwright chaos tests, or verify MCP tool configurations.",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const [inputVal, setInputVal] = useState<string>(initialPrompt || "");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [activeArtifact, setActiveArtifact] = useState<NovaArtifact | null>({
    id: "art-1",
    title: "SpotifyStorefront.tsx",
    type: "code",
    language: "typescript",
    createdAt: new Date().toLocaleTimeString(),
    content: `// SpotifyStorefront.tsx - Next.js / React Component
import React, { useState } from 'react';
import { ShoppingBag, Music, Play, Check } from 'lucide-react';

export function SpotifyStorefront() {
  const [syncedTracks, setSyncedTracks] = useState([
    { id: '1', title: 'Midnight City Synths', plays: '48.2k', price: 29.00 },
    { id: '2', title: 'Deep Tech Drum Samples', plays: '124.9k', price: 49.00 },
  ]);

  return (
    <div className="p-8 bg-slate-950 text-white rounded-3xl border border-slate-800">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500 rounded-2xl text-slate-950 font-bold">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Spotify Audio Kits & Merch</h2>
            <p className="text-xs text-slate-400">Live OAuth 2.0 Ingress Token Active</p>
          </div>
        </div>
        <button className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs">
          Connect Spotify API
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {syncedTracks.map(t => (
          <div key={t.id} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex justify-between items-center">
            <div>
              <div className="font-bold text-sm">{t.title}</div>
              <div className="text-xs text-emerald-400">{t.plays} streams on Spotify</div>
            </div>
            <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold">
              Buy Kit ($\${t.price})
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}`,
  });

  const [copiedArtifact, setCopiedArtifact] = useState<boolean>(false);
  const [artifactViewMode, setArtifactViewMode] = useState<"code" | "preview">("code");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isStreaming) return;

    const userText = inputVal;
    setInputVal("");

    const userMsg: NovaChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);

    // Simulate Agent Tool Calling & Artifact Synthesis
    setTimeout(() => {
      const toolCall: NovaToolCall = {
        id: `call-${Date.now()}`,
        toolName: "mcp_generate_app_artifact",
        parameters: { prompt: userText, framework: "Next.js / Tailwind" },
        status: "executing",
      };

      const assistantMsg: NovaChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: `Analyzing prompt: "${userText}". Executing MCP tool call \`mcp_generate_app_artifact\` to build requested code and verification spec...`,
        timestamp: new Date().toLocaleTimeString(),
        toolCalls: [toolCall],
      };

      setMessages((prev) => [...prev, assistantMsg]);

      setTimeout(() => {
        const isSpotify = userText.toLowerCase().includes("spotify");
        const title = isSpotify ? "SpotifyAppMerchSync.tsx" : "GeneratedComponent.tsx";

        const newArtifact: NovaArtifact = {
          id: `art-${Date.now()}`,
          title: title,
          type: "code",
          language: "typescript",
          createdAt: new Date().toLocaleTimeString(),
          content: isSpotify
            ? `// SpotifyAppMerchSync.tsx - Full Stack Spotify Merch & Playlist Engine
import React, { useState } from "react";
import { Music, ShoppingCart, Disc, Check, ExternalLink } from "lucide-react";

export function SpotifyAppMerchSync() {
  const [tokenReady, setTokenReady] = useState(true);

  return (
    <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl text-white space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Disc className="w-6 h-6 text-emerald-400 animate-spin" />
          <h2 className="text-xl font-bold">Live Spotify Catalog & Checkout</h2>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          OAuth Ingress Cleared
        </span>
      </div>
      <p className="text-sm text-slate-300">
        Direct sync active for Spotify track IDs. Automatically routes payments to Stripe / Shopify.
      </p>
    </div>
  );
}`
            : `// ${title}\n// Built with 1WithOut VibeCoding Compliance\nexport function GeneratedView() {\n  return (\n    <div className="p-6 bg-slate-900 text-white rounded-2xl">\n      <h1 className="text-lg font-bold">${userText}</h1>\n      <p className="text-xs text-slate-400 mt-2">MCP Protocol verified • 100% Type-safe</p>\n    </div>\n  );\n}`,
        };

        setActiveArtifact(newArtifact);

        setMessages((prev) => [
          ...prev.slice(0, -1),
          {
            ...assistantMsg,
            content: `I have synthesized the full component logic according to your specification. The interactive source code is available in the Artifact Visualizer on the right.`,
            toolCalls: [{ ...toolCall, status: "completed", result: { artifactId: newArtifact.id } }],
          },
        ]);
        setIsStreaming(false);
      }, 1200);
    }, 800);
  };

  const handleCopyArtifact = () => {
    if (!activeArtifact) return;
    navigator.clipboard.writeText(activeArtifact.content);
    setCopiedArtifact(true);
    setTimeout(() => setCopiedArtifact(false), 2000);
  };

  return (
    <div id="nova-agent-workspace-root" className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-semibold uppercase tracking-wider mb-2">
            <Bot className="w-3.5 h-3.5" />
            <span>Nova Agent Orchestrator • MCP Protocol & AGENTS.md</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Agent Chat & Interactive Artifact Workspace
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {onNavigateToCertification && (
            <button
              type="button"
              onClick={onNavigateToCertification}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold cursor-pointer"
            >
              6-Pillar Certification
            </button>
          )}
        </div>
      </div>

      {/* Main Split Grid (50% Chat / 50% Artifact) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ------------------------------------------------------------- */}
        {/* LEFT PANEL: CHAT & STREAMING ORCHESTRATOR */}
        {/* ------------------------------------------------------------- */}
        <div className="lg:col-span-6 bg-slate-900/90 rounded-3xl border border-slate-800 flex flex-col h-[700px] shadow-2xl overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-white">Nova Engine v2.0 (Gemini 3.7 Flash)</span>
            </div>
            <span className="font-mono text-slate-400">MCP Protocol: READY</span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col space-y-1.5 ${
                  m.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  {m.role === "assistant" && <Bot className="w-3.5 h-3.5 text-cyan-400" />}
                  <span>{m.role.toUpperCase()}</span>
                  <span>•</span>
                  <span>{m.timestamp}</span>
                </div>

                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed max-w-[90%] ${
                    m.role === "user"
                      ? "bg-emerald-500 text-slate-950 font-medium rounded-tr-sm"
                      : m.role === "system"
                      ? "bg-slate-950 text-slate-400 border border-slate-800 font-mono text-[11px]"
                      : "bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>

                  {/* Tool Call Inspection Badge */}
                  {m.toolCalls && m.toolCalls.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                      {m.toolCalls.map((tc) => (
                        <div
                          key={tc.id}
                          className="bg-slate-900 p-2.5 rounded-xl border border-slate-700/80 font-mono text-[11px] space-y-1 text-slate-300"
                        >
                          <div className="flex items-center justify-between text-cyan-400 font-bold">
                            <span className="flex items-center gap-1.5">
                              <Terminal className="w-3 h-3" />
                              <span>{tc.toolName}</span>
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              {tc.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Input Form */}
          <form onSubmit={handleSendMessage} className="p-4 bg-slate-950/80 border-t border-slate-800">
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask Nova to build Spotify merch components, landing pages, or audit tests..."
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-4 pr-12 py-3.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <button
                type="submit"
                disabled={isStreaming || !inputVal.trim()}
                className="absolute right-2 p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer disabled:opacity-40 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* RIGHT PANEL: ARTIFACT VISUALIZER & LIVE PREVIEW */}
        {/* ------------------------------------------------------------- */}
        <div className="lg:col-span-6 bg-slate-900/90 rounded-3xl border border-slate-800 flex flex-col h-[700px] shadow-2xl overflow-hidden">
          {/* Artifact Header & Actions */}
          <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold text-white">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span>{activeArtifact?.title || "Artifact Visualizer"}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-700 text-[11px]">
                <button
                  type="button"
                  onClick={() => setArtifactViewMode("code")}
                  className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                    artifactViewMode === "code" ? "bg-slate-800 text-emerald-400" : "text-slate-400"
                  }`}
                >
                  Code
                </button>
                <button
                  type="button"
                  onClick={() => setArtifactViewMode("preview")}
                  className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                    artifactViewMode === "preview" ? "bg-slate-800 text-emerald-400" : "text-slate-400"
                  }`}
                >
                  Interactive UI
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyArtifact}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                title="Copy source code"
              >
                {copiedArtifact ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Artifact Content Body */}
          <div className="flex-1 p-6 overflow-y-auto font-mono text-xs">
            {activeArtifact ? (
              artifactViewMode === "code" ? (
                <pre className="text-slate-300 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                  {activeArtifact.content}
                </pre>
              ) : (
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6 font-sans">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-500 rounded-2xl text-slate-950 font-bold">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Live Artifact Preview</h3>
                        <p className="text-xs text-slate-400">1WithOut Ingress Verified</p>
                      </div>
                    </div>
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                      HOT PREVIEW ACTIVE
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                    <div className="text-sm font-bold text-white">Spotify Sync & Merchandise Module</div>
                    <p className="text-xs text-slate-400">
                      Simulated OAuth Token active. Automated checkout rails hooked to Stripe & Shopify.
                    </p>
                  </div>
                </div>
              )
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                <span>No active artifact selected. Prompt the Nova Agent to generate one.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
