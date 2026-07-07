"use client";

/**
 * Dashboard top stats panel — the TikTok-style streak flame, the Code
 * Level progression with its XP bar, and the collapsible Daily Puzzle
 * Mission that feeds the level.
 */
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DailyPuzzle from "./DailyPuzzle";
import { getStreakCount } from "@/lib/rewards";
import { isPuzzleSolvedToday, levelInfo, type LevelInfo } from "@/lib/level";

export default function StatsPanel() {
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState<LevelInfo | null>(null);
  const [puzzleOpen, setPuzzleOpen] = useState(false);
  const [puzzleDone, setPuzzleDone] = useState(false);

  const refresh = useCallback(() => {
    setStreak(getStreakCount());
    setLevel(levelInfo());
    setPuzzleDone(isPuzzleSolvedToday());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="studio-card mb-10 p-5"
    >
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        {/* ── Streak flame ─────────────────────────────── */}
        <div className="flex items-center gap-3">
          <motion.span
            animate={streak > 0 ? { scale: [1, 1.12, 1] } : {}}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="text-3xl drop-shadow-neon"
            role="img"
            aria-label="Streak flame"
          >
            🔥
          </motion.span>
          <span className="py-0.5">
            <span className="block font-display text-lg font-bold leading-normal text-ice">
              {streak} {streak === 1 ? "Day" : "Days"} Streak
            </span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.2em] leading-relaxed text-mist/50">
              {streak > 0 ? "come back tomorrow to keep it alive" : "study tonight to light it up"}
            </span>
          </span>
        </div>

        <span className="hidden h-10 w-px bg-line sm:block" />

        {/* ── Code Level ───────────────────────────────── */}
        {level && (
          <div className="min-w-[190px] flex-1 py-0.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-display text-lg font-bold leading-normal text-electric drop-shadow-neon">
                {level.title}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] leading-relaxed text-mist/50">
                {level.intoLevel}/100 xp
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-neon to-electric shadow-glow transition-[width] duration-700 ease-out"
                style={{ width: `${Math.round(level.ratio * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Daily puzzle toggle ──────────────────────── */}
        <button
          onClick={() => setPuzzleOpen((o) => !o)}
          className={`rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em] leading-relaxed transition-all duration-300 ${
            puzzleDone
              ? "border-mint/40 text-mint"
              : "border-neon/50 text-neon-soft hover:bg-neon/10 hover:shadow-glow animate-breathe"
          }`}
        >
          {puzzleDone ? "daily puzzle · cleared" : puzzleOpen ? "close puzzle" : "daily puzzle mission"}
        </button>
      </div>

      {/* ── The puzzle itself ──────────────────────────── */}
      <AnimatePresence initial={false}>
        {puzzleOpen && (
          <motion.div
            key="puzzle"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-5 border-t border-line pt-5">
              <DailyPuzzle onXpAwarded={refresh} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
