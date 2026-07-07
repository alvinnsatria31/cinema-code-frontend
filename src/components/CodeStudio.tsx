"use client";

/**
 * The Code Studio, split into composable pieces so the workspace can
 * arrange them per layout (desktop split-screen vs. mobile tabs):
 *
 *  useCodeStudio() — shared state: code, mentor messages, validation.
 *  EditorCard      — the expanded editor + Submit / Ask AI Mentor buttons.
 *  MentorNotes     — the chat-bubble panel.
 *
 * In DEMO_MODE validation runs locally (mirroring the server's Tier-1
 * rules); otherwise it POSTs to /api/validate on the Express server.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CodeEditor from "./CodeEditor";
import { validateCode, DEMO_USER_ID } from "@/lib/api";
import { DEMO_MODE, localValidate, offlineMentorReply } from "@/lib/demo";
import type { DemoContent } from "@/types";

// ── Shared studio state ──────────────────────────────────────

export interface ChatMessage {
  id: number;
  role: "mentor" | "student";
  text: string;
  tone?: "success" | "hint";
}

export interface StudioState {
  code: string;
  setCode: (code: string) => void;
  messages: ChatMessage[];
  loading: false | "submit" | "mentor";
  submit: () => void;
  askMentor: () => void;
}

export function useCodeStudio(
  content: DemoContent,
  onPassed?: () => void,
  /** persistent database user id from the session; demo id when absent */
  userId?: string,
): StudioState {
  const [code, setCode] = useState(content.starterCode ?? "");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      role: "mentor",
      text: "Hey! I'm Echo, your studio mentor. Write your code, submit when it feels right, or ask me anytime. No pressure, no judgment.",
    },
  ]);
  const [loading, setLoading] = useState<false | "submit" | "mentor">(false);

  const pushMessage = (msg: Omit<ChatMessage, "id">) =>
    setMessages((prev) => [...prev, { ...msg, id: prev.length }]);

  async function handleValidate(forceAiMentor: boolean) {
    setLoading(forceAiMentor ? "mentor" : "submit");
    pushMessage({
      role: "student",
      text: forceAiMentor ? "Hey Echo, can you take a look?" : "Submitting my code…",
    });

    try {
      if (DEMO_MODE) {
        // Offline path: local rules, canned mentor, tiny stage-pause
        await new Promise((r) => setTimeout(r, 500));
        if (forceAiMentor) {
          pushMessage({ role: "mentor", text: offlineMentorReply(), tone: "hint" });
        } else {
          const result = localValidate(code, content);
          pushMessage({
            role: "mentor",
            text: result.hint,
            tone: result.passed ? "success" : "hint",
          });
          if (result.passed) onPassed?.();
        }
      } else {
        // Live path: the 2-tier engine on the Express server
        const result = await validateCode({
          userId: userId ?? DEMO_USER_ID,
          contentId: content.id,
          userCode: code,
          forceAiMentor,
        });
        pushMessage({
          role: "mentor",
          text: result.hint,
          tone: result.passed ? "success" : "hint",
        });
        if (result.passed) onPassed?.();
      }
    } catch {
      pushMessage({
        role: "mentor",
        text: "The studio connection flickered — check that the API server is running, then try again. Your code is safe right here.",
      });
    } finally {
      setLoading(false);
    }
  }

  return {
    code,
    setCode,
    messages,
    loading,
    submit: () => handleValidate(false),
    askMentor: () => handleValidate(true),
  };
}

// ── UI pieces ────────────────────────────────────────────────

/** Blue-glow button with the subtle "breathing" idle animation. */
function BreathingButton({
  children,
  onClick,
  disabled,
  variant = "solid",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "solid" | "outline";
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      animate={disabled ? {} : { scale: [1, 1.02, 1] }}
      transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      className={`rounded-full px-6 py-2.5 font-body text-sm font-medium leading-normal tracking-wide transition-shadow duration-500 disabled:cursor-not-allowed disabled:opacity-40
        ${
          variant === "solid"
            ? "bg-neon text-white shadow-glow hover:shadow-glow-lg"
            : "border border-neon/50 text-neon-soft hover:bg-neon/10 hover:shadow-glow"
        }`}
    >
      {children}
    </motion.button>
  );
}

export function EditorCard({ studio }: { studio: StudioState }) {
  return (
    <motion.section
      data-tour="studio"
      className="studio-card overflow-hidden"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <header className="border-b border-line px-5 py-3.5">
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] leading-relaxed text-mist">
          the code studio
        </h2>
      </header>

      <div className="p-4">
        <CodeEditor value={studio.code} onChange={studio.setCode} />

        <div data-tour="actions" className="mt-4 flex flex-wrap items-center gap-3">
          <BreathingButton onClick={studio.submit} disabled={!!studio.loading}>
            {studio.loading === "submit" ? "Listening…" : "Submit Code"}
          </BreathingButton>
          <BreathingButton
            variant="outline"
            onClick={studio.askMentor}
            disabled={!!studio.loading}
          >
            {studio.loading === "mentor" ? "Echo is thinking…" : "✦ Ask AI Mentor"}
          </BreathingButton>
        </div>
      </div>
    </motion.section>
  );
}

export function MentorNotes({ messages }: { messages: ChatMessage[] }) {
  return (
    <motion.section
      className="studio-card p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <h3 className="mb-3 font-mono text-xs uppercase tracking-[0.25em] leading-relaxed text-mist">
        mentor notes
      </h3>
      <ul className="flex max-h-52 flex-col gap-2.5 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.li
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                ${
                  msg.role === "student"
                    ? "self-end rounded-br-sm bg-neon/20 text-ice"
                    : msg.tone === "success"
                      ? "self-start rounded-bl-sm border border-mint/30 bg-surface-2 text-mint shadow-glow-mint"
                      : "self-start rounded-bl-sm border border-violet/25 bg-surface-2 text-mist"
                }`}
            >
              {msg.text}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </motion.section>
  );
}
