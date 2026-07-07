"use client";

/**
 * Paul's Shelf — the tiered achievement gallery. Earned pieces glow and
 * re-open on click; locked pieces dim and show a mini progress bar with
 * exactly how many tracks remain to unlock that tier.
 */
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import PaulsReward, {
  CassetteIcon,
  Certificate,
  VinylIcon,
} from "@/components/PaulsReward";
import {
  REWARDS,
  REWARD_ORDER,
  earnedRewards,
  rewardUnlockProgress,
  type Reward,
  type RewardId,
  type RewardPopup,
} from "@/lib/rewards";
import { MOCK_COURSE } from "@/lib/mock-data";
import { DEMO_MODE, allCompletedIds, applyDemoProgress } from "@/lib/demo";
import { fetchProgress, fetchRewards } from "@/lib/api";
import { useStudent } from "@/lib/useStudent";

function ShelfArt({ reward, locked }: { reward: Reward; locked: boolean }) {
  const label = reward.tier ? reward.tier.toUpperCase() : "MIDNIGHT";
  const dim = locked ? "opacity-30 grayscale" : "";
  return (
    <div className={`flex h-40 items-center justify-center transition-all duration-500 ${dim}`}>
      {reward.kind === "badge" && <CassetteIcon className="h-20 w-32" tier={reward.tier} label={label} />}
      {reward.kind === "collectible" && <VinylIcon className="h-24 w-24" tier={reward.tier} label={label} />}
      {reward.kind === "certificate" && (
        <div className="scale-[0.5]">
          <Certificate tier={reward.tier} title={reward.name} />
        </div>
      )}
    </div>
  );
}

/** The mini progress bar shown inside a locked, threshold-based badge. */
function UnlockBar({ reward, completedIds }: { reward: Reward; completedIds: Set<string> }) {
  const { current, target, remaining, ratio } = rewardUnlockProgress(reward, completedIds);
  return (
    <div className="mt-4">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] leading-relaxed text-neon-soft">
          {current}/{target} tracks
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] leading-relaxed text-mist/50">
          {remaining} to unlock {reward.name}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-2">
        {/* Plain width + CSS transition — reliably reflects live data,
            even when the count arrives after mount */}
        <div
          className="h-full rounded-full bg-gradient-to-r from-neon to-electric shadow-glow transition-[width] duration-700 ease-out"
          style={{ width: `${Math.round(ratio * 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function ShelfPage() {
  const student = useStudent();
  const [earnedIds, setEarnedIds] = useState<Set<RewardId>>(new Set());
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [popup, setPopup] = useState<RewardPopup | null>(null);
  const previewIndex = useRef(0);

  useEffect(() => {
    if (student.isLoading) return;

    const localFallback = () => {
      setEarnedIds(new Set(earnedRewards().map((r) => r.id)));
      setCompletedIds(allCompletedIds(applyDemoProgress(MOCK_COURSE)));
    };

    if (!DEMO_MODE && student.id) {
      // Live: grants + completions bound to her database user id
      Promise.all([fetchRewards(student.id), fetchProgress(student.id)])
        .then(([rewards, progress]) => {
          setEarnedIds(new Set(rewards.earned as RewardId[]));
          const done = new Set<string>();
          for (const course of progress.courses) {
            for (const mod of course.modules) {
              for (const c of mod.contents) if (c.isCompleted) done.add(c.id);
            }
          }
          setCompletedIds(done);
        })
        .catch(localFallback);
    } else {
      localFallback();
    }
  }, [student.id, student.isLoading]);

  const previewNextReward = () => {
    const id = REWARD_ORDER[previewIndex.current % REWARD_ORDER.length];
    previewIndex.current += 1;
    setPopup({ reward: REWARDS[id], preview: true });
  };

  const rewards = REWARD_ORDER.map((id) => REWARDS[id]);
  const earnedCount = rewards.filter((r) => earnedIds.has(r.id)).length;

  return (
    <main className="mx-auto max-w-6xl px-6 py-14 lg:py-20">
      <motion.header
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mb-12"
      >
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] leading-relaxed text-electric drop-shadow-neon">
          achievement gallery · bronze → diamond
        </p>
        <h1 className="pb-1 font-display text-3xl font-bold leading-[1.25] text-ice sm:text-4xl">
          Paul&apos;s Shelf
        </h1>
        <p className="mt-4 max-w-xl text-[15px] font-light leading-relaxed text-mist">
          {earnedCount} of {rewards.length} pieces collected · climb the tiers, one
          track at a time — everything you earn stays here, glowing quietly.
        </p>
      </motion.header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rewards.map((reward, i) => {
          const earned = earnedIds.has(reward.id);
          return (
            <motion.article
              key={reward.id}
              className="studio-card flex flex-col overflow-hidden"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.1, ease: "easeOut" }}
            >
              <div className="border-b border-line bg-midnight/40 px-4 pt-4">
                <ShelfArt reward={reward} locked={!earned} />
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-lg font-bold leading-normal text-ice">
                    {reward.name}
                  </h2>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] leading-relaxed ${
                      earned ? "border-mint/40 text-mint" : "border-line text-mist/50"
                    }`}
                  >
                    {earned ? "earned" : "locked"}
                  </span>
                </div>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.25em] leading-relaxed text-neon-soft">
                  {reward.subtitle}
                </p>
                <p className="mt-3 flex-1 text-sm font-light leading-relaxed text-mist">
                  {earned ? reward.description : reward.howToEarn}
                </p>

                {earned ? (
                  <button
                    onClick={() => setPopup({ reward })}
                    className="mt-4 self-start rounded-full border border-neon/50 px-5 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] leading-relaxed text-neon-soft transition-all hover:bg-neon/10 hover:shadow-glow"
                  >
                    ✦ view
                  </button>
                ) : (
                  reward.threshold !== undefined && (
                    <UnlockBar reward={reward} completedIds={completedIds} />
                  )
                )}
              </div>
            </motion.article>
          );
        })}
      </div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="mt-14 text-center"
      >
        <button
          onClick={previewNextReward}
          className="font-mono text-[11px] uppercase tracking-[0.2em] leading-relaxed text-neon-soft/60 transition-colors hover:text-electric"
        >
          ✦ preview all rewards (demo)
        </button>
      </motion.footer>

      <PaulsReward popup={popup} onClose={() => setPopup(null)} />
    </main>
  );
}
