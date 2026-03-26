"use client";

import { useState } from "react";
import { Menu, Zap } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { cn } from "@/lib/utils";

/**
 * AppShell
 * --------
 * Handles the top-level layout split between sidebar and main content.
 * On desktop (md+) the sidebar sits permanently in the flex row.
 * On mobile it slides in as a fixed overlay triggered by a hamburger button.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-full">
      {/* ── Mobile top bar ─────────────────────────────────────────── */}
      <header
        className={cn(
          "fixed left-0 right-0 top-0 z-40",
          "flex h-14 items-center gap-3",
          "border-b border-border bg-background/95 backdrop-blur-sm",
          "px-4",
          "md:hidden",
        )}
      >
        <button
          onClick={() => setSidebarOpen(true)}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md",
            "text-muted-foreground transition-colors",
            "hover:bg-accent hover:text-foreground",
          )}
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Mini logo */}
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-md",
              "bg-gradient-to-br from-violet-500 to-fuchsia-500",
            )}
          >
            <Zap className="h-3 w-3 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[13px] font-semibold text-foreground">Content Hub</span>
        </div>
      </header>

      {/* ── Backdrop (mobile only) ──────────────────────────────────── */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm",
          "transition-opacity duration-300 md:hidden",
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        aria-hidden="true"
      />

      {/* ── Sidebar wrapper ─────────────────────────────────────────── */}
      {/*
       * Mobile: fixed overlay, slides in from the left.
       * Desktop (md+): becomes a regular flex child — no translation.
       */}
      <div
        className={cn(
          /* Mobile — fixed panel */
          "fixed inset-y-0 left-0 z-50 flex-shrink-0",
          "transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          /* Desktop — back in normal flow */
          "md:relative md:inset-auto md:z-auto md:translate-x-0",
        )}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* ── Page content ────────────────────────────────────────────── */}
      {/* pt-14 offsets the fixed mobile header; removed on md+ */}
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
