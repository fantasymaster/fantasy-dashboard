# Content Dashboard - CLAUDE.md

Project documentation for AI assistants and developers working on this codebase.

## Tech Stack

| Layer | Choice | Version | Notes |
|-------|--------|---------|-------|
| Framework | Next.js (App Router) | 15.x | Uses `app/` directory, RSC by default |
| Language | TypeScript | 5.x | Strict mode enabled |
| Styling | Tailwind CSS | v4 | CSS-based config (no `tailwind.config.ts`) |
| Component Library | shadcn/ui | Latest (nova style) | CSS variables, Tailwind v4 compatible |
| Icons | lucide-react | Latest | Bundled with shadcn/ui |
| Font | Geist / Geist Mono | via next/font | Google Fonts via Next.js optimization |

## Folder Structure

```
content-dashboard/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout: dark class, sidebar, TooltipProvider
│   ├── page.tsx                # Dashboard overview with section cards
│   ├── globals.css             # Tailwind v4 imports + shadcn CSS variables
│   ├── instagram/page.tsx      # Instagram Manager section
│   ├── analytics/page.tsx      # Analytics section
│   ├── calendar/page.tsx       # Content Calendar section
│   ├── competitors/page.tsx    # Competitor Tracker section
│   └── news/page.tsx           # News Consolidator section
├── components/
│   ├── sidebar.tsx             # Shared sidebar navigation (client component)
│   └── ui/                     # shadcn/ui auto-generated components
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── scroll-area.tsx
│       ├── separator.tsx
│       └── tooltip.tsx
├── lib/
│   └── utils.ts                # cn() utility (clsx + tailwind-merge)
├── components.json             # shadcn/ui configuration
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Component Conventions

### Naming
- Page components: default export, named `<SectionName>Page` (e.g., `InstagramPage`)
- Shared components: named exports, PascalCase (e.g., `Sidebar`)
- shadcn/ui components: live in `components/ui/`, never edited directly

### File placement
- Route-specific components: co-locate inside the route folder or in `components/` if shared
- All reusable UI pieces: `components/` at root level
- shadcn components: always `components/ui/` (auto-managed by shadcn CLI)

### Client vs Server Components
- Default to Server Components (no `"use client"` directive)
- Add `"use client"` only when using hooks (`useState`, `usePathname`, etc.) or browser APIs
- The `Sidebar` component is a client component because it uses `usePathname`

## shadcn/ui Usage Patterns

### Adding new components
```bash
npx shadcn@latest add <component-name>
```

### Using the cn() utility
Always use `cn()` from `@/lib/utils` for conditional class merging:
```tsx
import { cn } from "@/lib/utils";

<div className={cn("base-classes", condition && "conditional-class", props.className)} />
```

### Current components installed
- `button` - Primary actions
- `badge` - Labels and status indicators
- `card` / `card-header` / `card-title` / `card-description` / `card-content` - Content containers
- `scroll-area` - Scrollable regions with custom scrollbars
- `separator` - Visual dividers
- `tooltip` - Hover hints (requires `TooltipProvider` in layout)

### TooltipProvider
`TooltipProvider` is already wrapped in `app/layout.tsx`. Do not add it again in child components.

## Dark Theme Approach

The app uses a **forced dark theme** - the `dark` class is set directly on the `<html>` element in `app/layout.tsx`. There is no light/dark toggle.

### How it works (Tailwind v4 + shadcn)
- `globals.css` defines CSS variables for both `:root` (light) and `.dark` (dark)
- The `.dark` class on `<html>` activates the dark CSS variables globally
- All shadcn components automatically use the correct dark values via `var(--background)`, `var(--foreground)`, etc.

### Key CSS variables in dark mode
```css
--background: oklch(0.145 0 0);        /* Near-black page background */
--foreground: oklch(0.985 0 0);        /* Near-white text */
--card: oklch(0.205 0 0);              /* Slightly lighter card backgrounds */
--muted: oklch(0.269 0 0);             /* Muted backgrounds */
--muted-foreground: oklch(0.708 0 0);  /* Secondary text */
--border: oklch(1 0 0 / 10%);          /* Subtle borders */
--accent: oklch(0.269 0 0);            /* Hover/active states */
```

### Sidebar background
The sidebar uses `bg-zinc-950` which is slightly darker than the main `bg-background` to create visual separation without a harsh border.

### Inline accent colors
Section pages use custom accent colors (e.g., `bg-blue-600/20`, `text-blue-400`) for their icon containers. These are intentionally translucent so they work in dark mode without needing separate dark: variants.

## Adding New Sections

1. Create the route directory and page:
   ```bash
   mkdir app/<section-name>
   touch app/<section-name>/page.tsx
   ```

2. Add the nav item to `components/sidebar.tsx`:
   ```tsx
   import { YourIcon } from "lucide-react";

   const navItems = [
     // ... existing items
     {
       label: "Your Section",
       href: "/<section-name>",
       icon: YourIcon,
     },
   ];
   ```

3. Add a card to `app/page.tsx` in the `sections` array.

4. Follow the page template pattern:
   - Header with colored icon container, title, description, and "Coming Soon" badge
   - Main content area (empty state CTA or data placeholder)
   - Features grid at the bottom showing planned functionality

## Running the Project

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

## Notes for AI Assistants

- This project uses Tailwind CSS v4 — there is **no** `tailwind.config.ts`. Customization goes in `globals.css` under `@theme inline`.
- shadcn uses the `nova` style variant (set in `components.json`).
- The `darkMode: ["class"]` config is handled automatically by Tailwind v4's `@custom-variant dark` in `globals.css`.
- Do not add a `tailwind.config.ts` — it will conflict with the v4 setup.
- All pages are Server Components by default. Only add `"use client"` when strictly necessary.
