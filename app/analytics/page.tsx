import { BarChart2, TrendingUp, Users, Eye, MousePointerClick, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const metricCards = [
  {
    label: "Total Reach",
    value: "—",
    change: "Connect data source",
    icon: Eye,
  },
  {
    label: "Engagement Rate",
    value: "—",
    change: "Connect data source",
    icon: MousePointerClick,
  },
  {
    label: "Follower Growth",
    value: "—",
    change: "Connect data source",
    icon: Users,
  },
  {
    label: "Impressions",
    value: "—",
    change: "Connect data source",
    icon: TrendingUp,
  },
];

const features = [
  {
    title: "Cross-Platform Analytics",
    description: "Unified metrics from Instagram, Twitter, LinkedIn, and more in a single view.",
  },
  {
    title: "Audience Demographics",
    description: "Understand your audience by age, location, gender, and interests.",
  },
  {
    title: "Content Performance",
    description: "Identify your top-performing posts and understand what drives engagement.",
  },
  {
    title: "Competitor Benchmarking",
    description: "Compare your growth and engagement metrics against industry competitors.",
  },
  {
    title: "Custom Reports",
    description: "Generate branded PDF reports for clients or stakeholders on demand.",
  },
  {
    title: "Goal Tracking",
    description: "Set targets for followers, reach, or engagement and track progress over time.",
  },
];

export default function AnalyticsPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20">
            <BarChart2 className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Track performance metrics across all your content channels
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-amber-400 border-amber-400/30 bg-amber-400/10">
          Coming Soon
        </Badge>
      </div>

      {/* Metric placeholders */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="bg-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {metric.label}
                  </p>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">{metric.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{metric.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart placeholder */}
      <Card className="mb-6 bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Performance Overview</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardDescription>Connect a data source to view your analytics chart</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border">
            <div className="text-center">
              <BarChart2 className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No data available</p>
              <p className="text-xs text-muted-foreground/60">Connect your accounts to see analytics</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features grid */}
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
        Planned Features
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="bg-card opacity-60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{feature.title}</CardTitle>
              <CardDescription className="text-xs">{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
