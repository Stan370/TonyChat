"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, ExternalLink, Eye, EyeOff, Trash2 } from "react-feather";
import { PricingBadge } from "../ModelSelect";
import { setProviderKey, type ProviderKeyEntry } from "@/lib/agentStore";
import { PROVIDERS, type ModelProvider } from "@/lib/providers";

interface ProviderKeyCardProps {
  provider: ModelProvider;
  entry?: ProviderKeyEntry;
  /** The server already has a key (or local URL) for this provider. */
  serverReady: boolean;
  highlighted?: boolean;
}

function mask(key: string) {
  return key.length <= 8 ? "••••" : `${key.slice(0, 4)}…${key.slice(-4)}`;
}

/** One provider: what's free, where to get a key, and a field to save and test your own key. */
export default function ProviderKeyCard({ provider, entry, serverReady, highlighted }: ProviderKeyCardProps) {
  const info = PROVIDERS[provider];
  const regions = info.regions ? Object.entries(info.regions) : [];
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const [region, setRegion] = useState(entry?.region ?? regions[0]?.[0] ?? "");
  const [status, setStatus] = useState<{ kind: "idle" | "checking" | "ok" | "error"; message?: string }>({ kind: "idle" });

  const save = async () => {
    const key = value.trim() || entry?.key;
    if (!key) {
      setStatus({ kind: "error", message: "Paste a key first." });
      return;
    }
    setStatus({ kind: "checking" });
    try {
      const response = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Provider-Key": key, ...(region ? { "X-Provider-Region": region } : {}) },
        body: JSON.stringify({ provider }),
      });
      const result = await response.json().catch(() => ({ ok: false, message: `Check failed (HTTP ${response.status}).` }));
      if (!result.ok) {
        setStatus({ kind: "error", message: result.message });
        return;
      }
      setProviderKey(provider, { key, region: region || undefined, models: result.models, verifiedAt: new Date().toISOString() });
      setValue("");
      const count = Array.isArray(result.models) && result.models.length ? ` ${result.models.length} models available.` : "";
      setStatus({ kind: "ok", message: `${result.message}${count}` });
    } catch {
      setStatus({ kind: "error", message: "Couldn't reach TonyChat's server. Check your connection." });
    }
  };

  return (
    <section id={provider} className={`card scroll-mt-6 p-5 transition-shadow ${highlighted ? "ring-2 ring-accent/50" : ""}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: info.color }} />
        <h3 className="font-semibold">{info.label}</h3>
        <PricingBadge pricing={info.pricing} />
        <span className="ml-auto text-xs">
          {entry?.key ? (
            <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle size={13} /> Your key {mask(entry.key)}
            </span>
          ) : serverReady ? (
            <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle size={13} /> Ready on this server
            </span>
          ) : (
            <span className="text-subtle">Not set up</span>
          )}
        </span>
      </div>
      <p className="mt-2 text-sm text-muted">{info.freeNote}</p>
      {info.privacyNote && (
        <p className="mt-1.5 inline-flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-300">
          <AlertTriangle size={13} className="mt-0.5 shrink-0" /> {info.privacyNote}
        </p>
      )}

      {info.byok ? (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="relative min-w-[14rem] flex-1">
              <input
                type={show ? "text" : "password"}
                value={value}
                onChange={e => setValue(e.target.value)}
                onKeyDown={e => e.key === "Enter" && save()}
                placeholder={entry?.key ? `Replace key (${mask(entry.key)})` : `Paste your ${info.label} API key`}
                aria-label={`${info.label} API key`}
                autoComplete="off"
                spellCheck={false}
                className="input pr-9 font-mono text-[13px]"
              />
              <button type="button" onClick={() => setShow(s => !s)} className="absolute right-1.5 top-1.5 rounded-md p-1 text-subtle hover:text-fg" aria-label={show ? "Hide key" : "Show key"}>
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {regions.length > 0 && (
              <select value={region} onChange={e => setRegion(e.target.value)} aria-label={`${info.label} region`} className="input w-auto">
                {regions.map(([id, r]) => (
                  <option key={id} value={id}>
                    {r.label}
                  </option>
                ))}
              </select>
            )}
            <button type="button" onClick={save} disabled={status.kind === "checking"} className="btn-primary">
              {status.kind === "checking" ? "Checking…" : entry?.key && !value ? "Re-check" : "Save and test"}
            </button>
            {entry?.key && (
              <button
                type="button"
                onClick={() => {
                  setProviderKey(provider, null);
                  setStatus({ kind: "idle" });
                }}
                className="btn-secondary px-2.5"
                aria-label={`Remove ${info.label} key`}
                title="Remove key"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            {info.keyUrl && (
              <a href={info.keyUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-accent hover:underline">
                {info.pricing === "paid" ? "Get an API key" : "Get a free key"} <ExternalLink size={12} />
              </a>
            )}
            {status.message && (
              <span role="status" className={status.kind === "error" ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}>
                {status.message}
              </span>
            )}
          </div>
        </>
      ) : (
        <p className="mt-3 rounded-xl bg-elevated px-3 py-2 font-mono text-xs text-muted">
          {serverReady ? "Connected: models from your Ollama server appear in the model picker." : `Not configured. On the server set ${info.envBaseUrl}=http://localhost:11434/v1 and run \`ollama pull qwen3\`.`}
        </p>
      )}
    </section>
  );
}
