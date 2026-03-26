"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Camera, Plus, Calendar, Clock, MoreHorizontal, Pencil, Trash2,
  MoveRight, ImageIcon, Film, Layers, BookOpen, Hash, CheckCircle2,
  Loader2, RefreshCw, Upload, X, Image,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent,
  DropdownMenuSubTrigger, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  type InstagramPost, type PostType, type PostStatus,
  POST_TYPE_LABELS, POST_TYPE_COLORS, POST_TYPE_ACCENT, STATUS_COLORS,
} from "@/lib/instagram-types";
import { fetchPosts, createPost, updatePost, deletePost, movePost } from "@/lib/posts-service";
import { uploadImage } from "@/lib/upload-service";

// ─── Icons per post type ─────────────────────────────────────────────────────
const PostTypeIcon: Record<PostType, React.ElementType> = {
  photo: ImageIcon, carousel: Layers, reel: Film, story: BookOpen,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Image Upload Zone ────────────────────────────────────────────────────────
function ImageUploadZone({
  value, uploading, onUpload, onRemove,
}: {
  value: string;
  uploading: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) onUpload(file);
  }

  if (value) {
    return (
      <div className="relative rounded-lg overflow-hidden border border-border">
        <img src={value} alt="Post preview" className="w-full h-44 object-cover" />
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
      className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/20 h-32 cursor-pointer transition-colors hover:border-primary/40 hover:bg-primary/5"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }}
      />
      {uploading ? (
        <>
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Uploading...</p>
        </>
      ) : (
        <>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
            <Upload className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            <span className="font-medium text-foreground">Click to upload</span> or drag & drop
          </p>
          <p className="text-[10px] text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
        </>
      )}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, count, color, loading }: {
  label: string; count: number; color: string; loading: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-card px-5 py-4">
      <span className={cn("text-2xl font-bold tabular-nums", color)}>
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : count}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

// ─── Post card ────────────────────────────────────────────────────────────────
function PostCard({ post, onDelete, onMove, onEdit }: {
  post: InstagramPost;
  onDelete: (id: string) => void;
  onMove: (id: string, status: PostStatus) => void;
  onEdit: (post: InstagramPost) => void;
}) {
  const Icon = PostTypeIcon[post.postType];
  const accentGradient = POST_TYPE_ACCENT[post.postType];
  const moveTargets = (["scheduled", "draft", "published", "backlog"] as PostStatus[])
    .filter((s) => s !== post.status)
    .map((s) => ({ label: s.charAt(0).toUpperCase() + s.slice(1), status: s }));

  return (
    <Card className="group relative flex flex-col gap-0 overflow-hidden border-border bg-card transition-all hover:border-border/60 hover:shadow-lg hover:shadow-black/20">
      <div className={cn("h-0.5 w-full bg-gradient-to-r", accentGradient)} />

      {post.imageUrl && (
        <div className="relative h-40 w-full overflow-hidden">
          <img src={post.imageUrl} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}

      <CardHeader className="flex flex-row items-start justify-between gap-3 px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br opacity-90", accentGradient)}>
            <Icon className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <Badge variant="outline" className={cn("shrink-0 text-[10px] font-medium px-1.5 py-0", POST_TYPE_COLORS[post.postType])}>
              {POST_TYPE_LABELS[post.postType]}
            </Badge>
            <Badge variant="outline" className={cn("shrink-0 text-[10px] font-medium px-1.5 py-0", STATUS_COLORS[post.status])}>
              {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
            </Badge>
            {post.imageUrl && (
              <Badge variant="outline" className="shrink-0 text-[10px] font-medium px-1.5 py-0 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                <Image className="mr-1 h-2.5 w-2.5" />Image
              </Badge>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:bg-accent hover:text-foreground">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onEdit(post)}>
              <Pencil className="mr-2 h-3.5 w-3.5" />Edit post
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <MoveRight className="mr-2 h-3.5 w-3.5" />Move to
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {moveTargets.map((t) => (
                  <DropdownMenuItem key={t.status} onClick={() => onMove(post.id, t.status)}>
                    {t.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(post.id)} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-3.5 w-3.5" />Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 px-4 pb-4">
        <p className="line-clamp-3 text-sm leading-relaxed text-foreground/90">{post.caption}</p>
        {post.hashtags && <p className="line-clamp-1 text-xs text-purple-400/70">{post.hashtags}</p>}
        <div className="mt-auto flex flex-col gap-1 pt-1">
          {post.scheduledDate && post.status === "scheduled" && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400/80">
              <Clock className="h-3 w-3" /><span>Scheduled: {formatDate(post.scheduledDate)}</span>
            </div>
          )}
          {post.publishedDate && post.status === "published" && (
            <div className="flex items-center gap-1.5 text-xs text-sky-400/80">
              <CheckCircle2 className="h-3 w-3" /><span>Published: {formatDate(post.publishedDate)}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
            <Calendar className="h-3 w-3" /><span>Created {formatDate(post.createdAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Camera className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="mb-1 text-sm font-medium">No {label} posts yet</p>
      <p className="mb-4 text-xs text-muted-foreground">Create a new post and assign it here.</p>
      <Button variant="outline" size="sm" onClick={onAdd}>
        <Plus className="mr-1.5 h-3.5 w-3.5" />Add post
      </Button>
    </div>
  );
}

// ─── Add / Edit Dialog ────────────────────────────────────────────────────────
interface PostFormData {
  caption: string; hashtags: string; postType: PostType;
  status: PostStatus; scheduledDate: string; imageUrl: string;
}

const defaultForm: PostFormData = {
  caption: "", hashtags: "", postType: "photo",
  status: "draft", scheduledDate: "", imageUrl: "",
};

function PostDialog({ open, initialData, onClose, onSave, saving }: {
  open: boolean; initialData: PostFormData | null;
  onClose: () => void; onSave: (data: PostFormData) => void; saving: boolean;
}) {
  const [form, setForm] = useState<PostFormData>(initialData ?? defaultForm);
  const [uploading, setUploading] = useState(false);
  const isEditing = initialData !== null;

  useEffect(() => { setForm(initialData ?? defaultForm); }, [initialData]);

  function set<K extends keyof PostFormData>(key: K, value: PostFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    try {
      const url = await uploadImage(file);
      set("imageUrl", url);
    } catch {
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-purple-600 to-pink-500">
              <Camera className="h-3.5 w-3.5 text-white" />
            </div>
            {isEditing ? "Edit Post" : "New Post Idea"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details for this post." : "Add a new post to your content pipeline."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">
          <div className="flex flex-col gap-1.5">
            <Label className="flex items-center gap-1.5">
              <Upload className="h-3.5 w-3.5 text-muted-foreground" />Cover Image
            </Label>
            <ImageUploadZone
              value={form.imageUrl}
              uploading={uploading}
              onUpload={handleImageUpload}
              onRemove={() => set("imageUrl", "")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="caption">Caption <span className="text-destructive">*</span></Label>
            <Textarea id="caption" placeholder="Write your caption here..."
              className="min-h-28 resize-none text-sm" value={form.caption}
              onChange={(e) => set("caption", e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="hashtags" className="flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5 text-muted-foreground" />Hashtags
            </Label>
            <Input id="hashtags" placeholder="#contentcreator #instagram" className="text-sm"
              value={form.hashtags} onChange={(e) => set("hashtags", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Post Type</Label>
              <Select value={form.postType} onValueChange={(v) => set("postType", v as PostType)}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
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
              <Select value={form.status} onValueChange={(v) => set("status", v as PostStatus)}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {form.status === "scheduled" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="scheduledDate" className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />Scheduled Date & Time
              </Label>
              <Input id="scheduledDate" type="datetime-local" className="text-sm"
                value={form.scheduledDate} onChange={(e) => set("scheduledDate", e.target.value)} />
            </div>
          )}

          {form.status === "published" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="publishedDate" className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />Published Date & Time
              </Label>
              <Input id="publishedDate" type="datetime-local" className="text-sm"
                value={form.scheduledDate} onChange={(e) => set("scheduledDate", e.target.value)} />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={saving || uploading}>Cancel</Button>
          <Button
            onClick={() => form.caption.trim() && onSave(form)}
            disabled={!form.caption.trim() || saving || uploading}
            className="bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-90"
          >
            {saving
              ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Saving...</>
              : isEditing ? "Save Changes" : "Add Post"
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Post grid ────────────────────────────────────────────────────────────────
function PostGrid({ posts, emptyLabel, onDelete, onMove, onEdit, onAdd, loading, error, onRetry }: {
  posts: InstagramPost[]; emptyLabel: string;
  onDelete: (id: string) => void; onMove: (id: string, status: PostStatus) => void;
  onEdit: (post: InstagramPost) => void; onAdd: () => void;
  loading: boolean; error: string | null; onRetry: () => void;
}) {
  if (loading) return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Loading posts...</p>
    </div>
  );
  if (error) return (
    <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-destructive/40 py-16 text-center gap-3">
      <p className="text-sm font-medium text-destructive">Failed to load posts</p>
      <p className="text-xs text-muted-foreground max-w-xs">{error}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="mr-1.5 h-3.5 w-3.5" />Retry
      </Button>
    </div>
  );
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {posts.length === 0
        ? <EmptyState label={emptyLabel} onAdd={onAdd} />
        : posts.map((post) => (
            <PostCard key={post.id} post={post} onDelete={onDelete} onMove={onMove} onEdit={onEdit} />
          ))
      }
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function InstagramPage() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<InstagramPost | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<PostStatus>("draft");

  const loadPosts = useCallback(async () => {
    setLoading(true); setError(null);
    try { setPosts(await fetchPosts()); }
    catch (err) { setError(err instanceof Error ? err.message : "Unknown error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const byStatus = (s: PostStatus) => posts.filter((p) => p.status === s);

  async function handleSave(data: PostFormData) {
    setSaving(true);
    try {
      if (editingPost) {
        const updated = await updatePost(editingPost.id, {
          caption: data.caption, hashtags: data.hashtags,
          postType: data.postType, status: data.status,
          imageUrl: data.imageUrl || undefined,
          scheduledDate: data.status === "scheduled" ? data.scheduledDate : undefined,
          publishedDate: data.status === "published" ? data.scheduledDate : undefined,
        });
        setPosts((prev) => prev.map((p) => p.id === editingPost.id ? updated : p));
      } else {
        const newPost = await createPost({
          caption: data.caption, hashtags: data.hashtags,
          postType: data.postType, status: data.status,
          imageUrl: data.imageUrl || undefined,
          scheduledDate: data.status === "scheduled" ? data.scheduledDate : undefined,
          publishedDate: data.status === "published" ? data.scheduledDate : undefined,
        });
        setPosts((prev) => [newPost, ...prev]);
      }
      setDialogOpen(false); setEditingPost(null);
    } catch (err) {
      alert("Failed to save: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try { await deletePost(id); setPosts((prev) => prev.filter((p) => p.id !== id)); }
    catch (err) { alert("Failed to delete: " + (err instanceof Error ? err.message : "Unknown error")); }
  }

  async function handleMove(id: string, status: PostStatus) {
    try {
      const updated = await movePost(id, status);
      setPosts((prev) => prev.map((p) => p.id === id ? updated : p));
    } catch (err) { alert("Failed to move: " + (err instanceof Error ? err.message : "Unknown error")); }
  }

  const formInitialData: PostFormData | null = editingPost ? {
    caption: editingPost.caption, hashtags: editingPost.hashtags,
    postType: editingPost.postType, status: editingPost.status,
    scheduledDate: editingPost.scheduledDate ?? editingPost.publishedDate ?? "",
    imageUrl: editingPost.imageUrl ?? "",
  } : null;

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-500">
            <Camera className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Instagram Manager</h1>
            <p className="text-sm text-muted-foreground">Manage your content pipeline — from idea to published post.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadPosts} disabled={loading}>
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          </Button>
          <Button onClick={() => { setDefaultStatus("draft"); setEditingPost(null); setDialogOpen(true); }}
            className="bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-90">
            <Plus className="mr-2 h-4 w-4" />New Post
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Scheduled" count={byStatus("scheduled").length} color="text-emerald-400" loading={loading} />
        <StatCard label="Drafts" count={byStatus("draft").length} color="text-zinc-300" loading={loading} />
        <StatCard label="Published" count={byStatus("published").length} color="text-sky-400" loading={loading} />
        <StatCard label="Backlog" count={byStatus("backlog").length} color="text-orange-400" loading={loading} />
      </div>

      <Tabs defaultValue="scheduled" className="flex flex-col gap-4">
        <TabsList className="w-fit">
          {(["scheduled", "draft", "published", "backlog"] as PostStatus[]).map((s) => (
            <TabsTrigger key={s} value={s} className="gap-2">
              {s.charAt(0).toUpperCase() + s.slice(1)}
              {byStatus(s).length > 0 && (
                <span className={cn(
                  "flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium",
                  s === "scheduled" ? "bg-emerald-500/20 text-emerald-400" :
                  s === "draft" ? "bg-zinc-500/20 text-zinc-400" :
                  s === "published" ? "bg-sky-500/20 text-sky-400" :
                  "bg-orange-500/20 text-orange-400"
                )}>
                  {byStatus(s).length}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {(["scheduled", "draft", "published", "backlog"] as PostStatus[]).map((s) => (
          <TabsContent key={s} value={s} className="mt-0">
            <PostGrid
              posts={byStatus(s)} emptyLabel={s}
              onDelete={handleDelete} onMove={handleMove}
              onEdit={(post) => { setEditingPost(post); setDialogOpen(true); }}
              onAdd={() => { setDefaultStatus(s as PostStatus); setEditingPost(null); setDialogOpen(true); }}
              loading={loading} error={error} onRetry={loadPosts}
            />
          </TabsContent>
        ))}
      </Tabs>

      <PostDialog
        open={dialogOpen}
        initialData={editingPost ? formInitialData : { ...defaultForm, status: defaultStatus }}
        onClose={() => { setDialogOpen(false); setEditingPost(null); }}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}
