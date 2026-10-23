import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Use case gallery",
  description: "Ready-made AI tasks with playable examples: build browser games and web apps, review code, analyze data and plan trips.",
};

export default function UseCasesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
