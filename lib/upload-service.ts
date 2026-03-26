import { supabase } from "./supabase";

const BUCKET = "post-images";

// ─── Upload image to Supabase Storage ────────────────────────────────────────
export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

// ─── Delete image from Supabase Storage ──────────────────────────────────────
export async function deleteImage(url: string): Promise<void> {
  // Extract file path from public URL
  const parts = url.split(`/${BUCKET}/`);
  if (parts.length < 2) return;
  const filePath = parts[1];

  await supabase.storage.from(BUCKET).remove([filePath]);
}
