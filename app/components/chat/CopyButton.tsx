"use client";

import { useState } from "react";
import { Check, Copy } from "react-feather";
import { copyText } from "@/lib/clipboard";

export default function CopyButton({ text, label = "Copy", className = "", showLabel = false }: { text: string; label?: string; className?: string; showLabel?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        if (await copyText(text)) {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }
      }}
      className={showLabel ? `inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-muted hover:bg-surface hover:text-fg ${className}` : `btn-icon h-7 w-7 ${className}`}
      aria-label={copied ? "Copied" : label}
      title={copied ? "Copied" : label}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {showLabel && (copied ? "Copied" : label)}
    </button>
  );
}
