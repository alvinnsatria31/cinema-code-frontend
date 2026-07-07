"use client";

/**
 * AppShell — permanent navigation around every page.
 *  Desktop (lg+): a fixed left sidebar that can slide fully out of view
 *  via an edge chevron, expanding the workspace to full width.
 *  Mobile: a bottom navigation bar; the music player slides up as a sheet.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AuthPanel from "./AuthPanel";
import MusicPlayer from "./MusicPlayer";
import { MOCK_COURSE } from "@/lib/mock-data";
import { applyDemoProgress } from "@/lib/demo";
import { unlockAudio } from "@/lib/audio";
import { useStudent } from "@/lib/useStudent";

interface NavItem {
  href: string;
  label: string;
  glyph: string;
}

const COLLAPSE_KEY = "cc-sidebar-collapsed";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [musicOpen, setMusicOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  // "The Learning Studio" resumes at the first uncompleted track
  const [studioHref, setStudioHref] = useState("/learn/html-01");

  useEffect(() => {
    const course = applyDemoProgress(MOCK_COURSE);
    const next = course.modules
      .flatMap((m) => m.contents)
      .find((c) => !c.isCompleted);
    if (next) setStudioHref(`/learn/${next.id}`);
  }, [pathname]);

  // Restore sidebar state + unlock audio on the first user gesture
  useEffect(() => {
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    const onGesture = () => unlockAudio();
    window.addEventListener("pointerdown", onGesture, { once: true });
    return () => window.removeEventListener("pointerdown", onGesture);
  }, []);

  const toggleCollapsed = () =>
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });

  const student = useStudent();

  const items: NavItem[] = [
    { href: "/dashboard", label: "dashboard", glyph: "◧" },
    { href: studioHref, label: "the learning studio", glyph: "▸" },
    { href: "/shelf", label: "paul's shelf", glyph: "❖" },
    // The hidden admin door — only rendered for ADMIN sessions
    ...(student.role === "ADMIN"
      ? [{ href: "/admin/manage-course", label: "manage course", glyph: "✎" }]
      : []),
  ];

  const isActive = (href: string) =>
    href.startsWith("/learn") ? pathname.startsWith("/learn") : pathname === href;

  return (
    <>
      {/* ── Desktop sidebar (slides out on collapse) ───────── */}
      <motion.aside
        initial={false}
        animate={{ x: collapsed ? "-100%" : "0%" }}
        transition={{ type: "spring", stiffness: 280, damping: 32 }}
        className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col overflow-y-auto border-r border-line bg-surface/50 p-5 backdrop-blur-md lg:flex"
      >
        <Link href="/dashboard" className="mb-8 block px-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] leading-relaxed text-electric drop-shadow-neon">
            the cinema
          </p>
          <p className="font-display text-lg font-bold leading-normal text-ice">
            &amp; Code Studio
          </p>
        </Link>

        <nav className="flex flex-col gap-1">
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm leading-normal transition-all duration-300 ${
                isActive(item.href)
                  ? "bg-surface-2 text-ice shadow-glow"
                  : "text-mist hover:bg-surface-2/60 hover:text-ice"
              }`}
            >
              <span
                className={`font-mono text-xs ${
                  isActive(item.href) ? "text-electric drop-shadow-neon" : "text-mist/50"
                }`}
              >
                {item.glyph}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6">
          <AuthPanel />
          <MusicPlayer hostEmbed />
        </div>
      </motion.aside>

      {/* ── Edge chevron — collapse / reveal the sidebar ───── */}
      <motion.button
        onClick={toggleCollapsed}
        initial={false}
        animate={{ left: collapsed ? 8 : 272 }}
        transition={{ type: "spring", stiffness: 280, damping: 32 }}
        className="fixed top-1/2 z-50 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface/90 font-mono text-sm text-mist shadow-glow backdrop-blur-md transition-colors hover:text-electric lg:flex"
        aria-label={collapsed ? "Show sidebar" : "Hide sidebar"}
      >
        {collapsed ? "›" : "‹"}
      </motion.button>

      {/* ── Page content (offset follows the sidebar) ──────── */}
      <div
        className={`pb-24 transition-[padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:pb-0 ${
          collapsed ? "lg:pl-0" : "lg:pl-72"
        }`}
      >
        {children}
      </div>

      {/* ── Mobile bottom navigation ───────────────────────── */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-surface/80 backdrop-blur-md lg:hidden">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 ${
              isActive(item.href) ? "text-electric" : "text-mist/70"
            }`}
          >
            <span className={`text-base ${isActive(item.href) ? "drop-shadow-neon" : ""}`}>
              {item.glyph}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-wider leading-relaxed">
              {item.label === "the learning studio"
                ? "studio"
                : item.label === "manage course"
                  ? "admin"
                  : item.label.replace("paul's ", "")}
            </span>
          </Link>
        ))}
        <button
          onClick={() => setMusicOpen((o) => !o)}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 ${
            musicOpen ? "text-electric" : "text-mist/70"
          }`}
          aria-label="Toggle music player"
        >
          <span className={`text-base ${musicOpen ? "drop-shadow-neon" : ""}`}>♫</span>
          <span className="font-mono text-[9px] uppercase tracking-wider leading-relaxed">music</span>
        </button>
      </nav>

      {/* ── Mobile music sheet (passive skin — no duplicate embed) ── */}
      <AnimatePresence>
        {musicOpen && (
          <motion.div
            className="fixed inset-x-3 bottom-20 z-40 lg:hidden"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <MusicPlayer hostEmbed={false} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
