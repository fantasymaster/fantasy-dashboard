/**
 * GET /api/instagram/connect
 * --------------------------
 * Initiates the Facebook / Instagram OAuth flow.
 * Generates a random CSRF state token, stores it in a cookie,
 * then redirects the user to the Facebook Login dialog.
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers";
import crypto from "crypto";

const SCOPES = [
  "instagram_basic",
  "instagram_manage_insights",
  "pages_show_list",
  "pages_read_engagement",
].join(",");

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Generate a random state value to prevent CSRF
  const state = crypto.randomBytes(16).toString("hex");

  // Store state in a short-lived cookie
  const cookieStore = await cookies();
  cookieStore.set("ig_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });

  const redirectUri = `${process.env.NEXTAUTH_URL}/api/instagram/callback`;

  const oauthUrl = new URL("https://www.facebook.com/v19.0/dialog/oauth");
  oauthUrl.searchParams.set("client_id", process.env.INSTAGRAM_APP_ID!);
  oauthUrl.searchParams.set("redirect_uri", redirectUri);
  oauthUrl.searchParams.set("scope", SCOPES);
  oauthUrl.searchParams.set("response_type", "code");
  oauthUrl.searchParams.set("state", state);

  return NextResponse.redirect(oauthUrl.toString());
}
