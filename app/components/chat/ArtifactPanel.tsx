"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Code, Download, Maximize2, Minimize2, Play, RefreshCw, X } from "react-feather";
import { Artifact, svgDocument } from "@/lib/artifacts";
import { downloadText, slugify } from "@/lib/clipboard";
import { highlightCode } from "@/lib/highlight";
import CopyButton from "./CopyButton";
import HtmlPreview from "./HtmlPreview";

export type ArtifactTab = "preview" | "code";

interface ArtifactPanelProps {
  artifacts: Artifact[];
  activeKey: string;
  onSelect: (key: string) => void;
  tab: ArtifactTab;
  onTabChange: (tab: ArtifactTab) => void;
  expanded: boolean;
  onToggleExpanded: () => void;
  onClose: () => void;
}

/** Live preview / source panel for HTML and SVG artifacts (like LobeChat artifacts). */
export default function ArtifactPanel({ artifacts, activeKey, onSelect, tab, onTabChange, expanded, onToggleExpanded, onClose }: ArtifactPanelProps) {
  const artifact = artifacts.find(a => a.key === activeKey) ?? artifacts[artifacts.length - 1];
  const [reloadKey, setReloadKey] = useState(0);
  const codeRef = useRef<HTMLPreElement>(null);

  const highlighted = useMemo(
    () => (artifact?.complete ? highlightCode(artifact.code, artifact.kind === "svg" ? "xml" : "html") : null),
    [artifact?.complete, artifact?.code, artifact?.kind],
  );

  // Follow the code as it streams in.
  useEffect(() => {
    if (tab === "code" && artifact && !artifact.complete && codeRef.current) {
      codeRef.current.scrollTop = codeRef.current.scrollHeight;
    }
  }, [tab, artifact]);

  if (!artifact) return null;
  const documentHtml = artifact.kind === "svg" ? svgDocument(artifact.code) : artifact.code;
  const tabClass = (t: ArtifactTab) =>
    `inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
      tab === t ? "bg-surface text-fg shadow-card" : "text-muted hover:text-fg"
    }`;

  return (
    <section aria-label="Artifact preview" className="flex h-full min-w-0 flex-col bg-surface">
      <header className="flex items-center gap-2 border-b border-line px-3 py-2">
        <div className="min-w-0 flex-1">
          {artifacts.length > 1 ? (
            <select
              value={artifact.key}
              onChange={e => onSelect(e.target.value)}
              aria-label="Artifact version"
              className="max-w-full truncate rounded-lg bg-transparent py-0.5 text-sm font-semibold text-fg focus:outline-none"
            >
              {artifacts.map(a => (
                <option key={a.key} value={a.key}>
                  v{a.version} · {a.title}
                </option>
              ))}
            </select>
          ) : (
            <h2 className="truncate text-sm font-semibold">{artifact.title}</h2>
          )}
        </div>
        <div className="flex items-center rounded-xl bg-elevated p-0.5">
          <button type="button" className={tabClass("preview")} onClick={() => onTabChange("preview")}>
            <Play size={12} /> Preview
          </button>
          <button type="button" className={tabClass("code")} onClick={() => onTabChange("code")}>
            <Code size={12} /> Code
          </button>
        </div>
        <div className="flex items-center">
          <button type="button" className="btn-icon" onClick={() => setReloadKey(k => k + 1)} aria-label="Reload preview" title="Reload preview" disabled={!artifact.complete}>
            <RefreshCw size={15} />
          </button>
          <CopyButton text={artifact.code} label="Copy code" />
          <button
            type="button"
            className="btn-icon"
            disabled={!artifact.complete}
            onClick={() =>
              downloadText(`${slugify(artifact.title)}.${artifact.kind === "svg" ? "svg" : "html"}`, artifact.code, artifact.kind === "svg" ? "image/svg+xml" : "text/html")
            }
            aria-label="Download file"
            title="Download"
          >
            <Download size={15} />
          </button>
          <button type="button" className="btn-icon hidden lg:inline-flex" onClick={onToggleExpanded} aria-label={expanded ? "Exit full width" : "Full width"} title={expanded ? "Exit full width" : "Full width"}>
            {expanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close preview" title="Close">
            <X size={16} />
          </button>
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        {tab === "preview" ? (
          artifact.complete ? (
            <HtmlPreview key={`${artifact.key}-${reloadKey}`} html={documentHtml} title={artifact.title} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 bg-canvas p-6 text-center">
              <RefreshCw size={22} className="animate-spin text-accent" />
              <p className="text-sm font-medium">Writing the code…</p>
              <p className="text-xs text-muted">{artifact.code.split("\n").length} lines so far. The preview starts as soon as the file is complete.</p>
              <button type="button" className="btn-secondary mt-1 text-xs" onClick={() => onTabChange("code")}>
                Watch the code
              </button>
            </div>
          )
        ) : (
          <pre ref={codeRef} className="h-full overflow-auto bg-canvas px-4 py-3 text-[12.5px] leading-6">
            {highlighted ? (
              <code className="hljs font-mono" dangerouslySetInnerHTML={{ __html: highlighted }} />
            ) : (
              <code className="hljs font-mono">{artifact.code}</code>
            )}
          </pre>
        )}
      </div>
    </section>
  );
}
