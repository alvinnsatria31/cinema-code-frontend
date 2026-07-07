"use client";

/**
 * The Cinema — a distraction-free stage for the lesson video.
 * Accepts a full YouTube embed URL or a bare video ID.
 */
import { motion } from "framer-motion";

function toEmbedUrl(videoUrl: string): string {
  if (videoUrl.startsWith("http")) return videoUrl;
  // Bare video ID → official embed URL, with related videos limited
  return `https://www.youtube.com/embed/${videoUrl}?rel=0&modestbranding=1`;
}

export default function CinemaPanel({
  videoUrl,
  title,
}: {
  videoUrl?: string;
  title: string;
}) {
  const hasVideo = Boolean(videoUrl && !videoUrl.startsWith("REPLACE"));

  return (
    <motion.section
      data-tour="cinema"
      className="studio-card flex h-full flex-col overflow-hidden"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <header className="flex items-center gap-3 border-b border-line px-5 py-3.5">
        <span className="h-2 w-2 rounded-full bg-neon shadow-glow" />
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-mist">
          the cinema
        </h2>
      </header>

      <div className="relative flex-1 bg-black/40 p-4">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-line">
          {hasVideo ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={toEmbedUrl(videoUrl!)}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            // Elegant placeholder until a real WPU video ID is configured
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-neon/40 text-neon shadow-glow">
                ▶
              </span>
              <p className="font-mono text-xs tracking-[0.2em] text-mist/60">
                video loading soon
              </p>
            </div>
          )}
        </div>

        <p className="mt-4 px-1 font-display text-sm font-medium text-ice">{title}</p>
      </div>
    </motion.section>
  );
}
