export type PostType = "photo" | "carousel" | "reel" | "story";
export type PostStatus = "scheduled" | "draft" | "published" | "backlog";

export interface InstagramPost {
  id: string;
  caption: string;
  hashtags: string;
  postType: PostType;
  status: PostStatus;
  scheduledDate?: string; // ISO string, used when status === "scheduled"
  publishedDate?: string; // ISO string, used when status === "published"
  createdAt: string;
}

export const POST_TYPE_LABELS: Record<PostType, string> = {
  photo: "Photo",
  carousel: "Carousel",
  reel: "Reel",
  story: "Story",
};

export const POST_TYPE_COLORS: Record<PostType, string> = {
  photo:    "bg-blue-500/15 text-blue-400 border-blue-500/20",
  carousel: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  reel:     "bg-pink-500/15 text-pink-400 border-pink-500/20",
  story:    "bg-amber-500/15 text-amber-400 border-amber-500/20",
};

export const POST_TYPE_ACCENT: Record<PostType, string> = {
  photo:    "from-blue-600 to-blue-400",
  carousel: "from-purple-600 to-purple-400",
  reel:     "from-pink-600 to-rose-400",
  story:    "from-amber-500 to-orange-400",
};

export const STATUS_COLORS: Record<PostStatus, string> = {
  scheduled: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  draft:     "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
  published: "bg-sky-500/15 text-sky-400 border-sky-500/20",
  backlog:   "bg-orange-500/15 text-orange-400 border-orange-500/20",
};

export const INITIAL_POSTS: InstagramPost[] = [
  {
    id: "1",
    caption: "Golden hour magic from last weekend's shoot. The light was absolutely unreal — couldn't have asked for a better evening. ✨",
    hashtags: "#goldenhour #photography #sunset #naturephotography",
    postType: "photo",
    status: "scheduled",
    scheduledDate: "2026-03-28T18:00",
    createdAt: "2026-03-20T10:00",
  },
  {
    id: "2",
    caption: "Behind the scenes of our latest campaign! Swipe to see how we brought this concept to life from mood board to final shot. 📸",
    hashtags: "#behindthescenes #contentcreation #campaign #creative",
    postType: "carousel",
    status: "scheduled",
    scheduledDate: "2026-03-30T12:00",
    createdAt: "2026-03-21T14:30",
  },
  {
    id: "3",
    caption: "POV: you finally nailed the transition ✨ Drop a 🔥 if you want a tutorial on this one.",
    hashtags: "#reels #transition #tutorial #trending",
    postType: "reel",
    status: "scheduled",
    scheduledDate: "2026-04-01T09:00",
    createdAt: "2026-03-22T09:15",
  },
  {
    id: "4",
    caption: "Working on something big... stay tuned 👀 Not sure about this angle yet — need to revisit.",
    hashtags: "#comingsoon #tease #brand",
    postType: "photo",
    status: "draft",
    createdAt: "2026-03-23T11:00",
  },
  {
    id: "5",
    caption: "Q&A time! Drop your questions below — answering the top ones in my next reel. Ask me anything about content creation, brand strategy, or life behind the lens.",
    hashtags: "#qanda #contentcreator #brandstrategy #askmeanything",
    postType: "carousel",
    status: "draft",
    createdAt: "2026-03-24T16:00",
  },
  {
    id: "6",
    caption: "Caption TBD — still brainstorming. Visual direction: bright, airy, minimal.",
    hashtags: "",
    postType: "story",
    status: "draft",
    createdAt: "2026-03-25T08:45",
  },
  {
    id: "7",
    caption: "Starting the week right ☀️ What's everyone manifesting this week? Tell me in the comments.",
    hashtags: "#mondaymotivation #manifestation #goodvibes #weeklygoals",
    postType: "photo",
    status: "published",
    publishedDate: "2026-03-24T09:00",
    createdAt: "2026-03-23T20:00",
  },
  {
    id: "8",
    caption: "5 tools I actually use to grow my account organically 👇 No paid ads, just strategy.",
    hashtags: "#growthhacks #organicgrowth #socialmediatips #contentcreator",
    postType: "carousel",
    status: "published",
    publishedDate: "2026-03-22T14:00",
    createdAt: "2026-03-21T18:00",
  },
  {
    id: "9",
    caption: "This one still hits different 🎞️",
    hashtags: "#reel #cinematic #mood #filmgrain",
    postType: "reel",
    status: "published",
    publishedDate: "2026-03-20T18:30",
    createdAt: "2026-03-19T12:00",
  },
  {
    id: "10",
    caption: "Idea: 'A day in my creative process' — full behind-the-scenes from ideation to posting. Could be a long-form reel or multi-part series.",
    hashtags: "#behindthescenes #dayinmylife #creativeprocess",
    postType: "reel",
    status: "backlog",
    createdAt: "2026-03-15T10:00",
  },
  {
    id: "11",
    caption: "Collaboration concept with a local coffee brand — aesthetics align perfectly. Need to reach out first before committing to post.",
    hashtags: "#collab #coffeephotography #brandpartnership",
    postType: "photo",
    status: "backlog",
    createdAt: "2026-03-12T14:00",
  },
  {
    id: "12",
    caption: "Seasonal content idea: spring refresh flat lay with the new product line. Hold until April launch.",
    hashtags: "#springaesthetic #flatlay #productphotography #launch",
    postType: "carousel",
    status: "backlog",
    createdAt: "2026-03-10T09:00",
  },
];
