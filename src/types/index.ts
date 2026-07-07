// Shared shapes — mirrors the API responses from the Express server.

export type ContentType = "VIDEO" | "CHALLENGE" | "READING";

export type Role = "ADMIN" | "STUDENT";

export interface TrackContent {
  id: string;
  title: string;
  type: ContentType;
  order: number;
  xpReward: number;
  isCompleted: boolean;
  completedAt: string | null;
}

export interface TrackModule {
  id: string;
  title: string;
  order: number;
  contents: TrackContent[];
}

export interface CourseProgress {
  id: string;
  slug: string;
  title: string;
  modules: TrackModule[];
  totalContents: number;
  completedContents: number;
  percent: number;
}

export interface ValidateResponse {
  passed: boolean;
  tier: 1 | 2;
  source: "local" | "ai-mentor";
  hint: string;
  xpAwarded?: number;
}

export interface WorkspaceContent {
  id: string;
  title: string;
  videoUrl?: string;
  challengePrompt?: string;
  starterCode?: string;
}

// ── Demo mode (static, offline) ──────────────────────────────

export interface ClientRule {
  pattern: string;
  flags?: string;
  hint: string;
}

export interface DemoContent extends WorkspaceContent {
  type: ContentType;
  /** exact expected markup — only enforced when strict is true */
  expected?: string;
  strict?: boolean;
  /** local structural checks, mirroring the server's Tier-1 rules */
  rules?: ClientRule[];
}
