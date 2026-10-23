"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import UseCaseGallery from "../components/usecases/UseCaseGallery";
import { USE_CASE_CATEGORIES, USE_CASES } from "@/lib/usecases";

export default function UseCasesPage() {
  return (
    <Suspense fallback={<div className="h-full bg-canvas" />}>
      <UseCases />
    </Suspense>
  );
}

function UseCases() {
  const router = useRouter();
  const params = useSearchParams();
  const requested = params.get("cat");
  const category = USE_CASE_CATEGORIES.some(c => c.id === requested) ? (requested as (typeof USE_CASE_CATEGORIES)[number]["id"]) : "featured";
  const openId = params.get("u");
  const playable = USE_CASES.filter(u => u.demo).length;

  const setQuery = (next: { cat?: string; u?: string | null }) => {
    const search = new URLSearchParams(params.toString());
    if (next.cat !== undefined) {
      if (next.cat === "featured") search.delete("cat");
      else search.set("cat", next.cat);
    }
    if (next.u !== undefined) {
      if (next.u) search.set("u", next.u);
      else search.delete("u");
    }
    const query = search.toString();
    router.replace(query ? `/usecases?${query}` : "/usecases", { scroll: false });
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Use case gallery</h1>
          <p className="mt-1 max-w-2xl text-muted">
            {USE_CASES.length} ready-made tasks across games, web apps, coding, writing and more. {playable} of them include a playable example you can try right now,
            then rebuild or remix with an agent.
          </p>
        </header>
        <UseCaseGallery
          initialCategory={category}
          initialOpenId={openId}
          onCategoryChange={c => setQuery({ cat: c })}
          onOpenChange={u => setQuery({ u: u?.id ?? null })}
        />
      </div>
    </div>
  );
}
