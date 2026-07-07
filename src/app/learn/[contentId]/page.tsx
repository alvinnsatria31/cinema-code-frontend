"use client";

/**
 * The Core Workspace — two distinct states:
 *  VIDEO track     → prominent cinema (2/3 width) + Track Notes panel.
 *  CHALLENGE track → Daily Mission briefing (top right) + expanded
 *                    Code Editor, Live Preview, and mentor notes.
 *
 * Mobile (< lg): the split screen collapses into a tabbed interface —
 * Video/Notes for video tracks, Mission/Editor/Preview for challenges.
 * Each piece renders exactly once; tabs only toggle visibility, so
 * editor state survives tab switches.
 */
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import CinemaPanel from "@/components/CinemaPanel";
import DailyMission from "@/components/DailyMission";
import LivePreview from "@/components/LivePreview";
import OnboardingTour from "@/components/OnboardingTour";
import PaulsReward from "@/components/PaulsReward";
import VideoNotes from "@/components/VideoNotes";
import { EditorCard, MentorNotes, useCodeStudio } from "@/components/CodeStudio";
import { DEMO_CONTENTS, FALLBACK_CONTENT, MOCK_COURSE } from "@/lib/mock-data";
import {
  DEMO_MODE,
  allCompletedIds,
  applyDemoProgress,
  markDemoComplete,
} from "@/lib/demo";
import { fetchContent, grantReward, markProgress } from "@/lib/api";
import { collectRewardPopups, type RewardPopup } from "@/lib/rewards";
import { useStudent } from "@/lib/useStudent";
import type { DemoContent } from "@/types";

type MobileTab = "watch" | "notes" | "mission" | "editor" | "preview";

const VIDEO_TABS: { id: MobileTab; label: string }[] = [
  { id: "watch", label: "▸ video" },
  { id: "notes", label: "✎ notes" },
];

const CHALLENGE_TABS: { id: MobileTab; label: string }[] = [
  { id: "mission", label: "✦ mission" },
  { id: "editor", label: "⌨ editor" },
  { id: "preview", label: "◈ preview" },
];

/** Visible on mobile only when its tab is active; always visible on lg+. */
const tabPane = (active: boolean) => (active ? "block" : "hidden lg:block");

export default function WorkspacePage() {
  const { contentId } = useParams<{ contentId: string }>();
  // Key by track so editor/mentor state fully resets between tracks
  return <Workspace key={contentId} contentId={contentId} />;
}

function Workspace({ contentId }: { contentId: string }) {
  const student = useStudent();
  const [content, setContent] = useState<DemoContent>(
    DEMO_CONTENTS[contentId] ?? FALLBACK_CONTENT,
  );
  const isVideo = content.type === "VIDEO";

  const [isCompleted, setIsCompleted] = useState(false);
  const [rewardQueue, setRewardQueue] = useState<RewardPopup[]>([]);
  const [tab, setTab] = useState<MobileTab>(isVideo ? "watch" : "mission");

  // ── Lesson payload: live API first, local fallback ────────
  useEffect(() => {
    if (DEMO_MODE) return;
    fetchContent(contentId)
      .then(({ content: live }) =>
        setContent({
          id: live.id,
          type: live.type,
          title: live.title,
          videoUrl: live.videoUrl,
          challengePrompt: live.challengePrompt,
          starterCode: live.starterCode,
          // no local rules in live mode — /api/validate runs the
          // server's 2-tier engine instead
        }),
      )
      .catch(() => {
        /* API offline → keep the static fallback already in state */
      });
  }, [contentId]);

  useEffect(() => {
    setIsCompleted(allCompletedIds(applyDemoProgress(MOCK_COURSE)).has(content.id));
    setTab(isVideo ? "watch" : "mission");
  }, [content.id, isVideo]);

  /** Mark this track done and collect any rewards Paul wants to hand over. */
  const handleCompleted = () => {
    // Local cache keeps the UI instant + offline-resilient…
    markDemoComplete(content.id);
    setIsCompleted(true);

    // …while the database stays the source of truth when signed in.
    if (!DEMO_MODE && student.id) {
      markProgress({ userId: student.id, contentId: content.id, isCompleted: true }).catch(
        () => {},
      );
    }

    const completed = allCompletedIds(applyDemoProgress(MOCK_COURSE));
    const popups = collectRewardPopups(completed);
    if (popups.length > 0) {
      setRewardQueue((q) => [...q, ...popups]);
      // Mirror every fresh grant to the rewards API (fire-and-forget)
      if (!DEMO_MODE && student.id) {
        for (const p of popups) {
          grantReward(student.id, p.reward.id).catch(() => {});
        }
      }
    }
  };

  const studio = useCodeStudio(content, handleCompleted, student.id);
  const tabs = isVideo ? VIDEO_TABS : CHALLENGE_TABS;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
      {/* ── Slim top bar ─────────────────────────────────── */}
      <motion.nav
        className="mb-5 flex items-center justify-between gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link
          href="/dashboard"
          className="group flex items-center gap-2 text-sm leading-normal text-mist transition-colors hover:text-ice"
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
          back to tracklist
        </Link>

        <div className="flex items-center gap-4">
          <p className="hidden font-mono text-xs uppercase tracking-[0.25em] leading-relaxed text-mist/50 xl:block">
            now playing · <span className="text-electric">{content.title}</span>
          </p>
          {isVideo &&
            (isCompleted ? (
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] leading-relaxed text-mint">
                ✓ watched
              </span>
            ) : (
              <button
                onClick={handleCompleted}
                className="rounded-full border border-neon/50 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] leading-relaxed text-neon-soft transition-all hover:bg-neon/10 hover:shadow-glow"
              >
                ✓ mark watched
              </button>
            ))}
        </div>
      </motion.nav>

      {/* ── Mobile tab bar ───────────────────────────────── */}
      <div className="mb-5 flex gap-2 lg:hidden">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-full px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] leading-relaxed transition-all duration-300 ${
              tab === t.id
                ? "bg-neon text-white shadow-glow"
                : "border border-line text-mist"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── VIDEO state: prominent cinema + track notes ──── */}
      {isVideo ? (
        <div className="lg:grid lg:grid-cols-3 lg:items-start lg:gap-6">
          <div className={`${tabPane(tab === "watch")} lg:col-span-2`}>
            <CinemaPanel videoUrl={content.videoUrl} title={content.title} />
          </div>
          <div className={`${tabPane(tab === "notes")} mt-6 lg:mt-0`}>
            <VideoNotes contentId={content.id} />
          </div>
        </div>
      ) : (
        /* ── CHALLENGE state: mission (top right) + expanded studio ── */
        <div className="lg:grid lg:grid-cols-5 lg:items-start lg:gap-6">
          <div className={`${tabPane(tab === "mission")} lg:order-2 lg:col-span-2`}>
            <DailyMission content={content} isCompleted={isCompleted} />
          </div>
          <div className="lg:order-1 lg:col-span-3">
            <div className={`${tabPane(tab === "editor")} mt-6 lg:mt-0`}>
              <EditorCard studio={studio} />
            </div>
            <div className={`${tabPane(tab === "preview")} mt-6 lg:mt-5`}>
              <LivePreview code={studio.code} />
            </div>
            <div className={`${tabPane(tab === "editor")} mt-6 lg:mt-5`}>
              <MentorNotes messages={studio.messages} />
            </div>
          </div>
        </div>
      )}

      {/* First-visit guided tour (localStorage-gated) */}
      <OnboardingTour />

      {/* Paul's rewards, one at a time */}
      <PaulsReward
        popup={rewardQueue[0] ?? null}
        onClose={() => setRewardQueue((q) => q.slice(1))}
      />
    </main>
  );
}
