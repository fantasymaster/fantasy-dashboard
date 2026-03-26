"use client";

import { useState, useEffect } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, ImageIcon, Film, Layers, BookOpen, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchPosts } from "@/lib/posts-service";
import { type InstagramPost, type PostType, POST_TYPE_ACCENT } from "@/lib/instagram-types";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const PostTypeIconMap: Record<PostType, React.ElementType> = {
  photo: ImageIcon, carousel: Layers, reel: Film, story: BookOpen,
};

const POST_TYPE_DOT: Record<PostType, string> = {
  photo: "bg-blue-400",
  carousel: "bg-purple-400",
  reel: "bg-pink-400",
  story: "bg-amber-400",
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CalendarPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    fetchPosts()
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function prevMonth() {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
    setSelectedDay(null);
  }

  function nextMonth() {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
    setSelectedDay(null);
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  // Map posts to days
  const postsByDay: Record<number, InstagramPost[]> = {};
  posts.forEach((post) => {
    const dateStr = post.scheduledDate || post.publishedDate || post.createdAt;
    if (!dateStr) return;
    const d = new Date(dateStr);
    if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
      const day = d.getDate();
      if (!postsByDay[day]) postsByDay[day] = [];
      postsByDay[day].push(post);
    }
  });

  const selectedPosts = selectedDay ? (postsByDay[selectedDay] ?? []) : [];

  const calendarCells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Pad to full weeks
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const isToday = (day: number) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  return (
    <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15">
          <CalendarDays className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Content Calendar</h1>
          <p className="text-sm text-muted-foreground">
            View your scheduled and published posts by date
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Calendar */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-base font-semibold min-w-36 text-center">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </h2>
                <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="mb-1 grid grid-cols-7 gap-1">
              {DAYS_OF_WEEK.map((d) => (
                <div key={d} className="py-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((day, idx) => {
                const dayPosts = day ? (postsByDay[day] ?? []) : [];
                const selected = day === selectedDay;
                const todayCell = day ? isToday(day) : false;

                return (
                  <div
                    key={idx}
                    onClick={() => day && setSelectedDay(selected ? null : day)}
                    className={cn(
                      "min-h-[48px] rounded-lg border p-1 transition-all sm:min-h-[72px] sm:p-1.5",
                      day ? "cursor-pointer" : "border-transparent",
                      day && !selected && !todayCell && "border-border bg-card hover:bg-accent/50",
                      todayCell && !selected && "border-primary/40 bg-primary/5",
                      selected && "border-primary bg-primary/10 ring-1 ring-primary/30",
                    )}
                  >
                    {day && (
                      <>
                        <span className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium",
                          todayCell ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground",
                        )}>
                          {day}
                        </span>
                        {dayPosts.length > 0 && (
                          <div className="mt-1 flex flex-col gap-0.5">
                            {/* Dot indicators on mobile, full label on sm+ */}
                            <div className="flex flex-wrap gap-0.5 sm:hidden">
                              {dayPosts.slice(0, 3).map((post) => (
                                <div key={post.id} className={cn("h-1.5 w-1.5 rounded-full", POST_TYPE_DOT[post.postType])} />
                              ))}
                            </div>
                            <div className="hidden sm:flex flex-col gap-0.5">
                              {dayPosts.slice(0, 2).map((post) => (
                                <div
                                  key={post.id}
                                  className={cn(
                                    "flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px] font-medium truncate",
                                    `bg-gradient-to-r ${POST_TYPE_ACCENT[post.postType]} bg-opacity-20 text-white/80`
                                  )}
                                >
                                  <div className={cn("h-1.5 w-1.5 shrink-0 rounded-full", POST_TYPE_DOT[post.postType])} />
                                  <span className="truncate">{post.caption.slice(0, 12)}…</span>
                                </div>
                              ))}
                              {dayPosts.length > 2 && (
                                <span className="pl-1 text-[9px] text-muted-foreground">+{dayPosts.length - 2} more</span>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-3 border-t border-border pt-3">
              {[
                { label: "Photo", color: "bg-blue-400" },
                { label: "Carousel", color: "bg-purple-400" },
                { label: "Reel", color: "bg-pink-400" },
                { label: "Story", color: "bg-amber-400" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className={cn("h-2 w-2 rounded-full", item.color)} />
                  {item.label}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Side panel */}
        <div className="flex flex-col gap-3">
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <h3 className="text-sm font-semibold">
                {selectedDay
                  ? `${MONTH_NAMES[currentMonth]} ${selectedDay}`
                  : "Select a day"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {selectedDay
                  ? selectedPosts.length === 0
                    ? "No posts on this day"
                    : `${selectedPosts.length} post${selectedPosts.length > 1 ? "s" : ""}`
                  : "Click a date to see posts"}
              </p>
            </CardHeader>
            <CardContent>
              {!selectedDay && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CalendarDays className="mb-2 h-8 w-8 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground">Click any date on the calendar</p>
                </div>
              )}
              {selectedDay && selectedPosts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-xs text-muted-foreground">No posts scheduled for this day</p>
                </div>
              )}
              {selectedPosts.map((post) => {
                const Icon = PostTypeIconMap[post.postType];
                return (
                  <div key={post.id} className="mb-3 rounded-lg border border-border bg-muted/30 p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <div className={cn("flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br", POST_TYPE_ACCENT[post.postType])}>
                        <Icon className="h-3 w-3 text-white" />
                      </div>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-xs text-foreground/80 line-clamp-3">{post.caption}</p>
                    {post.hashtags && (
                      <p className="mt-1.5 text-[10px] text-purple-400/70 line-clamp-1">{post.hashtags}</p>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Monthly summary */}
          <Card>
            <CardHeader className="pb-2">
              <h3 className="text-sm font-semibold">Month Summary</h3>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {[
                { label: "Scheduled", count: posts.filter(p => p.status === "scheduled" && (() => { const d = new Date(p.scheduledDate ?? ""); return d.getMonth() === currentMonth && d.getFullYear() === currentYear; })()), color: "text-emerald-400" },
                { label: "Published", count: posts.filter(p => p.status === "published" && (() => { const d = new Date(p.publishedDate ?? p.createdAt); return d.getMonth() === currentMonth && d.getFullYear() === currentYear; })()), color: "text-sky-400" },
                { label: "Drafts", count: posts.filter(p => p.status === "draft"), color: "text-zinc-400" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className={cn("font-bold text-base", item.color)}>{item.count.length}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
