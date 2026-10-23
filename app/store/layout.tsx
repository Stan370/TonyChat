import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent marketplace",
  description: "Specialized AI agents for coding, games, writing, learning and more. Create, customize and share your own agents.",
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
