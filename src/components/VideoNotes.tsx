"use client";

/**
 * Track Notes — the right panel on VIDEO tracks: milestone checkboxes
 * plus a free note-taking pad, both persisted per-track in localStorage.
 */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const MILESTONES = [
  "Watched the full episode",
  "Coded along with Pak Sandhika",
  "Ready for the next track",
] as const;

export default function VideoNotes({ contentId }: { contentId: string }) {
  const [notes, setNotes] = useState("");
  const [checked, setChecked] = useState<boolean[]>([false, false, false]);

  // Hydrate from localStorage per track
  useEffect(() => {
    setNotes(localStorage.getItem(`cc-notes-${contentId}`) ?? "");
    try {
      const saved = JSON.parse(
        localStorage.getItem(`cc-milestones-${contentId}`) ?? "null",
      ) as boolean[] | null;
      setChecked(saved ?? [false, false, false]);
    } catch {
      setChecked([false, false, false]);
    }
  }, [contentId]);

  const updateNotes = (value: string) => {
    setNotes(value);
    localStorage.setItem(`cc-notes-${contentId}`, value);
  };

  const toggleMilestone = (i: number) => {
    const next = checked.map((c, idx) => (idx === i ? !c : c));
    setChecked(next);
    localStorage.setItem(`cc-milestones-${contentId}`, JSON.stringify(next));
  };

  return (
    <motion.section
      className="studio-card overflow-hidden"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
    >
      <header className="border-b border-line px-5 py-3.5">
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] leading-relaxed text-mist">
          track notes
        </h2>
      </header>

      <div className="p-5">
        {/* Video milestones */}
        <ul className="space-y-2.5">
          {MILESTONES.map((label, i) => (
            <li key={label}>
              <button
                onClick={() => toggleMilestone(i)}
                className="group flex w-full items-center gap-3 text-left"
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] transition-all duration-300 ${
                    checked[i]
                      ? "border-electric bg-neon/20 text-electric shadow-glow-electric"
                      : "border-line text-transparent group-hover:border-mist/40"
                  }`}
                >
                  ✓
                </span>
                <span
                  className={`text-sm leading-normal transition-colors ${
                    checked[i] ? "text-ice" : "text-mist group-hover:text-ice"
                  }`}
                >
                  {label}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* Free notes */}
        <label className="mt-5 block border-t border-line pt-4">
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.25em] leading-relaxed text-mist/50">
            your liner notes
          </span>
          <textarea
            value={notes}
            onChange={(e) => updateNotes(e.target.value)}
            placeholder="Things worth remembering from this episode…"
            rows={7}
            className="focus-neon w-full resize-none rounded-xl border border-line bg-midnight/60 p-3 font-mono text-[13px] leading-relaxed text-ice placeholder:text-mist/30"
          />
        </label>
        <p className="mt-1.5 text-[11px] font-light leading-relaxed text-mist/40">
          saved automatically, just for you
        </p>
      </div>
    </motion.section>
  );
}
