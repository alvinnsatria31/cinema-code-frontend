"use client";

/**
 * Hidden Admin Dashboard — /admin/manage-course
 * Only ADMIN sessions may enter; everyone else is bounced back to the
 * dashboard. The form upserts content rows straight into PostgreSQL via
 * POST /api/admin/content, so new video tracks go live without a deploy.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LEARNING_CATEGORIES } from "@/lib/mock-data";
import { adminUpsertContent } from "@/lib/api";
import { useStudent } from "@/lib/useStudent";
import type { ContentType } from "@/types";

interface FormState {
  title: string;
  category: string;
  videoId: string;
  order: string; // kept as string for the input; parsed on submit
  type: ContentType;
}

const INITIAL_FORM: FormState = {
  title: "",
  category: "HTML Dasar",
  videoId: "",
  order: "1",
  type: "VIDEO",
};

const inputClasses =
  "focus-neon w-full rounded-xl border border-line bg-midnight/60 px-3.5 py-2.5 text-sm leading-relaxed text-ice placeholder:text-mist/30";

const labelClasses =
  "mb-1.5 block font-mono text-[10px] uppercase tracking-[0.25em] leading-relaxed text-mist/60";

export default function ManageCoursePage() {
  const student = useStudent();
  const router = useRouter();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "saving" }
    | { kind: "saved"; message: string }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  // ── Role gate: ADMIN only, everyone else back to the dashboard ──
  useEffect(() => {
    if (student.isLoading) return;
    if (student.role !== "ADMIN") router.replace("/dashboard");
  }, [student.isLoading, student.role, router]);

  // Render nothing while deciding / redirecting — the page stays hidden
  if (student.role !== "ADMIN") return null;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const order = Number.parseInt(form.order, 10);
    if (!form.title.trim() || !Number.isFinite(order) || order < 1) {
      setStatus({ kind: "error", message: "A title and a positive track index are required." });
      return;
    }

    setStatus({ kind: "saving" });
    try {
      const result = await adminUpsertContent({
        requesterEmail: student.email ?? "",
        category: form.category,
        title: form.title.trim(),
        type: form.type,
        videoUrl: form.videoId.trim() || undefined,
        order,
      });
      setStatus({
        kind: "saved",
        message: `Saved "${form.title.trim()}" → ${result.module.title} · track ${order}`,
      });
      setForm((f) => ({ ...INITIAL_FORM, category: f.category, order: String(order + 1) }));
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "The API could not be reached.",
      });
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-6 py-14 lg:py-20">
      <motion.header
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10"
      >
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] leading-relaxed text-electric drop-shadow-neon">
          admin · live course management
        </p>
        <h1 className="pb-1 font-display text-3xl font-bold leading-[1.25] text-ice">
          Manage Course
        </h1>
        <p className="mt-3 max-w-lg text-sm font-light leading-relaxed text-mist">
          Upserts write straight to the production database — new tracks appear
          on the dashboard instantly, no redeploy. Signed in as{" "}
          <span className="text-electric">{student.email}</span>.
        </p>
      </motion.header>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="studio-card space-y-5 p-6"
      >
        <div>
          <label htmlFor="admin-title" className={labelClasses}>
            video title
          </label>
          <input
            id="admin-title"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="HTML Dasar : Semantic Elements (14/13)"
            className={inputClasses}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="admin-category" className={labelClasses}>
              category
            </label>
            <select
              id="admin-category"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className={inputClasses}
            >
              {LEARNING_CATEGORIES.map((c) => (
                <option key={c.id} value={c.title}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="admin-type" className={labelClasses}>
              challenge type
            </label>
            <select
              id="admin-type"
              value={form.type}
              onChange={(e) => set("type", e.target.value as ContentType)}
              className={inputClasses}
            >
              <option value="VIDEO">VIDEO</option>
              <option value="CHALLENGE">CHALLENGE</option>
              <option value="READING">READING</option>
            </select>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="admin-video" className={labelClasses}>
              youtube video id
            </label>
            <input
              id="admin-video"
              value={form.videoId}
              onChange={(e) => set("videoId", e.target.value)}
              placeholder="NBZ9Ro6UKV8"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="admin-order" className={labelClasses}>
              track index
            </label>
            <input
              id="admin-order"
              type="number"
              min={1}
              value={form.order}
              onChange={(e) => set("order", e.target.value)}
              className={inputClasses}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 pt-1">
          <button
            type="submit"
            disabled={status.kind === "saving"}
            className="rounded-full bg-neon px-7 py-2.5 text-sm font-medium leading-normal text-white shadow-glow transition-shadow duration-500 hover:shadow-glow-lg disabled:opacity-40"
          >
            {status.kind === "saving" ? "Saving…" : "Push track live"}
          </button>
          {status.kind === "saved" && (
            <p className="text-xs leading-relaxed text-mint">{status.message}</p>
          )}
          {status.kind === "error" && (
            <p className="text-xs leading-relaxed text-neon-soft">{status.message}</p>
          )}
        </div>
      </motion.form>
    </main>
  );
}
