import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Add free API keys (Gemini, OpenRouter, Groq, Mistral, Zhipu GLM, SiliconFlow) or your own paid keys, and choose a theme.",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
