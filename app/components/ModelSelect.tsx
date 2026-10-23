"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, Key, Search } from "react-feather";
import { findModel } from "@/lib/modelConfig";
import { MODEL_PROVIDERS, PROVIDERS, PROVIDER_COLORS } from "@/lib/providers";
import type { ModelProviderConfig, ProviderAvailability } from "@/lib/types";
import { usePopover } from "./ui/usePopover";

export { PROVIDER_COLORS };

interface ModelSelectProps {
  /** Selected model reference, or "" for the "auto" option. */
  value: string;
  onChange: (model: string) => void;
  /** From useModelCatalog(): all known models and which providers are usable. */
  catalog: { models: ModelProviderConfig[]; availability: ProviderAvailability | null };
  /** Adds an "auto" option (value ""), e.g. "Auto (agent's choice)". */
  autoLabel?: string;
  /** Shown on the button when value is "" (defaults to autoLabel). */
  autoHint?: string;
  align?: "left" | "right";
  direction?: "down" | "up";
  className?: string;
}

export function PricingBadge({ pricing }: { pricing: "free" | "free-tier" | "paid" }) {
  if (pricing === "paid") return null;
  return (
    <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
      {pricing === "free" ? "Free" : "Free tier"}
    </span>
  );
}

/** LobeChat-style model switcher grouped by provider; providers without a key link to Settings. */
export default function ModelSelect({ value, onChange, catalog, autoLabel, autoHint, align = "left", direction = "down", className = "" }: ModelSelectProps) {
  const { open, setOpen, ref } = usePopover();
  const [query, setQuery] = useState("");
  const [freeOnly, setFreeOnly] = useState(false);
  const { models, availability } = catalog;
  const current = value ? findModel(value, models) : undefined;

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MODEL_PROVIDERS.map(provider => {
      const info = PROVIDERS[provider];
      const available = availability === null || availability[provider];
      const providerMatches = !q || info.label.toLowerCase().includes(q);
      const items = models.filter(
        m =>
          m.modelProvider === provider &&
          (!freeOnly || m.free) &&
          (providerMatches || m.label.toLowerCase().includes(q) || m.model.toLowerCase().includes(q)),
      );
      return { provider, info, available, items, providerMatches };
    })
      .filter(g => {
        if (g.available) return g.items.length > 0;
        // Unconfigured providers collapse into an "Add key" row (local-only providers are hidden).
        return g.info.byok && (!freeOnly || g.info.pricing !== "paid") && (g.providerMatches || g.items.length > 0);
      })
      // Usable providers first; "Add key" rows (free tiers before paid) at the end.
      .sort((a, b) => Number(b.available) - Number(a.available) || (a.available ? 0 : Number(a.info.pricing === "paid") - Number(b.info.pricing === "paid")));
  }, [models, availability, query, freeOnly]);

  const choose = (model: string) => {
    onChange(model);
    setOpen(false);
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-medium text-fg transition-colors hover:bg-elevated"
      >
        {current && <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: PROVIDER_COLORS[current.modelProvider] }} />}
        <span className="max-w-[12rem] truncate">{current ? current.label : autoHint ?? autoLabel ?? "Choose model"}</span>
        {current?.free && <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">FREE</span>}
        <ChevronDown size={14} className="shrink-0 text-subtle" />
      </button>

      {open && (
        <div
          className={`absolute z-40 flex max-h-[min(70vh,560px)] w-80 flex-col rounded-2xl border border-line bg-surface shadow-lift animate-fade-in ${
            align === "right" ? "right-0" : "left-0"
          } ${direction === "up" ? "bottom-full mb-2" : "top-full mt-2"}`}
        >
          <div className="flex items-center gap-1.5 border-b border-line p-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-2.5 top-2.5 text-subtle" />
              <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search models" aria-label="Search models" className="input py-1.5 pl-8 text-[13px]" />
            </div>
            <button
              type="button"
              onClick={() => setFreeOnly(f => !f)}
              aria-pressed={freeOnly}
              className={`shrink-0 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${freeOnly ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "text-muted hover:bg-elevated"}`}
            >
              Free only
            </button>
          </div>

          <div role="listbox" className="overflow-y-auto p-1.5">
            {autoLabel && !query && (
              <button
                type="button"
                role="option"
                aria-selected={!value}
                onClick={() => choose("")}
                className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-sm hover:bg-elevated"
              >
                <span>
                  <span className="block font-medium">{autoLabel}</span>
                  <span className="block text-xs text-muted">Use the model recommended by the agent</span>
                </span>
                {!value && <Check size={14} className="text-accent" />}
              </button>
            )}

            {groups.map(({ provider, info, available, items }, index) =>
              available ? (
                <div key={provider} className="mt-1">
                  <div className="flex items-center gap-1.5 px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-subtle">
                    <span className="h-2 w-2 rounded-full" style={{ background: info.color }} />
                    {info.label}
                    <PricingBadge pricing={info.pricing} />
                  </div>
                  {items.map(m => (
                    <button
                      key={m.model}
                      type="button"
                      role="option"
                      aria-selected={value === m.model}
                      onClick={() => choose(m.model)}
                      className="flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left text-sm hover:bg-elevated"
                    >
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5 font-medium">
                          <span className="truncate">{m.label}</span>
                          {m.free && info.pricing === "paid" && <PricingBadge pricing="free" />}
                          {m.default && <span className="tag shrink-0">default</span>}
                        </span>
                        {m.description && <span className="block truncate text-xs text-muted">{m.description}</span>}
                      </span>
                      {value === m.model && <Check size={14} className="shrink-0 text-accent" />}
                    </button>
                  ))}
                </div>
              ) : (
                <div key={provider}>
                {(index === 0 || groups[index - 1].available) && (
                  <div className="px-2.5 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-subtle">More providers</div>
                )}
                <Link
                  href={`/settings#${provider}`}
                  onClick={() => setOpen(false)}
                  className="mt-1 flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm text-muted hover:bg-elevated hover:text-fg"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: info.color }} />
                  <span className="flex-1 truncate">{info.label}</span>
                  <PricingBadge pricing={info.pricing} />
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-accent">
                    <Key size={12} /> Add key
                  </span>
                </Link>
                </div>
              ),
            )}
            {!groups.length && <p className="px-3 py-6 text-center text-sm text-muted">No models match.</p>}
          </div>
          <Link href="/settings" onClick={() => setOpen(false)} className="border-t border-line px-3 py-2 text-center text-xs font-medium text-accent hover:bg-elevated">
            Manage API keys and free providers
          </Link>
        </div>
      )}
    </div>
  );
}
