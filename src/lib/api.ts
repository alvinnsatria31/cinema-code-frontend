/**
 * Live API client — every call hits the Express + Prisma + PostgreSQL
 * backend. Callers are expected to catch failures and fall back to the
 * offline demo engine (lib/demo.ts) so the UI never goes dark.
 */
import type { CourseProgress, ValidateResponse, WorkspaceContent } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const DEMO_USER_ID = process.env.NEXT_PUBLIC_DEMO_USER_ID ?? "demo-user";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ?? `Request failed: ${res.status}`,
    );
  }
  return res.json() as Promise<T>;
}

// ── Progress ─────────────────────────────────────────────────

export function fetchProgress(userId: string) {
  return request<{ userId: string; courses: CourseProgress[] }>(
    `/api/progress/${userId}`,
  );
}

export function markProgress(params: {
  userId: string;
  contentId: string;
  isCompleted?: boolean;
  lastCode?: string;
}) {
  return request(`/api/progress`, { method: "POST", body: JSON.stringify(params) });
}

// ── Content ──────────────────────────────────────────────────

export function fetchContent(contentId: string) {
  return request<{
    content: WorkspaceContent & {
      type: "VIDEO" | "CHALLENGE" | "READING";
      xpReward: number;
      module: { id: string; title: string };
    };
  }>(`/api/content/${contentId}`);
}

// ── Validation (2-tier engine + AI mentor) ───────────────────

export function validateCode(params: {
  userId: string;
  contentId: string;
  userCode: string;
  forceAiMentor?: boolean;
}) {
  return request<ValidateResponse>(`/api/validate`, {
    method: "POST",
    body: JSON.stringify(params),
  });
}

// ── Rewards ──────────────────────────────────────────────────

export function fetchRewards(userId: string) {
  return request<{
    earned: string[];
    xp: number;
    streakCount: number;
    lastStudyAt: string | null;
  }>(`/api/rewards/${userId}`);
}

export function grantReward(userId: string, rewardId: string) {
  return request(`/api/rewards`, {
    method: "POST",
    body: JSON.stringify({ userId, rewardId }),
  });
}

export function addXpRemote(userId: string, amount: number) {
  return request<{ xp: number }>(`/api/rewards/xp`, {
    method: "POST",
    body: JSON.stringify({ userId, amount }),
  });
}

// ── Admin (live course management) ───────────────────────────

export interface AdminContentPayload {
  requesterEmail: string;
  category: string;
  title: string;
  type: "VIDEO" | "CHALLENGE" | "READING";
  videoUrl?: string;
  order: number;
  challengePrompt?: string;
}

export function adminUpsertContent(payload: AdminContentPayload) {
  return request<{ content: { id: string }; module: { id: string; title: string } }>(
    `/api/admin/content`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}
