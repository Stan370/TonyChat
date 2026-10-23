"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, GitHub } from "react-feather";
import JsonLd from "./components/JsonLd";
import ModelSelect from "./components/ModelSelect";
import AgentCard from "./components/agents/AgentCard";
import AgentPicker from "./components/agents/AgentPicker";
import Composer, { ComposerHandle } from "./components/chat/Composer";
import UseCaseGallery from "./components/usecases/UseCaseGallery";
import { BUILTIN_AGENTS, getBuiltinAgent } from "@/lib/agents";
import { useAgents, useModelCatalog } from "@/lib/agentStore";
import { startChat } from "@/lib/startChat";
import { Agent, Attachment, MODEL_PROVIDERS } from "@/lib/types";

const QUICK_ACTIONS = [
  { emoji: "🎮", label: "Build a game", agentId: "game-builder", text: "Build a browser game where " },
  { emoji: "🌐", label: "Make a website", agentId: "web-builder", text: "Build a landing page for " },
  { emoji: "🐞", label: "Debug code", agentId: "code-mentor", text: "Help me find the bug in this code:\n\n" },
  { emoji: "✍️", label: "Write content", agentId: "content-writer", text: "Write a blog post about " },
  { emoji: "📊", label: "Analyze data", agentId: "data-analyst", text: "Analyze the attached data and tell me " },
  { emoji: "🧳", label: "Plan a trip", agentId: "travel-planner", text: "Plan a trip to " },
  { emoji: "🗣️", label: "Practice a language", agentId: "language-tutor", text: "Let's practice " },
];

export default function Home() {
  const router = useRouter();
  const agents = useAgents();
  const catalog = useModelCatalog();
  const { availability } = catalog;
  const [agent, setAgent] = useState<Agent>(BUILTIN_AGENTS[0]);
  const [model, setModel] = useState("");
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const composerRef = useRef<ComposerHandle>(null);

  const noProviders = availability !== null && !MODEL_PROVIDERS.some(p => availability[p]);
  const featuredAgents = agents.filter(a => a.featured).slice(0, 6);

  const submit = () => startChat(router.push, { agentId: agent.id, prompt: input, attachments, model: model || undefined });

  const quickAction = (action: (typeof QUICK_ACTIONS)[number]) => {
    const next = getBuiltinAgent(action.agentId);
    // Commit the template synchronously so focus() can place the caret after it.
    flushSync(() => {
      if (next) setAgent(next);
      setInput(action.text);
    });
    composerRef.current?.focus();
  };

  return (
    <div className="h-full overflow-y-auto">
      <JsonLd />
      {/* Hero: Manus-style prompt box */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-40 h-[480px] bg-[radial-gradient(ellipse_at_top,rgb(var(--accent)/0.14),transparent_65%)]" />
        <div className="relative mx-auto max-w-3xl px-4 pb-10 pt-[9vh] sm:px-6">
          <Link href="/usecases?cat=games" className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1 text-xs text-muted shadow-card backdrop-blur transition-colors hover:text-fg">
            <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-accent-fg">NEW</span>
            Build and play games right in the chat
            <ArrowRight size={12} />
          </Link>
          <h1 className="text-center text-4xl font-semibold tracking-tight sm:text-5xl">What can I do for you?</h1>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted">
            Pick an agent, describe the task, and TonyChat gets to work: games, web apps, code reviews, research and more, on Claude, GPT or Gemini.
          </p>

          <div className="mt-8">
            <Composer
              ref={composerRef}
              size="hero"
              autoFocus
              value={input}
              onChange={setInput}
              onSubmit={submit}
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              placeholder={agent.id === "game-builder" ? "Describe the game you want to play…" : `Ask ${agent.name} anything…`}
              toolbar={
                <>
                  <AgentPicker agents={agents} value={agent} onChange={setAgent} />
                  <ModelSelect value={model} onChange={setModel} catalog={catalog} autoLabel="Auto" autoHint="Auto model" />
                </>
              }
            />
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {QUICK_ACTIONS.map(action => (
              <button key={action.label} type="button" onClick={() => quickAction(action)} className="chip">
                <span aria-hidden>{action.emoji}</span>
                {action.label}
              </button>
            ))}
          </div>

          {noProviders && (
            <p className="mx-auto mt-6 max-w-xl rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
              No model is set up yet.{" "}
              <Link href="/settings" className="font-semibold underline underline-offset-2">
                Add a free API key
              </Link>{" "}
              (Google Gemini, OpenRouter or Groq take about a minute, no card). You can still browse agents and play the examples below.
            </p>
          )}
        </div>
      </section>

      {/* Use case gallery */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Use case gallery</h2>
            <p className="mt-1 text-sm text-muted">Play an example, run its prompt, or remix it into something new.</p>
          </div>
          <Link href="/usecases" className="hidden text-sm font-medium text-accent hover:underline sm:block">
            View all
          </Link>
        </div>
        <UseCaseGallery limit={8} showAllLink />
      </section>

      {/* Featured agents */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Featured agents</h2>
            <p className="mt-1 text-sm text-muted">Specialists with tuned instructions and a recommended model.</p>
          </div>
          <Link href="/store" className="text-sm font-medium text-accent hover:underline">
            Marketplace
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredAgents.map(a => (
            <AgentCard key={a.id} agent={a} onOpen={() => router.push(`/store?agent=${encodeURIComponent(a.id)}`)} />
          ))}
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-subtle sm:flex-row sm:px-6">
          <span>© {new Date().getFullYear()} TonyChat · Open source under the MIT license</span>
          <nav className="flex items-center gap-4">
            <Link href="/store" className="hover:text-fg">Agents</Link>
            <Link href="/usecases" className="hover:text-fg">Use cases</Link>
            <a href="https://github.com/Stan370/TonyChat" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-fg">
              <GitHub size={13} /> GitHub
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
