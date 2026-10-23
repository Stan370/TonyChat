"use client";

import { useState } from "react";
import { X } from "react-feather";
import AgentAvatar from "./AgentAvatar";
import ModelSelect from "./ModelSelect";
import Modal from "./ui/Modal";
import { AVATAR_BACKGROUNDS, AVATAR_CHOICES } from "@/lib/agents";
import { useModelCatalog } from "@/lib/agentStore";
import type { Agent, ProviderAvailability } from "@/lib/types";

interface AgentFormModalProps {
  /** Existing agent to edit, or a pre-filled draft (e.g. an imported share link or a copy). */
  initial?: Agent;
  title: string;
  submitLabel: string;
  categories: string[];
  /** @deprecated availability now comes from useModelCatalog(); kept so callers compile. */
  availability?: ProviderAvailability | null;
  onSubmit: (agent: Omit<Agent, "id"> & { id?: string }) => void;
  onClose: () => void;
}

const label = "mb-1.5 block text-sm font-medium";

export default function AgentFormModal({ initial, title, submitLabel, categories, onSubmit, onClose }: AgentFormModalProps) {
  const catalog = useModelCatalog();
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState(initial?.category ?? "General");
  const [tags, setTags] = useState(initial?.tags.join(", ") ?? "");
  const [avatar, setAvatar] = useState(initial?.avatar ?? AVATAR_CHOICES[0]);
  const [avatarBg, setAvatarBg] = useState(initial?.avatarBg ?? AVATAR_BACKGROUNDS[0]);
  const [model, setModel] = useState(initial?.model ?? "");
  const [systemPrompt, setSystemPrompt] = useState(initial?.systemPrompt ?? "");
  const [starters, setStarters] = useState(initial?.starters?.join("\n") ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Give your agent a name.");
    if (!systemPrompt.trim()) return setError("Write instructions (a system prompt) for your agent.");
    onSubmit({
      id: initial?.id,
      name: name.trim().slice(0, 60),
      description: description.trim().slice(0, 300),
      category: category.trim().slice(0, 40) || "General",
      tags: tags.split(",").map(t => t.trim()).filter(Boolean).slice(0, 8),
      avatar,
      avatarBg,
      model: model || undefined,
      systemPrompt: systemPrompt.trim(),
      starters: starters.split("\n").map(s => s.trim()).filter(Boolean).slice(0, 4),
      author: initial?.author ?? "You",
      createdAt: initial?.createdAt,
      custom: true,
    });
  };

  const avatarOptions = avatar.startsWith("/") ? [avatar, ...AVATAR_CHOICES] : AVATAR_CHOICES;

  return (
    <Modal onClose={onClose} label={title} size="lg">
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="btn-icon">
            <X size={16} />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="flex gap-4">
            <AgentAvatar avatar={avatar} name={name || "Agent"} background={avatarBg} size={72} />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Avatar">
                {avatarOptions.map(choice => (
                  <button
                    key={choice}
                    type="button"
                    role="radio"
                    aria-checked={avatar === choice}
                    onClick={() => setAvatar(choice)}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg transition-colors ${avatar === choice ? "bg-accent-soft ring-2 ring-accent" : "bg-elevated hover:bg-line"}`}
                  >
                    {choice.startsWith("/") ? "🖼️" : choice}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Avatar color">
                {AVATAR_BACKGROUNDS.map(color => (
                  <button
                    key={color}
                    type="button"
                    role="radio"
                    aria-checked={avatarBg === color}
                    aria-label={`Color ${color}`}
                    onClick={() => setAvatarBg(color)}
                    className={`h-6 w-6 rounded-full border border-line ${avatarBg === color ? "ring-2 ring-accent ring-offset-2 ring-offset-surface" : ""}`}
                    style={{ background: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className={label}>Name *</span>
              <input className="input" value={name} onChange={e => setName(e.target.value)} maxLength={60} placeholder="Recipe Coach" />
            </label>
            <label className="block">
              <span className={label}>Category</span>
              <input className="input" value={category} onChange={e => setCategory(e.target.value)} list="agent-categories" maxLength={40} />
              <datalist id="agent-categories">
                {categories.map(c => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>
          </div>

          <label className="block">
            <span className={label}>Short description</span>
            <input className="input" value={description} onChange={e => setDescription(e.target.value)} maxLength={300} placeholder="Suggests recipes from what's in your fridge." />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className={label}>Tags (comma separated)</span>
              <input className="input" value={tags} onChange={e => setTags(e.target.value)} placeholder="cooking, recipes" />
            </label>
            <div>
              <span className={label}>Recommended model</span>
              <ModelSelect value={model} onChange={setModel} catalog={catalog} autoLabel="No preference" autoHint="No preference (chat default)" />
            </div>
          </div>

          <label className="block">
            <span className={label}>Instructions (system prompt) *</span>
            <textarea
              className="input min-h-[160px] font-mono text-[13px] leading-6"
              value={systemPrompt}
              onChange={e => setSystemPrompt(e.target.value)}
              maxLength={20000}
              placeholder="You are a friendly cooking coach. Ask what ingredients the user has, then suggest…"
            />
          </label>

          <label className="block">
            <span className={label}>Conversation starters (one per line, up to 4)</span>
            <textarea className="input min-h-[84px] text-sm" value={starters} onChange={e => setStarters(e.target.value)} placeholder={"What can I cook with eggs and spinach?\nPlan a week of quick dinners"} />
          </label>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>

        <footer className="flex justify-end gap-2 border-t border-line px-6 py-4">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {submitLabel}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
