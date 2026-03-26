/**
 * Server-side Supabase client
 * ----------------------------
 * Uses the service-role key so it bypasses Row Level Security.
 * Only import this in server components / API routes — never in client code.
 */
import { createClient } from "@supabase/supabase-js";

export function getSupabaseServer() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

/* ─── instagram_connections helpers ───────────────────────────── */

export interface IGConnection {
  id: string;
  user_email: string;
  ig_user_id: string;
  username: string | null;
  access_token: string;
  token_expires_at: string | null;
  profile_picture_url: string | null;
  followers_count: number;
  media_count: number;
  biography: string | null;
  website: string | null;
  updated_at: string;
}

export async function getConnection(
  userEmail: string
): Promise<IGConnection | null> {
  const db = getSupabaseServer();
  const { data } = await db
    .from("instagram_connections")
    .select("*")
    .eq("user_email", userEmail)
    .single();
  return data ?? null;
}

export async function upsertConnection(
  userEmail: string,
  payload: Omit<IGConnection, "id" | "user_email" | "updated_at">
) {
  const db = getSupabaseServer();
  const { error } = await db
    .from("instagram_connections")
    .upsert(
      { user_email: userEmail, ...payload, updated_at: new Date().toISOString() },
      { onConflict: "user_email" }
    );
  if (error) throw error;
}

export async function deleteConnection(userEmail: string) {
  const db = getSupabaseServer();
  const { error } = await db
    .from("instagram_connections")
    .delete()
    .eq("user_email", userEmail);
  if (error) throw error;
}
