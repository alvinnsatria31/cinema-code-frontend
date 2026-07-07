"use client";

/**
 * Paul's Shelf — a quiet row on the dashboard showing every reward
 * she's earned so far.
 */
import Link from "next/link";
import { motion } from "framer-motion";
import type { Reward } from "@/lib/rewards";

const KIND_GLYPH: Record<Reward["kind"], string> = {
  badge: "▮▮", //        cassette
  collectible: "◉", //   vinyl
  certificate: "❖", //   certificate
};

export default function RewardShelf({ rewards }: { rewards: Reward[] }) {
  if (rewards.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="mb-10"
    >
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-mono text-xs uppercase leading-relaxed tracking-[0.3em] text-mist/60">
          paul&apos;s shelf
        </h2>
        <Link
          href="/shelf"
          className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-neon-soft/70 transition-colors hover:text-electric"
        >
          view all →
        </Link>
      </div>
      <div className="flex flex-wrap gap-3">
        {rewards.map((r) => (
          <div
            key={r.id}
            className="studio-card flex items-center gap-3 px-4 py-2.5 transition-shadow duration-500 hover:shadow-glow-electric"
          >
            <span className="font-mono text-electric drop-shadow-neon">
              {KIND_GLYPH[r.kind]}
            </span>
            <span className="py-0.5">
              <span className="block text-sm leading-normal text-ice">{r.name}</span>
              <span className="block font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-mist/50">
                {r.subtitle}
              </span>
            </span>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
