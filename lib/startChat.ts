"use client";

import { createConversation, titleFromText } from "@/lib/agentStore";
import type { Attachment, Conversation, UseCase } from "@/lib/types";

type Navigate = (href: string) => void;

/**
 * Open the chat for an agent. A prompt is sent automatically when the chat opens;
 * a draft is only placed in the composer for the user to edit.
 */
export function startChat(
  navigate: Navigate,
  options: { agentId: string; prompt?: string; attachments?: Attachment[]; model?: string; draft?: Conversation["draft"] },
) {
  const { agentId, prompt, attachments, model, draft } = options;
  if (!prompt?.trim() && !attachments?.length && !draft) {
    navigate(`/chat?agent=${encodeURIComponent(agentId)}`);
    return;
  }
  const conversation = createConversation({
    agentId,
    model,
    pendingPrompt: (prompt?.trim() || attachments?.length) ? (prompt?.trim() ?? "") : undefined,
    pendingAttachments: attachments?.length ? attachments : undefined,
    draft,
    title: titleFromText(prompt?.trim() || draft?.text || attachments?.[0]?.name || "New chat"),
  });
  navigate(`/chat?c=${conversation.id}`);
}

/** Start a chat with the example's source attached, ready for the user to describe changes. */
export async function remixUseCase(navigate: Navigate, useCase: UseCase) {
  if (!useCase.demo) return;
  const response = await fetch(useCase.demo.src);
  if (!response.ok) throw new Error(`Could not load ${useCase.demo.src}`);
  const html = await response.text();
  const fileName = useCase.demo.src.split("/").pop() ?? "example.html";
  startChat(navigate, {
    agentId: useCase.agentId,
    draft: { text: useCase.demo.remixPrompt, attachments: [{ name: fileName, language: "html", content: html }] },
  });
}
