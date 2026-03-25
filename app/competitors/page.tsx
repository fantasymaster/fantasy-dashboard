import { Users, Search, TrendingUp, Bell, PlusCircle, BarChart2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Search,
    title: "Competitor Discovery",
    description: "Find and add competitors by username, keyword, or industry category.",
  },
  {
    icon: TrendingUp,
    title: "Growth Benchmarking",
    description: "Compare follower growth rates and engagement trends side by side.",
  },
  {
    icon: Bell,
    title: "Activity Alerts",
    description: "Get notified when competitors publish new content or run campaigns.",
  },
  {
    icon: BarChart2,
    title: "Share of Voice",
    description: "Measure your brand's presence versus competitors in your niche.",
  },
];

export default function CompetitorsPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600/20">
            <Users className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Competitor Tracker
            </h1>
            <p className="text-sm text-muted-foreground">
              Monitor competitors and benchmark your performance
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-amber-400 border-amber-400/30 bg-amber-400/10">
          Coming Soon
        </Badge>
      </div>

      {/* Empty state */}
      <Card className="mb-6 border-dashed border-border bg-card">
        <CardContent className="flex flex-col items-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-600/10">
            <Users className="h-8 w-8 text-violet-400" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-foreground">
            No Competitors Added Yet
          </h2>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            Add competitors to start tracking their content strategy, growth metrics, and engagement patterns compared to your own accounts.
          </p>
          <Button variant="secondary" disabled className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Competitor
          </Button>
        </CardContent>
      </Card>

      {/* Comparison table placeholder */}
      <Card className="mb-6 bg-card">
        <CardHeader>
          <CardTitle className="text-base">Competitor Comparison</CardTitle>
          <CardDescription>Head-to-head metric comparison will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border">
            <div className="text-center">
              <BarChart2 className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Add competitors to see comparison data</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features grid */}
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
        Planned Features
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className="bg-card opacity-60">
              <CardHeader className="pb-3">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                  <Icon className="h-4 w-4 text-foreground" />
                </div>
                <CardTitle className="text-sm">{feature.title}</CardTitle>
                <CardDescription className="text-xs">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
