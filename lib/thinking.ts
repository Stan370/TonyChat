// Reasoning ("thinking") text that some models stream before their answer.
// The server wraps it in <think>…</think>; some local models emit the tags themselves.

export interface ThinkingSplit {
  /** Reasoning text, or null when the message has none. */
  thinking: string | null;
  /** The answer without the reasoning block. */
  answer: string;
  /** False while the reasoning block is still streaming (no closing tag yet). */
  thinkingDone: boolean;
}

const LEADING_THINK = /^\s*<think>([\s\S]*?)(<\/think>\s*|$)/;

export function splitThinking(content: string): ThinkingSplit {
  const match = LEADING_THINK.exec(content);
  if (!match) return { thinking: null, answer: content, thinkingDone: true };
  return { thinking: match[1].trim(), answer: content.slice(match[0].length), thinkingDone: match[2].startsWith("</think>") };
}

/** The answer only, for re-sending history and copying. */
export function stripThinking(content: string): string {
  return splitThinking(content).answer;
}
