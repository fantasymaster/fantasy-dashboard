"use client";

import {
  BarChart2, TrendingUp, Users, Eye, MousePointerClick,
  ArrowUpRight, ArrowDownRight, ImageIcon, Film, Layers, BookOpen,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// ─── Mock data ───────────────────────────────────────────────────────────────
const followerData = [
  { month: "Oct", followers: 4200 },
  { month: "Nov", followers: 5100 },
  { month: "Dec", followers: 5800 },
  { month: "Jan", followers: 7200 },
  { month: "Feb", followers: 8900 },
  { month: "Mar", followers: 11400 },
];

const engagementData = [
  { day: "Mon", likes: 320, comments: 45, shares: 28 },
  { day: "Tue", likes: 480, comments: 62, shares: 41 },
  { day: "Wed", likes: 390, comments: 38, shares: 33 },
  { day: "Thu", likes: 610, comments: 88, shares: 55 },
  { day: "Fri", likes: 720, comments: 102, shares: 74 },
  { day: "Sat", likes: 890, comments: 134, shares: 96 },
  { day: "Sun", likes: 540, comments: 71, shares: 48 },
];

const postTypeData = [
  { name: "Reels", value: 42, color: "#e879f9" },
  { name: "Carousels", value: 28, color: "#818cf8" },
  { name: "Photos", value: 20, color: "#38bdf8" },
  { name: "Stories", value: 10, color: "#fb923c" },
];

const topPosts = [
  { caption: "POV: you finally nailed the transition ✨", type: "reel", likes: 4821, comments: 312, reach: 28400 },
  { caption: "5 tools I actually use to grow my account organically 👇", type: "carousel", likes: 3204, comments: 198, reach: 19200 },
  { caption: "Golden hour magic from last weekend's shoot ✨", type: "photo", likes: 2891, comments: 145, reach: 15600 },
  { caption: "Behind the scenes of our latest campaign!", type: "carousel", likes: 2340, comments: 167, reach: 13800 },
  { caption: "Starting the week right ☀️ What's everyone manifesting?", type: "photo", likes: 1920, comments: 234, reach: 11200 },
];

const PostTypeIconMap: Record<string, React.ElementType> = {
  photo: ImageIcon, carousel: Layers, reel: Film, story: BookOpen,
};

// ─── Stat card ───────────────────────────────────────────────────────────────
function StatCard({
  label, value, change, changeType, icon: Icon, color,
}: {
  label: string; value: string; change: string;
  changeType: "up" | "down"; icon: React.ElementType; color: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
            <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${changeType === "up" ? "text-emerald-400" : "text-rose-400"}`}>
              {changeType === "up"
                ? <ArrowUpRight className="h-3.5 w-3.5" />
                : <ArrowDownRight className="h-3.5 w-3.5" />
              }
              {change}
            </div>
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: {active?: boolean; payload?: {color: string; name: string; value: number}[]; label?: string}) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-xl text-xs">
        <p className="mb-1.5 font-semibold text-foreground">{label}</p>
        {payload.map((p) => (
          <div key={p.name} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            <span className="text-muted-foreground capitalize">{p.name}:</span>
            <span className="font-medium text-foreground">{p.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15">
          <BarChart2 className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Track performance across your content — sample data shown
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Followers" value="11.4K" change="+28% this month" changeType="up" icon={Users} color="bg-purple-500/15 text-purple-400" />
        <StatCard label="Avg. Reach" value="18.2K" change="+14% this month" changeType="up" icon={Eye} color="bg-blue-500/15 text-blue-400" />
        <StatCard label="Engagement Rate" value="4.8%" change="+0.6% this month" changeType="up" icon={MousePointerClick} color="bg-emerald-500/15 text-emerald-400" />
        <StatCard label="Total Impressions" value="142K" change="-3% this month" changeType="down" icon={TrendingUp} color="bg-amber-500/15 text-amber-400" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Follower growth */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Follower Growth</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={followerData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="followerGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "oklch(0.55 0.01 260)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "oklch(0.55 0.01 260)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="followers" stroke="#a855f7" strokeWidth={2} fill="url(#followerGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Post type breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Post Type Mix</CardTitle>
            <CardDescription>By percentage</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={postTypeData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {postTypeData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 w-full">
              {postTypeData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="ml-auto font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Weekly Engagement</CardTitle>
          <CardDescription>Likes, comments, and shares this week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={engagementData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }} barSize={18} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "oklch(0.55 0.01 260)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "oklch(0.55 0.01 260)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} />
              <Bar dataKey="likes" fill="#a855f7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="comments" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="shares" fill="#34d399" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top posts */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Top Performing Posts</CardTitle>
          <CardDescription>Ranked by reach this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col divide-y divide-border">
            {topPosts.map((post, i) => {
              const Icon = PostTypeIconMap[post.type];
              return (
                <div key={i} className="flex items-center gap-4 py-3">
                  <span className="w-5 text-center text-sm font-bold text-muted-foreground/50">
                    {i + 1}
                  </span>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <p className="flex-1 truncate text-sm">{post.caption}</p>
                  <div className="hidden gap-6 sm:flex text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="text-purple-400 font-medium">{post.likes.toLocaleString()}</span> likes</span>
                    <span className="flex items-center gap-1"><span className="text-blue-400 font-medium">{post.comments}</span> comments</span>
                    <span className="flex items-center gap-1"><span className="text-emerald-400 font-medium">{post.reach.toLocaleString()}</span> reach</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
