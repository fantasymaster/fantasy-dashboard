"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Camera, BarChart2, CalendarDays,
  Users, Newspaper, Sun, Moon, Monitor, Zap, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { label: "Dashboard",          href: "/",            icon: LayoutDashboard },
  { label: "Instagram Manager",  href: "/instagram",   icon: Camera          },
  { label: "Analytics",          href: "/analytics",   icon: BarChart2       },
  { label: "Content Calendar",   href: "/calendar",    icon: CalendarDays    },
  { label: "Competitor Tracker", href: "/competitors", icon: Users           },
  { label: "News Consolidator",  href: "/news",        icon: Newspaper       },
];

/* ─── Theme Toggle ───────────────────────────────────────────────── */
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-7 w-7" />;

  const Icon =
    theme === "dark"  ? Moon    :
    theme === "light" ? Sun     :
    Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-md",
          "text-muted-foreground",
          "transition-all duration-200",
          "hover:bg-accent hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        )}
        aria-label="Toggle theme"
      >
        <Icon className="h-3.5 w-3.5" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="top"
        sideOffset={6}
        className="w-32 min-w-0"
      >
        {[
          { value: "light",  label: "Light",  Icon: Sun     },
          { value: "dark",   label: "Dark",   Icon: Moon    },
          { value: "system", label: "System", Icon: Monitor },
        ].map(({ value, label, Icon: ItemIcon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              "gap-2 text-xs",
              theme === value && "text-primary font-medium",
            )}
          >
            <ItemIcon className="h-3 w-3 opacity-70" />
            {label}
            {theme === value && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ─── Sidebar ────────────────────────────────────────────────────── */
export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        /* Layout */
        "flex h-full w-[220px] flex-shrink-0 flex-col",
        /* Surface — one step above background */
        "bg-sidebar",
        /* Right edge border */
        "border-r border-sidebar-border",
      )}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-2.5 px-5 py-[18px]">
        <div
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg",
            "bg-gradient-to-br from-violet-500 to-fuchsia-500",
            "shadow-[0_0_12px_oklch(0.66_0.22_280/0.35)]",
          )}
        >
          <Zap className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] font-semibold leading-tight tracking-[-0.01em] text-foreground">
            Fantasy
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
            Dashboard
          </span>
        </div>

        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className={cn(
              "ml-auto flex h-7 w-7 items-center justify-center rounded-md",
              "text-muted-foreground transition-colors",
              "hover:bg-accent hover:text-foreground",
              "md:hidden",
            )}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Hairline separator */}
      <div className="mx-5 h-px bg-border" />

      {/* ── Section label ── */}
      <p className="text-label mt-5 mb-1.5 px-5 text-muted-foreground/70">
        Menu
      </p>

      {/* ── Navigation ── */}
      <nav className="flex flex-col gap-0.5 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Tooltip key={item.href}>
              <TooltipTrigger>
                <Link
                  href={item.href}
                  className={cn(
                    /* Base */
                    "group relative flex items-center gap-2.5 rounded-md px-3 py-[7px]",
                    "text-[13px] font-medium",
                    "transition-all duration-200",
                    /* Active state — left accent bar, subtle bg */
                    isActive
                      ? [
                          "text-foreground",
                          "bg-accent/60",
                          /* Left border accent */
                          "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
                          "before:h-4 before:w-[3px] before:rounded-r-full before:bg-primary",
                        ]
                      : [
                          "text-muted-foreground",
                          "hover:bg-accent/40 hover:text-foreground",
                        ],
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 flex-shrink-0 transition-colors duration-200",
                      isActive ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground/80",
                    )}
                    strokeWidth={isActive ? 2 : 1.75}
                  />
                  <span className="tracking-[-0.005em]">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                <p className="text-xs">{item.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="mt-auto">
        <div className="mx-5 h-px bg-border" />

        <div className="flex items-center justify-between px-4 py-3.5">
          {/* User avatar placeholder */}
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full",
                "bg-gradient-to-br from-violet-400 to-fuchsia-400",
                "text-[10px] font-semibold text-white",
              )}
            >
              F
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-medium leading-tight text-foreground">
                Workspace
              </span>
              <span className="text-[10px] leading-tight text-muted-foreground">
                v1.0
              </span>
            </div>
          </div>

          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
