"use client";

import { useState, useEffect } from "react";
import {
  Camera,
  Plus,
  Calendar,
  Clock,
  MoreHorizontal,
  Pencil,
  Trash2,
  MoveRight,
  ImageIcon,
  Film,
  Layers,
  BookOpen,
  Hash,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  type InstagramPost,
  type PostType,
  type PostStatus,
  POST_TYPE_LABELS,
  POST_TYPE_COLORS,
  POST_TYPE_ACCENT,
  STATUS_COLORS,
  INITIAL_POSTS,
} from "@/lib/instagram-types";

// ─── Icons per post type ────────────────────────────────────────────────────
const PostTypeIcon: Record<PostType, React.ElementType> = {
  photo: ImageIcon,
  carousel: Layers,
  reel: Film,
  story: BookOpen,
};

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatDate(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Stat card ──────────────────────────────────────────────────────────────
function StatCard({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-card px-5 py-4">
      <span className={cn("text-2xl font-bold tabular-nums", color)}>
        {count}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

// ─── Post card ──────────────────────────────────────────────────────────────
function PostCard({
  post,
  onDelete,
  onMove,
  onEdit,
}: {
  post: InstagramPost;
  onDelete: (id: string) => void;
  onMove: (id: string, status: PostStatus) => void;
  onEdit: (post: InstagramPost) => void;
}) {
  const Icon = PostTypeIcon[post.postType];
  const accentGradient = POST_TYPE_ACCENT[post.postType];

  const moveTargets: { label: string; status: PostStatus }[] = (
    [
      { label: "Scheduled", status: "scheduled" as PostStatus },
      { label: "Drafts", status: "draft" as PostStatus },
      { label: "Published", status: "published" as PostStatus },
      { label: "Backlog", status: "backlog" as PostStatus },
    ] as { label: string; status: PostStatus }[]
  ).filter((t) => t.status !== post.status);

  return (
    <Card className="group relative flex flex-col gap-0 overflow-hidden border-border bg-card transition-all duration-200 hover:border-border/60 hover:shadow-lg hover:shadow-black/20">
      {/* Colored top accent bar */}
      <div className={cn("h-0.5 w-full bg-gradient-to-r", accentGradient)} />

      <CardHeader className="flex flex-row items-start justify-between gap-3 px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* Post type icon */}
          <div
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
              `bg-gradient-to-br ${accentGradient} opacity-90`
            )}
          >
            <Icon className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 text-[10px] font-medium px-1.5 py-0",
                POST_TYPE_COLORS[post.postType]
              )}
            >
              {POST_TYPE_LABELS[post.postType]}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 text-[10px] font-medium px-1.5 py-0",
                STATUS_COLORS[post.status]
              )}
            >
              {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Actions menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onEdit(post)}>
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Edit post
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <MoveRight className="mr-2 h-3.5 w-3.5" />
                Move to
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {moveTargets.map((t) => (
                  <DropdownMenuItem
                    key={t.status}
                    onClick={() => onMove(post.id, t.status)}
                  >
                    {t.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(post.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 px-4 pb-4">
        {/* Caption */}
        <p className="line-clamp-3 text-sm leading-relaxed text-foreground/90">
          {post.caption}
        </p>

        {/* Hashtags */}
        {post.hashtags && (
          <p className="line-clamp-1 text-xs text-purple-400/70">
            {post.hashtags}
          </p>
        )}

        {/* Date row */}
        <div className="mt-auto flex flex-col gap-1 pt-1">
          {post.scheduledDate && post.status === "scheduled" && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400/80">
              <Clock className="h-3 w-3" />
              <span>Scheduled: {formatDate(post.scheduledDate)}</span>
            </div>
          )}
          {post.publishedDate && post.status === "published" && (
            <div className="flex items-center gap-1.5 text-xs text-sky-400/80">
              <CheckCircle2 className="h-3 w-3" />
              <span>Published: {formatDate(post.publishedDate)}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
            <Calendar className="h-3 w-3" />
            <span>Created {formatDate(post.createdAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
function EmptyState({
  label,
  onAdd,
}: {
  label: string;
  onAdd: () => void;
}) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Camera className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="mb-1 text-sm font-medium text-foreground">
        No {label} posts yet
      </p>
      <p className="mb-4 text-xs text-muted-foreground">
        Create a new post and assign it here.
      </p>
      <Button variant="outline" size="sm" onClick={onAdd}>
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        Add post
      </Button>
    </div>
  );
}

// ─── Add / Edit Dialog ───────────────────────────────────────────────────────
interface PostFormData {
  caption: string;
  hashtags: string;
  postType: PostType;
  status: PostStatus;
  scheduledDate: string;
}

const defaultForm: PostFormData = {
  caption: "",
  hashtags: "",
  postType: "photo",
  status: "draft",
  scheduledDate: "",
};

function PostDialog({
  open,
  initialData,
  onClose,
  onSave,
}: {
  open: boolean;
  initialData: PostFormData | null;
  onClose: () => void;
  onSave: (data: PostFormData) => void;
}) {
  const [form, setForm] = useState<PostFormData>(initialData ?? defaultForm);
  const isEditing = initialData !== null;

  // Sync when dialog re-opens with new initialData
  const handleOpenChange = (o: boolean) => {
    if (!o) onClose();
  };

  // Sync form whenever the dialog opens with new data
  useEffect(() => {
    setForm(initialData ?? defaultForm);
  }, [initialData]);

  function set<K extends keyof PostFormData>(key: K, value: PostFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    if (!form.caption.trim()) return;
    onSave(form);
    setForm(defaultForm);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-purple-600 to-pink-500">
              <Camera className="h-3.5 w-3.5 text-white" />
            </div>
            {isEditing ? "Edit Post" : "New Post Idea"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details for this post."
              : "Add a new post to your content pipeline."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">
          {/* Caption */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="caption">
              Caption <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="caption"
              placeholder="Write your caption here..."
              className="min-h-28 resize-none text-sm"
              value={form.caption}
              onChange={(e) => set("caption", e.target.value)}
            />
          </div>

          {/* Hashtags */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="hashtags" className="flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5 text-muted-foreground" />
              Hashtags
            </Label>
            <Input
              id="hashtags"
              placeholder="#contentcreator #instagram #photography"
              className="text-sm"
              value={form.hashtags}
              onChange={(e) => set("hashtags", e.target.value)}
            />
          </div>

          {/* Post type + Status row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Post Type</Label>
              <Select
                value={form.postType}
                onValueChange={(v) => set("postType", v as PostType)}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="photo">📷 Photo</SelectItem>
                  <SelectItem value="carousel">🎠 Carousel</SelectItem>
                  <SelectItem value="reel">🎬 Reel</SelectItem>
                  <SelectItem value="story">📖 Story</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => set("status", v as PostStatus)}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Scheduled date — only shown when status is "scheduled" */}
          {form.status === "scheduled" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="scheduledDate" className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                Scheduled Date & Time
              </Label>
              <Input
                id="scheduledDate"
                type="datetime-local"
                className="text-sm"
                value={form.scheduledDate}
                onChange={(e) => set("scheduledDate", e.target.value)}
              />
            </div>
          )}

          {/* Published date — only shown when status is "published" */}
          {form.status === "published" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="publishedDate" className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                Published Date & Time
              </Label>
              <Input
                id="publishedDate"
                type="datetime-local"
                className="text-sm"
                value={form.scheduledDate}
                onChange={(e) => set("scheduledDate", e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!form.caption.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-90"
          >
            {isEditing ? "Save Changes" : "Add Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Tab content ─────────────────────────────────────────────────────────────
function PostGrid({
  posts,
  emptyLabel,
  onDelete,
  onMove,
  onEdit,
  onAdd,
}: {
  posts: InstagramPost[];
  emptyLabel: string;
  onDelete: (id: string) => void;
  onMove: (id: string, status: PostStatus) => void;
  onEdit: (post: InstagramPost) => void;
  onAdd: () => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {posts.length === 0 ? (
        <EmptyState label={emptyLabel} onAdd={onAdd} />
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onDelete={onDelete}
            onMove={onMove}
            onEdit={onEdit}
          />
        ))
      )}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function InstagramPage() {
  const [posts, setPosts] = useState<InstagramPost[]>(INITIAL_POSTS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<InstagramPost | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<PostStatus>("draft");

  // Derived lists per status
  const byStatus = (s: PostStatus) => posts.filter((p) => p.status === s);

  function openAddDialog(status: PostStatus = "draft") {
    setDefaultStatus(status);
    setEditingPost(null);
    setDialogOpen(true);
  }

  function openEditDialog(post: InstagramPost) {
    setEditingPost(post);
    setDialogOpen(true);
  }

  function handleSave(data: PostFormData) {
    if (editingPost) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === editingPost.id
            ? {
                ...p,
                caption: data.caption,
                hashtags: data.hashtags,
                postType: data.postType,
                status: data.status,
                scheduledDate:
                  data.status === "scheduled" ? data.scheduledDate : undefined,
                publishedDate:
                  data.status === "published" ? data.scheduledDate : undefined,
              }
            : p
        )
      );
    } else {
      const newPost: InstagramPost = {
        id: uid(),
        caption: data.caption,
        hashtags: data.hashtags,
        postType: data.postType,
        status: data.status,
        scheduledDate:
          data.status === "scheduled" ? data.scheduledDate : undefined,
        publishedDate:
          data.status === "published" ? data.scheduledDate : undefined,
        createdAt: new Date().toISOString(),
      };
      setPosts((prev) => [newPost, ...prev]);
    }
    setDialogOpen(false);
    setEditingPost(null);
  }

  function handleDelete(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  function handleMove(id: string, status: PostStatus) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status,
              scheduledDate: status !== "scheduled" ? undefined : p.scheduledDate,
              publishedDate:
                status === "published"
                  ? new Date().toISOString()
                  : undefined,
            }
          : p
      )
    );
  }

  const formInitialData: PostFormData | null = editingPost
    ? {
        caption: editingPost.caption,
        hashtags: editingPost.hashtags,
        postType: editingPost.postType,
        status: editingPost.status,
        scheduledDate: editingPost.scheduledDate ?? editingPost.publishedDate ?? "",
      }
    : null;

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-500">
            <Camera className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Instagram Manager
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your content pipeline — from idea to published post.
            </p>
          </div>
        </div>
        <Button
          onClick={() => openAddDialog("draft")}
          className="bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-90"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Scheduled"
          count={byStatus("scheduled").length}
          color="text-emerald-400"
        />
        <StatCard
          label="Drafts"
          count={byStatus("draft").length}
          color="text-zinc-300"
        />
        <StatCard
          label="Published"
          count={byStatus("published").length}
          color="text-sky-400"
        />
        <StatCard
          label="Backlog"
          count={byStatus("backlog").length}
          color="text-orange-400"
        />
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="scheduled" className="flex flex-col gap-4">
        <TabsList className="w-fit">
          <TabsTrigger value="scheduled" className="gap-2">
            Scheduled
            {byStatus("scheduled").length > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500/20 px-1 text-[10px] font-medium text-emerald-400">
                {byStatus("scheduled").length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="draft" className="gap-2">
            Drafts
            {byStatus("draft").length > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-500/20 px-1 text-[10px] font-medium text-zinc-400">
                {byStatus("draft").length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="published" className="gap-2">
            Published
            {byStatus("published").length > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-500/20 px-1 text-[10px] font-medium text-sky-400">
                {byStatus("published").length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="backlog" className="gap-2">
            Backlog
            {byStatus("backlog").length > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500/20 px-1 text-[10px] font-medium text-orange-400">
                {byStatus("backlog").length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scheduled" className="mt-0">
          <PostGrid
            posts={byStatus("scheduled")}
            emptyLabel="scheduled"
            onDelete={handleDelete}
            onMove={handleMove}
            onEdit={openEditDialog}
            onAdd={() => openAddDialog("scheduled")}
          />
        </TabsContent>

        <TabsContent value="draft" className="mt-0">
          <PostGrid
            posts={byStatus("draft")}
            emptyLabel="draft"
            onDelete={handleDelete}
            onMove={handleMove}
            onEdit={openEditDialog}
            onAdd={() => openAddDialog("draft")}
          />
        </TabsContent>

        <TabsContent value="published" className="mt-0">
          <PostGrid
            posts={byStatus("published")}
            emptyLabel="published"
            onDelete={handleDelete}
            onMove={handleMove}
            onEdit={openEditDialog}
            onAdd={() => openAddDialog("published")}
          />
        </TabsContent>

        <TabsContent value="backlog" className="mt-0">
          <PostGrid
            posts={byStatus("backlog")}
            emptyLabel="backlog"
            onDelete={handleDelete}
            onMove={handleMove}
            onEdit={openEditDialog}
            onAdd={() => openAddDialog("backlog")}
          />
        </TabsContent>
      </Tabs>

      {/* ── Add / Edit dialog ── */}
      <PostDialog
        open={dialogOpen}
        initialData={
          editingPost
            ? formInitialData
            : { ...defaultForm, status: defaultStatus }
        }
        onClose={() => {
          setDialogOpen(false);
          setEditingPost(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
