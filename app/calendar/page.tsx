import { CalendarDays, PlusCircle, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Generate a placeholder calendar grid for the current month (March 2026)
const calendarDays = Array.from({ length: 35 }, (_, i) => {
  const day = i - 2; // March 2026 starts on Sunday (index 0 = day -2, so day 1 = index 3)
  return day > 0 && day <= 31 ? day : null;
});

const features = [
  {
    title: "Drag-and-Drop Scheduling",
    description: "Intuitively move content between dates with a visual drag-and-drop interface.",
  },
  {
    title: "Multi-Platform View",
    description: "See all scheduled content across Instagram, Twitter, LinkedIn, and more.",
  },
  {
    title: "Content Status Tracking",
    description: "Track content through Draft, Review, Approved, and Published stages.",
  },
  {
    title: "Team Collaboration",
    description: "Assign content to team members and manage approval workflows.",
  },
];

export default function CalendarPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600/20">
            <CalendarDays className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Content Calendar
            </h1>
            <p className="text-sm text-muted-foreground">
              Plan and schedule your content pipeline
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-amber-400 border-amber-400/30 bg-amber-400/10">
          Coming Soon
        </Badge>
      </div>

      {/* Calendar navigation */}
      <Card className="mb-6 bg-card">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-base font-semibold text-foreground">March 2026</h2>
              <Button variant="ghost" size="icon" disabled>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" disabled className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button variant="secondary" size="sm" disabled className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Add Content
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day headers */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => (
              <div
                key={idx}
                className={`min-h-[80px] rounded-lg border p-2 ${
                  day
                    ? day === 25
                      ? "border-primary/40 bg-primary/5"
                      : "border-border bg-muted/20 hover:bg-muted/40 cursor-pointer"
                    : "border-transparent bg-transparent"
                }`}
              >
                {day && (
                  <span
                    className={`text-xs font-medium ${
                      day === 25 ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {day}
                  </span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Features grid */}
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
        Planned Features
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
