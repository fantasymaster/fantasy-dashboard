"use client";

import { useState, useMemo } from "react";
import {
  Newspaper, Rss, Bookmark, BookmarkCheck, RefreshCw,
  ExternalLink, Search, Lightbulb, Clock, Tag,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { createPost } from "@/lib/posts-service";

// ─── Types ───────────────────────────────────────────────────────────────────
interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  category: Category;
  readTime: number;
  publishedAt: string;
  url: string;
  imageColor: string;
}

type Category = "All" | "Social Media" | "Marketing" | "Content" | "Tech" | "Trends";

const CATEGORIES: Category[] = ["All", "Social Media", "Marketing", "Content", "Tech", "Trends"];

const CATEGORY_COLORS: Record<Category, string> = {
  "All": "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
  "Social Media": "bg-pink-500/15 text-pink-400 border-pink-500/20",
  "Marketing": "bg-blue-500/15 text-blue-400 border-blue-500/20",
  "Content": "bg-purple-500/15 text-purple-400 border-purple-500/20",
  "Tech": "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  "Trends": "bg-amber-500/15 text-amber-400 border-amber-500/20",
};

// ─── Mock articles ────────────────────────────────────────────────────────────
const ALL_ARTICLES: NewsArticle[] = [
  {
    id: "1", category: "Social Media",
    title: "Instagram Announces New Creator Monetisation Tools for 2026",
    summary: "Meta is rolling out expanded monetisation options for Instagram creators, including a new subscription tier and enhanced affiliate marketing features that promise higher revenue splits for qualifying accounts.",
    source: "Social Media Today", readTime: 4, publishedAt: "2026-03-26T09:00:00Z",
    url: "https://socialmediatoday.com", imageColor: "from-pink-600 to-rose-500",
  },
  {
    id: "2", category: "Trends",
    title: "Short-Form Video Still Dominates: Reels Engagement Up 34% YoY",
    summary: "New data from Hootsuite's annual report shows Reels continue to outperform static posts by a wide margin. Accounts posting 5+ Reels per week see 3x the follower growth compared to photo-only accounts.",
    source: "Hootsuite Blog", readTime: 6, publishedAt: "2026-03-26T07:30:00Z",
    url: "https://hootsuite.com", imageColor: "from-amber-500 to-orange-400",
  },
  {
    id: "3", category: "Marketing",
    title: "The Psychology of Scroll-Stopping Captions: What Actually Works",
    summary: "A new study of 500,000 Instagram posts reveals the exact caption structures that drive the highest engagement. Hook sentences under 8 words, questions in the CTA, and mid-caption line breaks all show significant uplift.",
    source: "Later Blog", readTime: 7, publishedAt: "2026-03-25T14:00:00Z",
    url: "https://later.com", imageColor: "from-blue-600 to-indigo-500",
  },
  {
    id: "4", category: "Content",
    title: "How Top Creators Are Using AI to Batch 30 Days of Content in One Session",
    summary: "Content creators are increasingly turning to AI-assisted workflows to dramatically reduce production time. We break down the exact process used by creators with 100K+ followers to plan, write, and schedule a full month of content.",
    source: "Content Marketing Institute", readTime: 9, publishedAt: "2026-03-25T10:00:00Z",
    url: "https://contentmarketinginstitute.com", imageColor: "from-purple-600 to-violet-500",
  },
  {
    id: "5", category: "Tech",
    title: "Meta Launches AI-Powered Hashtag Recommendation Engine",
    summary: "Instagram's new AI hashtag tool analyses your content, audience demographics, and current trending topics to suggest the optimal hashtag mix for each post — claiming up to 40% improvement in discoverability.",
    source: "TechCrunch", readTime: 3, publishedAt: "2026-03-25T08:15:00Z",
    url: "https://techcrunch.com", imageColor: "from-cyan-600 to-teal-500",
  },
  {
    id: "6", category: "Social Media",
    title: "The Best Times to Post on Instagram in 2026 (Data-Backed)",
    summary: "Analysing over 2 million Instagram posts, Sprout Social's latest report identifies Tuesday 7–9am and Friday 11am–1pm as peak engagement windows across most niches. However, audience timezone data still matters most.",
    source: "Sprout Social", readTime: 5, publishedAt: "2026-03-24T16:00:00Z",
    url: "https://sproutsocial.com", imageColor: "from-emerald-600 to-green-500",
  },
  {
    id: "7", category: "Trends",
    title: "Aesthetic Minimalism Is Out — Raw Authenticity Drives Engagement in 2026",
    summary: "Consumer sentiment has shifted dramatically toward unpolished, behind-the-scenes content. Brands showing 'real' moments — mistakes, process, candid team shots — are seeing engagement rates 2-4x higher than heavily produced content.",
    source: "Adweek", readTime: 6, publishedAt: "2026-03-24T11:30:00Z",
    url: "https://adweek.com", imageColor: "from-rose-600 to-pink-500",
  },
  {
    id: "8", category: "Marketing",
    title: "Micro-Influencers vs Macro: The ROI Gap Is Widening",
    summary: "Brands are reallocating influencer budgets toward micro-creators (10K–100K followers), citing 6x better ROI compared to macro-influencer campaigns. Engagement rates and audience trust are cited as the primary drivers.",
    source: "Marketing Week", readTime: 8, publishedAt: "2026-03-23T13:00:00Z",
    url: "https://marketingweek.com", imageColor: "from-blue-500 to-sky-400",
  },
  {
    id: "9", category: "Content",
    title: "Carousel Posts Are Making a Comeback — Here's Why",
    summary: "After a year of Reels dominance, carousel engagement is surging. Instagram's algorithm has updated to surface high-save carousels to explore pages, and creators are seeing 3–5x more reach on educational carousel formats.",
    source: "Buffer Blog", readTime: 5, publishedAt: "2026-03-23T09:00:00Z",
    url: "https://buffer.com", imageColor: "from-violet-600 to-purple-500",
  },
  {
    id: "10", category: "Tech",
    title: "Instagram Testing 'Collab Stories' for Joint Creator Content",
    summary: "Screenshots circulating from beta testers show a new 'Collab Story' feature allowing two accounts to co-author a single Story visible to both audiences. The feature is expected to roll out globally in Q2 2026.",
    source: "The Verge", readTime: 3, publishedAt: "2026-03-22T15:30:00Z",
    url: "https://theverge.com", imageColor: "from-teal-600 to-cyan-500",
  },
  {
    id: "11", category: "Social Media",
    title: "How to Write a Bio That Converts Profile Visits to Followers",
    summary: "Your Instagram bio has 3 seconds to make an impression. New research identifies five bio elements that consistently drive follow rates: clear niche statement, social proof number, CTA with emoji, link-in-bio hint, and personality word.",
    source: "Planoly", readTime: 4, publishedAt: "2026-03-22T10:00:00Z",
    url: "https://planoly.com", imageColor: "from-fuchsia-600 to-pink-500",
  },
  {
    id: "12", category: "Trends",
    title: "Voice Notes in DMs Are Changing How Creators Engage with Audiences",
    summary: "A growing number of creators are using Instagram's voice note DM feature to personally respond to followers — a practice that's driving loyalty scores and super-fan conversion rates significantly higher than text-based engagement.",
    source: "Creator Economy Report", readTime: 7, publishedAt: "2026-03-21T12:00:00Z",
    url: "https://creatoreconomy.so", imageColor: "from-amber-600 to-yellow-500",
  },
];

function timeAgo(isoStr: string) {
  const diff = Date.now() - new Date(isoStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ─── Post idea dialog ─────────────────────────────────────────────────────────
function PostIdeaDialog({
  article,
  open,
  onClose,
}: {
  article: NewsArticle | null;
  open: boolean;
  onClose: () => void;
}) {
  const [caption, setCaption] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Pre-fill caption from article
  const suggested = article
    ? `💡 Hot take on: "${article.title}"\n\n[Add your perspective here...]\n\nWhat do you think? Drop your thoughts below 👇`
    : "";

  async function handleSave() {
    if (!caption.trim()) return;
    setSaving(true);
    try {
      await createPost({
        caption,
        hashtags: "#contentstrategy #socialmediatips #instagramgrowth",
        postType: "carousel",
        status: "backlog",
      });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setCaption("");
        onClose();
      }, 1500);
    } catch {
      alert("Failed to save post idea");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-amber-500 to-orange-400">
              <Lightbulb className="h-3.5 w-3.5 text-white" />
            </div>
            Turn Into Post Idea
          </DialogTitle>
          <DialogDescription>
            {article?.title}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Label>Caption</Label>
          <Textarea
            className="min-h-32 resize-none text-sm"
            placeholder="Write your take on this article..."
            value={caption || suggested}
            onChange={(e) => setCaption(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            This will be saved to your Instagram Manager as a backlog idea.
          </p>
        </div>
        <DialogFooter className="gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={saving || saved}
            className="bg-gradient-to-r from-amber-500 to-orange-400 text-white hover:opacity-90"
          >
            {saved ? "✓ Saved to Backlog!" : saving ? "Saving..." : "Save to Backlog"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Article card ─────────────────────────────────────────────────────────────
function ArticleCard({
  article,
  bookmarked,
  onBookmark,
  onPostIdea,
}: {
  article: NewsArticle;
  bookmarked: boolean;
  onBookmark: (id: string) => void;
  onPostIdea: (article: NewsArticle) => void;
}) {
  return (
    <Card className="group flex flex-col gap-0 overflow-hidden transition-all hover:shadow-lg hover:shadow-black/20 hover:border-border/60">
      {/* Top accent */}
      <div className={cn("h-0.5 w-full bg-gradient-to-r", article.imageColor)} />

      <CardHeader className="flex flex-row items-start justify-between gap-3 px-4 pt-4 pb-2">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn("shrink-0 text-[10px] px-1.5 py-0", CATEGORY_COLORS[article.category])}
            >
              {article.category}
            </Badge>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" /> {article.readTime} min read
            </span>
          </div>
          <h3 className="text-sm font-semibold leading-snug line-clamp-2 text-foreground">
            {article.title}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7 shrink-0 transition-colors",
            bookmarked ? "text-amber-400" : "text-muted-foreground opacity-0 group-hover:opacity-100"
          )}
          onClick={() => onBookmark(article.id)}
        >
          {bookmarked
            ? <BookmarkCheck className="h-3.5 w-3.5" />
            : <Bookmark className="h-3.5 w-3.5" />
          }
        </Button>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 px-4 pb-4">
        <p className="text-xs leading-relaxed text-muted-foreground line-clamp-3">
          {article.summary}
        </p>

        <div className="mt-auto flex items-center justify-between pt-2 border-t border-border">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-foreground/70">{article.source}</span>
            <span className="text-[10px] text-muted-foreground">{timeAgo(article.publishedAt)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
              onClick={() => onPostIdea(article)}
            >
              <Lightbulb className="h-3 w-3" />
              Post idea
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => window.open(article.url, "_blank")}
            >
              <ExternalLink className="h-3 w-3" />
              Read
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [search, setSearch] = useState("");
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [postIdeaArticle, setPostIdeaArticle] = useState<NewsArticle | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function toggleBookmark(id: string) {
    setBookmarks((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const filtered = useMemo(() => {
    return ALL_ARTICLES.filter((a) => {
      const matchesCategory = activeCategory === "All" || a.category === activeCategory;
      const matchesSearch =
        !search ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.summary.toLowerCase().includes(search.toLowerCase()) ||
        a.source.toLowerCase().includes(search.toLowerCase());
      const matchesBookmark = !showBookmarked || bookmarks.has(a.id);
      return matchesCategory && matchesSearch && matchesBookmark;
    });
  }, [activeCategory, search, bookmarks, showBookmarked, refreshKey]);

  return (
    <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15">
            <Newspaper className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">News Consolidator</h1>
            <p className="text-sm text-muted-foreground">
              Stay on top of trends — turn articles into post ideas instantly
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className={cn("gap-2", showBookmarked && "border-amber-400/40 text-amber-400")}
            onClick={() => setShowBookmarked((v) => !v)}
          >
            <Bookmark className="h-3.5 w-3.5" />
            Saved {bookmarks.size > 0 && `(${bookmarks.size})`}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setRefreshKey((k) => k + 1)}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Articles Today", value: "12", color: "text-orange-400" },
          { label: "Sources", value: "8", color: "text-blue-400" },
          { label: "Saved", value: bookmarks.size.toString(), color: "text-amber-400" },
          { label: "Post Ideas", value: "∞", color: "text-purple-400" },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1 rounded-xl border border-border bg-card px-5 py-4">
            <span className={cn("text-2xl font-bold tabular-nums", stat.color)}>{stat.value}</span>
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search articles, topics, sources..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
                activeCategory === cat
                  ? CATEGORY_COLORS[cat] + " ring-1 ring-current/30"
                  : "border-border text-muted-foreground hover:border-border/60 hover:text-foreground"
              )}
            >
              <Tag className="h-3 w-3" />
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <Rss className="mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm font-medium">No articles found</p>
          <p className="text-xs text-muted-foreground mt-1">
            {showBookmarked ? "No bookmarked articles yet" : "Try a different search or category"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              bookmarked={bookmarks.has(article.id)}
              onBookmark={toggleBookmark}
              onPostIdea={setPostIdeaArticle}
            />
          ))}
        </div>
      )}

      {/* Post idea dialog */}
      <PostIdeaDialog
        article={postIdeaArticle}
        open={!!postIdeaArticle}
        onClose={() => setPostIdeaArticle(null)}
      />
    </div>
  );
}
