"use client";

import Image from "next/image";
import { Play } from "react-feather";
import AgentAvatar from "../AgentAvatar";
import type { Agent, UseCase } from "@/lib/types";

export default function UseCaseCard({ useCase, agent, onOpen }: { useCase: UseCase; agent?: Agent; onOpen: (useCase: UseCase) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(useCase)}
      className="group card flex flex-col overflow-hidden text-left transition-all hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-elevated">
        {useCase.demo ? (
          <Image
            src={useCase.demo.cover}
            alt={`${useCase.title} preview`}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl transition-transform duration-300 group-hover:scale-110" style={{ background: agent?.avatarBg }}>
            {useCase.emoji}
          </div>
        )}
        {useCase.demo && (
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur">
            <Play size={10} fill="currentColor" /> Playable example
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="font-semibold leading-snug">{useCase.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{useCase.description}</p>
        {agent && (
          <div className="mt-auto flex items-center gap-1.5 pt-3 text-xs text-subtle">
            <AgentAvatar avatar={agent.avatar} name={agent.name} background={agent.avatarBg} size={18} shape="circle" />
            {agent.name}
          </div>
        )}
      </div>
    </button>
  );
}
