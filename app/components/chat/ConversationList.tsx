"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Edit2, Plus, Search, Trash2, X } from "react-feather";
import AgentAvatar from "../AgentAvatar";
import type { Agent, Conversation } from "@/lib/types";

interface ConversationListProps {
  conversations: Conversation[];
  agentsById: Record<string, Agent>;
  activeId: string | null;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onNavigate?: () => void;
  onClose?: () => void;
}

function groupLabel(iso: string): string {
  const date = new Date(iso);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const days = Math.floor((startOfToday.getTime() - new Date(date).setHours(0, 0, 0, 0)) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return "Previous 7 days";
  if (days < 30) return "Previous 30 days";
  return "Older";
}

/** Manus-style task list: every chat, grouped by date, with search, rename and delete. */
export default function ConversationList({ conversations, agentsById, activeId, onNew, onDelete, onRename, onNavigate, onClose }: ConversationListProps) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<{ id: string; title: string } | null>(null);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result: { label: string; items: Conversation[] }[] = [];
    for (const conversation of conversations) {
      const agentName = agentsById[conversation.agentId]?.name ?? "";
      if (q && !conversation.title.toLowerCase().includes(q) && !agentName.toLowerCase().includes(q)) continue;
      const label = groupLabel(conversation.updatedAt);
      const group = result.find(g => g.label === label);
      if (group) group.items.push(conversation);
      else result.push({ label, items: [conversation] });
    }
    return result;
  }, [conversations, agentsById, query]);

  const commitRename = () => {
    if (editing && editing.title.trim()) onRename(editing.id, editing.title.trim().slice(0, 80));
    setEditing(null);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-3 pb-2 pt-3">
        <h2 className="flex-1 text-sm font-semibold">Chats</h2>
        {onClose && (
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close chat list">
            <X size={16} />
          </button>
        )}
      </div>
      <div className="space-y-2 px-3 pb-2">
        <button type="button" onClick={onNew} className="btn-secondary w-full justify-start">
          <Plus size={16} /> New chat
        </button>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-2.5 text-subtle" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search chats" className="input py-1.5 pl-8 text-[13px]" aria-label="Search chats" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {groups.map(group => (
          <div key={group.label} className="mt-2">
            <div className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-subtle">{group.label}</div>
            {group.items.map(conversation => {
              const agent = agentsById[conversation.agentId];
              const active = conversation.id === activeId;
              if (editing?.id === conversation.id) {
                return (
                  <div key={conversation.id} className="px-1 py-0.5">
                    <input
                      autoFocus
                      value={editing.title}
                      onChange={e => setEditing({ ...editing, title: e.target.value })}
                      onBlur={commitRename}
                      onKeyDown={e => {
                        if (e.key === "Enter") commitRename();
                        if (e.key === "Escape") setEditing(null);
                      }}
                      className="input py-1.5 text-[13px]"
                      aria-label="Chat title"
                    />
                  </div>
                );
              }
              return (
                <div key={conversation.id} className={`group relative flex items-center rounded-xl ${active ? "bg-accent-soft" : "hover:bg-elevated"}`}>
                  <Link href={`/chat?c=${conversation.id}`} onClick={onNavigate} className="flex min-w-0 flex-1 items-center gap-2.5 px-2 py-2" aria-current={active ? "page" : undefined}>
                    <AgentAvatar avatar={agent?.avatar ?? "💬"} name={agent?.name ?? "Agent"} background={agent?.avatarBg} size={26} />
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-[13px] ${active ? "font-semibold text-fg" : "text-fg"}`}>{conversation.title}</span>
                      <span className="block truncate text-[11px] text-subtle">{agent?.name ?? "Deleted agent"}</span>
                    </span>
                  </Link>
                  <div className="absolute right-1 hidden items-center rounded-lg bg-surface/90 shadow-card group-hover:flex group-focus-within:flex">
                    <button type="button" className="btn-icon h-7 w-7" aria-label="Rename chat" title="Rename" onClick={() => setEditing({ id: conversation.id, title: conversation.title })}>
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      className="btn-icon h-7 w-7 hover:text-red-500"
                      aria-label="Delete chat"
                      title="Delete"
                      onClick={() => {
                        if (window.confirm(`Delete "${conversation.title}"?`)) onDelete(conversation.id);
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        {!groups.length && (
          <p className="px-3 py-8 text-center text-xs text-muted">{query ? "No chats match your search." : "Your chats will appear here."}</p>
        )}
      </div>
    </div>
  );
}
