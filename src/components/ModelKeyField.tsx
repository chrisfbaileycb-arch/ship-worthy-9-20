import React, { useState, useSyncExternalStore } from "react";
import { KeyRound, Check, X } from "lucide-react";
import { getUserKey, setUserKey, subscribeUserKey } from "../lib/byok";

/**
 * Where a visitor supplies their own Gemini key. The key is held in memory only (see lib/byok.ts):
 * it is gone on reload, it is never saved, and it is sent only with the requests that need a model.
 */
export const ModelKeyField: React.FC = () => {
  const key = useSyncExternalStore(subscribeUserKey, getUserKey, getUserKey);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const hasKey = key.length > 0;

  const save = () => {
    if (!draft.trim()) return;
    setUserKey(draft);
    setDraft("");
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        id="model-key-nav-btn"
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="model-key-popover"
        title="Analyses run on your own Gemini API key. It stays in this tab's memory."
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border whitespace-nowrap transition-all cursor-pointer ${
          hasKey
            ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
            : "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
        }`}
      >
        {hasKey ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <KeyRound className="w-3.5 h-3.5 text-amber-700" />}
        <span>{hasKey ? "Key set" : "Add key"}</span>
      </button>

      {open && (
        <div
          id="model-key-popover"
          role="dialog"
          aria-label="Your Gemini API key"
          className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] p-4 rounded-xl bg-white border border-slate-200 shadow-lg text-slate-800 z-50"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <p className="text-xs font-bold">Your Gemini API key</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-slate-500 hover:text-slate-800 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-slate-600 mb-3">
            Analyses run on your key, so you control the cost. It stays in this tab&apos;s memory, is sent only with each analysis request, and is forgotten when you reload.{" "}
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="underline text-emerald-700">
              Get a key
            </a>
          </p>
          <label htmlFor="model-key-input" className="sr-only">
            Gemini API key
          </label>
          <input
            id="model-key-input"
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            placeholder={hasKey ? "Replace the key" : "Paste your key"}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:border-emerald-500 focus:outline-none"
          />
          <div className="flex items-center justify-between mt-3">
            <button
              type="button"
              onClick={save}
              disabled={!draft.trim()}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold cursor-pointer disabled:cursor-not-allowed"
            >
              Use this key
            </button>
            {hasKey && (
              <button
                type="button"
                onClick={() => {
                  setUserKey("");
                  setOpen(false);
                }}
                className="text-xs font-semibold text-rose-700 hover:underline cursor-pointer"
              >
                Clear key
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
