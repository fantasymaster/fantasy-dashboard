/**
 * GET /api/instagram/media?limit=24
 * -----------------------------------
 * Fetches recent media from the connected Instagram account.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getConnection } from "@/lib/supabase-server";
import { getIGMedia } from "@/lib/instagram-api";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conn = await getConnection(session.user.email);
  if (!conn) {
    return NextResponse.json({ connected: false, media: [] });
  }

  const limit = Number(req.nextUrl.searchParams.get("limit") ?? "24");

  try {
    const media = await getIGMedia(conn.ig_user_id, conn.access_token, limit);
    return NextResponse.json({ connected: true, media });
  } catch (err) {
    console.error("[IG media error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch media" },
      { status: 500 }
    );
  }
}
