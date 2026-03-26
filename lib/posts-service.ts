import { supabase } from "./supabase";
import { type InstagramPost, type PostStatus } from "./instagram-types";

// ─── Type that matches our Supabase table columns ───────────────────────────
interface PostRow {
  id: string;
  created_at: string;
  caption: string;
  hashtags: string;
  post_type: string;
  status: string;
  scheduled_date: string | null;
  published_date: string | null;
  image_url: string | null;
}

// ─── Map DB row → app type ───────────────────────────────────────────────────
function rowToPost(row: PostRow): InstagramPost {
  return {
    id: row.id,
    caption: row.caption,
    hashtags: row.hashtags ?? "",
    postType: row.post_type as InstagramPost["postType"],
    status: row.status as PostStatus,
    scheduledDate: row.scheduled_date ?? undefined,
    publishedDate: row.published_date ?? undefined,
    createdAt: row.created_at,
    imageUrl: row.image_url ?? undefined,
  };
}

// ─── Fetch all posts ─────────────────────────────────────────────────────────
export async function fetchPosts(): Promise<InstagramPost[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as PostRow[]).map(rowToPost);
}

// ─── Create a new post ───────────────────────────────────────────────────────
export async function createPost(
  post: Omit<InstagramPost, "id" | "createdAt">
): Promise<InstagramPost> {
  const { data, error } = await supabase
    .from("posts")
    .insert({
      caption: post.caption,
      hashtags: post.hashtags,
      post_type: post.postType,
      status: post.status,
      scheduled_date: post.scheduledDate ?? null,
      published_date: post.publishedDate ?? null,
      image_url: post.imageUrl ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return rowToPost(data as PostRow);
}

// ─── Update an existing post ─────────────────────────────────────────────────
export async function updatePost(
  id: string,
  updates: Partial<Omit<InstagramPost, "id" | "createdAt">>
): Promise<InstagramPost> {
  const { data, error } = await supabase
    .from("posts")
    .update({
      ...(updates.caption !== undefined && { caption: updates.caption }),
      ...(updates.hashtags !== undefined && { hashtags: updates.hashtags }),
      ...(updates.postType !== undefined && { post_type: updates.postType }),
      ...(updates.status !== undefined && { status: updates.status }),
      ...(updates.scheduledDate !== undefined && { scheduled_date: updates.scheduledDate ?? null }),
      ...(updates.publishedDate !== undefined && { published_date: updates.publishedDate ?? null }),
      ...(updates.imageUrl !== undefined && { image_url: updates.imageUrl ?? null }),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return rowToPost(data as PostRow);
}

// ─── Delete a post ───────────────────────────────────────────────────────────
export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw error;
}

// ─── Move a post to a new status ─────────────────────────────────────────────
export async function movePost(
  id: string,
  status: PostStatus
): Promise<InstagramPost> {
  return updatePost(id, {
    status,
    publishedDate:
      status === "published" ? new Date().toISOString() : undefined,
  });
}
