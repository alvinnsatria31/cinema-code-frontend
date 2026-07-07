"use client";

/**
 * Main Dashboard — demo mode: renders entirely from static mock data +
 * localStorage progress. No API, no .env, no database needed.
 * (To reconnect the live backend, see DEMO_MODE in lib/demo.ts.)
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import CategoryAccordion from "@/components/CategoryAccordion";
import PaulsReward from "@/components/PaulsReward";
import RewardShelf from "@/components/RewardShelf";
import StatsPanel from "@/components/StatsPanel";
import { LEARNING_CATEGORIES, MOCK_COURSE } from "@/lib/mock-data";
import { DEMO_MODE, applyDemoProgress } from "@/lib/demo";
import { fetchProgress } from "@/lib/api";
import { useStudent } from "@/lib/useStudent";
import {
  REWARDS,
  awardReward,
  earnedRewards,
  recordStudySession,
  type Reward,
  type RewardPopup,
} from "@/lib/rewards";
import type { CourseProgress } from "@/types";

export default function DashboardPage() {
  // Google session when signed in (mapped to "Andin"), mock profile offline
  const student = useStudent();
  const [course, setCourse] = useState<CourseProgress>(MOCK_COURSE);
  const [shelf, setShelf] = useState<Reward[]>([]);
  const [popup, setPopup] = useState<RewardPopup | null>(null);
  const [isLive, setIsLive] = useState(false);

  // ── Course data: live API when signed in, local fallback otherwise ──
  useEffect(() => {
    if (student.isLoading) return;

    if (!DEMO_MODE && student.id) {
      fetchProgress(student.id)
        .then((data) => {
          if (data.courses[0]) {
            setCourse(data.courses[0]);
            setIsLive(true);
          } else {
            setCourse(applyDemoProgress(MOCK_COURSE));
          }
        })
        .catch(() => setCourse(applyDemoProgress(MOCK_COURSE)));
    } else {
      setCourse(applyDemoProgress(MOCK_COURSE));
    }
  }, [student.id, student.isLoading]);

  // ── Streak + shelf (localStorage cache; server mirror is best-effort) ──
  useEffect(() => {
    setShelf(earnedRewards());

    // Daily streak: opening the studio counts as showing up. First visit
    // of the day → Paul hands over the Midnight Driver badge.
    const streak = recordStudySession();
    if (streak.isFirstToday) {
      awardReward("streak-midnight-driver");
      const t = setTimeout(
        () =>
          setPopup({
            reward: REWARDS["streak-midnight-driver"],
            detail: `night ${streak.count} behind the wheel`,
          }),
        1400,
      );
      return () => clearTimeout(t);
    }
  }, []);

  const closePopup = () => {
    setPopup(null);
    setShelf(earnedRewards()); // shelf picks up anything just awarded
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 lg:py-16">
      {/* ── Greeting ─────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mb-12"
      >
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] leading-relaxed text-electric drop-shadow-neon">
          the cinema &amp; code studio
        </p>
        {/* generous line-height + bottom padding so descenders never clip */}
        <h1 className="pb-1 font-display text-3xl font-bold leading-[1.25] text-ice sm:text-4xl lg:text-5xl">
          Hey {student.name}, ready to write
          <br className="hidden sm:block" /> your first line of code tonight?
        </h1>
        <p className="mt-4 max-w-xl text-[15px] font-light leading-relaxed text-mist">
          {course.completedContents} of {course.totalContents} tracks played ·{" "}
          <span className="text-electric">{course.percent}%</span> through{" "}
          <span className="text-ice/90">{course.title}</span>
          {!isLive && (
            <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.15em] text-mist/40">
              offline data
            </span>
          )}
        </p>
      </motion.header>

      {/* ── Streak flame · code level · daily puzzle ────── */}
      <StatsPanel />

      {/* ── Paul's shelf strip (full gallery lives at /shelf) ── */}
      <RewardShelf rewards={shelf} />

      {/* ── Category accordion — the clean learning timeline ─ */}
      <CategoryAccordion course={course} categories={LEARNING_CATEGORIES} />

      {/* ── Footer whisper ────────────────────────────────── */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="mt-16 text-center"
      >
        <p className="font-mono text-xs tracking-[0.25em] leading-relaxed text-mist/40">
          one track a night is enough · it&apos;s all a beautiful blur
        </p>
        <Link
          href="/shelf"
          className="mt-3 inline-block font-mono text-[11px] uppercase tracking-[0.2em] leading-relaxed text-neon-soft/60 transition-colors hover:text-electric"
        >
          ✦ visit paul&apos;s shelf
        </Link>
      </motion.footer>

      <PaulsReward popup={popup} onClose={closePopup} />
    </main>
  );
}
