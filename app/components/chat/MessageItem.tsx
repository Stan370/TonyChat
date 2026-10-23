"use client";

import { useState } from "react";
import { AlertTriangle, ChevronRight, FileText, RefreshCw } from "react-feather";
import AgentAvatar from "../AgentAvatar";
import CopyButton from "./CopyButton";
import MessageMarkdown from "./MessageMarkdown";
import { modelLabel as labelFor } from "@/lib/modelConfig";
import type { Artifact } from "@/lib/artifacts";
import { splitThinking } from "@/lib/thinking";
import type { Agent, ChatMessage } from "@/lib/types";

interface MessageItemProps {
  message: ChatMessage;
  index: number;
  agent: Agent;
  isLast: boolean;
  streaming: boolean;
  artifacts: Record<string, Artifact>;
  activeArtifactKey: string | null;
  onOpenArtifact: (key: string) => void;
  onRegenerate?: () => void;
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-2" aria-label="Thinking">
      {[0, 1, 2].map(i => (
        <span key={i} className="h-2 w-2 rounded-full bg-subtle animate-dot-bounce" style={{ animationDelay: `${i * 0.16}s` }} />
      ))}
    </div>
  );
}

/** Collapsible reasoning: open while the model is thinking, collapsed once the answer starts. */
function ThinkingBlock({ text, done }: { text: string; done: boolean }) {
  const [userOpen, setUserOpen] = useState<boolean | null>(null);
  const open = userOpen ?? !done;
  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={() => setUserOpen(!open)}
        aria-expanded={open}
        className="inline-flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-xs font-medium text-muted hover:bg-elevated hover:text-fg"
      >
        <ChevronRight size={13} className={`transition-transform ${open ? "rotate-90" : ""}`} />
        {done ? "Thought process" : <span className="animate-pulse">Thinking…</span>}
      </button>
      {open && (
        <div className="mt-1 max-h-72 overflow-y-auto whitespace-pre-wrap border-l-2 border-line pl-3 text-[13px] leading-6 text-muted">{text || "…"}</div>
      )}
    </div>
  );
}

export default function MessageItem({ message, index, agent, isLast, streaming, artifacts, activeArtifactKey, onOpenArtifact, onRegenerate }: MessageItemProps) {
  if (message.role === "user") {
    return (
      <div className="group flex justify-end animate-slide-up">
        <div className="flex max-w-[85%] flex-col items-end gap-1.5">
          {message.attachments?.map((file, i) => (
            <span key={i} className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-2.5 py-1.5 text-xs">
              <FileText size={14} className="text-accent" />
              <span className="font-medium">{file.name}</span>
              <span className="text-subtle">{(file.content.length / 1000).toFixed(1)} KB</span>
            </span>
          ))}
          {message.content && (
            <div className="whitespace-pre-wrap break-words rounded-3xl rounded-tr-lg bg-accent-soft px-4 py-2.5 text-[15px] leading-7 text-fg">{message.content}</div>
          )}
          <div className="h-7 opacity-0 transition-opacity group-hover:opacity-100">
            <CopyButton text={message.content} />
          </div>
        </div>
      </div>
    );
  }

  const { thinking, answer, thinkingDone } = splitThinking(message.content);
  const pending = streaming && !message.content;
  const modelLabel = message.model ? labelFor(message.model) : undefined;

  return (
    <div className="group flex gap-3 animate-fade-in">
      <AgentAvatar avatar={agent.avatar} name={agent.name} background={agent.avatarBg} size={32} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2 text-xs">
          <span className="font-semibold text-fg">{agent.name}</span>
          {modelLabel && <span className="tag">{modelLabel}</span>}
        </div>
        {pending ? (
          <TypingDots />
        ) : message.error ? (
          <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p>{message.content}</p>
              {isLast && onRegenerate && (
                <button type="button" onClick={onRegenerate} className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold underline underline-offset-2">
                  <RefreshCw size={12} /> Try again
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {thinking !== null && <ThinkingBlock text={thinking} done={thinkingDone && (!streaming || answer.length > 0)} />}
            <MessageMarkdown
            content={answer}
            messageIndex={index}
            artifacts={artifacts}
            activeArtifactKey={activeArtifactKey}
            onOpenArtifact={onOpenArtifact}
            />
          </>
        )}
        {!pending && !message.error && !(streaming && isLast) && (
          <div className={`mt-1 flex items-center gap-0.5 transition-opacity ${isLast ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
            <CopyButton text={answer} label="Copy reply" />
            {isLast && onRegenerate && (
              <button type="button" onClick={onRegenerate} className="btn-icon h-7 w-7" aria-label="Regenerate reply" title="Regenerate">
                <RefreshCw size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
