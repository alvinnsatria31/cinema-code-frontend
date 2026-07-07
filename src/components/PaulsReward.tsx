"use client";

/**
 * "✦ paul jason klein sent you something..." — the reward modal.
 *
 * A framed real photo of Paul presents each reward; the artwork enters
 * through a dreamy "A Beautiful Blur" motion-blur animation; and the
 * instant the modal appears it fires a celebration (guaranteed chime +
 * a real LANY track through the Spotify widget). Artwork pieces are
 * exported for Paul's Shelf.
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { STUDENT_NAME, MOCK_COURSE } from "@/lib/mock-data";
import { CELEBRATION_TRACKS, triggerCelebration } from "@/lib/audio";
import type { RewardPopup, RewardTier } from "@/lib/rewards";

// ── Tier palette (metallic accents, era-consistent) ──────────

const TIER_ACCENT: Record<RewardTier, string> = {
  bronze: "#C88A56",
  silver: "#C7D0E0",
  gold: "#E9C46A",
  diamond: "#7FE9FF",
};
const DEFAULT_ACCENT = "#00E5FF"; // electric — used by the streak badge

const accentOf = (tier?: RewardTier) => (tier ? TIER_ACCENT[tier] : DEFAULT_ACCENT);

// ── Paul's portrait (real photo, framed) ─────────────────────

export function PaulPortrait() {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="shrink-0 -rotate-3">
      <div className="rounded-xl border border-electric/40 bg-surface-2 p-1.5 shadow-glow-electric">
        <div className="relative h-24 w-20 overflow-hidden rounded-lg">
          {!imgError ? (
            // Real photo, served from client/public/images/paul.jpg
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/images/paul.jpg"
              alt="Paul Jason Klein"
              className="h-full w-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            // Graceful vector fallback if the photo is missing
            <svg viewBox="0 0 72 88" className="h-full w-full" role="img" aria-label="Portrait of Paul">
              <rect width="72" height="88" rx="6" fill="#11101C" />
              <circle cx="36" cy="30" r="26" fill="#1A52FF" fillOpacity="0.18" />
              <circle cx="36" cy="30" r="11" fill="#5C82FF" fillOpacity="0.85" />
              <path d="M14 88 q4 -30 22 -30 q18 0 22 30 Z" fill="#1E1B33" />
              <path d="M25 26 q3 -10 12 -9 q9 1 10 9 q-6 -5 -11 -4 q-7 1 -11 4 Z" fill="#1E1B33" />
            </svg>
          )}
          {/* subtle blur-era sheen overlay on the frame */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-electric/15 via-transparent to-neon/10" />
        </div>
        <p className="pb-0.5 pt-1.5 text-center font-mono text-[8px] uppercase tracking-[0.24em] leading-relaxed text-electric/80">
          ✦ paul jason klein
          <br />
          certified
        </p>
      </div>
    </div>
  );
}

// ── Reward artwork (tier-colored inline SVG) ─────────────────

export function CassetteIcon({
  className = "h-24 w-36",
  tier,
  label = "MIDNIGHT",
}: {
  className?: string;
  tier?: RewardTier;
  label?: string;
}) {
  const accent = accentOf(tier);
  return (
    <svg viewBox="0 0 140 92" className={`${className} animate-float drop-shadow-neon`} fill="none">
      <rect x="4" y="4" width="132" height="84" rx="10" stroke={accent} strokeWidth="2.5" />
      <rect x="18" y="16" width="104" height="30" rx="6" stroke="#5C82FF" strokeWidth="2" />
      <circle cx="46" cy="31" r="8" stroke={accent} strokeWidth="2.5" />
      <circle cx="94" cy="31" r="8" stroke={accent} strokeWidth="2.5" />
      <line x1="54" y1="31" x2="86" y2="31" stroke="#1A52FF" strokeWidth="2" />
      <path d="M30 88 L40 62 H100 L110 88" stroke="#5C82FF" strokeWidth="2" />
      <text x="70" y="79" textAnchor="middle" fill={accent} fontSize="9" fontFamily="monospace" letterSpacing="2">
        {label}
      </text>
    </svg>
  );
}

export function VinylIcon({
  className = "h-28 w-28",
  tier,
  label = "SIDE A",
}: {
  className?: string;
  tier?: RewardTier;
  label?: string;
}) {
  const accent = accentOf(tier);
  return (
    <svg viewBox="0 0 120 120" className={`${className} animate-float drop-shadow-neon`} fill="none">
      <circle cx="60" cy="60" r="54" stroke={accent} strokeWidth="3" />
      <circle cx="60" cy="60" r="42" stroke="#2A2647" strokeWidth="1.5" />
      <circle cx="60" cy="60" r="34" stroke="#2A2647" strokeWidth="1.5" />
      <circle cx="60" cy="60" r="20" fill="#1A52FF" fillOpacity="0.25" stroke={accent} strokeWidth="2" />
      <circle cx="60" cy="60" r="4" fill={accent} />
      <path d="M22 40 A44 44 0 0 1 46 19" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
      <text x="60" y="107" textAnchor="middle" fill="#5C82FF" fontSize="9" fontFamily="monospace" letterSpacing="3">
        {label}
      </text>
    </svg>
  );
}

export function Certificate({
  detail,
  tier,
  title = "Track Graduate",
}: {
  detail?: string;
  tier?: RewardTier;
  title?: string;
}) {
  const accent = accentOf(tier);
  return (
    <div className="rounded-xl border border-electric/40 bg-midnight/70 p-1 shadow-glow-electric">
      <div className="rounded-lg border border-line px-8 py-9 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] leading-relaxed text-mist/60">
          the cinema &amp; code studio
        </p>
        <h3
          className="mt-4 font-display text-3xl font-bold leading-[1.2] tracking-wide drop-shadow-neon"
          style={{ color: accent }}
        >
          {title}
        </h3>
        <p className="mt-5 text-xs font-light leading-relaxed text-mist">this certifies that</p>
        <p className="mt-1 font-display text-2xl font-bold leading-[1.3] text-electric">
          {STUDENT_NAME}
        </p>
        <p className="mx-auto mt-3 max-w-[260px] text-xs font-light leading-relaxed text-mist">
          completed every track of
          <span className="text-ice/90"> {MOCK_COURSE.title}</span>
        </p>

        {/* Paul's signature */}
        <svg viewBox="0 0 120 30" className="mx-auto mt-6 h-7 w-28" fill="none">
          <path
            d="M8 22 C20 4, 28 26, 38 14 S 58 6, 64 18 S 84 26, 92 10 S 106 14, 114 8"
            stroke={accent}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em] leading-relaxed text-mist/50">
          paul jason klein ·{" "}
          {detail ??
            new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>
    </div>
  );
}

/** Renders the correct artwork for a reward (kind + tier + label). */
export function RewardArtwork({ popup }: { popup: RewardPopup }) {
  const { reward } = popup;
  const label = reward.tier ? reward.tier.toUpperCase() : "MIDNIGHT";
  if (reward.kind === "collectible") return <VinylIcon tier={reward.tier} label={label} />;
  if (reward.kind === "certificate")
    return <Certificate tier={reward.tier} title={reward.name} detail={popup.detail} />;
  return <CassetteIcon tier={reward.tier} label={label} />;
}

// ── The modal ────────────────────────────────────────────────

export default function PaulsReward({
  popup,
  onClose,
}: {
  popup: RewardPopup | null;
  onClose: () => void;
}) {
  // Celebrate the instant a reward appears: guaranteed chime + a real
  // LANY track. Diamond & the daily streak get romantic ILYSB; the
  // climbing tiers get high-energy XXL.
  useEffect(() => {
    if (!popup) return;
    const romantic = !popup.reward.tier || popup.reward.tier === "diamond";
    triggerCelebration(romantic ? CELEBRATION_TRACKS.romantic : CELEBRATION_TRACKS.highEnergy);
  }, [popup]);

  return (
    <AnimatePresence>
      {popup && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0A0914]/70 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="studio-card max-h-[90vh] w-[min(460px,100%)] overflow-y-auto p-7 text-center shadow-glow-lg"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            {/* Paul presents… */}
            <motion.div
              className="flex items-center justify-center gap-4"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <PaulPortrait />
              <p className="max-w-[180px] text-left font-mono text-xs uppercase tracking-[0.22em] leading-relaxed text-electric drop-shadow-neon">
                ✦ paul jason klein sent you something...
              </p>
            </motion.div>

            {/* Reward artwork — "A Beautiful Blur" entrance */}
            <motion.div
              className="mt-6 flex justify-center"
              initial={{ opacity: 0, scale: 1.08, filter: "blur(16px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <RewardArtwork popup={popup} />
            </motion.div>

            {popup.reward.kind !== "certificate" && (
              <>
                <h3 className="mt-5 font-display text-2xl font-bold leading-[1.3] text-ice">
                  {popup.reward.name}
                </h3>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.25em] leading-relaxed text-neon-soft">
                  {popup.reward.subtitle}
                  {popup.detail ? ` · ${popup.detail}` : ""}
                </p>
              </>
            )}

            <p className="mx-auto mt-4 max-w-xs text-sm font-light leading-relaxed text-mist">
              {popup.reward.description}
            </p>

            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="mt-6 rounded-full bg-neon px-8 py-2.5 text-sm font-medium leading-normal text-white shadow-glow transition-shadow duration-500 hover:shadow-glow-lg"
            >
              keep it
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
