"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, FileText, Play, Shuffle, X } from "react-feather";
import AgentAvatar from "../AgentAvatar";
import CopyButton from "../chat/CopyButton";
import HtmlPreview from "../chat/HtmlPreview";
import Modal from "../ui/Modal";
import { remixUseCase, startChat } from "@/lib/startChat";
import type { Agent, UseCase } from "@/lib/types";

/** Use case detail: a live, playable example (when available) plus the prompt to run or remix. */
export default function UseCaseModal({ useCase, agent, onClose }: { useCase: UseCase; agent?: Agent; onClose: () => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = () => startChat(router.push, { agentId: useCase.agentId, prompt: useCase.prompt, attachments: useCase.attachments });

  const remix = async () => {
    setBusy(true);
    setError(null);
    try {
      await remixUseCase(router.push, useCase);
    } catch {
      setError("Couldn't load the example source. Try again.");
      setBusy(false);
    }
  };

  return (
    <Modal onClose={onClose} label={useCase.title} size={useCase.demo ? "xl" : "md"}>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        {useCase.demo && (
          <div className="relative h-[52dvh] shrink-0 bg-black lg:h-auto lg:min-h-[560px] lg:w-[62%]">
            <HtmlPreview src={useCase.demo.src} title={`${useCase.title} example`} />
          </div>
        )}
        <div className="flex flex-col p-5 sm:p-6 lg:flex-1 lg:overflow-y-auto">
          <div className="flex items-start gap-3">
            <span className="text-3xl leading-none">{useCase.emoji}</span>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-semibold leading-tight">{useCase.title}</h2>
              <p className="mt-1 text-sm text-muted">{useCase.description}</p>
            </div>
            <button type="button" onClick={onClose} className="btn-icon -mr-2 -mt-1" aria-label="Close">
              <X size={16} />
            </button>
          </div>

          {agent && (
            <div className="mt-4 flex items-center gap-2.5 rounded-2xl bg-elevated p-2.5">
              <AgentAvatar avatar={agent.avatar} name={agent.name} background={agent.avatarBg} size={34} />
              <div className="min-w-0">
                <div className="text-sm font-medium">{agent.name}</div>
                <div className="truncate text-xs text-muted">{agent.description}</div>
              </div>
            </div>
          )}

          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-subtle">Prompt</h3>
              <CopyButton text={useCase.prompt} label="Copy prompt" showLabel />
            </div>
            <p className="whitespace-pre-wrap rounded-2xl border border-line bg-canvas p-3 text-sm leading-6">{useCase.prompt}</p>
            {useCase.attachments?.map(file => (
              <span key={file.name} className="mt-2 inline-flex items-center gap-2 rounded-xl border border-line px-2.5 py-1.5 text-xs">
                <FileText size={14} className="text-accent" /> {file.name}
              </span>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-2">
            <button type="button" onClick={run} className="btn-primary w-full py-2.5">
              <Play size={15} /> {useCase.demo ? "Build my own version" : "Run this prompt"}
            </button>
            {useCase.demo && (
              <>
                <button type="button" onClick={remix} disabled={busy} className="btn-secondary w-full py-2.5">
                  <Shuffle size={15} /> {busy ? "Loading example…" : "Remix this example"}
                </button>
                <a href={useCase.demo.src} target="_blank" rel="noreferrer" className="btn-ghost w-full">
                  <ExternalLink size={14} /> Play full screen
                </a>
              </>
            )}
            {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          </div>

          {useCase.demo && (
            <p className="mt-4 text-xs leading-5 text-subtle">
              This example ships with TonyChat so you can try it without an API key. “Build my own version” asks {agent?.name ?? "the agent"} to
              create a fresh one from the prompt. “Remix” attaches this example’s source so you can describe the changes you want.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
