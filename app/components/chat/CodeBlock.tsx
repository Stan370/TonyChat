"use client";

import { useMemo } from "react";
import { highlightCode } from "@/lib/highlight";
import CopyButton from "./CopyButton";

/** Fenced code block with a language label, copy button and syntax highlighting. */
export default function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const html = useMemo(() => highlightCode(code, lang), [code, lang]);
  return (
    <div className="not-prose my-3 overflow-hidden rounded-xl border border-line bg-canvas">
      <div className="flex items-center justify-between border-b border-line bg-elevated/60 px-3 py-1 text-xs text-muted">
        <span className="font-mono">{lang || "text"}</span>
        <CopyButton text={code} showLabel />
      </div>
      <pre className="overflow-x-auto px-4 py-3 text-[13px] leading-6">
        {html ? (
          <code className="hljs font-mono" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <code className="hljs font-mono">{code}</code>
        )}
      </pre>
    </div>
  );
}
