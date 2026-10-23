"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Monitor, Moon, Sun } from "react-feather";
import ProviderKeyCard from "../components/settings/ProviderKeyCard";
import {
  deleteAllConversations,
  getProviderKeys,
  setProviderKey,
  useConversations,
  useModelCatalog,
  useProviderKeys,
} from "@/lib/agentStore";
import { MODEL_PROVIDERS, PROVIDERS, type ModelProvider } from "@/lib/providers";

const FREE_FIRST: ModelProvider[] = [
  ...MODEL_PROVIDERS.filter(p => PROVIDERS[p].byok && PROVIDERS[p].pricing !== "paid"),
  ...MODEL_PROVIDERS.filter(p => PROVIDERS[p].byok && PROVIDERS[p].pricing === "paid"),
  ...MODEL_PROVIDERS.filter(p => !PROVIDERS[p].byok),
];

type Theme = "light" | "dark" | "system";

function applyTheme(theme: Theme) {
  try {
    if (theme === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", theme);
  } catch {
    // storage unavailable
  }
  const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export default function SettingsPage() {
  const keys = useProviderKeys();
  const conversations = useConversations();
  const { serverAvailability, availability } = useModelCatalog();
  const [theme, setTheme] = useState<Theme>("system");
  const [hash, setHash] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      setTheme(saved === "dark" || saved === "light" ? saved : "system");
    } catch {
      // ignore
    }
    const update = () => setHash(window.location.hash.slice(1));
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  // Deep links like /settings#groq scroll to that provider and focus its key field.
  useEffect(() => {
    if (!hash) return;
    const section = document.getElementById(hash);
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
    section?.querySelector("input")?.focus({ preventScroll: true });
  }, [hash]);

  const usable = availability ? MODEL_PROVIDERS.filter(p => availability[p]) : [];
  const keyCount = Object.keys(keys).length;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">Model providers</h2>
          <p className="mt-1 text-sm text-muted">
            Chat for free with your own key from a provider that has a free tier. Gemini, OpenRouter and Groq need no credit card. Keys stay in this browser and are
            sent to TonyChat&apos;s server only to forward your own chat requests; they are never stored on the server.
          </p>
          <div className="mt-3 rounded-2xl border border-line bg-surface px-4 py-3 text-sm">
            {availability === null ? (
              <span className="text-muted">Checking which providers are ready…</span>
            ) : usable.length ? (
              <span>
                Ready to chat with: <b>{usable.map(p => PROVIDERS[p].label).join(", ")}</b>.{" "}
                <Link href="/" className="font-medium text-accent hover:underline">
                  Start a chat
                </Link>
              </span>
            ) : (
              <span>
                No provider is set up yet. The quickest free option: get a <b>Google AI Studio</b> or <b>OpenRouter</b> key (about a minute, no card) and paste it below.
              </span>
            )}
          </div>

          <div className="mt-4 space-y-3">
            {FREE_FIRST.map((provider, i) => (
              <div key={provider}>
                {i === 0 && <h3 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-subtle">Free and free-tier providers</h3>}
                {PROVIDERS[provider].pricing === "paid" && PROVIDERS[FREE_FIRST[i - 1]]?.pricing !== "paid" && (
                  <h3 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-subtle">Paid providers</h3>
                )}
                {!PROVIDERS[provider].byok && PROVIDERS[FREE_FIRST[i - 1]]?.byok && (
                  <h3 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-subtle">Self-hosted</h3>
                )}
                <ProviderKeyCard provider={provider} entry={keys[provider]} serverReady={Boolean(serverAvailability?.[provider])} highlighted={hash === provider} />
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold">Appearance</h2>
          <div className="mt-3 inline-flex rounded-xl bg-elevated p-1" role="radiogroup" aria-label="Theme">
            {([
              ["light", "Light", Sun],
              ["dark", "Dark", Moon],
              ["system", "System", Monitor],
            ] as const).map(([value, label, Icon]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={theme === value}
                onClick={() => {
                  setTheme(value);
                  applyTheme(value);
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${theme === value ? "bg-surface text-fg shadow-card" : "text-muted hover:text-fg"}`}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold">Your data</h2>
          <p className="mt-1 text-sm text-muted">
            Chats, custom agents and keys are stored only in this browser. Clearing your browser data removes them.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-secondary"
              disabled={!conversations.length}
              onClick={() => {
                if (window.confirm(`Delete all ${conversations.length} chats in this browser? This can't be undone.`)) deleteAllConversations();
              }}
            >
              Delete all chats ({conversations.length})
            </button>
            <button
              type="button"
              className="btn-secondary"
              disabled={!keyCount}
              onClick={() => {
                if (!window.confirm("Remove all API keys saved in this browser?")) return;
                for (const provider of Object.keys(getProviderKeys()) as ModelProvider[]) setProviderKey(provider, null);
              }}
            >
              Remove all API keys ({keyCount})
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
