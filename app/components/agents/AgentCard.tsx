"use client";

import { Heart } from "react-feather";
import AgentAvatar from "../AgentAvatar";
import { PROVIDER_COLORS } from "../ModelSelect";
import { resolveModel } from "@/lib/modelConfig";
import type { Agent } from "@/lib/types";

interface AgentCardProps {
  agent: Agent;
  favorite?: boolean;
  onToggleFavorite?: () => void;
  onOpen: () => void;
  variant?: "default" | "featured";
}

/** Marketplace card (LobeChat Discover style). The whole card opens the agent; the heart toggles favorite. */
export default function AgentCard({ agent, favorite, onToggleFavorite, onOpen, variant = "default" }: AgentCardProps) {
  const model = resolveModel(agent.model)?.config;
  const featured = variant === "featured";
  return (
    <div className="group card relative flex h-full flex-col p-4 transition-all hover:-translate-y-0.5 hover:shadow-lift">
      {featured && <div className="pointer-events-none absolute inset-x-0 top-0 h-20 rounded-t-2xl opacity-70" style={{ background: agent.avatarBg }} />}
      <button type="button" onClick={onOpen} className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50" aria-label={`Open ${agent.name}`} />
      <div className="pointer-events-none relative flex items-start gap-3">
        <AgentAvatar avatar={agent.avatar} name={agent.name} background={agent.avatarBg ? `linear-gradient(${agent.avatarBg}, ${agent.avatarBg}), rgb(var(--surface))` : undefined} size={featured ? 56 : 48} />
        <div className="min-w-0 flex-1 pt-0.5">
          <h3 className="truncate font-semibold">{agent.name}</h3>
          <p className="truncate text-xs text-subtle">
            {agent.custom ? "Created by you" : `by ${agent.author}`} · {agent.category}
          </p>
        </div>
      </div>
      {onToggleFavorite && (
        <button
          type="button"
          onClick={onToggleFavorite}
          className={`absolute right-3 top-3 z-10 rounded-lg p-1.5 transition-colors ${
            favorite ? "text-pink-500" : "text-subtle opacity-0 hover:bg-elevated hover:text-fg group-hover:opacity-100 focus-visible:opacity-100"
          }`}
          aria-pressed={favorite}
          aria-label={favorite ? `Remove ${agent.name} from favorites` : `Add ${agent.name} to favorites`}
        >
          <Heart size={16} fill={favorite ? "currentColor" : "none"} />
        </button>
      )}
      <p className={`pointer-events-none relative mt-3 text-sm text-muted ${featured ? "line-clamp-3" : "line-clamp-2"}`}>{agent.description || "No description."}</p>
      <div className="pointer-events-none relative mt-auto flex flex-wrap items-center gap-1.5 pt-3">
        {agent.tags.slice(0, 3).map(tag => (
          <span key={tag} className="tag">{tag}</span>
        ))}
        {model && (
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-subtle">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: PROVIDER_COLORS[model.modelProvider] }} />
            {model.label}
          </span>
        )}
      </div>
    </div>
  );
}
