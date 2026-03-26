"use client";

import { useState } from "react";
import {
  Users, Plus, TrendingUp, TrendingDown, Trash2,
  AtSign, ExternalLink, BarChart2, Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Competitor {
  id: string;
  name: string;
  handle: string;
  followers: number;
  engagement: number;
  postsPerWeek: number;
  trend: "up" | "down" | "flat";
  tags: string[];
  notes: string;
}

const SAMPLE_COMPETITORS: Competitor[] = [
  {
    id: "1",
    name: "Creator Studio",
    handle: "@creatorstudio",
    followers: 48200,
    engagement: 5.2,
    postsPerWeek: 7,
    trend: "up",
    tags: ["content", "photography"],
    notes: "Posts heavily at 6pm EST. Strong carousel performance.",
  },
  {
    id: "2",
    name: "Visual Diary",
    handle: "@visualdiary",
    followers: 32100,
    engagement: 3.8,
    postsPerWeek: 4,
    trend: "flat",
    tags: ["lifestyle", "aesthetic"],
    notes: "Focuses on story content. Lower reach but high loyalty.",
  },
  {
    id: "3",
    name: "Reel Moments",
    handle: "@reelmoments",
    followers: 71500,
    engagement: 6.4,
    postsPerWeek: 12,
    trend: "up",
    tags: ["reels", "viral"],
    notes: "Trending sounds + quick edits. Posts 2x daily.",
  },
];

function formatFollowers(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function CompetitorCard({
  competitor,
  onDelete,
}: {
  competitor: Competitor;
  onDelete: (id: string) => void;
}) {
  return (
    <Card className="flex flex-col gap-0 overflow-hidden">
      <div className={cn(
        "h-0.5 w-full",
        competitor.trend === "up" ? "bg-gradient-to-r from-emerald-500 to-teal-400" :
        competitor.trend === "down" ? "bg-gradient-to-r from-rose-500 to-red-400" :
        "bg-gradient-to-r from-zinc-500 to-zinc-400"
      )} />
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-500">
            <AtSign className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm">{competitor.name}</p>
            <p className="text-xs text-muted-foreground">{competitor.handle}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className={cn(
            "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
            competitor.trend === "up" ? "bg-emerald-500/15 text-emerald-400" :
            competitor.trend === "down" ? "bg-rose-500/15 text-rose-400" :
            "bg-zinc-500/15 text-zinc-400"
          )}>
            {competitor.trend === "up" ? <TrendingUp className="h-3 w-3" /> :
             competitor.trend === "down" ? <TrendingDown className="h-3 w-3" /> :
             <BarChart2 className="h-3 w-3" />}
            {competitor.trend === "up" ? "Growing" : competitor.trend === "down" ? "Declining" : "Stable"}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Followers", value: formatFollowers(competitor.followers), color: "text-purple-400" },
            { label: "Eng. Rate", value: `${competitor.engagement}%`, color: "text-blue-400" },
            { label: "Posts/wk", value: competitor.postsPerWeek.toString(), color: "text-emerald-400" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg bg-muted/40 px-2 py-2 text-center">
              <p className={cn("text-base font-bold", stat.color)}>{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {competitor.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Notes */}
        {competitor.notes && (
          <p className="text-xs text-muted-foreground border-t border-border pt-3">
            {competitor.notes}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-border pt-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => window.open(`https://instagram.com/${competitor.handle.replace("@", "")}`, "_blank")}
          >
            <ExternalLink className="h-3 w-3" />
            View Profile
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-destructive hover:text-destructive"
            onClick={() => onDelete(competitor.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>(SAMPLE_COMPETITORS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "", handle: "", followers: "", engagement: "",
    postsPerWeek: "", notes: "", tags: "",
  });

  function handleAdd() {
    if (!form.name.trim() || !form.handle.trim()) return;
    const newCompetitor: Competitor = {
      id: Math.random().toString(36).slice(2),
      name: form.name,
      handle: form.handle.startsWith("@") ? form.handle : `@${form.handle}`,
      followers: parseInt(form.followers) || 0,
      engagement: parseFloat(form.engagement) || 0,
      postsPerWeek: parseInt(form.postsPerWeek) || 0,
      trend: "flat",
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      notes: form.notes,
    };
    setCompetitors(prev => [newCompetitor, ...prev]);
    setForm({ name: "", handle: "", followers: "", engagement: "", postsPerWeek: "", notes: "", tags: "" });
    setDialogOpen(false);
  }

  function handleDelete(id: string) {
    setCompetitors(prev => prev.filter(c => c.id !== id));
  }

  const filtered = competitors.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.handle.toLowerCase().includes(search.toLowerCase())
  );

  const avgEngagement = competitors.length
    ? (competitors.reduce((acc, c) => acc + c.engagement, 0) / competitors.length).toFixed(1)
    : "0";
  const totalFollowers = competitors.reduce((acc, c) => acc + c.followers, 0);

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15">
            <Users className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Competitor Tracker</h1>
            <p className="text-sm text-muted-foreground">
              Monitor and benchmark against competitors in your niche
            </p>
          </div>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-gradient-to-r from-violet-600 to-purple-500 text-white hover:opacity-90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Competitor
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Competitors Tracked", value: competitors.length.toString(), color: "text-violet-400" },
          { label: "Avg Engagement Rate", value: `${avgEngagement}%`, color: "text-blue-400" },
          { label: "Combined Followers", value: formatFollowers(totalFollowers), color: "text-emerald-400" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-4">
              <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search competitors..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Competitors grid */}
      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Users className="mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm font-medium">No competitors found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search ? "Try a different search term" : "Add your first competitor to start tracking"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <CompetitorCard key={c.id} competitor={c} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Add dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-violet-600 to-purple-500">
                <Users className="h-3.5 w-3.5 text-white" />
              </div>
              Add Competitor
            </DialogTitle>
            <DialogDescription>Track a competitor's Instagram presence</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Name *</Label>
                <Input placeholder="Creator Studio" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Handle *</Label>
                <Input placeholder="@handle" value={form.handle} onChange={e => setForm(f => ({ ...f, handle: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Followers</Label>
                <Input type="number" placeholder="48200" value={form.followers} onChange={e => setForm(f => ({ ...f, followers: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Eng. Rate %</Label>
                <Input type="number" placeholder="5.2" value={form.engagement} onChange={e => setForm(f => ({ ...f, engagement: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Posts/week</Label>
                <Input type="number" placeholder="7" value={form.postsPerWeek} onChange={e => setForm(f => ({ ...f, postsPerWeek: e.target.value }))} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Tags (comma separated)</Label>
              <Input placeholder="lifestyle, photography, reels" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Notes</Label>
              <Input placeholder="Key observations about their strategy..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAdd}
              disabled={!form.name.trim() || !form.handle.trim()}
              className="bg-gradient-to-r from-violet-600 to-purple-500 text-white hover:opacity-90"
            >
              Add Competitor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
