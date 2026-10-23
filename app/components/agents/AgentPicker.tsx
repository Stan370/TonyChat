"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, Search } from "react-feather";
import AgentAvatar from "../AgentAvatar";
import { usePopover } from "../ui/usePopover";
import type { Agent } from "@/lib/types";

interface AgentPickerProps {
  agents: Agent[];
  value: Agent;
  onChange: (agent: Agent) => void;
  direction?: "down" | "up";
}

/** Compact agent switcher used in the home composer. */
export default function AgentPicker({ agents, value, onChange, direction = "down" }: AgentPickerProps) {
  const { open, setOpen, ref } = usePopover();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return agents.filter(a => !q || a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || a.tags.some(t => t.includes(q)));
  }, [agents, query]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex max-w-[14rem] items-center gap-1.5 rounded-full border border-line bg-surface py-0.5 pl-0.5 pr-2.5 text-xs font-medium text-fg transition-colors hover:bg-elevated"
      >
        <AgentAvatar avatar={value.avatar} name={value.name} background={value.avatarBg} size={22} shape="circle" />
        <span className="truncate">{value.name}</span>
        <ChevronDown size={14} className="shrink-0 text-subtle" />
      </button>

      {open && (
        <div
          className={`absolute left-0 z-40 w-80 rounded-2xl border border-line bg-surface p-1.5 shadow-lift animate-fade-in ${
            direction === "up" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          <div className="relative mb-1">
            <Search size={14} className="absolute left-2.5 top-2.5 text-subtle" />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search agents"
              className="input py-1.5 pl-8"
            />
          </div>
          <div role="listbox" className="max-h-72 overflow-y-auto">
            {filtered.map(agent => (
              <button
                key={agent.id}
                type="button"
                role="option"
                aria-selected={agent.id === value.id}
                onClick={() => {
                  onChange(agent);
                  setOpen(false);
                  setQuery("");
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left hover:bg-elevated"
              >
                <AgentAvatar avatar={agent.avatar} name={agent.name} background={agent.avatarBg} size={30} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {agent.name}
                    {agent.custom && <span className="ml-1.5 tag">mine</span>}
                  </span>
                  <span className="block truncate text-xs text-muted">{agent.description}</span>
                </span>
                {agent.id === value.id && <Check size={14} className="shrink-0 text-accent" />}
              </button>
            ))}
            {!filtered.length && <p className="px-3 py-4 text-center text-sm text-muted">No agents match “{query}”.</p>}
          </div>
          <Link href="/store" className="mt-1 block rounded-xl px-2.5 py-2 text-center text-xs font-medium text-accent hover:bg-elevated">
            Browse the agent marketplace
          </Link>
        </div>
      )}
    </div>
  );
}
