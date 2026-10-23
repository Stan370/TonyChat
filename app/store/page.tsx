"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, Plus, Search, User } from "react-feather";
import AgentCard from "../components/agents/AgentCard";
import AgentDetailModal from "../components/agents/AgentDetailModal";
import AgentFormModal from "../components/AgentFormModal";
import { AGENT_CATEGORIES } from "@/lib/agents";
import {
  buildShareUrl,
  decodeSharedAgent,
  deleteCustomAgent,
  getRecentAgentIds,
  newAgentId,
  saveCustomAgent,
  toggleFavorite,
  useAgents,
  useFavorites,
  useModelCatalog,
} from "@/lib/agentStore";
import { copyText } from "@/lib/clipboard";
import { startChat } from "@/lib/startChat";
import type { Agent } from "@/lib/types";

type Scope = "all" | "favorites" | "mine";
type FormState = { mode: "create" } | { mode: "edit"; agent: Agent } | { mode: "copy"; agent: Agent } | { mode: "import"; agent: Agent } | null;

export default function StorePage() {
  return (
    <Suspense fallback={<div className="h-full bg-canvas" />}>
      <Marketplace />
    </Suspense>
  );
}

function Marketplace() {
  const router = useRouter();
  const params = useSearchParams();
  const agents = useAgents();
  const favorites = useFavorites();
  const { availability } = useModelCatalog();

  const [scope, setScope] = useState<Scope>("all");
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [form, setForm] = useState<FormState>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [recents, setRecents] = useState<string[]>([]);

  const detailId = params.get("agent");
  const detailAgent = detailId ? agents.find(a => a.id === detailId) : undefined;

  useEffect(() => setRecents(getRecentAgentIds()), []);

  // Import flow: /store?share=<payload>
  useEffect(() => {
    const share = params.get("share");
    if (!share) return;
    const shared = decodeSharedAgent(share);
    if (shared) setForm({ mode: "import", agent: shared });
    else setToast("That share link is invalid or damaged.");
    router.replace("/store");
  }, [params, router]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const categories = useMemo(() => {
    const extra = Array.from(new Set(agents.map(a => a.category))).filter(c => !AGENT_CATEGORIES.includes(c));
    return [...AGENT_CATEGORIES, ...extra].map(name => ({ name, count: agents.filter(a => a.category === name).length })).filter(c => c.count > 0);
  }, [agents]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return agents
      .filter(agent => {
        if (scope === "favorites" && !favorites.includes(agent.id)) return false;
        if (scope === "mine" && !agent.custom) return false;
        if (category !== "All" && agent.category !== category) return false;
        return (
          !q ||
          agent.name.toLowerCase().includes(q) ||
          agent.description.toLowerCase().includes(q) ||
          agent.tags.some(tag => tag.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "name":
            return a.name.localeCompare(b.name);
          case "recent": {
            const ra = recents.indexOf(a.id);
            const rb = recents.indexOf(b.id);
            return (ra === -1 ? Infinity : ra) - (rb === -1 ? Infinity : rb);
          }
          case "newest":
            return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
          default:
            return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
        }
      });
  }, [agents, favorites, scope, category, query, sortBy, recents]);

  const showFeatured = scope === "all" && category === "All" && !query.trim();
  const featured = agents.filter(a => a.featured).slice(0, 3);

  const openAgent = (agent: Agent) => router.push(`/store?agent=${encodeURIComponent(agent.id)}`, { scroll: false });
  const closeAgent = () => router.push("/store", { scroll: false });

  const share = async (agent: Agent) => {
    const url = buildShareUrl(agent);
    setToast((await copyText(url)) ? "Share link copied to clipboard" : "Couldn't copy the link");
  };

  const submitForm = (draft: Omit<Agent, "id"> & { id?: string }) => {
    const saved = saveCustomAgent({ ...draft, id: draft.id ?? newAgentId() } as Agent);
    setForm(null);
    setScope("mine");
    setCategory("All");
    setToast(`Saved ${saved.name}`);
  };

  const scopeButton = (value: Scope, label: string, icon: React.ReactNode, count?: number) => (
    <button
      type="button"
      onClick={() => setScope(value)}
      className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${
        scope === value ? "bg-accent-soft font-medium text-accent" : "text-muted hover:bg-elevated hover:text-fg"
      }`}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {count !== undefined && <span className="text-xs text-subtle">{count}</span>}
    </button>
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Agent marketplace</h1>
            <p className="mt-1 text-muted">Specialized AI agents for coding, games, writing, learning and more. Create and share your own.</p>
          </div>
          <button type="button" onClick={() => setForm({ mode: "create" })} className="btn-primary self-start sm:self-auto">
            <Plus size={16} /> Create agent
          </button>
        </header>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={17} className="absolute left-3.5 top-3 text-subtle" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search agents by name, skill or tag"
              aria-label="Search agents"
              className="input rounded-2xl py-2.5 pl-10 text-[15px]"
            />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} aria-label="Sort agents" className="input w-full rounded-2xl sm:w-48">
            <option value="featured">Featured first</option>
            <option value="recent">Recently used</option>
            <option value="newest">Newest</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>

        <div className="mt-6 lg:grid lg:grid-cols-[210px_1fr] lg:gap-8">
          {/* Categories: sidebar on desktop, scrollable pills on mobile */}
          <aside className="hidden lg:block">
            <nav aria-label="Agent filters" className="sticky top-4 space-y-0.5">
              {scopeButton("all", "All agents", <span className="w-4 text-center">✦</span>, agents.length)}
              {scopeButton("favorites", "Favorites", <Heart size={15} />, favorites.length)}
              {scopeButton("mine", "My agents", <User size={15} />, agents.filter(a => a.custom).length)}
              <div className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wide text-subtle">Categories</div>
              {[{ name: "All", count: agents.length }, ...categories].map(c => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setCategory(c.name)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-sm transition-colors ${
                    category === c.name ? "bg-elevated font-medium text-fg" : "text-muted hover:bg-elevated hover:text-fg"
                  }`}
                >
                  {c.name}
                  <span className="text-xs text-subtle">{c.count}</span>
                </button>
              ))}
            </nav>
          </aside>
          <div className="-mx-1 mb-4 flex gap-1.5 overflow-x-auto px-1 pb-1 lg:hidden">
            {(["all", "favorites", "mine"] as Scope[]).map(s => (
              <button key={s} type="button" onClick={() => setScope(s)} className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${scope === s ? "bg-fg text-surface" : "border border-line bg-surface text-muted"}`}>
                {s === "all" ? "All" : s === "favorites" ? `Favorites (${favorites.length})` : "Mine"}
              </button>
            ))}
            <span className="mx-1 w-px shrink-0 bg-line" />
            {[{ name: "All" }, ...categories].map(c => (
              <button key={c.name} type="button" onClick={() => setCategory(c.name)} className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${category === c.name ? "bg-accent-soft text-accent" : "border border-line bg-surface text-muted"}`}>
                {c.name === "All" ? "All categories" : c.name}
              </button>
            ))}
          </div>

          <div className="min-w-0">
            {showFeatured && (
              <section className="mb-8">
                <h2 className="mb-3 text-lg font-semibold">Featured</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {featured.map(agent => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      variant="featured"
                      favorite={favorites.includes(agent.id)}
                      onToggleFavorite={() => toggleFavorite(agent.id)}
                      onOpen={() => openAgent(agent)}
                    />
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-lg font-semibold">
                  {scope === "favorites" ? "Favorites" : scope === "mine" ? "My agents" : category === "All" ? "All agents" : category}
                </h2>
                <span className="text-sm text-subtle">{filtered.length} agents</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map(agent => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    favorite={favorites.includes(agent.id)}
                    onToggleFavorite={() => toggleFavorite(agent.id)}
                    onOpen={() => openAgent(agent)}
                  />
                ))}
              </div>
              {filtered.length === 0 && (
                <div className="rounded-3xl border border-dashed border-line px-6 py-14 text-center">
                  <p className="font-medium">
                    {scope === "favorites" ? "No favorites yet" : scope === "mine" ? "You haven't created an agent yet" : "No agents found"}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {scope === "favorites"
                      ? "Tap the heart on any agent to keep it here."
                      : scope === "mine"
                        ? "Create one from scratch, or open any agent and choose “Customize a copy”."
                        : "Try a different search or category."}
                  </p>
                  {scope === "mine" && (
                    <button type="button" onClick={() => setForm({ mode: "create" })} className="btn-primary mt-4">
                      <Plus size={16} /> Create agent
                    </button>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {detailAgent && !form && (
        <AgentDetailModal
          agent={detailAgent}
          availability={availability}
          favorite={favorites.includes(detailAgent.id)}
          onToggleFavorite={() => toggleFavorite(detailAgent.id)}
          onClose={closeAgent}
          onStartChat={prompt => startChat(router.push, { agentId: detailAgent.id, prompt })}
          onShare={() => share(detailAgent)}
          onCustomize={
            detailAgent.custom
              ? undefined
              : () => setForm({ mode: "copy", agent: { ...detailAgent, id: newAgentId(), name: `${detailAgent.name} (my copy)`, author: "You", custom: true, featured: false, createdAt: undefined } })
          }
          onEdit={detailAgent.custom ? () => setForm({ mode: "edit", agent: detailAgent }) : undefined}
          onDelete={
            detailAgent.custom
              ? () => {
                  if (!window.confirm(`Delete "${detailAgent.name}"? Its chats in this browser will also be removed.`)) return;
                  deleteCustomAgent(detailAgent.id);
                  closeAgent();
                  setToast(`Deleted ${detailAgent.name}`);
                }
              : undefined
          }
        />
      )}

      {form && (
        <AgentFormModal
          key={form.mode === "create" ? "create" : form.agent.id}
          title={form.mode === "edit" ? `Edit ${form.agent.name}` : form.mode === "import" ? "Add shared agent" : form.mode === "copy" ? "Customize agent" : "Create an agent"}
          submitLabel={form.mode === "edit" ? "Save changes" : form.mode === "import" ? "Add to my agents" : "Create agent"}
          initial={form.mode === "create" ? undefined : form.agent}
          categories={categories.map(c => c.name)}
          availability={availability}
          onSubmit={draft => {
            submitForm(draft);
            if (detailId) closeAgent();
          }}
          onClose={() => setForm(null)}
        />
      )}

      {toast && (
        <div role="status" className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-fg px-4 py-2 text-sm text-surface shadow-lift animate-slide-up md:bottom-6">
          {toast}
        </div>
      )}
    </div>
  );
}
