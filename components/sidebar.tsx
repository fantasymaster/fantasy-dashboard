"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Camera, BarChart2, CalendarDays,
  Users, Newspaper, Sun, Moon, Monitor,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { label: "Dashboard",          href: "/",           icon: LayoutDashboard },
  { label: "Instagram Manager",  href: "/instagram",  icon: Camera          },
  { label: "Analytics",          href: "/analytics",  icon: BarChart2       },
  { label: "Content Calendar",   href: "/calendar",   icon: CalendarDays    },
  { label: "Competitor Tracker", href: "/competitors",icon: Users           },
  { label: "News Consolidator",  href: "/news",       icon: Newspaper       },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-8 w-8" />;

  const icon =
    theme === "dark" ? <Moon className="h-4 w-4" /> :
    theme === "light" ? <Sun className="h-4 w-4" /> :
    <Monitor className="h-4 w-4" />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
        {icon}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="w-36">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={cn("gap-2", theme === "light" && "text-primary font-medium")}
        >
          <Sun className="h-3.5 w-3.5" /> Light
          {theme === "light" && <span className="ml-auto text-[10px]">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={cn("gap-2", theme === "dark" && "text-primary font-medium")}
        >
          <Moon className="h-3.5 w-3.5" /> Dark
          {theme === "dark" && <span className="ml-auto text-[10px]">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={cn("gap-2", theme === "system" && "text-primary font-medium")}
        >
          <Monitor className="h-3.5 w-3.5" /> System
          {theme === "system" && <span className="ml-auto text-[10px]">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[250px] flex-shrink-0 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-500">
          <LayoutDashboard className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-semibold tracking-tight">
          Fantasy Dashboard
        </span>
      </div>

      <Separator className="mb-2" />

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-3 py-2">
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
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {/* Footer with theme toggle */}
      <div className="mt-auto border-t border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Fantasy Dashboard v1.0</p>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
