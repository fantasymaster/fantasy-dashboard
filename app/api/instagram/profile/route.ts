/**
 * GET /api/instagram/profile
 * ---------------------------
 * Returns the stored Instagram connection data.
 * Refreshes the profile metrics from the Graph API on each call.
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getConnection, upsertConnection } from "@/lib/supabase-server";
import { getIGProfile } from "@/lib/instagram-api";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conn = await getConnection(session.user.email);
  if (!conn) {
    return NextResponse.json({ connected: false });
  }

  try {
    // Refresh live profile metrics
    const profile = await getIGProfile(conn.ig_user_id, conn.access_token);

    // Persist updated metrics
    await upsertConnection(session.user.email, {
      ig_user_id:          conn.ig_user_id,
      username:            profile.username ?? conn.username,
      access_token:        conn.access_token,
      token_expires_at:    conn.token_expires_at,
      profile_picture_url: profile.profile_picture_url ?? conn.profile_picture_url,
      followers_count:     profile.followers_count ?? conn.followers_count,
      media_count:         profile.media_count ?? conn.media_count,
      biography:           profile.biography ?? conn.biography,
      website:             profile.website ?? conn.website,
    });

    return NextResponse.json({
      connected: true,
      profile: {
        ...profile,
        profile_picture_url: profile.profile_picture_url ?? conn.profile_picture_url,
      },
    });
  } catch (err) {
    // Return stored data even if live refresh fails
    console.warn("[IG profile refresh error]", err);
    return NextResponse.json({
      connected: true,
      profile: {
        id:                  conn.ig_user_id,
        username:            conn.username,
        followers_count:     conn.followers_count,
        media_count:         conn.media_count,
        biography:           conn.biography,
        website:             conn.website,
        profile_picture_url: conn.profile_picture_url,
      },
    });
  }
}
