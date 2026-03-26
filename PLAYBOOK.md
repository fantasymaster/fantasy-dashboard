# Content Hub Dashboard — Complete Project Playbook

**Live URL:** https://fantasydashboard01.netlify.app
**GitHub:** https://github.com/fantasymaster/content-hub-dashboard
**Last Updated:** March 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Rationale](#2-tech-stack--rationale)
3. [Prerequisites & Account Setup](#3-prerequisites--account-setup)
4. [Local Development Setup](#4-local-development-setup)
5. [Supabase Setup](#5-supabase-setup)
6. [Google OAuth Setup](#6-google-oauth-setup)
7. [Instagram / Meta App Setup](#7-instagram--meta-app-setup)
8. [Environment Variables Reference](#8-environment-variables-reference)
9. [Project Architecture Deep Dive](#9-project-architecture-deep-dive)
10. [File Structure Walkthrough](#10-file-structure-walkthrough)
11. [Pages & Features Guide](#11-pages--features-guide)
12. [Styling System](#12-styling-system)
13. [Authentication System](#13-authentication-system)
14. [Instagram API Integration](#14-instagram-api-integration)
15. [Database Layer](#15-database-layer)
16. [Image Storage](#16-image-storage)
17. [Netlify Deployment](#17-netlify-deployment)
18. [Troubleshooting Guide](#18-troubleshooting-guide)
19. [What's Next — Roadmap](#19-whats-next--roadmap)
20. [Quick Reference Cheat Sheet](#20-quick-reference-cheat-sheet)

---

## 1. Project Overview

Content Hub Dashboard is a personal Instagram content management dashboard built for a single authenticated user. It replaces the need to juggle multiple third-party tools (Buffer, Later, Hootsuite) by consolidating everything into one self-hosted application: drafting posts, scheduling content, viewing analytics, monitoring competitors, and reading industry news — all in one place.

### What It Does

- **Post Manager** — Draft, edit, schedule, and delete Instagram posts with image uploads stored in Supabase Storage
- **Live Feed** — View your real published Instagram posts fetched live from the Meta Graph API
- **Analytics** — Live follower count and engagement charts powered by Recharts
- **Content Calendar** — Monthly calendar view of all scheduled and published posts
- **Competitor Tracker** — Track competitor Instagram handles and surface their stats
- **News Consolidator** — Curated news articles with the ability to turn any article into a post idea saved to your drafts
- **Settings** — Connect and disconnect your Instagram Business account via OAuth

### Who It's For

This is a single-user personal tool. The authentication system is intentionally locked to one email address (`ALLOWED_EMAIL`). It is not designed as a multi-tenant SaaS — if you need that, the architecture would need significant changes to the auth and database layers.

### Design Philosophy

The core principle is **simplicity over scale**. Every architectural decision prioritises getting a working, deployable tool fast over building for hypothetical future requirements. Row-Level Security is disabled on Supabase tables. Middleware is kept minimal. The entire auth guard is a single server component. This is intentional — for a personal dashboard accessed only by you, these tradeoffs are sensible.

---

## 2. Tech Stack & Rationale

Understanding why each technology was chosen helps you make informed decisions when you hit limitations or need to extend the project.

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 16.2+ (App Router) | Server Components + API Routes in one project. App Router enables fine-grained server/client split — critical for keeping API tokens server-only. |
| Language | TypeScript | Catches Instagram API shape mismatches at compile time. The Meta Graph API returns inconsistent shapes depending on account type; types help enormously. |
| Styling | Tailwind CSS v4 + shadcn/ui | shadcn gives you copy-paste components you fully own. No third-party component library lock-in. Tailwind v4 uses CSS-native features (oklch colors, `@layer`). |
| Database | Supabase (PostgreSQL) | Managed Postgres with a generous free tier, a JavaScript SDK, and built-in file storage. All three are needed here. |
| Auth | NextAuth.js v4 | Industry-standard. Google OAuth in ~20 lines. Session persistence via JWT. Works on Netlify without needing a dedicated auth server. |
| Charts | Recharts | React-native charting library. Composable, well-documented, works with server-fetched data passed as props. |
| Theme | next-themes | Single-line dark mode toggle with SSR-safe hydration. |
| Deployment | Netlify + @netlify/plugin-nextjs | The plugin handles converting Next.js API routes and Server Components into Netlify Functions automatically. No manual configuration needed. |
| Instagram | Meta Graph API v19.0 | The official API. Required for reading real follower counts, media, and engagement data. |

### Why Not Vercel?

Vercel is the natural home for Next.js, but Netlify was chosen here. The behavior is nearly identical — both support Next.js Server Components and API Routes. The main operational difference is that Netlify's edge functions have stricter limitations around complex Node.js modules (which is why auth is done in a regular Server Component rather than middleware — more on this in the Architecture section).

### Why Not Prisma?

Supabase's JavaScript SDK (`@supabase/supabase-js`) provides a clean query builder that covers all the CRUD operations needed here. Adding Prisma would introduce a migration workflow, schema files, and a client generation step — unnecessary overhead for a two-table database.

### Why Next.js 16 (and not 14 or 15)?

Next.js 16 ships with Turbopack as the default dev server bundler. Cold start times drop from ~8 seconds to under 1 second for this project. The App Router APIs used here are stable in v16. There are no v16-specific features being used that would break on v14 or v15.

---

## 3. Prerequisites & Account Setup

Before writing a single line of code, you need the following accounts and tools installed. Work through this section completely before moving on.

### 3.1 Required Accounts

Create accounts at each of these services if you don't already have one:

- **GitHub** — https://github.com — version control and Netlify deployment source
- **Supabase** — https://supabase.com — free tier is sufficient
- **Google Cloud Console** — https://console.cloud.google.com — for OAuth credentials
- **Meta for Developers** — https://developers.facebook.com — for Instagram Graph API
- **Netlify** — https://netlify.com — free tier is sufficient for personal use

You also need an **Instagram Business or Creator account** connected to a **Facebook Page** you manage. A personal Instagram account will not work with the Graph API. If your account is personal, go to Instagram → Settings → Account → Switch to Professional Account → choose Creator or Business.

### 3.2 Install Node.js

The project requires Node.js 18.17 or later (for Next.js 16 compatibility).

**Check if you already have Node:**
```bash
node --version
# Should output v18.17.0 or higher
```

**If not installed, use nvm (recommended):**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Restart your terminal, then:
nvm install 20
nvm use 20
nvm alias default 20

# Verify
node --version   # v20.x.x
npm --version    # 10.x.x
```

> **Why nvm?** It lets you switch Node versions per project. Next.js 16 requires Node 18.17+. If you have an older Node globally, you'd hit build errors. nvm eliminates this entirely.

### 3.3 Install Git

```bash
git --version
# If not installed on macOS: xcode-select --install
# On Ubuntu/Debian: sudo apt install git
```

### 3.4 A Code Editor

VS Code is recommended. Install the following extensions for the best experience:
- **Tailwind CSS IntelliSense** — autocomplete for Tailwind classes
- **ESLint** — catches code issues inline
- **Prettier** — auto-formatting
- **TypeScript and JavaScript Language Features** — built-in, just make sure it's enabled

---

## 4. Local Development Setup

### 4.1 Clone or Create the Repository

**If starting from scratch:**
```bash
# Create the Next.js project
npx create-next-app@latest content-dashboard
```

When prompted, choose:
```
✓ Would you like to use TypeScript? — Yes
✓ Would you like to use ESLint? — Yes
✓ Would you like to use Tailwind CSS? — Yes
✓ Would you like your code inside a `src/` directory? — No
✓ Would you like to use App Router? — Yes
✓ Would you like to use Turbopack for next dev? — Yes
✓ Would you like to customize the import alias? — No (use @/*)
```

**If cloning the existing repo:**
```bash
git clone https://github.com/fantasymaster/content-hub-dashboard.git content-dashboard
cd content-dashboard
```

### 4.2 Install Dependencies

```bash
cd content-dashboard
npm install
```

If starting fresh, install all project dependencies:

```bash
# Core runtime dependencies
npm install @supabase/supabase-js next-auth next-themes recharts lucide-react

# shadcn/ui utilities
npm install class-variance-authority clsx tailwind-merge

# Dev dependencies
npm install -D @netlify/plugin-nextjs @types/node @types/react typescript
```

**Install shadcn/ui CLI and initialize:**
```bash
npx shadcn@latest init
```

When prompted:
```
✓ Which style would you like to use? — Default
✓ Which color would you like to use as base color? — Slate
✓ Would you like to use CSS variables for colors? — Yes
```

Then add the components used in this project:
```bash
npx shadcn@latest add button card badge input textarea select dialog tabs
```

### 4.3 Create the Environment File

```bash
touch .env.local
```

Open `.env.local` and add the following (you'll fill in the actual values as you complete the setup steps in subsequent sections):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Google OAuth
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-this-below

# Single-user allowlist
ALLOWED_EMAIL=your@email.com

# Instagram / Meta
INSTAGRAM_APP_ID=your_facebook_app_id
INSTAGRAM_APP_SECRET=your_facebook_app_secret
```

**Generate a NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
# Copy the output into NEXTAUTH_SECRET
```

### 4.4 Add .env.local to .gitignore

This should already be there from `create-next-app`, but verify:

```bash
cat .gitignore | grep env
# Should show: .env.local
```

If not present, add it manually:
```bash
echo ".env.local" >> .gitignore
```

> **Critical:** Never commit `.env.local` to GitHub. It contains secret keys that would give anyone full access to your Supabase database and Instagram account.

### 4.5 Start the Development Server

```bash
npm run dev
```

You should see:
```
▲ Next.js 16.2.x (Turbopack)
- Local:        http://localhost:3000
- Environments: .env.local
```

Visit http://localhost:3000. You'll see an error about missing environment variables — that's expected until you complete the setup steps below.

---

## 5. Supabase Setup

Supabase provides three things for this project: the PostgreSQL database, file storage for post images, and the server-side service role key that bypasses row-level security for secure server-only operations.

### 5.1 Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click **New Project**
3. Choose your organization (or create one)
4. Fill in:
   - **Name:** `content-hub-dashboard` (or anything you like)
   - **Database Password:** Generate a strong password and save it somewhere safe
   - **Region:** Choose the region closest to you
5. Click **Create new project** and wait ~2 minutes for provisioning

### 5.2 Get Your API Keys

1. In your Supabase project, go to **Settings** (gear icon) → **API**
2. Copy the following into your `.env.local`:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

> **Warning:** The `service_role` key bypasses all Row Level Security policies. It must ONLY be used in server-side code (API routes, Server Components). Never expose it to the client. The `NEXT_PUBLIC_` prefix on the anon key is intentional — it's designed to be public. The service_role key has no such prefix for this reason.

### 5.3 Create the instagram_posts Table

1. In Supabase, go to **SQL Editor**
2. Click **New query**
3. Paste and run the following:

```sql
create table if not exists instagram_posts (
  id              uuid        default gen_random_uuid() primary key,
  caption         text        not null,
  hashtags        text        default '',
  post_type       text        not null default 'photo',
  status          text        not null default 'draft',
  image_url       text,
  scheduled_date  timestamptz,
  published_date  timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Disable RLS — this is a personal single-user dashboard
-- If you ever make this multi-tenant, re-enable and add policies
alter table instagram_posts disable row level security;
```

4. Click **Run**. You should see "Success. No rows returned."

### 5.4 Create the instagram_connections Table

This table stores the Instagram access token and profile data after the OAuth flow completes.

```sql
create table if not exists instagram_connections (
  id                  uuid        default gen_random_uuid() primary key,
  user_email          text        not null unique,
  ig_user_id          text        not null,
  username            text,
  access_token        text        not null,
  token_expires_at    timestamptz,
  profile_picture_url text,
  followers_count     integer     default 0,
  media_count         integer     default 0,
  biography           text,
  website             text,
  updated_at          timestamptz default now(),
  created_at          timestamptz default now()
);

-- No RLS needed — only accessed via service_role key in server-side API routes
```

The `user_email` column has a `unique` constraint, which means one Instagram account per app user. The `upsert` operation used when reconnecting depends on this uniqueness.

### 5.5 Create the Storage Bucket

1. In Supabase, go to **Storage** (the database cylinder icon)
2. Click **New bucket**
3. Name it `post-images`
4. Toggle **Public bucket** to ON (post images are meant to be publicly viewable)
5. Click **Save**

Now set up the storage policies. Go to **SQL Editor** and run:

```sql
-- Allow anyone to read images (they're public post images)
create policy "Public read" on storage.objects
  for select using (bucket_id = 'post-images');

-- Allow authenticated server operations to upload
create policy "Allow uploads" on storage.objects
  for insert with check (bucket_id = 'post-images');

-- Allow authenticated server operations to delete
create policy "Allow deletes" on storage.objects
  for delete using (bucket_id = 'post-images');
```

> **Note on storage policies:** Even though the bucket is public, Supabase still requires explicit RLS policies on the `storage.objects` table. Without the "Allow uploads" policy, image uploads will fail with a 403 error.

### 5.6 Verify Setup

Go to **Table Editor** in Supabase. You should see both tables listed:
- `instagram_posts`
- `instagram_connections`

Go to **Storage** → you should see the `post-images` bucket.

---

## 6. Google OAuth Setup

Google OAuth handles user authentication. When a user clicks "Sign in with Google", they're redirected to Google, authenticate, and Google sends back a token that NextAuth validates against the `ALLOWED_EMAIL` whitelist.

### 6.1 Create a Google Cloud Project

1. Go to https://console.cloud.google.com
2. At the top, click the project dropdown → **New Project**
3. Name it `Content Hub Dashboard` → **Create**
4. Make sure the new project is selected in the dropdown

### 6.2 Configure the OAuth Consent Screen

Before creating credentials, you must configure the consent screen (what users see when signing in).

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (even though only one user will ever sign in) → **Create**
3. Fill in:
   - **App name:** Content Hub Dashboard
   - **User support email:** your email
   - **Developer contact information:** your email
4. Click **Save and Continue**
5. On the **Scopes** page, click **Save and Continue** (no additional scopes needed — NextAuth handles this)
6. On the **Test users** page, add your Google account email → **Save and Continue**
7. Review and click **Back to Dashboard**

> **Why External?** Internal is only available to Google Workspace accounts. External with your email as a test user works identically for a personal app.

### 6.3 Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client IDs**
3. Application type: **Web application**
4. Name: `Content Hub Dashboard Web Client`
5. Under **Authorized redirect URIs**, click **Add URI** and add both:
   ```
   http://localhost:3000/api/auth/callback/google
   https://fantasydashboard01.netlify.app/api/auth/callback/google
   ```
6. Click **Create**
7. Copy the **Client ID** and **Client Secret** into your `.env.local`:
   ```env
   GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxxx
   ```

> **Important:** The redirect URIs must match exactly — including protocol (http vs https) and no trailing slash. NextAuth constructs the callback URL as `{NEXTAUTH_URL}/api/auth/callback/google`. If your `NEXTAUTH_URL` doesn't match a registered URI, Google will reject the OAuth flow with a `redirect_uri_mismatch` error.

---

## 7. Instagram / Meta App Setup

This is the most complex external service to configure. The Instagram Graph API requires a Facebook Developer App, and the Instagram account must be a Business or Creator account connected to a Facebook Page.

### 7.1 Prerequisites Check

Before proceeding, verify:
- [ ] Your Instagram account is **Business** or **Creator** (not Personal)
- [ ] Your Instagram account is **connected to a Facebook Page** you admin

**To connect Instagram to a Facebook Page:**
1. Go to your Facebook Page
2. Settings → Instagram → Connect account
3. Follow the prompts

If you don't have a Facebook Page, create one at https://facebook.com/pages/create. It doesn't need followers or content — it just needs to exist and be connected.

### 7.2 Create the Meta Developer App

1. Go to https://developers.facebook.com
2. Log in with your Facebook account (the same one that manages your Facebook Page)
3. Click **My Apps** → **Create App**
4. Select **Business** as the app type → **Next**
5. Fill in:
   - **App name:** Content Hub Dashboard
   - **App contact email:** your email
6. Click **Create App**

### 7.3 Add the Instagram Graph API Product

1. On the app dashboard, scroll to **Add Products to Your App**
2. Find **Instagram Graph API** and click **Set up**
3. This adds the Instagram product to your app

### 7.4 Configure OAuth Redirect URIs

1. In the left sidebar, click **Facebook Login** → **Settings**
2. Under **Valid OAuth Redirect URIs**, add:
   ```
   https://fantasydashboard01.netlify.app/api/instagram/callback
   http://localhost:3000/api/instagram/callback
   ```
3. Click **Save Changes**

### 7.5 Get Your App Credentials

1. Go to **Settings** → **Basic**
2. Copy:
   - **App ID** → `INSTAGRAM_APP_ID`
   - **App Secret** (click Show) → `INSTAGRAM_APP_SECRET`

### 7.6 Required Permissions

The app requests these permissions during the OAuth flow:

| Permission | Purpose |
|-----------|---------|
| `instagram_basic` | Read profile info (username, bio, profile picture) |
| `instagram_manage_insights` | Read follower count and post engagement data |
| `pages_show_list` | List the Facebook Pages the user manages |
| `pages_read_engagement` | Read Page engagement data (needed to find connected Instagram account) |

In development mode (before Meta App Review), these permissions work for the app owner and any accounts you add as **Testers** in the app dashboard.

### 7.7 Add Test Users (Development Mode)

Since the app is in development mode (not submitted for Meta App Review), only designated test users can connect:

1. Go to **Roles** → **Roles** in the app dashboard
2. Under **Testers**, click **Add Testers**
3. Enter the Facebook username or email of accounts you want to test with
4. They must accept the tester invitation at https://developers.facebook.com/apps

For a purely personal dashboard used only by you (the app owner), no test users need to be added — the app owner can always connect.

### 7.8 Understanding Development vs. Live Mode

| Mode | Who can connect |
|------|----------------|
| Development | App owner + designated Testers only |
| Live (after App Review) | Any Instagram Business/Creator account |

For personal use, **Development mode is sufficient forever**. You never need to submit for App Review unless you want other people to use your app.

> **App Review note:** If you ever want to make this a real product for other users, Meta App Review for `instagram_manage_insights` can take 2-4 weeks. Plan accordingly.

---

## 8. Environment Variables Reference

Here is the complete reference for every environment variable used in the project.

### 8.1 Local Development (.env.local)

```env
# ─── Supabase ─────────────────────────────────────────────────────────────────
# Your project URL — safe to expose (needed for client-side SDK)
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghij.supabase.co

# Anonymous key — safe to expose (public by design, RLS controls access)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service role key — NEVER expose to client. Bypasses all RLS policies.
# Only used in server-side API routes (lib/supabase-server.ts)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ─── Google OAuth ─────────────────────────────────────────────────────────────
# From Google Cloud Console → APIs & Services → Credentials
GOOGLE_CLIENT_ID=123456789-abcdefghij.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx

# ─── NextAuth ─────────────────────────────────────────────────────────────────
# Must match the URL where your app runs. NextAuth uses this to construct callback URLs.
NEXTAUTH_URL=http://localhost:3000

# Random secret for signing JWT tokens. Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your-32-character-random-string-here

# ─── Single-User Allowlist ────────────────────────────────────────────────────
# Only this email address can sign in. Must match your Google account email exactly.
ALLOWED_EMAIL=your@email.com

# ─── Instagram / Meta ─────────────────────────────────────────────────────────
# From Meta Developer App → Settings → Basic
INSTAGRAM_APP_ID=1234567890123456
INSTAGRAM_APP_SECRET=abcdef1234567890abcdef1234567890
```

### 8.2 Netlify Production (same keys, different values)

Set these in Netlify → Site settings → Environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghij.supabase.co     # same as local
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...                         # same as local
SUPABASE_SERVICE_ROLE_KEY=eyJ...                             # same as local
GOOGLE_CLIENT_ID=123456789-abcdefghij.apps.googleusercontent.com  # same as local
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx                             # same as local
NEXTAUTH_URL=https://fantasydashboard01.netlify.app          # DIFFERENT — production URL
NEXTAUTH_SECRET=your-32-character-random-string-here         # same as local (or regenerate)
ALLOWED_EMAIL=your@email.com                                  # same as local
INSTAGRAM_APP_ID=1234567890123456                             # same as local
INSTAGRAM_APP_SECRET=abcdef1234567890abcdef1234567890        # same as local
```

> **The only variable that differs between local and production is `NEXTAUTH_URL`.** In development it points to localhost; in production it points to your Netlify domain. Getting this wrong is the #1 cause of OAuth redirect failures.

### 8.3 Variable Security Classification

| Variable | Client-safe? | Why |
|----------|-------------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Designed to be public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Designed to be public; RLS restricts access |
| `SUPABASE_SERVICE_ROLE_KEY` | **No** | Full database access, bypasses RLS |
| `GOOGLE_CLIENT_ID` | Technically yes | Exposed in OAuth redirect URL anyway |
| `GOOGLE_CLIENT_SECRET` | **No** | Used to exchange auth codes server-side |
| `NEXTAUTH_URL` | Yes | It's just your app's URL |
| `NEXTAUTH_SECRET` | **No** | Signs JWT tokens; exposure = session forgery |
| `ALLOWED_EMAIL` | **No** | Reveals your email address |
| `INSTAGRAM_APP_ID` | Technically yes | Used in OAuth redirect URL |
| `INSTAGRAM_APP_SECRET` | **No** | Used to exchange auth codes server-side |

Variables marked `NEXT_PUBLIC_` are automatically bundled into the client-side JavaScript. All others are only available server-side.

---

## 9. Project Architecture Deep Dive

### 9.1 The Server/Client Split

Next.js App Router components are **Server Components by default**. They run on the server, can access environment variables and databases directly, and send HTML to the browser. They cannot use React hooks or browser APIs.

**Client Components** are opted in with `"use client"` at the top of the file. They run in the browser, can use hooks and event listeners, but cannot directly access server-side resources.

The project's split:

```
Server Components               Client Components
─────────────────               ─────────────────
app/page.tsx                    app/instagram/page.tsx
app/analytics/page.tsx          app/analytics/analytics-client.tsx
app/(protected)/layout.tsx      app/calendar/page.tsx
                                app/competitors/page.tsx
                                app/news/page.tsx
                                app/settings/page.tsx
                                components/app-shell.tsx
                                components/sidebar.tsx
```

**Why are some pages Server Components?**

`app/page.tsx` (Dashboard) and `app/analytics/page.tsx` fetch live Instagram data — follower counts, etc. Doing this in a Server Component means:
1. The API call happens on the server before any HTML is sent to the browser
2. The Instagram access token (stored in Supabase) is never exposed to the client
3. The page loads with data already populated (no loading spinners for the critical KPI)

**Why are most pages Client Components?**

Interactive pages (post manager, calendar, competitor tracker) need `useState`, `useEffect`, form handlers, and modal state. These require Client Components. They still fetch data — but via `fetch()` calls to the Next.js API routes, which keep tokens server-side.

### 9.2 Auth Architecture

```
Browser Request
      │
      ▼
middleware.ts (minimal — just passes through)
      │
      ▼
app/(protected)/layout.tsx
      │
      ├─ getServerSession(authOptions)
      │
      ├─ If no session → redirect('/login')
      │
      └─ If session → render children
```

**Why is auth done in a Server Component instead of middleware?**

Next.js middleware runs on the Netlify Edge Network. Edge functions are very fast but have strict limitations — they cannot import many Node.js modules. NextAuth's `getServerSession` internally uses Node.js crypto modules that crash on Netlify's edge runtime.

The solution: keep `middleware.ts` minimal (it just adds some headers and passes everything through), and do the actual auth check in `app/(protected)/layout.tsx`, which is a regular Node.js Server Component, not an edge function.

This means there's a small window where a request gets through middleware but is redirected by the layout. In practice this is imperceptible to the user and perfectly secure — the redirect happens before any protected content is rendered.

### 9.3 Instagram OAuth Token Flow

```
1. User clicks "Connect Instagram" on /settings
      │
      ▼
2. GET /api/instagram/connect
   - Generates random CSRF state string
   - Stores state in httpOnly cookie (ig_oauth_state)
   - Redirects browser to Facebook OAuth URL:
     https://www.facebook.com/dialog/oauth?
       client_id=INSTAGRAM_APP_ID
       &redirect_uri=.../api/instagram/callback
       &scope=instagram_basic,instagram_manage_insights,...
       &state={csrf_state}
      │
      ▼
3. User authorizes on Facebook
      │
      ▼
4. GET /api/instagram/callback?code=AUTH_CODE&state=CSRF_STATE
   - Verifies state matches cookie (CSRF protection)
   - Exchanges code for short-lived token (via Facebook Graph API)
   - Exchanges short-lived token for 60-day long-lived token
   - Fetches user's Facebook Pages
   - Finds Instagram Business account connected to those Pages
   - Fetches Instagram profile (username, followers, bio, etc.)
   - Stores everything in instagram_connections table via service_role key
   - Redirects to /settings?ig=connected
      │
      ▼
5. Settings page shows live profile data
```

**The 60-day token problem:** Instagram long-lived tokens expire after 60 days. This project does not yet implement automatic token refresh. You'll need to reconnect every 60 days. See the [Roadmap section](#19-whats-next--roadmap) for the planned refresh implementation.

### 9.4 Data Flow for Live Stats

When the Dashboard or Analytics page loads:

```
app/page.tsx (Server Component)
      │
      ├─ 1. Import supabaseServer (service_role client)
      ├─ 2. Query instagram_connections for ALLOWED_EMAIL
      ├─ 3. Get access_token from the row
      ├─ 4. Call Meta Graph API: GET /me?fields=followers_count&access_token=...
      ├─ 5. Get follower count
      └─ 6. Pass follower count as prop to client components
```

The access token never leaves the server. The client component only receives the follower count number.

---

## 10. File Structure Walkthrough

Every file in the project and its purpose:

```
content-dashboard/
│
├── app/                           # Next.js App Router — all routes live here
│   │
│   ├── layout.tsx                 # Root layout: ThemeProvider wraps everything,
│   │                              # AppShell provides mobile sidebar drawer
│   │
│   ├── globals.css                # Design system: oklch color tokens, typography
│   │                              # scale, Tailwind base layer overrides
│   │
│   ├── page.tsx                   # Dashboard home — Server Component
│   │                              # Fetches live follower count, renders KPI cards
│   │                              # and quick-action buttons
│   │
│   ├── login/
│   │   └── page.tsx               # Google sign-in page — Client Component
│   │                              # Calls signIn('google') from next-auth/react
│   │
│   ├── settings/
│   │   └── page.tsx               # Instagram connection manager — Client Component
│   │                              # Shows connect/disconnect button, live profile
│   │                              # card when connected
│   │
│   ├── instagram/
│   │   └── page.tsx               # Post manager + Live Feed — Client Component
│   │                              # Tab 1: CRUD for instagram_posts table
│   │                              # Tab 2: Live Feed from Meta Graph API
│   │
│   ├── analytics/
│   │   ├── page.tsx               # Server Component: fetches live follower count,
│   │   │                          # passes to client component as prop
│   │   └── analytics-client.tsx   # Client Component: renders Recharts charts,
│   │                              # displays live follower stat from prop
│   │
│   ├── calendar/
│   │   └── page.tsx               # Content calendar — Client Component
│   │                              # Renders monthly calendar grid, fetches posts
│   │                              # from Supabase, shows post count per day
│   │
│   ├── competitors/
│   │   └── page.tsx               # Competitor tracker — Client Component
│   │                              # Add/delete competitor handles, stats grid
│   │
│   ├── news/
│   │   └── page.tsx               # News consolidator — Client Component
│   │                              # 12 mock articles, bookmark toggle,
│   │                              # "Turn into post" saves draft to Supabase
│   │
│   ├── (protected)/
│   │   └── layout.tsx             # Auth guard — Server Component
│   │                              # Calls getServerSession, redirects to /login
│   │                              # if no valid session. Wraps all protected routes.
│   │
│   └── api/                       # API Routes — all server-side only
│       │
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts       # NextAuth catch-all handler
│       │                          # Handles /api/auth/signin, /callback, /session, etc.
│       │
│       └── instagram/
│           ├── connect/
│           │   └── route.ts       # GET: Start Instagram OAuth flow
│           │                      # Sets CSRF cookie, redirects to Facebook
│           │
│           ├── callback/
│           │   └── route.ts       # GET: Handle OAuth callback from Facebook
│           │                      # Verifies CSRF, exchanges tokens, stores in DB
│           │
│           ├── disconnect/
│           │   └── route.ts       # POST: Delete Instagram connection from DB
│           │
│           ├── profile/
│           │   └── route.ts       # GET: Fetch live profile from Meta Graph API
│           │                      # Used by settings page to show current data
│           │
│           └── media/
│               └── route.ts       # GET: Fetch user's Instagram posts
│                                  # Used by Live Feed tab in instagram page
│
├── components/
│   ├── app-shell.tsx              # Client Component: mobile sidebar drawer
│   │                              # Hamburger button, slide-in overlay, backdrop
│   │                              # Wraps all page content in layout.tsx
│   │
│   ├── sidebar.tsx                # Client Component: navigation sidebar
│   │                              # Desktop: permanent 220px sidebar
│   │                              # Mobile: rendered inside AppShell drawer
│   │                              # Active route highlighting via usePathname
│   │
│   └── theme-provider.tsx         # Thin wrapper around next-themes ThemeProvider
│                                  # Passes through to layout.tsx
│
├── lib/
│   ├── auth.ts                    # NextAuth authOptions
│   │                              # Google provider config, ALLOWED_EMAIL check,
│   │                              # JWT/session callbacks
│   │
│   ├── supabase.ts                # Client-side Supabase instance (anon key)
│   │                              # Used in Client Components for public reads
│   │
│   ├── supabase-server.ts         # Server-side Supabase instance (service_role key)
│   │                              # Used ONLY in API routes and Server Components
│   │                              # Never imported by Client Components
│   │
│   ├── posts-service.ts           # CRUD operations for instagram_posts table
│   │                              # getAllPosts, createPost, updatePost, deletePost
│   │
│   ├── upload-service.ts          # Image operations for Supabase Storage
│   │                              # uploadImage, deleteImage, getPublicUrl
│   │
│   ├── instagram-types.ts         # TypeScript interfaces for all Instagram data shapes
│   │                              # InstagramPost, InstagramProfile, InstagramConnection
│   │                              # Also exports constants like POST_TYPES, STATUSES
│   │
│   └── instagram-api.ts           # Helper functions for Meta Graph API calls
│                                  # fetchProfile, fetchMedia, refreshToken
│
├── middleware.ts                  # Next.js middleware — intentionally minimal
│                                  # Does NOT do auth (would crash on Netlify edge)
│                                  # Just passes requests through
│
├── netlify.toml                   # Netlify build configuration
│                                  # Tells Netlify to use @netlify/plugin-nextjs
│
├── next.config.ts                 # Next.js configuration
│                                  # Image domains, any custom webpack config
│
├── tailwind.config.ts             # Tailwind configuration
│                                  # Content paths for purging, custom theme extensions
│
└── package.json                   # Dependencies and scripts
```

---

## 11. Pages & Features Guide

### 11.1 Dashboard (/ )

**Type:** Server Component
**Route:** `/`

The dashboard is the first page you see after signing in. It makes one server-side call to fetch your live Instagram follower count and renders it as a KPI card.

Key elements:
- **Follower KPI card** — live count from Meta Graph API, fetched server-side
- **Quick action cards** — links to Create Post, View Analytics, Check News
- **Activity feed** — recent post activity pulled from Supabase

Because this is a Server Component, the follower count is baked into the HTML before it reaches the browser. There's no loading state flicker for the hero number.

### 11.2 Instagram Manager (/instagram)

**Type:** Client Component
**Route:** `/instagram`

Two tabs:

**Tab 1: Post Manager**
- Lists all posts from the `instagram_posts` Supabase table
- Filter by status (Draft, Scheduled, Published)
- Create new post via modal form: caption, hashtags, post type, status, scheduled date, image upload
- Edit existing posts
- Delete posts (with confirmation)
- Image upload via Supabase Storage `post-images` bucket

**Tab 2: Live Feed**
- Fetches your real Instagram posts from the Meta Graph API
- Shows thumbnail, caption preview, timestamp, and engagement metrics
- Read-only — this is what's actually on your Instagram profile

**Image Upload Flow:**
1. User selects file in the form
2. Client sends file to Supabase Storage via `upload-service.ts`
3. Supabase returns a public URL
4. URL is stored in the `image_url` column of `instagram_posts`

### 11.3 Analytics (/analytics)

**Type:** Server Component (page.tsx) + Client Component (analytics-client.tsx)
**Route:** `/analytics`

The page-level Server Component fetches the live follower count and passes it as a prop to `analytics-client.tsx`. This pattern lets the critical stat load with zero delay (baked into server HTML) while the interactive charts (which need `useState`) live in a Client Component.

Charts included:
- **Follower Growth** — line chart, last 30 days (sample data)
- **Engagement Rate** — bar chart per post type
- **Post Performance** — combined chart showing reach vs. impressions
- **Best Posting Times** — heatmap-style visualization

> **Note on sample data:** The Meta Graph API's insights endpoints require your app to be in Live mode (approved by Meta App Review) for full historical data. In development mode, charts use sample data while the follower count stat is live.

### 11.4 Content Calendar (/calendar)

**Type:** Client Component
**Route:** `/calendar`

A monthly grid calendar that:
- Renders the current month by default
- Shows dot indicators on days that have scheduled or published posts
- Clicking a day opens a side panel showing posts scheduled for that day
- Navigation arrows to move between months
- Posts are fetched from `instagram_posts` filtered by `scheduled_date`

### 11.5 Competitor Tracker (/competitors)

**Type:** Client Component
**Route:** `/competitors`

Lets you manually track competitor Instagram handles:
- Add a competitor by entering their username
- Delete competitors
- Search/filter the competitor list
- Stats grid showing follower count, post count, engagement rate

> **Important note on competitor data:** The Meta Graph API does not allow reading other users' profile data unless they've authorized your app. The competitor stats shown are either manually entered or fetched from public profile scraping (not included in the base implementation). The Stats fields are currently mock/manually-entered data.

### 11.6 News Consolidator (/news)

**Type:** Client Component
**Route:** `/news`

A curated news reader:
- 12 pre-loaded article cards (mock data in the component)
- Bookmark toggle (saved to localStorage)
- Filter by category (Design, Marketing, Social Media, etc.)
- **"Turn into post idea"** button — creates a new Draft post in `instagram_posts` with the article title as the caption seed
- This is the only action that writes to Supabase from this page

### 11.7 Settings (/settings)

**Type:** Client Component
**Route:** `/settings`

Two states:

**Not connected:**
- Shows "Connect Instagram" button
- Clicking it calls `GET /api/instagram/connect` which starts the OAuth flow

**Connected:**
- Shows live profile card (avatar, username, follower count, bio)
- Shows "Disconnect" button
- Clicking disconnect calls `POST /api/instagram/disconnect` which deletes the row from `instagram_connections`
- After disconnect, profile card disappears and connect button returns

**Connection status check:**
The page calls `GET /api/instagram/profile` on mount. If it returns a profile, the user is connected. If it returns 404 or an error, they're not connected.

### 11.8 Login (/login)

**Type:** Client Component
**Route:** `/login`

A minimal page with a single "Sign in with Google" button. Calls `signIn('google')` from `next-auth/react`. After successful authentication, NextAuth redirects to `/` (the dashboard).

If you sign in with an email that doesn't match `ALLOWED_EMAIL`, the `signIn` callback in `lib/auth.ts` returns `false`, which NextAuth translates to a `/api/auth/error?error=AccessDenied` redirect. The login page handles this by showing an "Access denied" message when that query param is present.

---

## 12. Styling System

### 12.1 Tailwind CSS v4

The project uses Tailwind CSS v4, which introduced significant changes from v3:

- **No more `tailwind.config.js` for CSS variables** — theme is now defined directly in CSS using `@theme`
- **Native CSS color system** — uses `oklch()` color space instead of hex/hsl
- **Vite plugin instead of PostCSS plugin** (handled automatically by Next.js integration)

### 12.2 Color Tokens (globals.css)

Colors are defined using CSS custom properties in oklch color space:

```css
@theme {
  --color-background: oklch(1 0 0);        /* white */
  --color-foreground: oklch(0.15 0 0);     /* near-black */
  --color-primary: oklch(0.45 0.18 265);   /* purple-ish blue */
  --color-primary-foreground: oklch(1 0 0);
  --color-muted: oklch(0.96 0 0);
  --color-muted-foreground: oklch(0.45 0 0);
  --color-border: oklch(0.9 0 0);
  --color-card: oklch(0.99 0 0);
}

.dark {
  --color-background: oklch(0.12 0 0);
  --color-foreground: oklch(0.95 0 0);
  /* ... dark variants */
}
```

**Why oklch?** It's perceptually uniform — adjusting lightness in oklch actually looks like an even progression, unlike hsl. Dark mode variants are much easier to tune.

### 12.3 Dark Mode

Dark mode is powered by `next-themes`. The `ThemeProvider` in `app/layout.tsx` wraps the entire app:

```tsx
<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  {children}
</ThemeProvider>
```

`attribute="class"` means next-themes adds a `dark` class to the `<html>` element when dark mode is active. Tailwind's dark mode variant (`dark:`) responds to this class.

The theme toggle button (in the Sidebar) calls `useTheme()` from next-themes and cycles between `light`, `dark`, and `system`.

### 12.4 shadcn/ui Components

shadcn/ui is not a component library you install — it's a CLI that copies component source code into your project. This means:
- You own the code completely
- You can modify any component without fighting library internals
- No dependency updates breaking your custom styles

Components used in this project:
- `Button` — primary, secondary, ghost, destructive variants
- `Card`, `CardHeader`, `CardContent`, `CardFooter` — layout containers
- `Badge` — status indicators (Draft, Scheduled, Published)
- `Input`, `Textarea`, `Select` — form elements
- `Dialog` — modal for post creation/editing
- `Tabs` — Instagram Manager page tabs

---

## 13. Authentication System

### 13.1 NextAuth Configuration (lib/auth.ts)

```typescript
// lib/auth.ts — key sections explained

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // ALLOWED_EMAIL is the single-user whitelist
      // If the signing-in email doesn't match, deny access
      return user.email === process.env.ALLOWED_EMAIL;
    },
    async session({ session, token }) {
      // Persist the user's email in the session object
      // Makes it available in Server Components via getServerSession
      return session;
    },
  },
  pages: {
    signIn: '/login',    // Custom sign-in page
    error: '/login',     // Redirect errors back to login page
  },
  session: {
    strategy: 'jwt',     // Store sessions in JWT, not database
  },
};
```

**Why JWT sessions?** The alternative is database sessions (storing session data in a Supabase table). JWT sessions are self-contained and require no extra database table or queries on every request. For a single-user app, the JWT size (stored in an httpOnly cookie) is negligible.

### 13.2 Auth Guard (app/(protected)/layout.tsx)

```typescript
// app/(protected)/layout.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return <>{children}</>;
}
```

Every page inside `app/(protected)/` automatically inherits this layout. All protected routes are placed inside this directory:
- `app/(protected)/page.tsx` → the Dashboard
- `app/(protected)/instagram/page.tsx`
- `app/(protected)/analytics/page.tsx`
- etc.

> **Note on the parentheses in `(protected)`:** Parentheses in directory names create a "route group" in Next.js App Router. The directory name is NOT included in the URL path. So `app/(protected)/page.tsx` is still accessible at `/`, not `/protected`.

### 13.3 Login Flow Step-by-Step

1. User visits any protected route (e.g., `/`)
2. `(protected)/layout.tsx` calls `getServerSession`
3. No session found → `redirect('/login')`
4. Login page renders with "Sign in with Google" button
5. User clicks button → `signIn('google')` called
6. Browser redirects to Google's OAuth consent screen
7. User approves → Google redirects to `/api/auth/callback/google?code=...`
8. NextAuth exchanges the code for tokens, calls `signIn` callback
9. Callback checks `user.email === ALLOWED_EMAIL`
10. If match: session created, user redirected to `/`
11. If no match: `redirect('/api/auth/error?error=AccessDenied')`
12. Error page shows "Access denied" message

---

## 14. Instagram API Integration

### 14.1 The Meta Graph API

Instagram's API is part of Facebook's Meta Graph API. To read data, you make HTTP GET requests to:
```
https://graph.facebook.com/v19.0/{endpoint}?access_token={token}&fields={fields}
```

The project uses version 19.0. Meta maintains backward compatibility for 2 years after a version release, so v19.0 is stable through 2026.

### 14.2 Token Types

| Token Type | Lifespan | Used for |
|-----------|---------|---------|
| Short-lived User Token | ~1 hour | Temporary, obtained from OAuth flow |
| Long-lived User Token | 60 days | Stored in DB, used for all API calls |
| Page Access Token | Never expires | Could be used for Page-level actions |

The project exchanges the short-lived token for a long-lived token immediately after OAuth and stores the long-lived token.

**Exchange short-lived for long-lived:**
```
GET https://graph.facebook.com/v19.0/oauth/access_token
  ?grant_type=fb_exchange_token
  &client_id={INSTAGRAM_APP_ID}
  &client_secret={INSTAGRAM_APP_SECRET}
  &fb_exchange_token={short_lived_token}
```

### 14.3 Finding the Instagram Business Account

This is the trickiest part of the OAuth flow. The Graph API doesn't directly give you an "Instagram account" from the user token. You have to:

1. Get the user's Facebook Pages: `GET /me/accounts`
2. For each Page, check if it has a connected Instagram Business Account: `GET /{page_id}?fields=instagram_business_account`
3. Use the first one found as the connected Instagram account

```typescript
// Pseudocode from lib/instagram-api.ts

async function findInstagramAccount(userToken: string) {
  // Step 1: Get Facebook Pages
  const pagesResponse = await fetch(
    `https://graph.facebook.com/v19.0/me/accounts?access_token=${userToken}`
  );
  const { data: pages } = await pagesResponse.json();

  // Step 2: Find Instagram Business Account
  for (const page of pages) {
    const igResponse = await fetch(
      `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${userToken}`
    );
    const pageData = await igResponse.json();

    if (pageData.instagram_business_account) {
      return pageData.instagram_business_account.id;
    }
  }

  throw new Error('No Instagram Business Account found');
}
```

### 14.4 Fetching Profile Data

Once you have the Instagram Business Account ID:

```typescript
// Fields available for instagram_basic + instagram_manage_insights
const fields = [
  'username',
  'name',
  'biography',
  'website',
  'followers_count',
  'media_count',
  'profile_picture_url',
].join(',');

const response = await fetch(
  `https://graph.facebook.com/v19.0/${igUserId}?fields=${fields}&access_token=${accessToken}`
);
```

### 14.5 Fetching Media (Live Feed)

```typescript
const mediaFields = [
  'id',
  'caption',
  'media_type',
  'media_url',
  'thumbnail_url',
  'timestamp',
  'like_count',
  'comments_count',
  'permalink',
].join(',');

const response = await fetch(
  `https://graph.facebook.com/v19.0/${igUserId}/media?fields=${mediaFields}&access_token=${accessToken}&limit=12`
);
```

`media_url` returns the actual image/video URL. `thumbnail_url` is available for VIDEO type posts. For CAROUSEL_ALBUM, you get the cover image.

### 14.6 CSRF Protection

The OAuth flow uses a CSRF state parameter to prevent OAuth hijacking:

```typescript
// In /api/instagram/connect:
const state = crypto.randomUUID();
cookies().set('ig_oauth_state', state, {
  httpOnly: true,    // Not accessible from JavaScript
  secure: true,      // Only sent over HTTPS
  maxAge: 600,       // Expires in 10 minutes
  sameSite: 'lax',
});

// Redirect to Facebook with state parameter
const authUrl = new URL('https://www.facebook.com/dialog/oauth');
authUrl.searchParams.set('state', state);
// ...
```

```typescript
// In /api/instagram/callback:
const cookieState = cookies().get('ig_oauth_state')?.value;
const queryState = searchParams.get('state');

if (!cookieState || cookieState !== queryState) {
  return Response.json({ error: 'Invalid state' }, { status: 403 });
}
// Clear the cookie
cookies().delete('ig_oauth_state');
```

---

## 15. Database Layer

### 15.1 Two Supabase Clients

The project maintains two separate Supabase client instances:

**lib/supabase.ts — Client-side (anon key)**
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

Used in: Client Components, for operations that work with the anon key (public reads of `instagram_posts`).

**lib/supabase-server.ts — Server-side (service role)**
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // Only available server-side
);
```

Used in: API Routes (`/api/instagram/*`), Server Components. The service role key is not prefixed with `NEXT_PUBLIC_` and is therefore unavailable in browser-side code.

> **Why two clients?** For `instagram_connections`, we deliberately want no client-side access — the table contains access tokens. Using the service role key ensures only server-side code can read or write this table, even though RLS is disabled (RLS is disabled for simplicity, but the token isolation is still maintained through the client split).

### 15.2 Posts Service (lib/posts-service.ts)

All CRUD for `instagram_posts` is centralized here:

```typescript
// Get all posts, newest first
export async function getAllPosts() {
  const { data, error } = await supabase
    .from('instagram_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Create a new post
export async function createPost(post: CreatePostInput) {
  const { data, error } = await supabase
    .from('instagram_posts')
    .insert([{ ...post, created_at: new Date().toISOString() }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update a post
export async function updatePost(id: string, updates: Partial<InstagramPost>) {
  const { data, error } = await supabase
    .from('instagram_posts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete a post
export async function deletePost(id: string) {
  const { error } = await supabase
    .from('instagram_posts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
```

### 15.3 Upload Service (lib/upload-service.ts)

```typescript
// Upload image to Supabase Storage
export async function uploadImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
  const filePath = `posts/${fileName}`;

  const { error } = await supabase.storage
    .from('post-images')
    .upload(filePath, file, { cacheControl: '3600', upsert: false });

  if (error) throw error;

  // Return the public URL
  const { data } = supabase.storage
    .from('post-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// Delete image from storage
export async function deleteImage(imageUrl: string) {
  // Extract the path from the full URL
  const path = imageUrl.split('/post-images/')[1];
  if (!path) return;

  const { error } = await supabase.storage
    .from('post-images')
    .remove([path]);

  if (error) throw error;
}
```

### 15.4 TypeScript Types (lib/instagram-types.ts)

Key interfaces:

```typescript
export interface InstagramPost {
  id: string;
  caption: string;
  hashtags: string;
  post_type: 'photo' | 'video' | 'carousel' | 'reel' | 'story';
  status: 'draft' | 'scheduled' | 'published';
  image_url: string | null;
  scheduled_date: string | null;
  published_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface InstagramConnection {
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
  created_at: string;
}

export interface LiveInstagramPost {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url?: string;
  thumbnail_url?: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
  permalink: string;
}
```

---

## 16. Image Storage

### 16.1 Bucket Configuration

The `post-images` bucket in Supabase Storage is configured as **public**, meaning any file uploaded to it is accessible via a public URL without authentication. This is appropriate for Instagram post images — they're intended to be shared.

The public URL format:
```
https://{project_ref}.supabase.co/storage/v1/object/public/post-images/{path}
```

### 16.2 File Organization

Uploaded images are stored under a `posts/` prefix with a timestamp-random filename:
```
post-images/
└── posts/
    ├── 1711234567890-abc123def456.jpg
    ├── 1711234598123-xyz789ghi012.png
    └── ...
```

The timestamp prefix ensures files sort chronologically in the Supabase Storage browser.

### 16.3 Cleanup on Post Delete

When a post is deleted, its associated image should also be deleted from Storage. The `deletePost` flow:

1. Client calls `deleteImage(post.image_url)` from `upload-service.ts`
2. Then calls `deletePost(post.id)` from `posts-service.ts`

> **Important:** Always delete the image before the post. If you delete the post first and then the image deletion fails, you'll have an orphaned file in Storage. The reverse order means if image deletion fails, the post still exists and you can retry.

### 16.4 Image Size Limits

Supabase Storage has a default file size limit of 50MB per file on the free tier. Instagram's actual limit for uploaded images is 8MB. The upload service doesn't currently enforce a client-side size check — consider adding one:

```typescript
// Add to upload form handler:
if (file.size > 8 * 1024 * 1024) {
  throw new Error('Image must be under 8MB');
}
```

---

## 17. Netlify Deployment

### 17.1 netlify.toml Explained

```toml
[build]
  command = "npm run build"     # The build command Netlify runs
  publish = ".next"             # Where the build output is

[[plugins]]
  package = "@netlify/plugin-nextjs"  # Auto-converts Next.js to Netlify Functions
```

The `@netlify/plugin-nextjs` plugin is doing a lot of heavy lifting here:
- Converts Next.js API Routes to Netlify Functions
- Converts Server Components to on-demand Server-Side Rendering
- Handles static page generation
- Sets up proper caching headers

Without this plugin, you'd need to manually configure each API route as a Netlify Function — the plugin handles all of this automatically.

### 17.2 Step-by-Step Netlify Deployment

**Step 1: Push your code to GitHub**
```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

**Step 2: Create a new Netlify site**
1. Go to https://app.netlify.com
2. Click **Add new site** → **Import an existing project**
3. Connect to GitHub (authorize Netlify to access your repos)
4. Select your repository

**Step 3: Configure build settings**

Netlify should auto-detect these from `netlify.toml`, but verify:
- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Node version:** Set to 20 in Site settings → Build & deploy → Environment → NODE_VERSION = `20`

**Step 4: Add environment variables**

Go to **Site settings** → **Environment variables** → **Add a variable** for each:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
NEXTAUTH_URL          ← Use your Netlify URL: https://fantasydashboard01.netlify.app
NEXTAUTH_SECRET
ALLOWED_EMAIL
INSTAGRAM_APP_ID
INSTAGRAM_APP_SECRET
```

**Step 5: Deploy**

Click **Deploy site**. The first build takes 3-5 minutes.

Watch the build log. A successful build ends with:
```
Build script success
Site is live
```

**Step 6: Set your custom domain (optional)**

If you want a custom domain instead of the auto-generated `.netlify.app` URL:
1. Site settings → Domain management → Add custom domain
2. Follow the DNS configuration instructions for your domain registrar

### 17.3 Continuous Deployment

After the initial setup, every `git push` to the `main` branch automatically triggers a new Netlify build and deployment. No manual steps needed.

Branch deploys can be enabled for preview environments — useful if you're making significant changes you want to test before merging to main.

### 17.4 Netlify Function Logs

If API routes misbehave in production, check the function logs:
1. Go to your Netlify site
2. Click **Functions** tab
3. Click on a function name to see its logs
4. Filter by time range or search for error messages

Each Next.js API route becomes a separate Netlify Function. They're named after the route path, e.g., `api-instagram-callback`.

### 17.5 Build Caching

Netlify caches `node_modules` between builds to speed up deployments. If you're getting strange build errors after updating dependencies, clear the cache:
1. Site settings → Build & deploy → Build settings
2. Click **Clear cache and deploy site**

---

## 18. Troubleshooting Guide

This section covers every significant error encountered during the development and deployment of this project, along with how to resolve each one.

---

### 18.1 AUTH ERRORS

#### Error: `redirect_uri_mismatch` (Google OAuth)

**Symptom:** After clicking "Sign in with Google", you see a Google error page: "The redirect URI in the request did not match..."

**Cause:** The `NEXTAUTH_URL` environment variable doesn't match a URI registered in Google Cloud Console.

**Fix:**
1. Check your `NEXTAUTH_URL` (local: `http://localhost:3000`, production: your Netlify URL)
2. Go to Google Cloud Console → Credentials → your OAuth client
3. Verify the Authorized Redirect URIs include `{NEXTAUTH_URL}/api/auth/callback/google`
4. Make sure there's no trailing slash mismatch

---

#### Error: `AccessDenied` after Google sign-in

**Symptom:** You authenticate with Google successfully but are redirected to `/login?error=AccessDenied`

**Cause:** The email you signed in with doesn't match `ALLOWED_EMAIL`

**Fix:**
1. Check your `.env.local`: `ALLOWED_EMAIL=your@email.com`
2. Make sure it matches the Google account you're signing in with exactly (including case, though Google emails are case-insensitive)
3. Restart the dev server after changing env vars: `npm run dev`

---

#### Error: NextAuth session not persisting across reloads

**Symptom:** You sign in, but refreshing the page sends you back to login

**Cause:** Usually `NEXTAUTH_SECRET` is missing or the wrong value is set in production

**Fix:**
1. Make sure `NEXTAUTH_SECRET` is set in both `.env.local` and Netlify env vars
2. The secret must be the same between deployments (changing it invalidates all existing sessions)
3. Generate with `openssl rand -base64 32`

---

#### Error: NextAuth middleware crashes on Netlify

**Symptom:** Production site crashes immediately. Netlify function logs show: "Module not found: Can't resolve 'crypto'" or "Edge runtime does not support..."

**Cause:** Attempting to use `withAuth` from `next-auth/middleware` in `middleware.ts`. Netlify edge functions don't support the Node.js crypto module that NextAuth uses internally.

**Fix:** Move all auth logic out of `middleware.ts` into `app/(protected)/layout.tsx` (a regular Server Component, not an edge function). Keep `middleware.ts` minimal — just pass requests through or add simple headers.

```typescript
// middleware.ts — safe minimal version
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

---

### 18.2 INSTAGRAM API ERRORS

#### Error: `OAuthException: Invalid OAuth redirect_uri`

**Symptom:** Clicking "Connect Instagram" redirects to Facebook, then Facebook shows "Invalid redirect_uri"

**Cause:** The callback URL isn't registered in the Facebook App's OAuth redirect URIs

**Fix:**
1. Go to developers.facebook.com → Your App → Facebook Login → Settings
2. Add both:
   - `http://localhost:3000/api/instagram/callback`
   - `https://fantasydashboard01.netlify.app/api/instagram/callback`
3. Save changes (takes effect immediately, no app review needed)

---

#### Error: `OAuthException: (#10) Application does not have permission for this action`

**Symptom:** The OAuth flow completes but the callback fails when trying to fetch the Instagram account

**Cause:** The required permissions weren't requested in the OAuth scope, or the user didn't grant them

**Fix:** Check the scope parameter in `/api/instagram/connect`:
```typescript
const scope = [
  'instagram_basic',
  'instagram_manage_insights',
  'pages_show_list',
  'pages_read_engagement',
].join(',');
```

Make sure all four permissions are present. If you added them after the user already connected, they need to disconnect and reconnect to grant the new permissions.

---

#### Error: `No Instagram Business Account found`

**Symptom:** OAuth completes but Settings shows "Connection failed: No Instagram Business Account found"

**Cause:** The Instagram account isn't a Business/Creator account, or it isn't connected to a Facebook Page

**Fix:**
1. Verify the Instagram account is Business or Creator (Instagram → Settings → Account Type)
2. Verify it's connected to a Facebook Page (Facebook Page → Settings → Instagram)
3. Make sure you're signing into Facebook OAuth with the account that manages the connected Page

---

#### Error: Instagram access token expired

**Symptom:** Live Feed and follower count return errors. Supabase shows a token with `token_expires_at` in the past.

**Cause:** Long-lived Instagram tokens expire after 60 days

**Fix:**
1. Go to Settings → Disconnect Instagram
2. Click Connect Instagram
3. Re-authorize the app on Facebook
4. Token is refreshed and stored with a new 60-day expiry

> The roadmap includes automatic token refresh before expiry — see Section 19.

---

#### Error: `#200 Requires extended permission: instagram_manage_insights`

**Symptom:** Follower count returns an error even after successful connection

**Cause:** In some cases, Meta requires the `instagram_manage_insights` permission to be explicitly granted during the OAuth flow, and users sometimes don't see or click through the permission

**Fix:** Disconnect and reconnect. Make sure to click through ALL permission dialogs on Facebook's OAuth screen. If a permission screen appears asking about specific access, grant it.

---

### 18.3 SUPABASE ERRORS

#### Error: `new row violates row-level security policy for table "instagram_posts"`

**Symptom:** Creating or updating posts fails with an RLS violation

**Cause:** RLS was accidentally re-enabled on the table, or a new deployment reset the table configuration

**Fix:** Run in Supabase SQL Editor:
```sql
alter table instagram_posts disable row level security;
alter table instagram_connections disable row level security;
```

---

#### Error: `StorageApiError: The resource already exists`

**Symptom:** Image upload fails when trying to upload a file with the same name

**Cause:** The upload path collision (shouldn't happen with the timestamp-random filename strategy, but can happen if two uploads happen within the same millisecond)

**Fix:** The `uploadImage` function uses `upsert: false`. If you need to re-upload the same file, delete the old one first. In practice, the timestamp+random string in the filename makes collisions essentially impossible.

---

#### Error: `TypeError: supabaseServer is not a function` or `supabaseServer is undefined`

**Symptom:** API routes crash when trying to query `instagram_connections`

**Cause:** `lib/supabase-server.ts` was accidentally imported in a Client Component

**Fix:**
1. Check your imports — `supabase-server.ts` must only be imported in files without `"use client"` at the top
2. If you need to fetch `instagram_connections` data in a Client Component, create an API route that does the query server-side and fetch that route from the client

---

#### Error: Supabase data stale after update

**Symptom:** After creating or updating a post, the list doesn't reflect the change until page refresh

**Cause:** The post list is fetched with `useEffect` on component mount but not after mutations

**Fix:** After every create/update/delete operation, call the fetch function again:
```typescript
const handleCreatePost = async (postData) => {
  await createPost(postData);
  await fetchPosts();  // Re-fetch after mutation
};
```

---

### 18.4 BUILD & DEPLOYMENT ERRORS

#### Error: `Module not found: Can't resolve '@/components/ui/button'`

**Symptom:** Build fails with missing component imports

**Cause:** shadcn/ui components haven't been added yet

**Fix:**
```bash
npx shadcn@latest add button card badge input textarea select dialog tabs
```

---

#### Error: Netlify build fails with `next: command not found`

**Symptom:** Build log shows "sh: next: command not found"

**Cause:** `node_modules` isn't being installed, or `next` isn't in `package.json`

**Fix:**
1. Check that `package.json` includes `"next": "^16.2.1"` in dependencies
2. Try clearing Netlify cache: Site settings → Build & deploy → Clear cache and retry deploy

---

#### Error: `NEXTAUTH_URL` not set in production → broken OAuth redirects

**Symptom:** Sign-in works locally but fails in production

**Cause:** `NEXTAUTH_URL` is still set to `http://localhost:3000` in Netlify env vars, or not set at all

**Fix:** In Netlify → Site settings → Environment variables, set:
```
NEXTAUTH_URL = https://fantasydashboard01.netlify.app
```
Redeploy after adding the variable.

---

#### Error: `Error: No router instance found` on server-side page

**Symptom:** Build error or runtime error mentioning router

**Cause:** Using `useRouter()` from `next/navigation` in a Server Component (no `"use client"` directive)

**Fix:** Add `"use client"` at the top of the file, or move the router logic into a client component.

---

#### Error: TypeScript error `Property 'xxx' does not exist on type`

**Symptom:** TypeScript compilation fails with property errors on Instagram API response types

**Cause:** The Meta Graph API returns different field shapes depending on account type and permissions

**Fix:** Check `lib/instagram-types.ts` and make the relevant fields optional (`?`) or add them if missing:
```typescript
interface LiveInstagramPost {
  id: string;
  caption?: string;        // Optional — not all posts have captions
  media_url?: string;      // Optional — videos may only have thumbnail_url
  // ...
}
```

---

### 18.5 DEVELOPMENT SERVER ISSUES

#### Error: Port 3000 already in use

```bash
# Find what's using port 3000
lsof -ti:3000
# Kill it
kill -9 $(lsof -ti:3000)
# Or run on a different port
npm run dev -- -p 3001
```

---

#### Error: Environment variable changes not taking effect

**Symptom:** You updated `.env.local` but the app still uses old values

**Cause:** Next.js caches environment variables at server startup

**Fix:** Always restart the dev server after changing `.env.local`:
```bash
# Stop with Ctrl+C, then:
npm run dev
```

---

#### Error: Turbopack incremental build error

**Symptom:** Random TypeScript or module errors that go away on full restart

**Cause:** Turbopack's incremental cache is occasionally inconsistent with major file changes

**Fix:**
```bash
# Delete Turbopack cache and restart
rm -rf .next
npm run dev
```

---

## 19. What's Next — Roadmap

The following features represent logical next steps for the project, ordered roughly by priority and implementation complexity.

### 19.1 Automatic Instagram Token Refresh (High Priority)

**Problem:** Long-lived tokens expire after 60 days, requiring manual reconnection.

**Solution:** A Netlify Scheduled Function that runs weekly and refreshes tokens nearing expiry.

```typescript
// netlify/functions/refresh-tokens.ts (scheduled)
// Runs every Sunday via cron: "0 0 * * 0"

export default async function() {
  const supabase = createServiceClient();

  // Find connections expiring within 7 days
  const expiryThreshold = new Date();
  expiryThreshold.setDate(expiryThreshold.getDate() + 7);

  const { data: connections } = await supabase
    .from('instagram_connections')
    .select('*')
    .lt('token_expires_at', expiryThreshold.toISOString());

  for (const connection of connections) {
    // Call the token refresh endpoint
    const response = await fetch(
      `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${connection.access_token}`
    );
    const { access_token, expires_in } = await response.json();

    // Update in database
    await supabase
      .from('instagram_connections')
      .update({
        access_token,
        token_expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', connection.id);
  }
}
```

Add to `netlify.toml`:
```toml
[functions."refresh-tokens"]
  schedule = "0 0 * * 0"  # Every Sunday at midnight UTC
```

---

### 19.2 Real Analytics Data (Medium Priority)

**Problem:** Analytics charts currently use sample data. Full historical analytics require Meta App Review approval for `instagram_manage_insights`.

**Solution:** Submit the app for Meta App Review to get `instagram_manage_insights` approved.

Alternatively, without App Review:
- Use the `since` and `until` parameters on the media endpoint to pull 90-day post history
- Calculate approximate engagement rate from `like_count` / `followers_count`
- Store periodic snapshots in a `analytics_snapshots` Supabase table to build historical data over time

---

### 19.3 Real Competitor Data (Medium Priority)

**Problem:** Competitor stats are currently manual/mock data. The Meta Graph API doesn't allow reading competitor profiles.

**Solutions (in order of effort):**
1. **Manual entry** — the current approach; simple but requires manual updates
2. **Third-party social API** (Apify, PhantomBuster) — paid scrapers that can pull public Instagram stats; integrate their API
3. **Build a Puppeteer scraper** — more complex, requires a separate server, but free

For a personal dashboard, manual entry is often sufficient — you don't need real-time competitor data, just rough benchmarks updated monthly.

---

### 19.4 Actual Instagram Publishing (High Impact, High Effort)

**Problem:** Posts in the "Published" status are currently just marked as published in the database — they aren't actually posted to Instagram.

**Solution:** Use the Instagram Content Publishing API.

Instagram publishing via API works in two stages:
1. Create a media container: `POST /{ig-user-id}/media` with the image URL and caption
2. Publish the container: `POST /{ig-user-id}/media_publish` with the container ID

```typescript
// Pseudocode for publishing a post

async function publishToInstagram(post: InstagramPost, accessToken: string) {
  // Step 1: Create container
  const containerResponse = await fetch(
    `https://graph.facebook.com/v19.0/${igUserId}/media`,
    {
      method: 'POST',
      body: new URLSearchParams({
        image_url: post.image_url,
        caption: `${post.caption}\n\n${post.hashtags}`,
        access_token: accessToken,
      }),
    }
  );
  const { id: containerId } = await containerResponse.json();

  // Step 2: Publish
  const publishResponse = await fetch(
    `https://graph.facebook.com/v19.0/${igUserId}/media_publish`,
    {
      method: 'POST',
      body: new URLSearchParams({
        creation_id: containerId,
        access_token: accessToken,
      }),
    }
  );
  return publishResponse.json();
}
```

**Important limitations:**
- The image must be publicly accessible via URL (Supabase Storage public URLs work)
- Instagram enforces rate limits: 50 API-published posts per 24 hours
- Requires `instagram_content_publish` permission (needs Meta App Review)
- No scheduling — you publish at the time of the API call

For scheduling, implement a Netlify Scheduled Function that checks for posts with `status = 'scheduled'` and `scheduled_date <= now()` and publishes them.

---

### 19.5 Push Notifications (Low Priority)

Add browser push notifications for:
- Scheduled posts about to go live
- Token expiry reminders
- Engagement milestones (e.g., "You hit 1,000 followers!")

Implementation: Web Push API + Netlify Edge Functions as the push server.

---

### 19.6 Multi-Account Support (Major Refactor)

**Current state:** Single user, single Instagram account.

**To support multiple users:**
1. Re-enable RLS on all tables
2. Add user ID to all table rows
3. Write RLS policies scoped to `auth.uid()`
4. Switch to Supabase Auth instead of NextAuth (Supabase Auth integrates natively with RLS)
5. Update `instagram_connections` to support multiple accounts per user

This is a significant architectural change — plan for at least a week of work.

---

### 19.7 RSS Feed Integration for News

**Current state:** News articles are hardcoded mock data.

**Solution:** Fetch real RSS feeds from industry publications on the server:

```typescript
// In app/news/page.tsx (Server Component):
const feeds = [
  'https://socialmediaexaminer.com/feed/',
  'https://buffer.com/resources/feed/',
];

const articles = await Promise.all(feeds.map(fetchAndParseRSS));
```

Use `rss-parser` npm package to parse RSS feeds server-side and pass articles as props to the client component.

---

### 19.8 Export & Reporting

Add a data export feature:
- Export all posts as CSV
- Generate a monthly PDF report with analytics
- Share analytics report link (read-only, token-authenticated)

---

## 20. Quick Reference Cheat Sheet

For quick lookups without hunting through the full document.

### Dev Commands

```bash
# Start development server
npm run dev

# Build for production (test locally)
npm run build
npm run start

# Type check
npx tsc --noEmit

# Clear all caches and rebuild
rm -rf .next && npm run dev
```

### Key URLs

| Environment | URL |
|------------|-----|
| Local | http://localhost:3000 |
| Production | https://fantasydashboard01.netlify.app |
| Supabase Dashboard | https://supabase.com/dashboard |
| Google Cloud Console | https://console.cloud.google.com |
| Meta Developer Portal | https://developers.facebook.com |
| Netlify Dashboard | https://app.netlify.com |

### Environment Variable Quick Reference

| Variable | Where it comes from | Used in |
|---------|-------------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | Client + Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | Client + Server |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | Server only |
| `GOOGLE_CLIENT_ID` | Google Cloud Console → Credentials | Server (NextAuth) |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console → Credentials | Server (NextAuth) |
| `NEXTAUTH_URL` | Your app URL | Server (NextAuth) |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | Server (NextAuth) |
| `ALLOWED_EMAIL` | Your email address | Server (NextAuth) |
| `INSTAGRAM_APP_ID` | Meta Developer App → Settings → Basic | Server (Instagram OAuth) |
| `INSTAGRAM_APP_SECRET` | Meta Developer App → Settings → Basic | Server (Instagram OAuth) |

### Supabase Table Quick Reference

**instagram_posts**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Auto-generated primary key |
| caption | text | Required |
| hashtags | text | Default empty string |
| post_type | text | photo, video, carousel, reel, story |
| status | text | draft, scheduled, published |
| image_url | text | Nullable, public Supabase Storage URL |
| scheduled_date | timestamptz | Nullable |
| published_date | timestamptz | Nullable |
| created_at | timestamptz | Auto-set |
| updated_at | timestamptz | Update manually on each write |

**instagram_connections**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Auto-generated primary key |
| user_email | text | Unique constraint — one account per user |
| ig_user_id | text | Instagram Business Account ID |
| username | text | Instagram username |
| access_token | text | Long-lived token (60-day expiry) |
| token_expires_at | timestamptz | Nullable — track expiry for refresh |
| profile_picture_url | text | Nullable |
| followers_count | integer | Default 0 |
| media_count | integer | Default 0 |
| biography | text | Nullable |
| website | text | Nullable |
| updated_at | timestamptz | Update on each upsert |
| created_at | timestamptz | Auto-set |

### Instagram API Endpoints Used

| Endpoint | Method | Purpose |
|---------|--------|---------|
| `https://www.facebook.com/dialog/oauth` | GET (browser redirect) | Start OAuth flow |
| `https://graph.facebook.com/v19.0/oauth/access_token` | GET | Exchange code for token |
| `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token` | GET | Extend to long-lived token |
| `https://graph.facebook.com/v19.0/me/accounts` | GET | List user's Facebook Pages |
| `https://graph.facebook.com/v19.0/{page_id}?fields=instagram_business_account` | GET | Find connected Instagram account |
| `https://graph.facebook.com/v19.0/{ig_user_id}?fields=username,followers_count,...` | GET | Fetch profile data |
| `https://graph.facebook.com/v19.0/{ig_user_id}/media?fields=...` | GET | Fetch media posts |

### Common Errors at a Glance

| Error | Most Likely Cause | Quick Fix |
|-------|-----------------|-----------|
| `redirect_uri_mismatch` | NEXTAUTH_URL mismatch | Check env var + Google Console URIs |
| `AccessDenied` | Wrong email signed in | Check ALLOWED_EMAIL env var |
| `No Instagram Business Account` | Account not Business type or not linked to Page | Convert account type, link to FB Page |
| Token expired | 60 days since last connection | Disconnect + reconnect on Settings page |
| RLS violation | RLS re-enabled | Run `alter table disable row level security` |
| Netlify crash (crypto) | Auth in middleware | Move auth to (protected)/layout.tsx |
| Build: missing shadcn component | Component not added | `npx shadcn@latest add {component}` |

---

*This playbook was written against the state of the project as of March 2026. Framework versions, API endpoint formats, and third-party service UIs change over time — if you encounter discrepancies, check the official documentation for Next.js, Supabase, Meta Graph API, and NextAuth.*
