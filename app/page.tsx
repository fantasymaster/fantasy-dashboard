import Link from "next/link";
import {
  Camera,
  BarChart2,
  CalendarDays,
  Users,
  Newspaper,
  ArrowUpRight,
  Zap,
  TrendingUp,
  Activity,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Data ───────────────────────────────────────────────────────── */

const kpiCards = [
  {
    label: "Total Followers",
    value: "—",
    delta: null,
    note: "Connect account",
    icon: Users,
    accent: "violet",
  },
  {
    label: "Scheduled Posts",
    value: "0",
    delta: null,
    note: "Nothing queued",
    icon: CalendarDays,
    accent: "blue",
  },
  {
    label: "Competitors",
    value: "0",
    delta: null,
    note: "Add to track",
    icon: TrendingUp,
    accent: "emerald",
  },
  {
    label: "News Sources",
    value: "0",
    delta: null,
    note: "Add feeds",
    icon: Activity,
    accent: "amber",
  },
] as const;

type Accent = "violet" | "blue" | "emerald" | "amber";

const accentClasses: Record<Accent, { bg: string; text: string; glow: string; border: string }> = {
  violet:  { bg: "bg-violet-500/10",  text: "text-violet-400",  glow: "shadow-[0_0_12px_oklch(0.66_0.22_280/0.2)]",  border: "border-violet-500/20"  },
  blue:    { bg: "bg-blue-500/10",    text: "text-blue-400",    glow: "shadow-[0_0_12px_oklch(0.62_0.18_215/0.2)]",  border: "border-blue-500/20"    },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", glow: "shadow-[0_0_12px_oklch(0.68_0.18_160/0.2)]",  border: "border-emerald-500/20" },
  amber:   { bg: "bg-amber-500/10",   text: "text-amber-400",   glow: "shadow-[0_0_12px_oklch(0.76_0.18_55/0.2)]",   border: "border-amber-500/20"   },
};

const quickActions = [
  {
    title:       "Instagram Manager",
    description: "Schedule posts and track engagement",
    href:        "/instagram",
    icon:        Camera,
    label:       "Social",
    accent:      "violet" as Accent,
  },
  {
    title:       "Analytics",
    description: "Audience insights and growth trends",
    href:        "/analytics",
    icon:        BarChart2,
    label:       "Insights",
    accent:      "blue" as Accent,
  },
  {
    title:       "Content Calendar",
    description: "Plan your content pipeline",
    href:        "/calendar",
    icon:        CalendarDays,
    label:       "Planning",
    accent:      "emerald" as Accent,
  },
  {
    title:       "Competitor Tracker",
    description: "Benchmark and identify opportunities",
    href:        "/competitors",
    icon:        Users,
    label:       "Research",
    accent:      "amber" as Accent,
  },
  {
    title:       "News Consolidator",
    description: "Industry news and content inspiration",
    href:        "/news",
    icon:        Newspaper,
    label:       "Feeds",
    accent:      "violet" as Accent,
  },
];

const recentActivity = [
  { text: "Dashboard initialised",  time: "Just now",  dot: "bg-violet-400" },
  { text: "Awaiting account setup", time: "—",         dot: "bg-muted-foreground/30" },
  { text: "No events yet",          time: "—",         dot: "bg-muted-foreground/30" },
];

/* ─── Components ─────────────────────────────────────────────────── */

function KpiCard({
  label,
  value,
  note,
  icon: Icon,
  accent,
}: (typeof kpiCards)[number]) {
  const a = accentClasses[accent];
  return (
    <div
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-5",
        "transition-all duration-200",
        "hover:border-border/80 hover:shadow-md",
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", a.bg)}>
          <Icon className={cn("h-4 w-4", a.text)} strokeWidth={1.75} />
        </div>
        <span className={cn("text-label", a.text)}>{label}</span>
      </div>

      <div>
        <p className={cn("text-display text-[2.25rem] font-bold tabular-nums leading-none tracking-[-0.02em]", "text-foreground")}>
          {value}
        </p>
        <p className="mt-1.5 text-[12px] text-muted-foreground">{note}</p>
      </div>
    </div>
  );
}

function ActionCard({
  title,
  description,
  href,
  icon: Icon,
  label,
  accent,
}: (typeof quickActions)[number]) {
  const a = accentClasses[accent];
  return (
    <Link href={href} className="group block">
      <div
        className={cn(
          "relative flex items-start gap-4 rounded-xl border border-border bg-card p-5",
          "transition-all duration-200",
          "hover:border-border/80 hover:shadow-md hover:-translate-y-[1px]",
        )}
      >
        {/* Icon */}
        <div className={cn("mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg", a.bg)}>
          <Icon className={cn("h-4 w-4", a.text)} strokeWidth={1.75} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-[13px] font-semibold leading-snug tracking-[-0.005em] text-foreground">
              {title}
            </h3>
            <span
              className={cn(
                "text-label rounded-md px-1.5 py-0.5",
                a.bg, a.text,
              )}
            >
              {label}
            </span>
          </div>
          <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>

        {/* Arrow */}
        <ArrowUpRight
          className={cn(
            "h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/40",
            "transition-all duration-200",
            "group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
          )}
        />
      </div>
    </Link>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */

export default function DashboardPage() {
  return (
    <div className="min-h-full px-8 py-8">
      <div className="mx-auto max-w-[960px] space-y-8">

        {/* ── Hero ── */}
        <div>
          {/* Status pill */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/8 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_theme(colors.amber.400)]" />
            <span className="text-[11px] font-medium text-amber-400/90 tracking-[0.04em]">
              SETUP IN PROGRESS
            </span>
          </div>

          {/* Heading */}
          <h1
            className={cn(
              "text-[2rem] font-bold leading-[1.15] tracking-[-0.02em] text-foreground",
              "sm:text-[2.5rem]",
            )}
          >
            Welcome back.
          </h1>
          <p className="mt-2 max-w-[480px] text-[14px] leading-relaxed text-muted-foreground">
            Your content command centre is ready. Connect your accounts to
            unlock analytics, scheduling, and competitor tracking.
          </p>
        </div>

        {/* ── KPI Row ── */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
            <p className="text-label text-muted-foreground">Overview</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {kpiCards.map((card) => (
              <KpiCard key={card.label} {...card} />
            ))}
          </div>
        </section>

        {/* ── Two-column layout: Actions + Activity ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">

          {/* Quick Actions */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
                <p className="text-label text-muted-foreground">Modules</p>
              </div>
              <span className="text-[11px] text-muted-foreground/60">
                {quickActions.length} available
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {quickActions.map((action) => (
                <ActionCard key={action.href} {...action} />
              ))}
            </div>
          </section>

          {/* Recent Activity */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
              <p className="text-label text-muted-foreground">Activity</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-col divide-y divide-border">
                {recentActivity.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <span
                      className={cn(
                        "mt-[5px] h-1.5 w-1.5 flex-shrink-0 rounded-full",
                        item.dot,
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] leading-snug text-foreground/80">
                        {item.text}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground/60">
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-[11px] leading-relaxed text-muted-foreground/60">
                  Activity will appear here as you use the platform.
                </p>
              </div>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
