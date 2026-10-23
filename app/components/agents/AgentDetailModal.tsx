"use client";

import { useState } from "react";
import { ArrowUpRight, Copy, Edit2, Heart, MessageSquare, Share2, Trash2, X } from "react-feather";
import AgentAvatar from "../AgentAvatar";
import Modal from "../ui/Modal";
import { PROVIDER_COLORS } from "../ModelSelect";
import { resolveModel } from "@/lib/modelConfig";
import type { Agent, ProviderAvailability } from "@/lib/types";

interface AgentDetailModalProps {
  agent: Agent;
  availability: ProviderAvailability | null;
  favorite: boolean;
  onToggleFavorite: () => void;
  onClose: () => void;
  /** Start a new chat, optionally sending a conversation starter right away. */
  onStartChat: (prompt?: string) => void;
  onShare: () => void;
  onCustomize?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

/** LobeChat-style assistant detail: description, starters, model and the full system prompt. */
export default function AgentDetailModal({ agent, availability, favorite, onToggleFavorite, onClose, onStartChat, onShare, onCustomize, onEdit, onDelete }: AgentDetailModalProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const model = resolveModel(agent.model)?.config;
  const modelUnavailable = model && availability && !availability[model.modelProvider];

  return (
    <Modal onClose={onClose} label={agent.name} size="lg">
      <div className="relative overflow-y-auto">
        <div className="h-24 w-full" style={{ background: agent.avatarBg ?? "rgb(var(--accent-soft))" }} />
        <button type="button" onClick={onClose} className="btn-icon absolute right-3 top-3 bg-surface/70 backdrop-blur" aria-label="Close">
          <X size={16} />
        </button>
        <div className="px-6 pb-6">
          <div className="-mt-10 flex items-end justify-between gap-3">
            <AgentAvatar avatar={agent.avatar} name={agent.name} background={agent.avatarBg ? `linear-gradient(${agent.avatarBg}, ${agent.avatarBg}), rgb(var(--surface))` : undefined} size={80} className="border-4 border-surface" />
            <div className="flex gap-1.5 pb-1">
              <button type="button" onClick={onToggleFavorite} className={`btn-secondary px-2.5 ${favorite ? "text-pink-600" : ""}`} aria-pressed={favorite} aria-label={favorite ? "Remove from favorites" : "Add to favorites"} title="Favorite">
                <Heart size={15} fill={favorite ? "currentColor" : "none"} />
              </button>
              <button type="button" onClick={onShare} className="btn-secondary px-2.5" aria-label="Copy share link" title="Copy share link">
                <Share2 size={15} />
              </button>
              {onEdit && (
                <button type="button" onClick={onEdit} className="btn-secondary px-2.5" aria-label="Edit agent" title="Edit">
                  <Edit2 size={15} />
                </button>
              )}
              {onDelete && (
                <button type="button" onClick={onDelete} className="btn-secondary px-2.5 hover:text-red-500" aria-label="Delete agent" title="Delete">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>

          <h2 className="mt-3 text-2xl font-semibold">{agent.name}</h2>
          <p className="mt-0.5 text-sm text-muted">
            by {agent.author} · {agent.category}
            {agent.custom && " · created in this browser"}
          </p>
          <p className="mt-3 text-[15px] leading-7">{agent.description}</p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {agent.tags.map(tag => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => onStartChat()} className="btn-primary">
              <MessageSquare size={16} /> Start chat
            </button>
            {onCustomize && (
              <button type="button" onClick={onCustomize} className="btn-secondary">
                <Copy size={15} /> Customize a copy
              </button>
            )}
            <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted">
              {model ? (
                <>
                  <span className="h-2 w-2 rounded-full" style={{ background: PROVIDER_COLORS[model.modelProvider] }} />
                  {model.label}
                  {modelUnavailable && <span className="text-amber-600 dark:text-amber-400">(not configured, another model will be used)</span>}
                </>
              ) : (
                "Works with any model"
              )}
            </span>
          </div>

          {agent.starters?.length ? (
            <section className="mt-6">
              <h3 className="mb-2 text-sm font-semibold">Try asking</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {agent.starters.map(starter => (
                  <button key={starter} type="button" onClick={() => onStartChat(starter)} className="group flex items-start justify-between gap-2 rounded-2xl border border-line p-3 text-left text-sm hover:border-accent/40 hover:bg-elevated">
                    {starter}
                    <ArrowUpRight size={15} className="mt-0.5 shrink-0 text-subtle group-hover:text-accent" />
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-6">
            <button type="button" onClick={() => setShowPrompt(s => !s)} className="text-sm font-semibold hover:text-accent">
              {showPrompt ? "Hide" : "Show"} system prompt
            </button>
            {showPrompt && (
              <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded-2xl border border-line bg-canvas p-4 font-mono text-xs leading-6 text-muted">{agent.systemPrompt}</pre>
            )}
          </section>
        </div>
      </div>
    </Modal>
  );
}
