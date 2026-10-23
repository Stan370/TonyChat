"use client";

import { isValidElement, memo, useMemo } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Artifact, splitMarkdown } from "@/lib/artifacts";
import ArtifactCard from "./ArtifactCard";
import CodeBlock from "./CodeBlock";

const markdownComponents: Components = {
  // Indented or list-nested code blocks that the fence splitter left in the text.
  pre({ children }) {
    const child = Array.isArray(children) ? children[0] : children;
    if (isValidElement<{ className?: string; children?: React.ReactNode }>(child)) {
      const lang = /language-(\S+)/.exec(child.props.className ?? "")?.[1] ?? "";
      return <CodeBlock lang={lang} code={String(child.props.children ?? "").replace(/\n$/, "")} />;
    }
    return <pre>{children}</pre>;
  },
  a({ node: _node, ...props }) {
    return <a {...props} target="_blank" rel="noreferrer noopener" />;
  },
};

const TextBlock = memo(function TextBlock({ text }: { text: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {text}
    </ReactMarkdown>
  );
});

interface MessageMarkdownProps {
  content: string;
  messageIndex: number;
  artifacts?: Record<string, Artifact>;
  activeArtifactKey?: string | null;
  onOpenArtifact?: (key: string) => void;
}

/** Renders Markdown; fenced HTML/SVG documents become artifact cards. */
export default function MessageMarkdown({ content, messageIndex, artifacts, activeArtifactKey, onOpenArtifact }: MessageMarkdownProps) {
  const segments = useMemo(() => splitMarkdown(content), [content]);
  let block = -1;
  return (
    <div className="markdown">
      {segments.map((segment, i) => {
        if (segment.type === "text") return segment.text.trim() ? <TextBlock key={i} text={segment.text} /> : null;
        block++;
        const artifact = artifacts?.[`${messageIndex}:${block}`];
        if (artifact && onOpenArtifact) {
          return <ArtifactCard key={i} artifact={artifact} active={activeArtifactKey === artifact.key} onOpen={onOpenArtifact} />;
        }
        return <CodeBlock key={i} lang={segment.lang} code={segment.code} />;
      })}
    </div>
  );
}
