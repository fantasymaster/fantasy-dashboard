import Link from "next/link";
import {
  Camera,
  BarChart2,
  CalendarDays,
  Users,
  Newspaper,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const sections = [
  {
    title: "Instagram Manager",
    description: "Schedule posts, manage stories, and track engagement across your Instagram accounts.",
    href: "/instagram",
    icon: Camera,
    badge: "Social",
    badgeVariant: "secondary" as const,
    stats: "Connect account to get started",
  },
  {
    title: "Analytics",
    description: "Deep-dive into performance metrics, audience insights, and growth trends.",
    href: "/analytics",
    icon: BarChart2,
    badge: "Insights",
    badgeVariant: "secondary" as const,
    stats: "No data yet",
  },
  {
    title: "Content Calendar",
    description: "Plan, schedule, and organize your content pipeline across all channels.",
    href: "/calendar",
    icon: CalendarDays,
    badge: "Planning",
    badgeVariant: "secondary" as const,
    stats: "0 scheduled items",
  },
  {
    title: "Competitor Tracker",
    description: "Monitor competitor activity, benchmark performance, and identify opportunities.",
    href: "/competitors",
    icon: Users,
    badge: "Research",
    badgeVariant: "secondary" as const,
    stats: "0 competitors tracked",
  },
  {
    title: "News Consolidator",
    description: "Aggregate industry news, trending topics, and content inspiration in one place.",
    href: "/news",
    icon: Newspaper,
    badge: "Feeds",
    badgeVariant: "secondary" as const,
    stats: "0 sources connected",
  },
];

export default function DashboardPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome to Content Hub
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage your content strategy, track analytics, and stay ahead of the competition.
        </p>
      </div>

      {/* Status bar */}
      <div className="mb-8 flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
        <div className="h-2 w-2 rounded-full bg-amber-400" />
        <p className="text-sm text-muted-foreground">
          Getting started — connect your accounts to unlock full functionality.
        </p>
      </div>

      {/* Section cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.href} href={section.href} className="group block">
              <Card className="h-full bg-card transition-colors hover:bg-accent/20 hover:border-border/80">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Icon className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={section.badgeVariant}>{section.badge}</Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </div>
                  <CardTitle className="mt-3 text-base">{section.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{section.stats}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
