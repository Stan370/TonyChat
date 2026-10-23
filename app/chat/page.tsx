"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Code, Edit, Sidebar } from "react-feather";
import AgentAvatar from "../components/AgentAvatar";
import ModelSelect from "../components/ModelSelect";
import AgentDetailModal from "../components/agents/AgentDetailModal";
import ArtifactPanel, { ArtifactTab } from "../components/chat/ArtifactPanel";
import Composer, { ComposerHandle } from "../components/chat/Composer";
import ConversationList from "../components/chat/ConversationList";
import MessageItem from "../components/chat/MessageItem";
import { BUILTIN_AGENTS } from "@/lib/agents";
import {
  buildShareUrl,
  createConversation,
  deleteConversation,
  findAgent,
  getConversation,
  getDefaultAgent,
  getSavedModel,
  listConversations,
  loadMessages,
  markAgentUsed,
  saveMessages,
  saveModel,
  takeLegacySelectedAgent,
  titleFromText,
  toggleFavorite,
  updateConversation,
  useAgents,
  useConversations,
  useFavorites,
  providerHeaders,
  useModelCatalog,
} from "@/lib/agentStore";
import { collectArtifacts } from "@/lib/artifacts";
import { copyText } from "@/lib/clipboard";
import { findModel, pickAvailableModel } from "@/lib/modelConfig";
import { Agent, Attachment, ChatMessage, MODEL_PROVIDERS } from "@/lib/types";

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="h-full bg-canvas" />}>
      <ChatApp />
    </Suspense>
  );
}

function replaceLast(messages: ChatMessage[], patch: Partial<ChatMessage>): ChatMessage[] {
  if (!messages.length) return messages;
  const copy = [...messages];
  copy[copy.length - 1] = { ...copy[copy.length - 1], ...patch };
  return copy;
}

function ChatApp() {
  const router = useRouter();
  const params = useSearchParams();
  const conversationParam = params.get("c");
  const agentParam = params.get("agent");

  const catalog = useModelCatalog();
  const { availability, loaded: availabilityLoaded, extraModels } = catalog;
  const conversations = useConversations();
  const agents = useAgents();
  const favorites = useFavorites();
  const agentsById = useMemo(() => Object.fromEntries(agents.map(a => [a.id, a])), [agents]);

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [agent, setAgent] = useState<Agent>(BUILTIN_AGENTS[0]);
  const [conversationModel, setConversationModel] = useState<string | undefined>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [ready, setReady] = useState(false);
  const [listCollapsed, setListCollapsed] = useState(false);
  const [mobileListOpen, setMobileListOpen] = useState(false);
  const [panel, setPanel] = useState<{ key: string; tab: ArtifactTab } | null>(null);
  const [panelExpanded, setPanelExpanded] = useState(false);
  const [showAgentInfo, setShowAgentInfo] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const conversationIdRef = useRef<string | null>(null);
  const pendingSendRef = useRef<{ prompt: string; attachments?: Attachment[] } | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Bumped whenever the visible conversation changes so a finishing stream can't write into another one.
  const generationRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const composerRef = useRef<ComposerHandle>(null);
  const seenArtifactsRef = useRef<Set<string>>(new Set());
  const artifactCompleteRef = useRef<Record<string, boolean>>({});

  // ---- Route → state ---------------------------------------------------------------
  useEffect(() => {
    // Already showing this conversation (we just created it while sending).
    if (conversationParam && conversationParam === conversationIdRef.current) return;

    abortRef.current?.abort();
    abortRef.current = null;
    generationRef.current += 1;
    setStreaming(false);
    setPanel(null);
    setPanelExpanded(false);
    setMobileListOpen(false);
    artifactCompleteRef.current = {};

    if (conversationParam) {
      const conversation = getConversation(conversationParam);
      if (!conversation) {
        router.replace("/chat");
        return;
      }
      const conversationAgent = findAgent(conversation.agentId) ?? getDefaultAgent();
      const stored = loadMessages(conversation.id);
      conversationIdRef.current = conversation.id;
      setConversationId(conversation.id);
      setAgent(conversationAgent);
      setConversationModel(conversation.model);
      setMessages(stored);
      seenArtifactsRef.current = new Set(collectArtifacts(stored).map(a => a.key));
      setInput(conversation.draft?.text ?? "");
      setAttachments(conversation.draft?.attachments ?? []);
      if (conversation.draft) updateConversation(conversation.id, { draft: undefined });
      if (conversation.pendingPrompt !== undefined || conversation.pendingAttachments) {
        pendingSendRef.current = { prompt: conversation.pendingPrompt ?? "", attachments: conversation.pendingAttachments };
        updateConversation(conversation.id, { pendingPrompt: undefined, pendingAttachments: undefined });
      }
      markAgentUsed(conversationAgent.id);
    } else {
      const requested = findAgent(agentParam) ?? takeLegacySelectedAgent();
      if (!requested) {
        const latest = listConversations()[0];
        if (latest) {
          router.replace(`/chat?c=${latest.id}`);
          return;
        }
      }
      conversationIdRef.current = null;
      setConversationId(null);
      setAgent(requested ?? getDefaultAgent());
      setConversationModel(undefined);
      setMessages([]);
      seenArtifactsRef.current = new Set();
      setInput("");
      setAttachments([]);
    }
    stickToBottomRef.current = true;
    setReady(true);
  }, [conversationParam, agentParam, router]);

  // Explicit choice for this chat > agent recommendation > last choice > any configured provider.
  const modelId = useMemo(
    () => pickAvailableModel([conversationModel, agent.model, ready ? getSavedModel() : undefined], availability, extraModels).model,
    [conversationModel, agent, availability, ready, extraModels],
  );

  const handleModelChange = (model: string) => {
    setConversationModel(model);
    saveModel(model);
    if (conversationIdRef.current) updateConversation(conversationIdRef.current, { model });
  };

  // ---- Sending ----------------------------------------------------------------------
  const send = async (text: string, files: Attachment[], baseHistory: ChatMessage[]) => {
    const content = text.trim();
    if ((!content && !files.length) || streaming) return;

    let id = conversationIdRef.current;
    if (!id) {
      const conversation = createConversation({ agentId: agent.id, model: conversationModel, title: titleFromText(content || files[0]?.name || agent.name) });
      id = conversation.id;
      conversationIdRef.current = id;
      setConversationId(id);
      router.replace(`/chat?c=${id}`);
    }

    const now = new Date().toISOString();
    const history: ChatMessage[] = [...baseHistory, { role: "user", content, attachments: files.length ? files : undefined, createdAt: now }];
    const placeholder: ChatMessage = { role: "assistant", content: "", model: modelId, createdAt: now };
    // Artifacts in replaced replies (regenerate) should auto-open again.
    seenArtifactsRef.current = new Set(Array.from(seenArtifactsRef.current).filter(key => Number(key.split(":")[0]) < history.length));
    setMessages([...history, placeholder]);
    saveMessages(id, history);
    updateConversation(id, {}, { touch: true });
    setInput("");
    setAttachments([]);
    setStreaming(true);
    stickToBottomRef.current = true;

    const controller = new AbortController();
    abortRef.current = controller;
    const generation = generationRef.current;
    let received = "";
    let servedBy = modelId;
    let frame = 0;
    // Batch UI updates to one per animation frame; streams can deliver hundreds of chunks per second.
    const scheduleFlush = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (generation === generationRef.current) setMessages(prev => replaceLast(prev, { content: received, model: servedBy }));
      });
    };

    let final: ChatMessage;
    try {
      const provider = findModel(modelId, extraModels)?.modelProvider;
      const response = await fetch("/api/chat", {
        method: "POST",
        // The visitor's own key for this provider, if they saved one in Settings.
        headers: { "Content-Type": "application/json", ...(provider ? providerHeaders(provider) : {}) },
        body: JSON.stringify({
          model: modelId,
          systemPrompt: agent.systemPrompt,
          messages: history.filter(m => !m.error).map(({ role, content, attachments }) => ({ role, content, attachments })),
        }),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? `Request failed with status ${response.status}.`);
      }
      servedBy = response.headers.get("X-Model") ?? modelId;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        received += decoder.decode(value, { stream: true });
        scheduleFlush();
      }
      received += decoder.decode();
      final = { ...placeholder, content: received || "[The model returned an empty response.]", model: servedBy };
    } catch (error) {
      final = controller.signal.aborted
        ? { ...placeholder, content: received ? `${received}\n\n[Stopped]` : "[Stopped]", model: servedBy }
        : { ...placeholder, content: error instanceof Error ? error.message : "Something went wrong.", error: true, model: servedBy };
    }
    if (frame) cancelAnimationFrame(frame);

    // Save to the conversation that started the request, even if the user has moved on.
    saveMessages(id, [...history, final]);
    updateConversation(id, {}, { touch: true });
    if (generation === generationRef.current) {
      setMessages([...history, final]);
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const sendRef = useRef(send);
  sendRef.current = send;

  // Prompts handed over from the home page or the use case gallery.
  useEffect(() => {
    if (!ready || !availabilityLoaded || streaming || !pendingSendRef.current) return;
    const pending = pendingSendRef.current;
    pendingSendRef.current = null;
    sendRef.current(pending.prompt, pending.attachments ?? [], messages);
  }, [ready, availabilityLoaded, streaming, messages]);

  const submit = () => send(input, attachments, messages);

  const regenerate = () => {
    const lastUserIndex = messages.map(m => m.role).lastIndexOf("user");
    if (lastUserIndex === -1) return;
    const lastUser = messages[lastUserIndex];
    send(lastUser.content, lastUser.attachments ?? [], messages.slice(0, lastUserIndex));
  };

  const newChat = useCallback(() => {
    router.push(`/chat?agent=${encodeURIComponent(agent.id)}`);
  }, [router, agent.id]);

  const startWithPrompt = (prompt?: string) => {
    setShowAgentInfo(false);
    if (!prompt) return newChat();
    if (!messages.length) return send(prompt, [], []);
    const conversation = createConversation({ agentId: agent.id, pendingPrompt: prompt });
    router.push(`/chat?c=${conversation.id}`);
  };

  // ---- Artifacts ----------------------------------------------------------------------
  const artifacts = useMemo(() => collectArtifacts(messages), [messages]);
  const artifactsByKey = useMemo(() => Object.fromEntries(artifacts.map(a => [a.key, a])), [artifacts]);
  const activeArtifact = panel ? artifactsByKey[panel.key] : undefined;

  // Open new artifacts as they start streaming (code view), like Claude/LobeChat artifacts.
  useEffect(() => {
    if (!streaming) return;
    for (const artifact of artifacts) {
      if (!seenArtifactsRef.current.has(artifact.key)) {
        seenArtifactsRef.current.add(artifact.key);
        setPanel({ key: artifact.key, tab: artifact.complete ? "preview" : "code" });
      }
    }
  }, [artifacts, streaming]);

  // Switch to the live preview as soon as the open artifact's code is complete.
  useEffect(() => {
    if (!activeArtifact) return;
    const wasComplete = artifactCompleteRef.current[activeArtifact.key];
    if (activeArtifact.complete && wasComplete === false) {
      setPanel(p => (p && p.key === activeArtifact.key ? { ...p, tab: "preview" } : p));
    }
    artifactCompleteRef.current[activeArtifact.key] = activeArtifact.complete;
  }, [activeArtifact]);

  const openArtifact = (key: string) => setPanel(p => (p?.key === key ? null : { key, tab: artifactsByKey[key]?.complete ? "preview" : "code" }));

  // ---- Scrolling ------------------------------------------------------------------------
  useEffect(() => {
    const el = scrollRef.current;
    if (el && stickToBottomRef.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    stickToBottomRef.current = nearBottom;
    setAtBottom(nearBottom);
  };

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    stickToBottomRef.current = true;
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const noProviders = availability !== null && !MODEL_PROVIDERS.some(p => availability[p]);
  const currentConversation = conversations.find(c => c.id === conversationId);
  const model = findModel(modelId, extraModels);

  const conversationList = (onClose?: () => void) => (
    <ConversationList
      conversations={conversations}
      agentsById={agentsById}
      activeId={conversationId}
      onNew={() => {
        setMobileListOpen(false);
        newChat();
      }}
      onDelete={id => {
        deleteConversation(id);
        if (id === conversationIdRef.current) {
          conversationIdRef.current = null;
          router.replace(`/chat?agent=${encodeURIComponent(agent.id)}`);
        }
      }}
      onRename={(id, title) => updateConversation(id, { title })}
      onNavigate={() => setMobileListOpen(false)}
      onClose={onClose}
    />
  );

  return (
    <div className="flex h-full">
      {/* Conversation list */}
      <aside className={`hidden w-64 shrink-0 border-r border-line bg-surface ${listCollapsed ? "" : "lg:block"}`}>{conversationList()}</aside>
      {mobileListOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setMobileListOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-line bg-surface shadow-lift animate-slide-up">
            {conversationList(() => setMobileListOpen(false))}
          </aside>
        </div>
      )}

      {/* Chat column */}
      <section className={`relative flex min-w-0 flex-1 flex-col ${panel && panelExpanded ? "lg:hidden" : ""}`}>
        <header className="flex h-14 shrink-0 items-center gap-1.5 border-b border-line bg-surface/80 px-2 backdrop-blur sm:px-3">
          <button
            type="button"
            className="btn-icon"
            onClick={() => (window.matchMedia("(min-width: 1024px)").matches ? setListCollapsed(c => !c) : setMobileListOpen(true))}
            aria-label="Toggle chat list"
            title="Chat list"
          >
            <Sidebar size={17} />
          </button>
          <button type="button" onClick={() => setShowAgentInfo(true)} className="flex min-w-0 items-center gap-2 rounded-xl px-1.5 py-1 text-left hover:bg-elevated" title="Agent details">
            <AgentAvatar avatar={agent.avatar} name={agent.name} background={agent.avatarBg} size={30} />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{agent.name}</span>
              <span className="block max-w-[40vw] truncate text-xs text-muted">{currentConversation?.title ?? agent.description}</span>
            </span>
          </button>
          <div className="ml-auto flex items-center gap-1">
            <ModelSelect value={modelId} onChange={handleModelChange} catalog={catalog} align="right" className="hidden sm:block" />
            {artifacts.length > 0 && (
              <button
                type="button"
                className={`btn-icon ${panel ? "bg-accent-soft text-accent" : ""}`}
                onClick={() => (panel ? setPanel(null) : openArtifact(artifacts[artifacts.length - 1].key))}
                aria-label={panel ? "Hide preview" : "Show preview"}
                title={panel ? "Hide preview" : "Show preview"}
              >
                <Code size={17} />
              </button>
            )}
            <button type="button" className="btn-icon" onClick={newChat} aria-label="New chat" title="New chat">
              <Edit size={17} />
            </button>
          </div>
        </header>

        {noProviders && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
            No model is set up yet.{" "}
            <Link href="/settings" className="font-semibold underline underline-offset-2">
              Add a free API key in Settings
            </Link>{" "}
            (Gemini, OpenRouter, Groq and others have free tiers) to start chatting.
          </div>
        )}

        <div ref={scrollRef} onScroll={onScroll} className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
            {ready && messages.length === 0 && (
              <div className="flex flex-col items-center pt-[6vh] text-center animate-fade-in">
                <AgentAvatar avatar={agent.avatar} name={agent.name} background={agent.avatarBg} size={72} />
                <h1 className="mt-4 text-2xl font-semibold">{agent.name}</h1>
                <p className="mt-1 max-w-md text-sm text-muted">{agent.description}</p>
                <p className="mt-2 text-xs text-subtle">
                  by {agent.author}
                  {model && ` · ${model.label}`}
                </p>
                {agent.starters?.length ? (
                  <div className="mt-8 grid w-full max-w-2xl gap-2 sm:grid-cols-2">
                    {agent.starters.map(starter => (
                      <button
                        key={starter}
                        type="button"
                        onClick={() => send(starter, [], [])}
                        disabled={noProviders || streaming}
                        className="group flex items-start justify-between gap-3 rounded-2xl border border-line bg-surface p-3.5 text-left text-sm shadow-card transition-colors hover:border-accent/40 hover:bg-elevated disabled:opacity-50"
                      >
                        {starter}
                        <ArrowUpRight size={15} className="mt-0.5 shrink-0 text-subtle group-hover:text-accent" />
                      </button>
                    ))}
                  </div>
                ) : null}
                <Link href="/store" className="mt-6 text-xs font-medium text-accent hover:underline">
                  Switch agent in the marketplace
                </Link>
              </div>
            )}

            {messages.map((message, index) => (
              <MessageItem
                key={index}
                message={message}
                index={index}
                agent={agent}
                isLast={index === messages.length - 1}
                streaming={streaming && index === messages.length - 1}
                artifacts={artifactsByKey}
                activeArtifactKey={panel?.key ?? null}
                onOpenArtifact={openArtifact}
                onRegenerate={!streaming && index === messages.length - 1 ? regenerate : undefined}
              />
            ))}
          </div>
        </div>

        {!atBottom && messages.length > 0 && (
          <button type="button" onClick={scrollToBottom} className="absolute bottom-32 left-1/2 -translate-x-1/2 rounded-full border border-line bg-surface p-2 shadow-lift" aria-label="Scroll to latest">
            <ArrowDown size={16} />
          </button>
        )}

        <div className="shrink-0 px-3 pb-3 pt-1 sm:px-4 sm:pb-4">
          <div className="mx-auto max-w-3xl">
            <Composer
              ref={composerRef}
              value={input}
              onChange={setInput}
              onSubmit={submit}
              onStop={() => abortRef.current?.abort()}
              streaming={streaming}
              disabled={noProviders}
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              placeholder={`Message ${agent.name}…`}
              toolbar={<ModelSelect value={modelId} onChange={handleModelChange} catalog={catalog} direction="up" className="sm:hidden" />}
            />
            <p className="mt-2 hidden text-center text-[11px] text-subtle sm:block">
              Enter to send · Shift+Enter for a new line · AI can make mistakes, so check important info.
            </p>
          </div>
        </div>
      </section>

      {/* Artifact panel: side-by-side on desktop, full screen on phones */}
      {panel && activeArtifact && (
        <div className={`fixed inset-0 z-50 border-l border-line lg:static lg:z-auto ${panelExpanded ? "lg:flex-1" : "lg:w-[46%] lg:min-w-[420px] lg:max-w-[900px]"}`}>
          <ArtifactPanel
            artifacts={artifacts}
            activeKey={panel.key}
            onSelect={key => setPanel({ key, tab: artifactsByKey[key]?.complete ? "preview" : "code" })}
            tab={panel.tab}
            onTabChange={tab => setPanel(p => (p ? { ...p, tab } : p))}
            expanded={panelExpanded}
            onToggleExpanded={() => setPanelExpanded(e => !e)}
            onClose={() => {
              setPanel(null);
              setPanelExpanded(false);
            }}
          />
        </div>
      )}

      {showAgentInfo && (
        <AgentDetailModal
          agent={agent}
          availability={availability}
          favorite={favorites.includes(agent.id)}
          onToggleFavorite={() => toggleFavorite(agent.id)}
          onClose={() => setShowAgentInfo(false)}
          onStartChat={startWithPrompt}
          onShare={async () => {
            if (await copyText(buildShareUrl(agent))) setToast("Share link copied");
          }}
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
