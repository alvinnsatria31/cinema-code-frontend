"use client";

/**
 * Daily Puzzle Mission — a tiny syntax-arranging challenge. Tap the
 * chips in the right order to assemble a valid line of code; solving
 * it awards daily level XP (once per calendar day). The puzzle rotates
 * deterministically by date.
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PUZZLE_XP,
  addXp,
  isPuzzleSolvedToday,
  markPuzzleSolvedToday,
} from "@/lib/level";
import { playCelebrationChime } from "@/lib/audio";

interface Puzzle {
  brief: string;
  /** chips in the scrambled order they're displayed */
  chips: string[];
  /** the correct sequence */
  answer: string[];
}

const PUZZLES: Puzzle[] = [
  {
    brief: "Assemble a heading that greets the world.",
    chips: ["</h1>", "Hello!", "<h1>"],
    answer: ["<h1>", "Hello!", "</h1>"],
  },
  {
    brief: "Assemble one item of a tracklist.",
    chips: ["Malibu Nights", "</li>", "<li>"],
    answer: ["<li>", "Malibu Nights", "</li>"],
  },
  {
    brief: "Assemble a link to WPU.",
    chips: ["</a>", '<a href="#">', "WPU"],
    answer: ['<a href="#">', "WPU", "</a>"],
  },
  {
    brief: "Assemble a CSS rule that paints headings blue.",
    chips: ["}", "h1 {", "color: blue;"],
    answer: ["h1 {", "color: blue;", "}"],
  },
  {
    brief: "Assemble an image tag, alt text included.",
    chips: ['alt="cover"', "<img", 'src="paul.jpg"', "/>"],
    answer: ["<img", 'src="paul.jpg"', 'alt="cover"', "/>"],
  },
];

/** Same puzzle for the whole day, new one tomorrow. */
function todaysPuzzle(): Puzzle {
  const day = Math.floor(Date.now() / 86_400_000);
  return PUZZLES[day % PUZZLES.length];
}

export default function DailyPuzzle({ onXpAwarded }: { onXpAwarded?: () => void }) {
  const [puzzle] = useState<Puzzle>(todaysPuzzle);
  const [picked, setPicked] = useState<number[]>([]); // indices into puzzle.chips
  const [solved, setSolved] = useState(false);
  const [missed, setMissed] = useState(false);

  useEffect(() => {
    setSolved(isPuzzleSolvedToday());
  }, []);

  const assembled = picked.map((i) => puzzle.chips[i]);

  const pickChip = (i: number) => {
    if (picked.includes(i) || solved) return;
    setMissed(false);
    setPicked((p) => [...p, i]);
  };

  const reset = () => {
    setPicked([]);
    setMissed(false);
  };

  const check = () => {
    if (assembled.join(" ") === puzzle.answer.join(" ")) {
      markPuzzleSolvedToday();
      addXp(PUZZLE_XP);
      setSolved(true);
      playCelebrationChime();
      onXpAwarded?.();
    } else {
      setMissed(true);
    }
  };

  if (solved) {
    return (
      <div className="text-center">
        <p className="font-display text-sm font-bold leading-normal text-mint">
          puzzle cleared · +{PUZZLE_XP} xp
        </p>
        <p className="mt-1 text-xs font-light leading-relaxed text-mist/60">
          tomorrow&apos;s puzzle drops at midnight — see you then
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm font-light leading-relaxed text-mist">{puzzle.brief}</p>

      {/* Assembly line */}
      <div
        className={`mt-3 flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-xl border px-3 py-2 font-mono text-[12px] leading-relaxed transition-colors duration-300 ${
          missed ? "border-neon/60 text-neon-soft" : "border-line text-ice"
        }`}
      >
        {assembled.length === 0 ? (
          <span className="text-mist/30">tap the chips below, in order…</span>
        ) : (
          assembled.map((chip, i) => (
            <motion.span
              key={`${chip}-${i}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded bg-surface-2 px-1.5 py-0.5"
            >
              {chip}
            </motion.span>
          ))
        )}
      </div>
      <AnimatePresence>
        {missed && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-1.5 text-xs font-light leading-relaxed text-neon-soft"
          >
            not quite the right order — reset and listen to the line again
          </motion.p>
        )}
      </AnimatePresence>

      {/* Chips */}
      <div className="mt-3 flex flex-wrap gap-2">
        {puzzle.chips.map((chip, i) => (
          <button
            key={`${chip}-${i}`}
            onClick={() => pickChip(i)}
            disabled={picked.includes(i)}
            className="rounded-lg border border-neon/40 bg-surface-2 px-2.5 py-1.5 font-mono text-[12px] leading-relaxed text-ice transition-all duration-300 hover:shadow-glow disabled:opacity-25 disabled:shadow-none"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={check}
          disabled={picked.length !== puzzle.answer.length}
          className="rounded-full bg-neon px-5 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] leading-relaxed text-white shadow-glow transition-shadow duration-500 hover:shadow-glow-lg disabled:opacity-40 disabled:shadow-none"
        >
          verify · +{PUZZLE_XP} xp
        </button>
        <button
          onClick={reset}
          className="font-mono text-[11px] uppercase tracking-[0.15em] leading-relaxed text-mist/50 transition-colors hover:text-mist"
        >
          reset
        </button>
      </div>
    </div>
  );
}
