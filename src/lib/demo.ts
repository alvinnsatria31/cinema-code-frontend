/**
 * Demo mode switch + local fallback engine.
 * DEMO_MODE is now FALSE: pages fetch live data from the Express API
 * (lib/api.ts) using the session's database user id. Everything below
 * stays as the offline fallback — if the API is unreachable or nobody
 * is signed in, the studio still works from static data + localStorage
 * instead of going dark.
 */
import type { CourseProgress, DemoContent } from "@/types";

export const DEMO_MODE = false;

// v2: content ids changed when the curriculum was aligned to the WPU playlist
const PROGRESS_KEY = "cc-demo-progress-v2";

/** Content ids completed locally (on top of the mock course defaults). */
export function storedCompletions(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

export function markDemoComplete(contentId: string): Set<string> {
  const done = storedCompletions();
  done.add(contentId);
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...done]));
  return done;
}

/** Union of the mock defaults and everything completed this session. */
export function allCompletedIds(course: CourseProgress): Set<string> {
  const done = storedCompletions();
  for (const mod of course.modules) {
    for (const c of mod.contents) if (c.isCompleted) done.add(c.id);
  }
  return done;
}

/** Overlay localStorage completions onto the static course and recount. */
export function applyDemoProgress(course: CourseProgress): CourseProgress {
  const done = allCompletedIds(course);
  let completed = 0;

  const modules = course.modules.map((mod) => ({
    ...mod,
    contents: mod.contents.map((c) => {
      const isCompleted = done.has(c.id);
      if (isCompleted) completed += 1;
      return { ...c, isCompleted };
    }),
  }));

  return {
    ...course,
    modules,
    completedContents: completed,
    percent: Math.round((completed / course.totalContents) * 100),
  };
}

// ── Local validation (mirrors the server's Tier-1 engine) ────

function normalize(code: string): string {
  return code.replace(/\s+/g, " ").replace(/>\s+</g, "><").trim().toLowerCase();
}

export function localValidate(
  userCode: string,
  content: DemoContent,
): { passed: boolean; hint: string } {
  for (const rule of content.rules ?? []) {
    let regex: RegExp;
    try {
      regex = new RegExp(rule.pattern, rule.flags ?? "i");
    } catch {
      continue;
    }
    if (!regex.test(userCode)) return { passed: false, hint: rule.hint };
  }

  // Strict challenges also compare the normalized final markup
  if (content.strict && content.expected) {
    if (normalize(userCode) !== normalize(content.expected)) {
      return {
        passed: false,
        hint: "So close — the structure is all there, but one small detail differs from the brief. Read the challenge line once more, slowly, like reading lyrics.",
      };
    }
  }

  return {
    passed: true,
    hint: "That's it — clean take, first listen. Track complete!",
  };
}

/** Canned Echo replies for "Ask AI Mentor" while offline. */
const OFFLINE_MENTOR_LINES = [
  "I'm in offline mode tonight, so here's my studio trick: read your code out loud, tag by tag — an opening note for every closing note. The off-beat usually shows itself.",
  "No cloud tonight, just us. Compare your code with the challenge line word by word, like checking lyrics against the record sleeve. You're closer than you think.",
  "Working unplugged! Check three things: is every tag opened, is every tag closed, and is the text between them exactly what the brief asked for? One of those three is your answer.",
];

let mentorLineIndex = 0;
export function offlineMentorReply(): string {
  const line = OFFLINE_MENTOR_LINES[mentorLineIndex % OFFLINE_MENTOR_LINES.length];
  mentorLineIndex += 1;
  return line;
}
