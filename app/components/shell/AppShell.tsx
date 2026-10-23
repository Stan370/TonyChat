"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GitHub, Grid, Home, MessageSquare, Settings, Zap } from "react-feather";
import ThemeToggle from "./ThemeToggle";

export const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/chat", label: "Chats", icon: MessageSquare },
  { href: "/store", label: "Agents", icon: Grid },
  { href: "/usecases", label: "Use cases", icon: Zap },
];

const GITHUB_URL = "https://github.com/Stan370/TonyChat";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** LobeChat-style navigation rail on desktop, bottom tab bar on mobile. */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";

  return (
    <div className="flex h-dvh overflow-hidden">
      <nav aria-label="Main" className="hidden md:flex w-[68px] shrink-0 flex-col items-center gap-1 border-r border-line bg-surface py-3">
        <Link href="/" className="mb-3" aria-label="TonyChat home">
          <Image src="/T_icon.png" alt="TonyChat" width={36} height={36} className="rounded-xl dark:invert" priority />
        </Link>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`group flex w-14 flex-col items-center gap-1 rounded-xl py-2 text-[11px] transition-colors ${
                active ? "bg-accent-soft text-accent" : "text-muted hover:bg-elevated hover:text-fg"
              }`}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
        <div className="mt-auto flex flex-col items-center gap-1">
          <Link
            href="/settings"
            aria-current={isActive(pathname, "/settings") ? "page" : undefined}
            className={`btn-icon ${isActive(pathname, "/settings") ? "bg-accent-soft text-accent" : ""}`}
            aria-label="Settings and API keys"
            title="Settings and API keys"
          >
            <Settings size={18} />
          </Link>
          <ThemeToggle />
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="btn-icon" aria-label="TonyChat on GitHub" title="GitHub">
            <GitHub size={18} />
          </a>
        </div>
      </nav>

      <main className="relative flex-1 min-w-0 overflow-hidden pb-14 md:pb-0">{children}</main>

      <nav aria-label="Main" className="md:hidden fixed inset-x-0 bottom-0 z-40 flex h-14 items-stretch border-t border-line bg-surface/95 backdrop-blur">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] ${active ? "text-accent" : "text-muted"}`}
            >
              <Icon size={19} />
              {label}
            </Link>
          );
        })}
        <Link
          href="/settings"
          aria-current={isActive(pathname, "/settings") ? "page" : undefined}
          aria-label="Settings"
          className={`flex w-14 flex-col items-center justify-center gap-0.5 text-[11px] ${isActive(pathname, "/settings") ? "text-accent" : "text-muted"}`}
        >
          <Settings size={19} />
          Settings
        </Link>
      </nav>
    </div>
  );
}
