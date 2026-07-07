"use client";

/**
 * The "Coding Cassette" progress tracker.
 * Each module is a cassette side; each content item is a track node that
 * glows neon pink once completed — a retro tracklist instead of a bar.
 */
import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import type { TrackModule } from "@/types";

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
};

const nodeVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function TrackNode({
  index,
  title,
  type,
  isCompleted,
  isCurrent,
  contentId,
}: {
  index: number;
  title: string;
  type: string;
  isCompleted: boolean;
  isCurrent: boolean;
  contentId: string;
}) {
  return (
    <motion.li variants={nodeVariants}>
      <Link
        href={`/learn/${contentId}`}
        className={`group flex items-center gap-4 rounded-xl px-4 py-3 transition-colors duration-300
          ${isCurrent ? "bg-surface-2" : "hover:bg-surface-2/60"}`}
      >
        {/* Track node — the glowing dot */}
        <span
          className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-mono text-xs transition-all duration-500
            ${
              isCompleted
                ? "border-neon bg-neon/15 text-electric shadow-glow"
                : isCurrent
                  ? "border-neon/50 text-ice animate-breathe"
                  : "border-line text-mist/60"
            }`}
        >
          {isCompleted ? "✓" : String(index).padStart(2, "0")}
          {isCurrent && (
            <span className="absolute inset-0 rounded-full border border-neon/30 animate-ping [animation-duration:2.5s]" />
          )}
        </span>

        <span className="min-w-0 flex-1 py-0.5">
          <span
            className={`block truncate text-sm leading-normal transition-colors duration-300
              ${isCompleted ? "text-ice" : isCurrent ? "text-ice" : "text-mist group-hover:text-ice"}`}
          >
            {title}
          </span>
          <span className="text-[11px] uppercase leading-relaxed tracking-[0.18em] text-mist/50">
            {type === "VIDEO" ? "▸ video" : type === "CHALLENGE" ? "⌨ challenge" : "☰ reading"}
          </span>
        </span>

        {isCurrent && (
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-electric drop-shadow-neon">
            now playing
          </span>
        )}
      </Link>
    </motion.li>
  );
}

export default function CassetteTracklist({ modules }: { modules: TrackModule[] }) {
  // "Current" track = the first uncompleted item across the whole course
  const currentId =
    modules.flatMap((m) => m.contents).find((c) => !c.isCompleted)?.id ?? null;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {modules.map((mod) => {
        const done = mod.contents.filter((c) => c.isCompleted).length;
        return (
          <motion.section
            key={mod.id}
            className="studio-card overflow-hidden"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: mod.order * 0.12, ease: "easeOut" }}
          >
            {/* Cassette label */}
            <header className="flex items-baseline justify-between border-b border-line px-5 py-4">
              <h3 className="font-display text-sm font-bold leading-normal tracking-wide text-ice">
                {mod.title}
              </h3>
              <span className="font-mono text-xs text-mist/60">
                {done}/{mod.contents.length}
              </span>
            </header>

            <motion.ul
              className="p-2"
              variants={listVariants}
              initial="hidden"
              animate="show"
            >
              {mod.contents.map((c, i) => (
                <TrackNode
                  key={c.id}
                  index={i + 1}
                  title={c.title}
                  type={c.type}
                  isCompleted={c.isCompleted}
                  isCurrent={c.id === currentId}
                  contentId={c.id}
                />
              ))}
            </motion.ul>
          </motion.section>
        );
      })}
    </div>
  );
}
