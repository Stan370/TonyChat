"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "react-feather";
import UseCaseCard from "./UseCaseCard";
import UseCaseModal from "./UseCaseModal";
import { BUILTIN_AGENTS } from "@/lib/agents";
import { USE_CASE_CATEGORIES, getUseCase, getUseCasesFor } from "@/lib/usecases";
import type { UseCase, UseCaseCategory } from "@/lib/types";

type CategoryId = "featured" | UseCaseCategory;

interface UseCaseGalleryProps {
  limit?: number;
  initialCategory?: CategoryId;
  /** Opens this use case on mount (deep link). */
  initialOpenId?: string | null;
  showAllLink?: boolean;
  onCategoryChange?: (category: CategoryId) => void;
  onOpenChange?: (useCase: UseCase | null) => void;
}

const agentsById = Object.fromEntries(BUILTIN_AGENTS.map(a => [a.id, a]));

/** Manus-style use case gallery with category tabs. */
export default function UseCaseGallery({ limit, initialCategory = "featured", initialOpenId, showAllLink, onCategoryChange, onOpenChange }: UseCaseGalleryProps) {
  const [category, setCategory] = useState<CategoryId>(initialCategory);
  const [open, setOpen] = useState<UseCase | null>(null);

  useEffect(() => setCategory(initialCategory), [initialCategory]);
  useEffect(() => {
    if (initialOpenId) setOpen(getUseCase(initialOpenId) ?? null);
  }, [initialOpenId]);

  const items = useMemo(() => {
    const all = getUseCasesFor(category);
    return limit ? all.slice(0, limit) : all;
  }, [category, limit]);

  const select = (next: CategoryId) => {
    setCategory(next);
    onCategoryChange?.(next);
  };
  const openUseCase = (useCase: UseCase | null) => {
    setOpen(useCase);
    onOpenChange?.(useCase);
  };

  return (
    <div>
      <div role="tablist" aria-label="Use case categories" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {USE_CASE_CATEGORIES.map(c => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={category === c.id}
            onClick={() => select(c.id)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              category === c.id ? "bg-fg text-surface" : "border border-line bg-surface text-muted hover:text-fg"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map(useCase => (
          <UseCaseCard key={useCase.id} useCase={useCase} agent={agentsById[useCase.agentId]} onOpen={openUseCase} />
        ))}
      </div>

      {showAllLink && (
        <div className="mt-6 flex justify-center">
          <Link href={category === "featured" ? "/usecases" : `/usecases?cat=${category}`} className="btn-secondary">
            Explore all use cases <ArrowRight size={15} />
          </Link>
        </div>
      )}

      {open && <UseCaseModal useCase={open} agent={agentsById[open.agentId]} onClose={() => openUseCase(null)} />}
    </div>
  );
}
