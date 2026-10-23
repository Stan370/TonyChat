import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat",
  description: "Chat with AI agents on Claude, GPT or Gemini, with live previews for generated games and web pages.",
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return children;
}
