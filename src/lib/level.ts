/**
 * Code Level progression — XP earned from daily puzzles (and anything
 * else that calls addXp), stored in localStorage. 100 XP per level.
 */

const XP_KEY = "cc-xp-v1";
const PUZZLE_DONE_KEY = "cc-puzzle-done";

export const XP_PER_LEVEL = 100;
export const PUZZLE_XP = 30;

export function getXp(): number {
  if (typeof window === "undefined") return 0;
  const raw = Number(localStorage.getItem(XP_KEY) ?? "0");
  return Number.isFinite(raw) && raw >= 0 ? raw : 0;
}

export function addXp(amount: number): number {
  const next = getXp() + amount;
  localStorage.setItem(XP_KEY, String(next));
  return next;
}

export interface LevelInfo {
  level: number;
  title: string; // e.g. "Level 4 Developer"
  xp: number;
  intoLevel: number; //  xp inside the current level (0..99)
  toNext: number; //     xp still needed for the next level
  ratio: number; //      0..1 fill for the level bar
}

export function levelInfo(xp: number = getXp()): LevelInfo {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const intoLevel = xp % XP_PER_LEVEL;
  return {
    level,
    title: `Level ${level} Developer`,
    xp,
    intoLevel,
    toNext: XP_PER_LEVEL - intoLevel,
    ratio: intoLevel / XP_PER_LEVEL,
  };
}

// ── Daily puzzle gating (one XP drop per calendar day) ───────

function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isPuzzleSolvedToday(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PUZZLE_DONE_KEY) === todayStamp();
}

export function markPuzzleSolvedToday(): void {
  localStorage.setItem(PUZZLE_DONE_KEY, todayStamp());
}
