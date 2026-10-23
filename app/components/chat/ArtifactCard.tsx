"use client";

import { ChevronRight, Image as ImageIcon, Play, RefreshCw } from "react-feather";
import type { Artifact } from "@/lib/artifacts";

interface ArtifactCardProps {
  artifact: Artifact;
  active: boolean;
  onOpen: (key: string) => void;
}

/** Inline card in a message that opens an HTML/SVG artifact in the preview panel. */
export default function ArtifactCard({ artifact, active, onOpen }: ArtifactCardProps) {
  const lines = artifact.code.split("\n").length;
  return (
    <button
      type="button"
      onClick={() => onOpen(artifact.key)}
      className={`not-prose my-3 flex w-full max-w-md items-center gap-3 rounded-2xl border p-2.5 text-left transition-colors ${
        active ? "border-accent/60 bg-accent-soft/60" : "border-line bg-surface hover:bg-elevated"
      }`}
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${artifact.complete ? "bg-accent text-accent-fg" : "bg-elevated text-muted"}`}>
        {!artifact.complete ? <RefreshCw size={18} className="animate-spin" /> : artifact.kind === "svg" ? <ImageIcon size={18} /> : <Play size={18} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-fg">{artifact.title}</span>
        <span className="block text-xs text-muted">
          {artifact.complete
            ? `${artifact.kind === "svg" ? "SVG image" : "Interactive preview"} · ${lines} lines · v${artifact.version}`
            : `Writing code… ${lines} lines`}
        </span>
      </span>
      <span className="flex shrink-0 items-center text-xs font-medium text-accent">
        {active ? "Showing" : "Open"}
        <ChevronRight size={14} />
      </span>
    </button>
  );
}
