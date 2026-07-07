"use client";

/**
 * Category Accordion — the dashboard learning timeline.
 * Each category expands (Framer Motion height reveal) into a horizontal,
 * swipeable shelf of retro cassette tapes — one physical tape per track.
 * Completed tapes glow electric cyan at the reels. No emoji anywhere:
 * states are micro-typography badges ("SOON", "LOCKED") in the display face.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { CourseProgress, TrackContent } from "@/types";
import type { LearningCategory } from "@/lib/mock-data";

// ── The cassette tape ────────────────────────────────────────

/**
 * Two reels + tape window, drawn as vectors. The spoke groups rotate
 * slowly (CSS .reel-spin, defined in globals.css) — a subtle, always-on
 * mechanical hum in the card background. Completed → cyan glow.
 */
function CassetteReels({ lit }: { lit: boolean }) {
  const reel = lit ? "#00E5FF" : "#5C82FF";
  const hub = lit ? "#00E5FF" : "#2A2647";
  return (
    <svg
      viewBox="0 0 160 56"
      className={`w-full ${lit ? "drop-shadow-neon" : "opacity-80"}`}
      fill="none"
      aria-hidden
    >
      {/* tape window */}
      <rect x="6" y="4" width="148" height="48" rx="8" stroke="#2A2647" strokeWidth="1.5" />
      {/* left reel (rim static, spokes+hub rotate) */}
      <circle cx="48" cy="28" r="15" stroke={reel} strokeWidth="2" />
      <g className="reel-spin">
        <circle cx="48" cy="28" r="5" fill={hub} fillOpacity={lit ? 0.9 : 1} />
        <line x1="48" y1="15" x2="48" y2="21" stroke={reel} strokeWidth="1.5" />
        <line x1="37" y1="34" x2="42" y2="31" stroke={reel} strokeWidth="1.5" />
        <line x1="59" y1="34" x2="54" y2="31" stroke={reel} strokeWidth="1.5" />
      </g>
      {/* right reel */}
      <circle cx="112" cy="28" r="15" stroke={reel} strokeWidth="2" />
      <g className="reel-spin [animation-duration:11s]">
        <circle cx="112" cy="28" r="5" fill={hub} fillOpacity={lit ? 0.9 : 1} />
        <line x1="112" y1="15" x2="112" y2="21" stroke={reel} strokeWidth="1.5" />
        <line x1="101" y1="34" x2="106" y2="31" stroke={reel} strokeWidth="1.5" />
        <line x1="123" y1="34" x2="118" y2="31" stroke={reel} strokeWidth="1.5" />
      </g>
      {/* tape strand between reels */}
      <line x1="63" y1="28" x2="97" y2="28" stroke="#1A52FF" strokeWidth="2" />
    </svg>
  );
}

function CassetteCard({
  index,
  content,
  isCurrent,
}: {
  index: number;
  content: TrackContent;
  isCurrent: boolean;
}) {
  const status = content.isCompleted
    ? content.type === "VIDEO"
      ? "watched"
      : "completed"
    : isCurrent
      ? "now playing"
      : content.type === "VIDEO"
        ? "video"
        : "challenge";

  return (
    <Link href={`/learn/${content.id}`} className="group w-56 shrink-0 snap-start">
      <div
        className={`rounded-2xl border bg-surface/50 p-3 backdrop-blur-md transition-all duration-500 group-hover:-translate-y-1 ${
          content.isCompleted
            ? "border-electric/40 shadow-glow-electric"
            : isCurrent
              ? "border-neon/60 shadow-glow animate-breathe"
              : "border-neon/20 group-hover:border-neon/60 group-hover:shadow-glow"
        }`}
      >
        {/* Label strip */}
        <div className="rounded-lg border border-line bg-midnight/70 px-2.5 py-2">
          <p className="truncate text-[12px] font-medium leading-normal text-ice" title={content.title}>
            {content.title}
          </p>
          <p className="font-display text-[8px] font-medium uppercase tracking-[0.28em] leading-relaxed text-mist/50">
            trk {String(index).padStart(2, "0")}
          </p>
        </div>

        {/* Reels */}
        <div className="mt-2.5">
          <CassetteReels lit={content.isCompleted} />
        </div>

        {/* Foot line */}
        <div className="mt-2 flex items-center justify-between px-0.5">
          <span
            className={`font-display text-[9px] font-medium uppercase tracking-[0.24em] leading-relaxed ${
              content.isCompleted
                ? "text-electric drop-shadow-neon"
                : isCurrent
                  ? "text-neon-soft"
                  : "text-mist/50"
            }`}
          >
            {status}
          </span>
          {/* screws, for the vintage plastic feel */}
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-1 w-1 rounded-full bg-line" />
            <span className="h-1 w-1 rounded-full bg-line" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── One accordion row ────────────────────────────────────────

function CategoryRow({
  category,
  contents,
  currentId,
  isOpen,
  onToggle,
}: {
  category: LearningCategory;
  contents: TrackContent[];
  currentId: string | null;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const done = contents.filter((c) => c.isCompleted).length;
  const available = category.state === "available";

  const badge =
    category.state === "available"
      ? `${done}/${contents.length}`
      : category.state === "coming-soon"
        ? "soon"
        : "locked";

  return (
    <motion.div
      layout
      className={`studio-card overflow-hidden ${!available ? "opacity-80" : ""}`}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-2/40"
      >
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-mono text-xs ${
            available ? "border-neon/40 text-electric" : "border-line text-mist/40"
          }`}
        >
          {String(category.index).padStart(2, "0")}
        </span>

        <span className="min-w-0 flex-1 py-0.5">
          <span className="block truncate font-display text-base font-bold leading-normal text-ice">
            {category.title}
          </span>
          <span className="block truncate text-xs font-light leading-relaxed text-mist/70">
            {category.subtitle}
          </span>
        </span>

        {/* Micro-typography state badge — display face, no emoji */}
        <span
          className={`shrink-0 rounded-full border px-3 py-1 font-display text-[9px] font-medium uppercase tracking-[0.28em] leading-relaxed ${
            available ? "border-mint/30 text-mint" : "border-line text-mist/50"
          }`}
        >
          {badge}
        </span>

        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="shrink-0 font-mono text-xs text-mist/60"
        >
          ▾
        </motion.span>
      </button>

      {/* Body — the cassette shelf */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-line">
              {available ? (
                <div className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 pt-5">
                  {contents.map((c, i) => (
                    <CassetteCard
                      key={c.id}
                      index={i + 1}
                      content={c}
                      isCurrent={c.id === currentId}
                    />
                  ))}
                </div>
              ) : (
                <p className="px-5 py-6 text-center text-sm font-light leading-relaxed text-mist/70">
                  {category.note}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── The accordion ────────────────────────────────────────────

export default function CategoryAccordion({
  course,
  categories,
}: {
  course: CourseProgress;
  categories: LearningCategory[];
}) {
  // Resolve a category's contents by static module id (demo data) OR by
  // title match (live API modules carry database cuids, not "m-html").
  const contentsForCategory = useMemo(() => {
    return (cat: LearningCategory): TrackContent[] => {
      const byId = course.modules.find((m) => m.id === cat.moduleId);
      if (byId) return byId.contents;
      const byTitle = course.modules.find((m) =>
        m.title.toLowerCase().includes(cat.title.toLowerCase()),
      );
      return byTitle?.contents ?? [];
    };
  }, [course]);

  const currentId = useMemo(
    () => course.modules.flatMap((m) => m.contents).find((c) => !c.isCompleted)?.id ?? null,
    [course],
  );

  const defaultOpen = useMemo(() => {
    for (const cat of categories) {
      if (contentsForCategory(cat).some((c) => c.id === currentId)) return cat.id;
    }
    return categories.find((c) => c.state === "available")?.id ?? null;
  }, [categories, contentsForCategory, currentId]);

  const [openId, setOpenId] = useState<string | null>(defaultOpen);

  return (
    <div className="flex flex-col gap-3">
      {categories.map((cat) => (
        <CategoryRow
          key={cat.id}
          category={cat}
          contents={contentsForCategory(cat)}
          currentId={currentId}
          isOpen={openId === cat.id}
          onToggle={() => setOpenId((cur) => (cur === cat.id ? null : cat.id))}
        />
      ))}
    </div>
  );
}
