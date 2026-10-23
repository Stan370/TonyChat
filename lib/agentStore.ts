"use client";

// Browser-side persistence for agents, favorites and conversations.
// Everything lives in localStorage so the app works without a database.
// Writes notify subscribers (and other tabs via the "storage" event) so lists
// stay in sync across components.
import { useEffect, useMemo, useState } from "react";
import { BUILTIN_AGENTS, DEFAULT_AGENT_ID, LEGACY_AGENT_IDS, getBuiltinAgent } from "@/lib/agents";
import { allModelConfigs } from "@/lib/modelConfig";
import { MODEL_PROVIDERS, PROVIDERS, type ModelProvider } from "@/lib/providers";
import type { Agent, Attachment, ChatMessage, Conversation, ModelProviderConfig, ProviderAvailability } from "@/lib/types";

const KEYS = {
  customAgents: "tonychat.customAgents",
  favorites: "tonychat.favorites",
  recents: "tonychat.recentAgents",
  selectedModel: "tonychat.selectedModel",
  providerKeys: "tonychat.providerKeys",
  conversations: "tonychat.conversations",
  messages: (conversationId: string) => `tonychat.messages.${conversationId}`,
  /** One history per agent, written by the previous version of the chat page. */
  legacyHistoryPrefix: "tonychat.history.",
  /** Written by the original store page; read once for migration. */
  legacySelectedAgent: "selectedAgent",
};

const MAX_MESSAGES_PER_CONVERSATION = 300;
const MAX_RECENTS = 8;

// ---- Storage primitives & change notifications ---------------------------------

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach(listener => listener());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", event => {
    if (!event.key || event.key.startsWith("tonychat.")) notify();
  });
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function isQuotaError(error: unknown) {
  return error instanceof DOMException && (error.name === "QuotaExceededError" || error.code === 22);
}

/** Free space by deleting the messages of the oldest conversations. */
function pruneOldestConversation(keep: string): boolean {
  const all = read<Conversation[]>(KEYS.conversations, []);
  const victim = [...all].sort((a, b) => a.updatedAt.localeCompare(b.updatedAt)).find(c => KEYS.messages(c.id) !== keep);
  if (!victim) return false;
  window.localStorage.removeItem(KEYS.messages(victim.id));
  window.localStorage.setItem(KEYS.conversations, JSON.stringify(all.filter(c => c.id !== victim.id)));
  return true;
}

function write(key: string, value: unknown, { silent = false } = {}) {
  const serialized = JSON.stringify(value);
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      window.localStorage.setItem(key, serialized);
      break;
    } catch (error) {
      if (!isQuotaError(error) || !pruneOldestConversation(key)) {
        // Storage disabled or still full: the app keeps working, it just won't persist.
        console.warn(`[agentStore] could not save ${key}`, error);
        break;
      }
    }
  }
  if (!silent) notify();
}

function remove(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
  notify();
}

/** Re-reads `getValue` whenever the store changes. Server render uses `initial`. */
function useStoreValue<T>(getValue: () => T, initial: T): T {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => {
    const update = () => setValue(getValue());
    update();
    return subscribe(update);
  }, [getValue]);
  return value;
}

export function newId(prefix: string): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 10)
      : Math.random().toString(36).slice(2, 12);
  return `${prefix}-${rand}`;
}

// ---- Agents -------------------------------------------------------------------

export function getCustomAgents(): Agent[] {
  return read<Agent[]>(KEYS.customAgents, []).map(a => ({ ...a, custom: true }));
}

export function getAllAgents(): Agent[] {
  return [...BUILTIN_AGENTS, ...getCustomAgents()];
}

export function useAgents(): Agent[] {
  return useStoreValue(getAllAgents, BUILTIN_AGENTS);
}

export function findAgent(id: string | null | undefined): Agent | undefined {
  if (!id) return undefined;
  return getBuiltinAgent(id) ?? getCustomAgents().find(a => a.id === id);
}

export function getDefaultAgent(): Agent {
  return getBuiltinAgent(DEFAULT_AGENT_ID)!;
}

export function newAgentId(): string {
  return newId("custom");
}

export function saveCustomAgent(agent: Agent): Agent {
  const saved: Agent = { ...agent, custom: true, featured: false, createdAt: agent.createdAt ?? new Date().toISOString() };
  const others = getCustomAgents().filter(a => a.id !== saved.id);
  write(KEYS.customAgents, [...others, saved]);
  return saved;
}

/** Deletes a custom agent together with its favorites entry and conversations. */
export function deleteCustomAgent(id: string) {
  write(KEYS.customAgents, getCustomAgents().filter(a => a.id !== id), { silent: true });
  write(KEYS.favorites, getFavorites().filter(f => f !== id), { silent: true });
  write(KEYS.recents, getRecentAgentIds().filter(r => r !== id), { silent: true });
  for (const conversation of readConversations().filter(c => c.agentId === id)) {
    window.localStorage.removeItem(KEYS.messages(conversation.id));
  }
  write(KEYS.conversations, readConversations().filter(c => c.agentId !== id));
}

/**
 * Agent saved under the original "selectedAgent" key. Built-in ids are mapped to
 * the new catalog; anything else is imported as a custom agent so it isn't lost.
 */
let takenLegacyAgent: { agent: Agent | undefined } | null = null;

export function takeLegacySelectedAgent(): Agent | undefined {
  // Cached so a repeated call in the same page view (e.g. React Strict Mode) gets the same answer.
  if (takenLegacyAgent) return takenLegacyAgent.agent;
  const legacy = read<Agent | null>(KEYS.legacySelectedAgent, null);
  if (!legacy) return undefined;
  window.localStorage.removeItem(KEYS.legacySelectedAgent);
  let agent: Agent | undefined;
  if (LEGACY_AGENT_IDS[legacy.id]) agent = getBuiltinAgent(legacy.id);
  else if (legacy.name && legacy.systemPrompt) {
    agent = saveCustomAgent({ ...legacy, id: legacy.id?.startsWith("custom-") ? legacy.id : newAgentId() });
  }
  takenLegacyAgent = { agent };
  return agent;
}

// ---- Favorites & recents ---------------------------------------------------------

export function getFavorites(): string[] {
  return read<string[]>(KEYS.favorites, []);
}

export function useFavorites(): string[] {
  return useStoreValue(getFavorites, []);
}

export function toggleFavorite(id: string): string[] {
  const current = getFavorites();
  const next = current.includes(id) ? current.filter(f => f !== id) : [...current, id];
  write(KEYS.favorites, next);
  return next;
}

export function getRecentAgentIds(): string[] {
  return read<string[]>(KEYS.recents, []);
}

export function markAgentUsed(id: string) {
  write(KEYS.recents, [id, ...getRecentAgentIds().filter(r => r !== id)].slice(0, MAX_RECENTS), { silent: true });
}

// ---- Model preference ---------------------------------------------------------

export function getSavedModel(): string | undefined {
  return read<string | undefined>(KEYS.selectedModel, undefined);
}

export function saveModel(model: string) {
  write(KEYS.selectedModel, model, { silent: true });
}

// ---- Conversations --------------------------------------------------------------

let legacyMigrated = false;

/** Turns per-agent histories from the previous version into conversations (once). */
function migrateLegacyHistory() {
  if (legacyMigrated || typeof window === "undefined") return;
  legacyMigrated = true;
  try {
    const legacyKeys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key?.startsWith(KEYS.legacyHistoryPrefix)) legacyKeys.push(key);
    }
    if (!legacyKeys.length) return;
    const conversations = read<Conversation[]>(KEYS.conversations, []);
    for (const key of legacyKeys) {
      const messages = read<ChatMessage[]>(key, []);
      window.localStorage.removeItem(key);
      if (!messages.length) continue;
      const agentId = key.slice(KEYS.legacyHistoryPrefix.length);
      const now = new Date().toISOString();
      const firstUser = messages.find(m => m.role === "user");
      const conversation: Conversation = {
        id: newId("c"),
        agentId,
        title: firstUser ? titleFromText(firstUser.content) : "Earlier chat",
        createdAt: now,
        updatedAt: now,
      };
      conversations.push(conversation);
      window.localStorage.setItem(KEYS.messages(conversation.id), JSON.stringify(messages));
    }
    window.localStorage.setItem(KEYS.conversations, JSON.stringify(conversations));
  } catch (error) {
    console.warn("[agentStore] legacy history migration failed", error);
  }
}

function readConversations(): Conversation[] {
  migrateLegacyHistory();
  return read<Conversation[]>(KEYS.conversations, []);
}

/** Most recently updated first. */
export function listConversations(): Conversation[] {
  return [...readConversations()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function useConversations(): Conversation[] {
  return useStoreValue(listConversations, []);
}

export function getConversation(id: string): Conversation | undefined {
  return readConversations().find(c => c.id === id);
}

export function createConversation(input: {
  agentId: string;
  model?: string;
  title?: string;
  pendingPrompt?: string;
  pendingAttachments?: Attachment[];
  draft?: Conversation["draft"];
}): Conversation {
  const now = new Date().toISOString();
  const conversation: Conversation = {
    id: newId("c"),
    title: input.title ?? (input.pendingPrompt ? titleFromText(input.pendingPrompt) : "New chat"),
    createdAt: now,
    updatedAt: now,
    ...input,
  };
  write(KEYS.conversations, [conversation, ...readConversations()]);
  markAgentUsed(input.agentId);
  return conversation;
}

export function updateConversation(id: string, patch: Partial<Omit<Conversation, "id">>, { touch = false } = {}) {
  const all = readConversations();
  const index = all.findIndex(c => c.id === id);
  if (index === -1) return;
  all[index] = { ...all[index], ...patch, ...(touch ? { updatedAt: new Date().toISOString() } : {}) };
  write(KEYS.conversations, all);
}

export function deleteConversation(id: string) {
  window.localStorage.removeItem(KEYS.messages(id));
  write(KEYS.conversations, readConversations().filter(c => c.id !== id));
}

export function deleteAllConversations() {
  for (const conversation of readConversations()) window.localStorage.removeItem(KEYS.messages(conversation.id));
  write(KEYS.conversations, []);
}

export function loadMessages(conversationId: string): ChatMessage[] {
  return read<ChatMessage[]>(KEYS.messages(conversationId), []);
}

export function saveMessages(conversationId: string, messages: ChatMessage[]) {
  write(KEYS.messages(conversationId), messages.slice(-MAX_MESSAGES_PER_CONVERSATION), { silent: true });
}

/** Short title from the first line of a message. */
export function titleFromText(text: string): string {
  const firstLine = text.replace(/```[\s\S]*?(```|$)/g, " ").split("\n").map(l => l.trim()).find(Boolean) ?? "";
  const clean = firstLine.replace(/[#*_>`]/g, "").trim();
  return clean.length > 60 ? `${clean.slice(0, 57)}…` : clean || "New chat";
}

// ---- Share links ------------------------------------------------------------------

interface SharedAgentPayload {
  v: 1;
  name: string;
  description: string;
  category: string;
  tags: string[];
  avatar: string;
  avatarBg?: string;
  systemPrompt: string;
  model?: string;
  starters?: string[];
  author: string;
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach(b => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(encoded: string): string {
  const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(binary, c => c.charCodeAt(0)));
}

const SAFE_COLOR = /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\))$/i;

/** Link that opens a built-in agent, or lets someone import a custom agent into their own browser. */
export function buildShareUrl(agent: Agent): string {
  const origin = window.location.origin;
  if (!agent.custom) return `${origin}/store?agent=${encodeURIComponent(agent.id)}`;
  const payload: SharedAgentPayload = {
    v: 1,
    name: agent.name,
    description: agent.description,
    category: agent.category,
    tags: agent.tags,
    avatar: agent.avatar,
    avatarBg: agent.avatarBg,
    systemPrompt: agent.systemPrompt,
    model: agent.model,
    starters: agent.starters,
    author: agent.author,
  };
  return `${origin}/store?share=${toBase64Url(JSON.stringify(payload))}`;
}

/** Decode a share payload into an unsaved agent, or undefined if it is invalid. */
export function decodeSharedAgent(encoded: string): Agent | undefined {
  try {
    const p = JSON.parse(fromBase64Url(encoded)) as Partial<SharedAgentPayload>;
    if (p.v !== 1 || typeof p.name !== "string" || typeof p.systemPrompt !== "string") return undefined;
    const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
    return {
      id: newAgentId(),
      name: str(p.name, 60),
      description: str(p.description, 300),
      category: str(p.category, 40) || "General",
      tags: Array.isArray(p.tags) ? p.tags.filter(t => typeof t === "string").slice(0, 8) : [],
      // Only emoji avatars or same-origin paths, never external URLs.
      avatar:
        typeof p.avatar === "string" && ((p.avatar.startsWith("/") && !p.avatar.startsWith("//")) || [...p.avatar].length <= 4)
          ? p.avatar
          : "🤖",
      avatarBg: typeof p.avatarBg === "string" && SAFE_COLOR.test(p.avatarBg) ? p.avatarBg : undefined,
      systemPrompt: str(p.systemPrompt, 20000),
      model: typeof p.model === "string" ? p.model : undefined,
      starters: Array.isArray(p.starters) ? p.starters.filter(s => typeof s === "string").slice(0, 4) : undefined,
      author: str(p.author, 60) || "Community",
      custom: true,
    };
  } catch {
    return undefined;
  }
}

// ---- Provider keys ("bring your own key") -------------------------------------------

export interface ProviderKeyEntry {
  key: string;
  /** Endpoint region for providers with several (see PROVIDERS[...].regions). */
  region?: string;
  /** Models the key unlocked when it was verified. */
  models?: ModelProviderConfig[];
  verifiedAt?: string;
}

export type ProviderKeys = Partial<Record<ModelProvider, ProviderKeyEntry>>;

export function getProviderKeys(): ProviderKeys {
  return read<ProviderKeys>(KEYS.providerKeys, {});
}

export function useProviderKeys(): ProviderKeys {
  return useStoreValue(getProviderKeys, {});
}

export function setProviderKey(provider: ModelProvider, entry: ProviderKeyEntry | null) {
  const keys = { ...getProviderKeys() };
  if (entry) keys[provider] = entry;
  else delete keys[provider];
  write(KEYS.providerKeys, keys);
}

/** Headers that send the visitor's own key for one provider with a request. */
export function providerHeaders(provider: ModelProvider): Record<string, string> {
  const entry = getProviderKeys()[provider];
  if (!entry?.key) return {};
  return { "X-Provider-Key": entry.key, ...(entry.region ? { "X-Provider-Region": entry.region } : {}) };
}

// ---- Model catalog -------------------------------------------------------------------

export interface ModelCatalog {
  /** Built-in plus discovered models, without duplicates. */
  models: ModelProviderConfig[];
  /** Discovered models only (pass to resolveModel / pickAvailableModel as `extra`). */
  extraModels: ModelProviderConfig[];
  /** Providers usable now: configured on the server, or with the visitor's own key. Null until loaded. */
  availability: ProviderAvailability | null;
  /** Providers configured on the server. */
  serverAvailability: ProviderAvailability | null;
  loaded: boolean;
}

interface ServerCatalog {
  providers: ProviderAvailability;
  models: ModelProviderConfig[];
}

let serverCatalogCache: Promise<ServerCatalog | null> | null = null;

function loadServerCatalog(): Promise<ServerCatalog | null> {
  serverCatalogCache ??= fetch("/api/models")
    .then(res => (res.ok ? res.json() : null))
    .then(data => (data?.providers ? { providers: data.providers, models: Array.isArray(data.models) ? data.models : [] } : null))
    .catch(() => null);
  return serverCatalogCache;
}

export function useModelCatalog(): ModelCatalog {
  const keys = useProviderKeys();
  const [server, setServer] = useState<{ data: ServerCatalog | null; loaded: boolean }>({ data: null, loaded: false });

  useEffect(() => {
    let cancelled = false;
    loadServerCatalog().then(data => {
      if (!cancelled) setServer({ data, loaded: true });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(() => {
    const extraModels: ModelProviderConfig[] = [];
    const seen = new Set(allModelConfigs.map(m => m.model));
    for (const model of [...(server.data?.models ?? []), ...MODEL_PROVIDERS.flatMap(p => keys[p]?.models ?? [])]) {
      if (!seen.has(model.model)) {
        seen.add(model.model);
        extraModels.push(model);
      }
    }
    const serverAvailability = server.data?.providers ?? null;
    const availability = server.loaded
      ? (Object.fromEntries(
          MODEL_PROVIDERS.map(p => [p, Boolean(serverAvailability?.[p]) || Boolean(PROVIDERS[p].byok && keys[p]?.key)]),
        ) as ProviderAvailability)
      : null;
    return { models: [...allModelConfigs, ...extraModels], extraModels, availability, serverAvailability, loaded: server.loaded };
  }, [keys, server]);
}

/** @deprecated use useModelCatalog(). */
export function useProviderAvailability(): { availability: ProviderAvailability | null; loaded: boolean } {
  const { availability, loaded } = useModelCatalog();
  return { availability, loaded };
}
