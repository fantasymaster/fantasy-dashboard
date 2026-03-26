"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Settings, Camera, CheckCircle2, AlertCircle, Loader2,
  ExternalLink, LogOut, RefreshCw, Users, ImageIcon, Globe,
  AtSign, Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { IGProfile } from "@/lib/instagram-api";

/* ─── Types ─────────────────────────────────────────────────────── */

interface ProfileResponse {
  connected: boolean;
  profile?: IGProfile & { profile_picture_url?: string };
}

/* ─── Instagram connection card ─────────────────────────────────── */

function InstagramCard() {
  const searchParams = useSearchParams();
  const igStatus = searchParams.get("ig");
  const igMsg    = searchParams.get("msg");

  const [data, setData]       = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  async function loadProfile() {
    setLoading(true);
    try {
      const res = await fetch("/api/instagram/profile");
      setData(await res.json());
    } catch {
      setData({ connected: false });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProfile(); }, []);

  async function handleDisconnect() {
    if (!confirm("Disconnect your Instagram account?")) return;
    setDisconnecting(true);
    try {
      await fetch("/api/instagram/disconnect", { method: "DELETE" });
      setData({ connected: false });
    } finally {
      setDisconnecting(false);
    }
  }

  /* ── Flash banners ── */
  const flashBanner = (() => {
    if (igStatus === "connected")
      return { type: "success", text: "Instagram connected successfully!" };
    if (igStatus === "denied")
      return { type: "warn", text: "You cancelled the Instagram authorisation." };
    if (igStatus === "error") {
      const friendly: Record<string, string> = {
        no_ig_account: "No Instagram Business/Creator account found. Make sure your Instagram account is connected to a Facebook Page.",
        state_mismatch: "Security check failed — please try again.",
        missing_params:  "OAuth response was incomplete. Please try again.",
      };
      return {
        type: "error",
        text: friendly[igMsg ?? ""] ?? `Connection failed: ${igMsg ?? "unknown error"}`,
      };
    }
    return null;
  })();

  const profile = data?.profile;

  return (
    <Card>
      {/* Accent bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-t-xl" />

      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-500">
            <Camera className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Instagram Account</h2>
            <p className="text-xs text-muted-foreground">
              Connect your Business or Creator account to unlock live data
            </p>
          </div>
          {data?.connected && (
            <Badge className="ml-auto bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-[10px]">
              Connected
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* Flash banner */}
        {flashBanner && (
          <div className={cn(
            "flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm",
            flashBanner.type === "success" && "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
            flashBanner.type === "warn"    && "border-amber-500/20 bg-amber-500/10 text-amber-400",
            flashBanner.type === "error"   && "border-rose-500/20 bg-rose-500/10 text-rose-400",
          )}>
            {flashBanner.type === "success"
              ? <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
              : <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            }
            <p className="leading-snug">{flashBanner.text}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking connection...
          </div>
        )}

        {/* Connected — show profile */}
        {!loading && data?.connected && profile && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              {profile.profile_picture_url ? (
                <img
                  src={profile.profile_picture_url}
                  alt={profile.username}
                  className="h-14 w-14 rounded-full border-2 border-border object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-xl font-bold">
                  {profile.username?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
              <div>
                <p className="font-semibold text-foreground">@{profile.username}</p>
                {profile.biography && (
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                    {profile.biography}
                  </p>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 flex items-center gap-1 text-[11px] text-primary hover:underline"
                  >
                    <Globe className="h-3 w-3" />
                    {profile.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Followers", value: (profile.followers_count ?? 0).toLocaleString(), icon: Users, color: "text-violet-400" },
                { label: "Posts",     value: (profile.media_count ?? 0).toLocaleString(),     icon: ImageIcon, color: "text-blue-400" },
                { label: "Following", value: (profile.follows_count ?? 0).toLocaleString(),   icon: AtSign,    color: "text-emerald-400" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg bg-muted/40 p-3 text-center">
                  <p className={cn("text-lg font-bold tabular-nums", stat.color)}>{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs"
                onClick={loadProfile}
                disabled={loading}
              >
                <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs"
                onClick={() =>
                  window.open(
                    `https://instagram.com/${profile.username}`,
                    "_blank"
                  )
                }
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View Profile
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto gap-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleDisconnect}
                disabled={disconnecting}
              >
                {disconnecting
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <LogOut className="h-3.5 w-3.5" />
                }
                Disconnect
              </Button>
            </div>
          </div>
        )}

        {/* Not connected */}
        {!loading && !data?.connected && (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Camera className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-foreground">No account connected</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-xs mx-auto">
                Connect your Instagram Business or Creator account to see live
                followers, posts, and insights in your dashboard.
              </p>
            </div>

            {/* Requirements */}
            <div className="rounded-lg bg-muted/30 px-4 py-3 text-xs text-muted-foreground space-y-1.5">
              <p className="font-medium text-foreground text-[11px] uppercase tracking-wider mb-2">Requirements</p>
              {[
                "Instagram Business or Creator account",
                "Connected to a Facebook Page you manage",
                "Facebook Developer App with Instagram Graph API",
              ].map((req) => (
                <div key={req} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <span>{req}</span>
                </div>
              ))}
            </div>

            <Button
              asChild
              className="bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white hover:opacity-90 gap-2"
            >
              <a href="/api/instagram/connect">
                <Zap className="h-4 w-4" />
                Connect Instagram
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-500/15">
          <Settings className="h-5 w-5 text-zinc-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage integrations and account connections
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl">
        <InstagramCard />
      </div>
    </div>
  );
}
