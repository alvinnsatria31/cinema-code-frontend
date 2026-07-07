/**
 * Static demo data — the app runs entirely from this file in demo mode.
 *
 * The curriculum is defined once in MODULE_DEFS (aligned to the WPU /
 * Web Programming UNPAS "HTML Dasar" playlist by Pak Sandhika Galih,
 * followed by the CSS and JavaScript tracks), and everything else —
 * dashboard course, workspace contents, reward boundaries — is derived
 * from it so the three can never drift apart.
 *
 * NOTE: videoUrl fields are placeholders. Paste the real WPU YouTube
 * video IDs (and adjust any episode titles) when wiring the playlist.
 */
import type {
  ClientRule,
  ContentType,
  CourseProgress,
  DemoContent,
} from "@/types";

export const STUDENT_NAME = "Andin";

// ── Definitions ──────────────────────────────────────────────

interface ChallengeDef {
  prompt: string;
  starter: string;
  expected?: string;
  strict?: boolean;
  rules: ClientRule[];
}

interface TrackDef {
  id: string;
  title: string;
  type: ContentType;
  /** completed by default, so the demo dashboard feels lived-in */
  completed?: boolean;
  xp?: number;
  videoUrl?: string;
  challenge?: ChallengeDef;
}

interface ModuleDef {
  id: string;
  title: string;
  tracks: TrackDef[];
}

// ── Challenge payloads ───────────────────────────────────────

const CHALLENGES: Record<string, ChallengeDef> = {
  heading: {
    prompt: "Write a main heading that says: Hello, World! Use the <h1> tag.",
    starter: "<!-- Write your heading below -->\n",
    expected: "<h1>Hello, World!</h1>",
    strict: true,
    rules: [
      { pattern: "<h1[^>]*>", flags: "i", hint: "Every song needs an opening note — start with an <h1> tag." },
      { pattern: "</h1>", flags: "i", hint: "You opened the verse but never closed it — add </h1> at the end." },
      { pattern: "hello,?\\s*world", flags: "i", hint: "The tag looks great — now put the lyrics inside: 'Hello, World!' goes between the tags." },
    ],
  },
  list: {
    prompt: "Create an unordered list with two items: HTML and CSS. Use <ul> and <li> tags.",
    starter: "<!-- Build your list below -->\n",
    rules: [
      { pattern: "<ul[^>]*>", flags: "i", hint: "A tracklist needs its sleeve — wrap everything in a <ul> tag first." },
      { pattern: "<li[^>]*>", flags: "i", hint: "Each song on the list is an <li> — add your first list item." },
      { pattern: "</li>", flags: "i", hint: "Close each track with </li> so the list knows where one song ends." },
      { pattern: "</ul>", flags: "i", hint: "Almost — close the sleeve with </ul> at the very end." },
    ],
  },
  hyperlink: {
    prompt: 'Make a link to WPU\'s channel: an <a> tag with href="https://youtube.com/@sandhikagalihWPU" and the text "WPU".',
    starter: "<!-- Your first hyperlink below -->\n",
    rules: [
      { pattern: "<a[\\s>]", flags: "i", hint: "A link starts with an <a> tag — the anchor that holds the whole thing." },
      { pattern: "href\\s*=", flags: "i", hint: "Tell the link where to go — add an href attribute inside the opening tag." },
      { pattern: "</a>", flags: "i", hint: "Close the anchor with </a> after the link text." },
    ],
  },
  image: {
    prompt: 'Add an image: an <img> tag with a src attribute and an alt attribute (e.g. alt="album cover").',
    starter: "<!-- Place your image below -->\n",
    rules: [
      { pattern: "<img[\\s>]", flags: "i", hint: "Pictures come in through the <img> tag — start there." },
      { pattern: "src\\s*=", flags: "i", hint: "The src attribute is the record sleeve address — where the image lives." },
      { pattern: "alt\\s*=", flags: "i", hint: "Add an alt attribute — it's the lyric sheet for anyone who can't see the artwork." },
    ],
  },
  cssColor: {
    prompt: 'Make a blue heading: give an <h1> a style attribute with color: blue. Try: <h1 style="color: blue">Blue Hour</h1>',
    starter: "<!-- Paint it blue below -->\n",
    rules: [
      { pattern: "<h1[^>]*>", flags: "i", hint: "Start with the heading itself — an <h1> tag." },
      { pattern: "style\\s*=", flags: "i", hint: 'Inline styling lives in a style attribute — add style="..." inside the opening tag.' },
      { pattern: "color\\s*:", flags: "i", hint: "Inside the style, set the color property — like color: blue." },
      { pattern: "</h1>", flags: "i", hint: "Close the heading with </h1>." },
    ],
  },
  cssBlock: {
    prompt: "Write a <style> block that gives the body a black background (background: black).",
    starter: "<!-- Set the mood below -->\n",
    rules: [
      { pattern: "<style[^>]*>", flags: "i", hint: "CSS lives inside a <style> tag — open one first." },
      { pattern: "body", flags: "i", hint: "Tell CSS who you're styling — target the body selector." },
      { pattern: "background", flags: "i", hint: "Now set the background property — background: black." },
      { pattern: "</style>", flags: "i", hint: "Close the mixing booth with </style>." },
    ],
  },
  jsVariable: {
    prompt: 'Inside a <script> tag, declare a variable named song with the value "Malibu Nights".',
    starter: "<script>\n  // your variable here\n</script>",
    rules: [
      { pattern: "<script[^>]*>", flags: "i", hint: "JavaScript plays inside a <script> tag — make sure it's there." },
      { pattern: "\\b(let|const|var)\\b", flags: "i", hint: "Declare the variable with let or const — that's how JS learns a new name." },
      { pattern: "song", flags: "i", hint: "Name the variable song — exactly that." },
      { pattern: "malibu nights", flags: "i", hint: 'Give it the value "Malibu Nights" — quotes included.' },
    ],
  },
  jsButton: {
    prompt: "Create a <button> with an onclick that calls alert('ILYSB'). Click it in the preview!",
    starter: "<!-- Your first interactive element -->\n",
    rules: [
      { pattern: "<button[^>]*>", flags: "i", hint: "Start with a <button> tag — the crowd needs something to press." },
      { pattern: "onclick\\s*=", flags: "i", hint: "Wire it up with an onclick attribute inside the opening tag." },
      { pattern: "alert\\s*\\(", flags: "i", hint: "Make it speak — call alert('ILYSB') inside the onclick." },
      { pattern: "</button>", flags: "i", hint: "Close the button with </button>." },
    ],
  },
};

// ── The curriculum ───────────────────────────────────────────

const video = (
  id: string,
  title: string,
  youtubeId: string,
  completed = false,
): TrackDef => ({
  id,
  title,
  type: "VIDEO",
  completed,
  videoUrl: youtubeId, // bare YouTube id — CinemaPanel builds the embed URL
});

const challenge = (id: string, title: string, def: ChallengeDef): TrackDef => ({
  id,
  title,
  type: "CHALLENGE",
  xp: 15,
  challenge: def,
});

const MODULE_DEFS: ModuleDef[] = [
  {
    id: "m-html",
    title: "Side A — HTML Dasar (WPU)",
    tracks: [
      // Real WPU "HTML Dasar" playlist — 13 episodes, official video ids.
      video("html-01", "HTML Dasar : Pendahuluan HTML (1/13)", "NBZ9Ro6UKV8", true),
      video("html-02", "HTML Dasar : Hello World! (2/13)", "1NicaVOCXHA", true),
      video("html-03", "HTML Dasar : Code Editor (3/13)", "3sLSi9L5nWE", true),
      video("html-04", "HTML Dasar : Tag (4/13)", "cUWBYzA6M-8"),
      video("html-05", "HTML Dasar : Paragraf (5/13)", "Dl_bIYBc9gM"),
      video("html-06", "HTML Dasar : Heading (6/13)", "SMetRBdIh-8"),
      challenge("html-ch-heading", "Challenge — Your First Heading", CHALLENGES.heading),
      video("html-07", "HTML Dasar : List (7/13)", "gLHEoeupIZs"),
      challenge("html-ch-list", "Challenge — Build a Tracklist", CHALLENGES.list),
      video("html-08", "HTML Dasar : Hyperlink (8/13)", "QIlBOI-hTuA"),
      challenge("html-ch-link", "Challenge — Link to WPU", CHALLENGES.hyperlink),
      video("html-09", "HTML Dasar : Image (9/13)", "yb_emYhY3Pc"),
      challenge("html-ch-image", "Challenge — Add the Album Art", CHALLENGES.image),
      video("html-10", "HTML Dasar : Table (10/13)", "7-QNafrXigs"),
      video("html-11", "HTML Dasar : Table Merging (11/13)", "qs8G2XWf7Yk"),
      video("html-12", "HTML Dasar : Form (12/13)", "LQf_Jj7jbCI"),
      video("html-13", "HTML Dasar : Form (lanjutan) (13/13)", "_CNkLKU-LoE"),
    ],
  },
  {
    id: "m-css",
    title: "Side B — CSS Dasar (WPU)",
    tracks: [
      // Real WPU "CSS Dasar" playlist — 10 episodes, official video ids.
      video("css-01", "CSS Dasar - 1 - Pendahuluan", "CleFk3BZB3g"),
      video("css-02", "CSS Dasar - 2 - Anatomi CSS", "8lXDi2Mxp9c"),
      video("css-03", "CSS Dasar - 3 - Penempatan CSS", "bnnislprJro"),
      video("css-04", "CSS Dasar - 4 - Font Styling", "nPHed3_oPvY"),
      video("css-05", "CSS Dasar - 5 - Text Styling", "xih8giA7S3Q"),
      challenge("css-ch-color", "Challenge — Paint It Blue", CHALLENGES.cssColor),
      video("css-06", "CSS Dasar - 6 - Background", "zm-HPYS_ELU"),
      challenge("css-ch-block", "Challenge — Set the Mood", CHALLENGES.cssBlock),
      video("css-07", "CSS Dasar - 7 - Selector", "0KLwWyQyMQo"),
      video("css-08", "CSS Dasar - 8 - Pseudo Class", "G0gYWdIHOug"),
      video("css-09", "CSS Dasar - 9 - Inheritance", "kY2FEA3y43E"),
      video("css-10", "CSS Dasar - 10 - Specificity", "yu74Y1ndd5w"),
    ],
  },
];

// ── Derived exports (course, contents, reward boundaries) ────

function buildCourse(defs: ModuleDef[]): CourseProgress {
  let total = 0;
  let completed = 0;

  const modules = defs.map((mod, mIndex) => ({
    id: mod.id,
    title: mod.title,
    order: mIndex + 1,
    contents: mod.tracks.map((t, tIndex) => {
      total += 1;
      if (t.completed) completed += 1;
      return {
        id: t.id,
        title: t.title,
        type: t.type,
        order: tIndex + 1,
        xpReward: t.xp ?? 10,
        isCompleted: t.completed ?? false,
        completedAt: null,
      };
    }),
  }));

  return {
    id: "mock-course",
    slug: "web-foundations",
    title: "Web Foundations — HTML, CSS & JavaScript",
    modules,
    totalContents: total,
    completedContents: completed,
    percent: Math.round((completed / total) * 100),
  };
}

function buildContents(defs: ModuleDef[]): Record<string, DemoContent> {
  const out: Record<string, DemoContent> = {};
  for (const mod of defs) {
    for (const t of mod.tracks) {
      out[t.id] = {
        id: t.id,
        type: t.type,
        title: t.title,
        videoUrl: t.videoUrl,
        challengePrompt: t.challenge?.prompt,
        starterCode: t.challenge?.starter,
        expected: t.challenge?.expected,
        strict: t.challenge?.strict,
        rules: t.challenge?.rules,
      };
    }
  }
  return out;
}

export const MOCK_COURSE: CourseProgress = buildCourse(MODULE_DEFS);
export const DEMO_CONTENTS: Record<string, DemoContent> = buildContents(MODULE_DEFS);

/** Completing every one of these unlocks the HTML milestone collectible. */
export const HTML_TRACK_IDS: string[] = MODULE_DEFS[0].tracks.map((t) => t.id);
export const ALL_CONTENT_IDS: string[] = MODULE_DEFS.flatMap((m) =>
  m.tracks.map((t) => t.id),
);

/** Fallback for unknown ids so deep links never break in demo mode. */
export const FALLBACK_CONTENT: DemoContent = DEMO_CONTENTS["html-ch-heading"];

// ── Dashboard categories (the accordion) ─────────────────────
// "available" categories link to a real module above; "coming-soon" and
// "locked" are roadmap placeholders with no tracks yet.

export type CategoryState = "available" | "coming-soon" | "locked";

export interface LearningCategory {
  id: string;
  index: number;
  title: string;
  subtitle: string;
  state: CategoryState;
  /** links to a MOCK_COURSE module when state is "available" */
  moduleId?: string;
  /** message shown when expanded but not yet available */
  note?: string;
}

export const LEARNING_CATEGORIES: LearningCategory[] = [
  {
    id: "cat-html",
    index: 1,
    title: "HTML Dasar",
    subtitle: "Full 13 videos compiled from WPU",
    state: "available",
    moduleId: "m-html",
  },
  {
    id: "cat-css",
    index: 2,
    title: "CSS Dasar",
    subtitle: "10 tracks · styling foundations",
    state: "available",
    moduleId: "m-css",
  },
  {
    id: "cat-css-layout",
    index: 3,
    title: "CSS Layouting",
    subtitle: "flexbox, grid & responsive design",
    state: "coming-soon",
    note: "✦ Coming Soon — Paul is curating the best track for you",
  },
  {
    id: "cat-js",
    index: 4,
    title: "JavaScript Dasar",
    subtitle: "logic, variables & interactivity",
    state: "coming-soon",
    note: "✦ Coming Soon — Paul is curating the best track for you",
  },
  {
    id: "cat-tailwind",
    index: 5,
    title: "Tailwind CSS",
    subtitle: "utility-first styling at speed",
    state: "locked",
    note: "Locked — unlocks after JavaScript Dasar",
  },
  {
    id: "cat-json-api",
    index: 6,
    title: "JSON & Web API",
    subtitle: "fetching and shaping real data",
    state: "locked",
    note: "Locked — unlocks after Tailwind CSS",
  },
  {
    id: "cat-nextjs",
    index: 7,
    title: "Next.js Foundations",
    subtitle: "the framework this studio is built on",
    state: "locked",
    note: "Locked — the final chapter of the journey",
  },
];

// ==========================================
// [PASTE YOUR CUSTOM VIDEO LIST / METADATA HERE]
// ==========================================
// Drop your own raw video rows or token items into this array. The index
// signature keeps it permissive, so any extra fields you paste are kept.
export interface CustomVideoItem {
  id: string;
  title: string;
  videoUrl?: string;
  [key: string]: unknown;
}

export const CUSTOM_VIDEO_METADATA: CustomVideoItem[] = [
  // { id: "custom-01", title: "My Track", videoUrl: "https://youtu.be/..." },
];
