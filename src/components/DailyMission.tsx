"use client";

/**
 * Daily Mission Instructions — the clear, calm briefing card shown
 * beside the editor on CHALLENGE tracks.
 */
import { motion } from "framer-motion";
import type { DemoContent } from "@/types";

export default function DailyMission({
  content,
  isCompleted,
}: {
  content: DemoContent;
  isCompleted: boolean;
}) {
  return (
    <motion.section
      className="studio-card overflow-hidden"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] leading-relaxed text-electric drop-shadow-neon">
          ✦ daily mission
        </h2>
        {isCompleted && (
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] leading-relaxed text-mint">
            ✓ cleared
          </span>
        )}
      </header>

      <div className="p-5">
        <h3 className="font-display text-lg font-bold leading-normal text-ice">
          {content.title}
        </h3>
        <p className="mt-3 text-sm font-light leading-relaxed text-mist">
          {content.challengePrompt}
        </p>

        <ul className="mt-5 space-y-2 border-t border-line pt-4">
          {[
            "Type it in the Code Studio — the preview updates live.",
            "Experiment freely; nothing here can break.",
            "Stuck? Echo gives hints, never spoilers.",
          ].map((tip) => (
            <li
              key={tip}
              className="flex items-start gap-2 text-xs font-light leading-relaxed text-mist/70"
            >
              <span className="mt-0.5 text-neon-soft">·</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
}
