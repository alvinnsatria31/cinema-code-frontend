"use client";

/**
 * Interactive Onboarding Tour — a floating neon spotlight that walks her
 * through the workspace on her very first visit, then never again
 * (completion is stored in localStorage).
 *
 * Spotlight technique: one absolutely-positioned frame over the target
 * element, with a giant box-shadow dimming everything else — no library.
 */
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "cinema-code-tour-v1";

interface TourStep {
  target: string | null; // CSS selector, or null for a centered welcome card
  title: string;
  body: string;
}

const STEPS: TourStep[] = [
  {
    target: null,
    title: "Welcome to your studio ✦",
    body: "This is where you'll learn to build the web — one track at a time, like writing a song. No deadlines, no grades. Just you, some neon light, and your first lines of code.",
  },
  {
    target: '[data-tour="cinema"]',
    title: "The Cinema",
    body: "Your lessons play here — Pak Sandhika will walk you through every concept. Pause and rewind as much as you like; the film waits for you.",
  },
  {
    target: '[data-tour="studio"]',
    title: "The Code Studio",
    body: "This is your instrument. Type your very first tags right here — the editor colors your code as you play, so you can see the structure of every note.",
  },
  {
    target: '[data-tour="preview"]',
    title: "Live Preview & your AI Mentor",
    body: "Everything you type appears here instantly — your code, alive. And whenever you feel stuck, tap “Ask AI Mentor”. Echo gives gentle hints, never spoilers, never pressure. 💙",
  },
];

export default function OnboardingTour() {
  const [stepIndex, setStepIndex] = useState<number | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  // Open only on the very first visit, after the page settles
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => setStepIndex(0), 900);
    return () => clearTimeout(t);
  }, []);

  // Measure the current step's target (and re-measure on resize)
  const measure = useCallback(() => {
    if (stepIndex === null) return;
    const selector = STEPS[stepIndex].target;
    if (!selector) return setRect(null);

    const el = document.querySelector(selector);
    if (!el) return setRect(null);
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    // Wait a beat for the smooth scroll before measuring
    setTimeout(() => setRect(el.getBoundingClientRect()), 350);
  }, [stepIndex]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, "done");
    setStepIndex(null);
  };

  if (stepIndex === null) return null;
  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  // Tooltip position: under the spotlight when there's room, else above
  const tooltipTop = rect
    ? rect.bottom + 260 < window.innerHeight
      ? rect.bottom + 16
      : Math.max(16, rect.top - 240)
    : undefined;

  return (
    <AnimatePresence>
      <motion.div
        key="tour"
        className="fixed inset-0 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Spotlight frame — dims the world, haloes the target */}
        {rect ? (
          <motion.div
            className="pointer-events-none absolute rounded-2xl border border-neon/70 shadow-glow"
            animate={{
              top: rect.top - 8,
              left: rect.left - 8,
              width: rect.width + 16,
              height: rect.height + 16,
            }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            style={{ boxShadow: "0 0 0 9999px rgba(10, 9, 20, 0.82), 0 0 30px rgba(26,82,255,0.45)" }}
          />
        ) : (
          <div className="absolute inset-0 bg-[#0A0914]/85 backdrop-blur-sm" />
        )}

        {/* Floating tooltip card */}
        <motion.div
          key={stepIndex}
          className="studio-card absolute left-1/2 w-[min(420px,calc(100vw-32px))] p-6 shadow-glow-violet"
          // Centering lives in Framer's x/y so its transform doesn't
          // clobber a Tailwind translate class
          style={rect ? { top: tooltipTop, x: "-50%" } : { top: "50%", x: "-50%", y: "-50%" }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.3em] text-electric drop-shadow-neon">
            step {stepIndex + 1} / {STEPS.length}
          </p>
          <h3 className="mb-2 font-display text-lg font-semibold text-ice">{step.title}</h3>
          <p className="text-sm font-light leading-relaxed text-mist">{step.body}</p>

          <div className="mt-5 flex items-center justify-between">
            <button
              onClick={finish}
              className="text-xs tracking-wide text-mist/50 transition-colors hover:text-mist"
            >
              skip tour
            </button>
            <div className="flex gap-2">
              {stepIndex > 0 && (
                <button
                  onClick={() => setStepIndex(stepIndex - 1)}
                  className="rounded-full border border-line px-4 py-1.5 text-xs text-mist transition-colors hover:border-mist/40 hover:text-ice"
                >
                  back
                </button>
              )}
              <button
                onClick={() => (isLast ? finish() : setStepIndex(stepIndex + 1))}
                className="rounded-full bg-neon px-5 py-1.5 text-xs font-medium text-white shadow-glow transition-shadow hover:shadow-glow-lg"
              >
                {isLast ? "let's begin ✦" : "next"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
