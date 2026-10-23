"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { ArrowUp, FileText, Paperclip, Square, X } from "react-feather";
import type { Attachment } from "@/lib/types";

const MAX_FILE_BYTES = 100_000;
const MAX_FILES = 3;
const ACCEPT =
  ".txt,.md,.csv,.tsv,.json,.html,.htm,.css,.js,.jsx,.mjs,.ts,.tsx,.py,.sql,.yaml,.yml,.xml,.svg,.sh,.java,.go,.rs,.c,.cpp,.h,.rb,.php,.log";

const LANGUAGE_BY_EXTENSION: Record<string, string> = {
  htm: "html", html: "html", js: "javascript", mjs: "javascript", jsx: "jsx", ts: "typescript", tsx: "tsx",
  py: "python", md: "markdown", yml: "yaml", yaml: "yaml", sh: "bash", rs: "rust", rb: "ruby",
  csv: "csv", tsv: "tsv", json: "json", css: "css", sql: "sql", xml: "xml", svg: "svg", java: "java",
  go: "go", c: "c", cpp: "cpp", h: "c", php: "php", txt: "", log: "",
};

export function languageForFile(name: string): string {
  return LANGUAGE_BY_EXTENSION[name.split(".").pop()?.toLowerCase() ?? ""] ?? "";
}

export interface ComposerHandle {
  focus: () => void;
}

interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  streaming?: boolean;
  disabled?: boolean;
  placeholder?: string;
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
  /** Controls shown at the bottom-left (agent picker, model picker, ...). */
  toolbar?: React.ReactNode;
  size?: "hero" | "default";
  autoFocus?: boolean;
}

/** Message composer shared by the home page and chat. */
const Composer = forwardRef<ComposerHandle, ComposerProps>(function Composer(
  { value, onChange, onSubmit, onStop, streaming, disabled, placeholder, attachments, onAttachmentsChange, toolbar, size = "default", autoFocus },
  ref,
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const hero = size === "hero";

  // Focus with the caret at the end, so text typed after a prefilled template follows it.
  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        const el = textareaRef.current;
        if (!el) return;
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      },
    }),
    [],
  );

  // Auto-grow the textarea with its content.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, hero ? 260 : 220)}px`;
  }, [value, hero]);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(t);
  }, [error]);

  const addFiles = async (files: FileList | File[]) => {
    const next = [...attachments];
    for (const file of Array.from(files)) {
      if (next.length >= MAX_FILES) {
        setError(`You can attach up to ${MAX_FILES} files.`);
        break;
      }
      if (file.size > MAX_FILE_BYTES) {
        setError(`${file.name} is larger than ${MAX_FILE_BYTES / 1000} KB.`);
        continue;
      }
      const content = await file.text();
      if (content.includes("\u0000")) {
        setError(`${file.name} doesn't look like a text file.`);
        continue;
      }
      next.push({ name: file.name, language: languageForFile(file.name), content });
    }
    onAttachmentsChange(next);
  };

  const canSend = !disabled && !streaming && (value.trim().length > 0 || attachments.length > 0);

  return (
    <div
      className={`relative rounded-3xl border bg-surface transition-colors ${
        dragging ? "border-accent ring-4 ring-accent/15" : "border-line"
      } ${hero ? "shadow-composer" : "shadow-card"} focus-within:border-accent/50`}
      onDragOver={e => {
        if (e.dataTransfer.types.includes("Files")) {
          e.preventDefault();
          setDragging(true);
        }
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => {
        if (!e.dataTransfer.files.length) return;
        e.preventDefault();
        setDragging(false);
        addFiles(e.dataTransfer.files);
      }}
    >
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 px-3 pt-3">
          {attachments.map((file, index) => (
            <span key={`${file.name}-${index}`} className="inline-flex max-w-[16rem] items-center gap-2 rounded-xl border border-line bg-elevated py-1.5 pl-2.5 pr-1.5 text-xs">
              <FileText size={14} className="shrink-0 text-accent" />
              <span className="truncate font-medium">{file.name}</span>
              <span className="shrink-0 text-subtle">{(file.content.length / 1000).toFixed(1)} KB</span>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() => onAttachmentsChange(attachments.filter((_, i) => i !== index))}
                className="rounded-md p-0.5 text-subtle hover:bg-surface hover:text-fg"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={value}
        rows={hero ? 3 : 1}
        autoFocus={autoFocus}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => {
          // Enter sends; Shift+Enter adds a line. Ignore Enter while an IME (e.g. Chinese input) is composing.
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            if (canSend) onSubmit();
          }
        }}
        onPaste={e => {
          if (e.clipboardData.files.length) {
            e.preventDefault();
            addFiles(e.clipboardData.files);
          }
        }}
        placeholder={placeholder}
        aria-label="Message"
        className={`block w-full resize-none bg-transparent px-4 text-fg placeholder:text-subtle focus:outline-none disabled:opacity-60 ${
          hero ? "pt-4 text-base" : "pt-3 text-[15px]"
        }`}
      />

      <div className="flex items-center gap-2 px-2.5 pb-2.5 pt-1">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={disabled}
          className="btn-icon"
          aria-label="Attach a text file"
          title="Attach a text file (code, CSV, Markdown…)"
        >
          <Paperclip size={17} />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          multiple
          hidden
          onChange={e => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">{toolbar}</div>
        {streaming ? (
          <button key="stop" type="button" onClick={onStop} className="flex h-9 w-9 items-center justify-center rounded-full bg-fg text-surface transition-opacity hover:opacity-80" aria-label="Stop generating" title="Stop">
            <Square size={14} fill="currentColor" />
          </button>
        ) : (
          <button
            key="send"
            type="button"
            onClick={onSubmit}
            disabled={!canSend}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-fg transition-all hover:bg-accent/90 disabled:bg-elevated disabled:text-subtle"
            aria-label="Send message"
            title="Send (Enter)"
          >
            <ArrowUp size={18} />
          </button>
        )}
      </div>

      {error && <p className="absolute -bottom-6 left-4 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
});

export default Composer;
