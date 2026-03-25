import { Newspaper, Rss, Tag, Bookmark, RefreshCw, PlusCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Rss,
    title: "RSS Feed Aggregation",
    description: "Subscribe to any RSS feed and consolidate all updates in one inbox.",
  },
  {
    icon: Tag,
    title: "Topic Filtering",
    description: "Filter news by keywords, topics, or industry tags relevant to your niche.",
  },
  {
    icon: Bookmark,
    title: "Content Inspiration",
    description: "Save articles and turn trending news into content ideas with one click.",
  },
  {
    icon: RefreshCw,
    title: "Auto-Refresh",
    description: "Set refresh intervals so your feed always shows the latest industry updates.",
  },
];

const suggestedSources = [
  { name: "TechCrunch", category: "Technology" },
  { name: "Marketing Week", category: "Marketing" },
  { name: "Social Media Today", category: "Social Media" },
  { name: "Content Marketing Institute", category: "Content" },
  { name: "Search Engine Journal", category: "SEO" },
  { name: "Adweek", category: "Advertising" },
];

export default function NewsPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-600/20">
            <Newspaper className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              News Consolidator
            </h1>
            <p className="text-sm text-muted-foreground">
              Aggregate industry news and content inspiration in one place
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
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-600/10">
            <Rss className="h-8 w-8 text-orange-400" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-foreground">
            No News Sources Connected
          </h2>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            Add RSS feeds, newsletters, or keyword alerts to start aggregating industry news and content ideas relevant to your niche.
          </p>
          <Button variant="secondary" disabled className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add News Source
          </Button>
        </CardContent>
      </Card>

      {/* Suggested sources */}
      <Card className="mb-6 bg-card">
        <CardHeader>
          <CardTitle className="text-base">Suggested Sources</CardTitle>
          <CardDescription>Popular industry feeds you can subscribe to</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {suggestedSources.map((source) => (
              <div
                key={source.name}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{source.name}</p>
                  <p className="text-xs text-muted-foreground">{source.category}</p>
                </div>
                <Button variant="ghost" size="sm" disabled className="text-xs">
                  Add
                </Button>
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
