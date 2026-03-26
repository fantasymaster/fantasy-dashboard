/**
 * Instagram Graph API helpers
 * ----------------------------
 * All calls use the Facebook Graph API v19.0 endpoint which gives access
 * to Instagram Business / Creator account data.
 *
 * Permissions used:
 *   instagram_basic           — profile, media list
 *   instagram_manage_insights — account + post-level insights
 *   pages_show_list           — list the user's Facebook Pages
 *   pages_read_engagement     — read page-level data
 */

const FB = "https://graph.facebook.com/v19.0";

/* ─── Types ────────────────────────────────────────────────────── */

export interface IGProfile {
  id: string;
  username: string;
  name?: string;
  biography?: string;
  followers_count: number;
  follows_count?: number;
  media_count: number;
  profile_picture_url?: string;
  website?: string;
}

export interface IGMedia {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
  permalink: string;
}

export interface IGDailyInsight {
  end_time: string;
  value: number;
}

export interface IGAccountInsights {
  impressions: number;
  reach: number;
  profile_views: number;
  follower_series: IGDailyInsight[]; // daily follower_count
}

/* ─── Token exchange ───────────────────────────────────────────── */

/** Step 1 — Exchange the OAuth code for a short-lived user token */
export async function exchangeCodeForToken(code: string, redirectUri: string) {
  const url = new URL(`${FB}/oauth/access_token`);
  url.searchParams.set("client_id", process.env.INSTAGRAM_APP_ID!);
  url.searchParams.set("client_secret", process.env.INSTAGRAM_APP_SECRET!);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("code", code);

  const res = await fetch(url.toString());
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data as { access_token: string; token_type: string };
}

/** Step 2 — Swap short-lived token for a 60-day long-lived token */
export async function getLongLivedToken(shortToken: string) {
  const url = new URL(`${FB}/oauth/access_token`);
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", process.env.INSTAGRAM_APP_ID!);
  url.searchParams.set("client_secret", process.env.INSTAGRAM_APP_SECRET!);
  url.searchParams.set("fb_exchange_token", shortToken);

  const res = await fetch(url.toString());
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data as { access_token: string; token_type: string; expires_in: number };
}

/** Refresh a long-lived token before it expires */
export async function refreshLongLivedToken(token: string) {
  const url = new URL(`${FB}/refresh_access_token`);
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", token);

  const res = await fetch(url.toString());
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data as { access_token: string; expires_in: number };
}

/* ─── Account discovery ────────────────────────────────────────── */

/**
 * Walk the user's Facebook Pages and return the first connected
 * Instagram Business / Creator account ID.
 */
export async function findIGUserIdFromPages(
  userAccessToken: string
): Promise<string | null> {
  const pagesRes = await fetch(
    `${FB}/me/accounts?access_token=${userAccessToken}`
  );
  const pages = await pagesRes.json();
  if (pages.error) throw new Error(pages.error.message);

  for (const page of pages.data ?? []) {
    const igRes = await fetch(
      `${FB}/${page.id}?fields=instagram_business_account&access_token=${userAccessToken}`
    );
    const igData = await igRes.json();
    if (igData.instagram_business_account?.id) {
      return igData.instagram_business_account.id;
    }
  }
  return null;
}

/* ─── Data fetchers ────────────────────────────────────────────── */

export async function getIGProfile(
  igUserId: string,
  accessToken: string
): Promise<IGProfile> {
  const fields =
    "id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url,website";
  const res = await fetch(
    `${FB}/${igUserId}?fields=${fields}&access_token=${accessToken}`
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data;
}

export async function getIGMedia(
  igUserId: string,
  accessToken: string,
  limit = 24
): Promise<IGMedia[]> {
  const fields =
    "id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count,permalink";
  const res = await fetch(
    `${FB}/${igUserId}/media?fields=${fields}&limit=${limit}&access_token=${accessToken}`
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.data ?? [];
}

export async function getIGAccountInsights(
  igUserId: string,
  accessToken: string
): Promise<IGAccountInsights> {
  const since = Math.floor(Date.now() / 1000) - 30 * 24 * 3600;
  const until = Math.floor(Date.now() / 1000);

  const res = await fetch(
    `${FB}/${igUserId}/insights` +
      `?metric=impressions,reach,profile_views,follower_count` +
      `&period=day&since=${since}&until=${until}` +
      `&access_token=${accessToken}`
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  const result: IGAccountInsights = {
    impressions: 0,
    reach: 0,
    profile_views: 0,
    follower_series: [],
  };

  for (const metric of data.data ?? []) {
    const total = (metric.values ?? []).reduce(
      (s: number, v: { value: number }) => s + (v.value ?? 0),
      0
    );
    switch (metric.name) {
      case "impressions":   result.impressions   = total; break;
      case "reach":         result.reach         = total; break;
      case "profile_views": result.profile_views = total; break;
      case "follower_count":
        result.follower_series = metric.values ?? [];
        break;
    }
  }
  return result;
}
