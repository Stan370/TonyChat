import { stripThinking } from "@/lib/thinking";

// Splits assistant Markdown into text and fenced-code segments, and detects
// "artifacts": complete HTML documents or SVG images that can be previewed live.

export type ArtifactKind = "html" | "svg";

export type Segment =
  | { type: "text"; text: string }
  | { type: "code"; lang: string; code: string; closed: boolean; artifact?: ArtifactKind };

const OPEN_FENCE = /^ {0,3}(`{3,}|~{3,})\s*([^\s`]*)[^`]*$/;

/** Parse fenced code blocks (CommonMark-style) so unfinished blocks can be detected while streaming. */
export function splitMarkdown(content: string): Segment[] {
  const segments: Segment[] = [];
  const lines = content.split("\n");
  let text: string[] = [];
  let code: string[] = [];
  let fence: { char: string; length: number; lang: string } | null = null;

  const flushText = () => {
    if (text.length) segments.push({ type: "text", text: text.join("\n") });
    text = [];
  };
  const pushCode = (closed: boolean) => {
    const body = code.join("\n");
    const lang = fence!.lang.toLowerCase();
    segments.push({ type: "code", lang, code: body, closed, artifact: artifactKind(lang, body) });
    code = [];
    fence = null;
  };

  for (const line of lines) {
    if (!fence) {
      const match = OPEN_FENCE.exec(line);
      if (match) {
        flushText();
        fence = { char: match[1][0], length: match[1].length, lang: match[2] ?? "" };
      } else {
        text.push(line);
      }
      continue;
    }
    const closing = new RegExp(`^ {0,3}\\${fence.char}{${fence.length},}\\s*$`);
    if (closing.test(line)) pushCode(true);
    else code.push(line);
  }
  if (fence) pushCode(false);
  else flushText();
  return segments;
}

/** Decide whether a code block should render as a live preview. */
export function artifactKind(lang: string, code: string): ArtifactKind | undefined {
  const start = code.trimStart().slice(0, 200).toLowerCase();
  if (lang === "svg" || (lang === "xml" && start.startsWith("<svg")) || (!lang && start.startsWith("<svg"))) return "svg";
  if (lang === "html" || lang === "htm") {
    // Small HTML snippets stay as code; full documents and larger pages become previews.
    if (start.startsWith("<!doctype html") || start.startsWith("<html") || code.length > 600 || code.includes("<script")) return "html";
    return undefined;
  }
  if (!lang && (start.startsWith("<!doctype html") || start.startsWith("<html"))) return "html";
  return undefined;
}

export function artifactTitle(code: string, kind: ArtifactKind): string {
  const title = /<title[^>]*>([^<]{1,80})<\/title>/i.exec(code)?.[1] ?? /<h1[^>]*>([^<]{1,80})<\/h1>/i.exec(code)?.[1];
  if (title?.trim()) return decodeEntities(title.trim());
  return kind === "svg" ? "SVG image" : "Web preview";
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/** Wrap an SVG so it is centered and scaled inside the preview frame. */
export function svgDocument(svg: string): string {
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;height:100%;display:flex;align-items:center;justify-content:center;background:#fff}svg{max-width:100%;max-height:100%}</style></head><body>${svg}</body></html>`;
}

export interface Artifact {
  /** `${messageIndex}:${blockIndex}` */
  key: string;
  messageIndex: number;
  kind: ArtifactKind;
  title: string;
  code: string;
  complete: boolean;
  /** 1-based version number of artifacts in this conversation. */
  version: number;
}

/** All artifacts in a conversation, oldest first. */
export function collectArtifacts(messages: { role: string; content: string }[]): Artifact[] {
  const artifacts: Artifact[] = [];
  messages.forEach((message, messageIndex) => {
    if (message.role !== "assistant") return;
    let block = 0;
    for (const segment of splitMarkdown(stripThinking(message.content))) {
      if (segment.type !== "code") continue;
      if (segment.artifact) {
        artifacts.push({
          key: `${messageIndex}:${block}`,
          messageIndex,
          kind: segment.artifact,
          title: artifactTitle(segment.code, segment.artifact),
          code: segment.code,
          complete: segment.closed,
          version: artifacts.length + 1,
        });
      }
      block++;
    }
  });
  return artifacts;
}
