/**
 * "Paul's Reward" system — a tiered progression track.
 *
 * The daily streak badge rewards showing up; the four cassette tiers
 * (Bronze → Silver → Gold → Diamond) reward cumulative tracks completed,
 * culminating in the Diamond graduate certificate. Everything is awarded
 * locally and persisted in localStorage.
 */
import { ALL_CONTENT_IDS } from "./mock-data";

export type RewardId =
  | "streak-midnight-driver"
  | "tier-bronze"
  | "tier-silver"
  | "tier-gold"
  | "tier-diamond";

export type RewardKind = "badge" | "collectible" | "certificate";
export type RewardTier = "bronze" | "silver" | "gold" | "diamond";

export interface Reward {
  id: RewardId;
  kind: RewardKind; // controls which artwork renders
  tier?: RewardTier; // metallic accent + ordering
  name: string;
  subtitle: string;
  description: string;
  /** cumulative tracks needed to unlock; undefined = special (daily) trigger */
  threshold?: number;
  /** shown on the shelf while still locked */
  howToEarn: string;
}

/** A reward instance queued for the "Paul sent you something!" modal. */
export interface RewardPopup {
  reward: Reward;
  /** extra context line, e.g. current streak day */
  detail?: string;
  /** preview popups display but don't persist */
  preview?: boolean;
}

// Tier thresholds across the full 34-track curriculum.
export const TIER_THRESHOLDS: Record<RewardTier, number> = {
  bronze: 5,
  silver: 12,
  gold: 22,
  diamond: ALL_CONTENT_IDS.length, // every track
};

export const REWARDS: Record<RewardId, Reward> = {
  "streak-midnight-driver": {
    id: "streak-midnight-driver",
    kind: "badge",
    name: "Midnight Driver",
    subtitle: "daily streak badge",
    description:
      "You showed up tonight. That's the whole secret — hands on the wheel, one track at a time.",
    howToEarn: "Show up and study once tonight — that's all it takes.",
  },
  "tier-bronze": {
    id: "tier-bronze",
    kind: "badge",
    tier: "bronze",
    name: "Bronze Cassette",
    subtitle: "tier I · first pressing",
    description:
      "Five tracks in and the tape is warm. Paul pressed your first cassette — the b-side of a long, good record.",
    threshold: TIER_THRESHOLDS.bronze,
    howToEarn: "Complete 5 tracks to press your first cassette.",
  },
  "tier-silver": {
    id: "tier-silver",
    kind: "badge",
    tier: "silver",
    name: "Silver Cassette",
    subtitle: "tier II · going steady",
    description:
      "Twelve tracks deep. The rhythm is yours now — Paul plated this one in silver to prove it.",
    threshold: TIER_THRESHOLDS.silver,
    howToEarn: "Complete 12 tracks to earn the silver pressing.",
  },
  "tier-gold": {
    id: "tier-gold",
    kind: "collectible",
    tier: "gold",
    name: "Gold Record",
    subtitle: "tier III · certified",
    description:
      "Twenty-two tracks. This is the wall-worthy one — a gold record for a run that's genuinely gone the distance.",
    threshold: TIER_THRESHOLDS.gold,
    howToEarn: "Complete 22 tracks to go gold.",
  },
  "tier-diamond": {
    id: "tier-diamond",
    kind: "certificate",
    tier: "diamond",
    name: "Diamond Graduate",
    subtitle: "tier IV · the whole record",
    description:
      "Every track, every side, every hidden groove. You built the whole record — and Paul signed the diamond certificate himself.",
    threshold: TIER_THRESHOLDS.diamond,
    howToEarn: "Complete the entire course — all tracks — for the diamond.",
  },
};

/** Progression order for previews and the shelf. */
export const REWARD_ORDER: RewardId[] = [
  "streak-midnight-driver",
  "tier-bronze",
  "tier-silver",
  "tier-gold",
  "tier-diamond",
];

// ── Earned-rewards registry ──────────────────────────────────

// v2: reward ids changed when the tiered system landed
const REWARDS_KEY = "cc-rewards-v2";

export function earnedRewards(): Reward[] {
  if (typeof window === "undefined") return [];
  try {
    const ids: RewardId[] = JSON.parse(localStorage.getItem(REWARDS_KEY) ?? "[]");
    return ids.map((id) => REWARDS[id]).filter(Boolean);
  } catch {
    return [];
  }
}

/** Persist a reward; returns true only the first time it's earned. */
export function awardReward(id: RewardId): boolean {
  const ids: RewardId[] = JSON.parse(localStorage.getItem(REWARDS_KEY) ?? "[]");
  if (ids.includes(id)) return false;
  ids.push(id);
  localStorage.setItem(REWARDS_KEY, JSON.stringify(ids));
  return true;
}

// ── Progress helpers (for the shelf's mini progress bars) ────

/** How many real curriculum tracks are in the completed set. */
export function completedTrackCount(completedIds: Set<string>): number {
  // Demo mode: ids match the static curriculum, so intersect for safety.
  const known = ALL_CONTENT_IDS.filter((id) => completedIds.has(id)).length;
  if (known > 0) return known;
  // Live mode: ids are database cuids — every entry the API returned is
  // a real completed track, so the set size IS the count.
  return completedIds.size;
}

export interface UnlockProgress {
  current: number;
  target: number;
  remaining: number;
  /** 0..1 fill for the bar */
  ratio: number;
}

/** Progress toward a specific reward, for locked-badge bars. */
export function rewardUnlockProgress(
  reward: Reward,
  completedIds: Set<string>,
): UnlockProgress {
  const count = completedTrackCount(completedIds);
  // Streak badge isn't track-based; model it as a single daily step.
  const target = reward.threshold ?? 1;
  const current = Math.min(count, target);
  return {
    current,
    target,
    remaining: Math.max(0, target - current),
    ratio: target === 0 ? 1 : current / target,
  };
}

// ── Daily streak tracking ────────────────────────────────────

const STREAK_KEY = "cc-streak-v1";

interface StreakState {
  last: string; // YYYY-MM-DD of the last study day
  count: number;
}

function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Read the current streak without mutating it (for the stats panel). */
export function getStreakCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const state = JSON.parse(localStorage.getItem(STREAK_KEY) ?? "null") as StreakState | null;
    if (!state) return 0;
    // A streak older than yesterday has already been broken
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    return state.last === todayStamp() || state.last === yesterday ? state.count : 0;
  } catch {
    return 0;
  }
}

/**
 * Record a study session. Returns the streak count and whether this is
 * the first session today (which is what triggers the Midnight Driver
 * popup — once per day, never spammy).
 */
export function recordStudySession(): { count: number; isFirstToday: boolean } {
  const today = todayStamp();
  let state: StreakState = { last: "", count: 0 };
  try {
    state = JSON.parse(localStorage.getItem(STREAK_KEY) ?? "null") ?? state;
  } catch {
    /* fresh start */
  }

  if (state.last === today) return { count: state.count, isFirstToday: false };

  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const count = state.last === yesterday ? state.count + 1 : 1;
  localStorage.setItem(STREAK_KEY, JSON.stringify({ last: today, count }));
  return { count, isFirstToday: true };
}

// ── Trigger evaluation ───────────────────────────────────────

const TIER_IDS: RewardId[] = ["tier-bronze", "tier-silver", "tier-gold", "tier-diamond"];

/**
 * Called after a content item is completed. Awards every tier whose
 * threshold the learner has now crossed and returns the popups to show,
 * in the order Paul would hand them over.
 */
export function collectRewardPopups(completedIds: Set<string>): RewardPopup[] {
  const popups: RewardPopup[] = [];

  // Daily streak first
  const streak = recordStudySession();
  if (streak.isFirstToday) {
    awardReward("streak-midnight-driver");
    popups.push({
      reward: REWARDS["streak-midnight-driver"],
      detail: `night ${streak.count} behind the wheel`,
    });
  }

  // Then any newly-crossed tiers, ascending
  const count = completedTrackCount(completedIds);
  for (const id of TIER_IDS) {
    const reward = REWARDS[id];
    if (reward.threshold !== undefined && count >= reward.threshold) {
      if (awardReward(id)) {
        popups.push({ reward, detail: `${count}/${reward.threshold} tracks` });
      }
    }
  }

  return popups;
}
