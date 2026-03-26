/**
 * GET /api/instagram/callback
 * ----------------------------
 * Facebook redirects here after the user authorises the app.
 * 1. Verify state (CSRF check)
 * 2. Exchange code → short-lived token
 * 3. Exchange → 60-day long-lived token
 * 4. Find the connected Instagram Business account
 * 5. Fetch & store the profile in Supabase
 * 6. Redirect to /settings with a success flash
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers";
import {
  exchangeCodeForToken,
  getLongLivedToken,
  findIGUserIdFromPages,
  getIGProfile,
} from "@/lib/instagram-api";
import { upsertConnection } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { searchParams } = req.nextUrl;
  const code  = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // User denied permission
  if (error) {
    return NextResponse.redirect(
      new URL("/settings?ig=denied", req.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/settings?ig=error&msg=missing_params", req.url)
    );
  }

  // CSRF check
  const cookieStore = await cookies();
  const savedState = cookieStore.get("ig_oauth_state")?.value;
  cookieStore.delete("ig_oauth_state");

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(
      new URL("/settings?ig=error&msg=state_mismatch", req.url)
    );
  }

  try {
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/instagram/callback`;

    // Step 1 — short-lived user token
    const { access_token: shortToken } = await exchangeCodeForToken(code, redirectUri);

    // Step 2 — long-lived token (60 days)
    const { access_token: longToken, expires_in } = await getLongLivedToken(shortToken);
    const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

    // Step 3 — find Instagram Business account
    const igUserId = await findIGUserIdFromPages(longToken);
    if (!igUserId) {
      return NextResponse.redirect(
        new URL("/settings?ig=error&msg=no_ig_account", req.url)
      );
    }

    // Step 4 — fetch profile
    const profile = await getIGProfile(igUserId, longToken);

    // Step 5 — persist in Supabase
    await upsertConnection(session.user.email, {
      ig_user_id:          igUserId,
      username:            profile.username ?? null,
      access_token:        longToken,
      token_expires_at:    expiresAt,
      profile_picture_url: profile.profile_picture_url ?? null,
      followers_count:     profile.followers_count ?? 0,
      media_count:         profile.media_count ?? 0,
      biography:           profile.biography ?? null,
      website:             profile.website ?? null,
    });

    return NextResponse.redirect(new URL("/settings?ig=connected", req.url));
  } catch (err) {
    console.error("[IG callback error]", err);
    const msg = encodeURIComponent(
      err instanceof Error ? err.message : "unknown"
    );
    return NextResponse.redirect(
      new URL(`/settings?ig=error&msg=${msg}`, req.url)
    );
  }
}
