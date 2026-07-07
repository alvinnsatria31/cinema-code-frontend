"use client";

/**
 * LANY mini-player — now a REAL player.
 *
 * A Spotify embed is created through the official iFrame API, so it
 * streams actual tracks and can be controlled programmatically (the
 * reward modal force-plays a song through the same controller). Our
 * custom cobalt skin sits on top; the Spotify widget renders beneath.
 *
 * Offline or before the API loads, every control no-ops gracefully and
 * the UI still renders — nothing throws.
 */
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  LANY_PLAYLIST_ID,
  LANY_SETLIST,
  registerSpotifyPlayer,
  unlockAudio,
} from "@/lib/audio";

// ── Minimal typings for the Spotify iFrame API ───────────────

interface SpotifyPlaybackData {
  isPaused: boolean;
  position: number;
  duration: number;
}
interface SpotifyController {
  loadUri(uri: string): void;
  play(): void;
  pause(): void;
  togglePlay(): void;
  resume(): void;
  seek(seconds: number): void;
  addListener(
    event: "ready" | "playback_update",
    cb: (e: { data: SpotifyPlaybackData }) => void,
  ): void;
  destroy(): void;
}
interface SpotifyIframeApi {
  createController(
    el: HTMLElement,
    opts: { uri: string; width?: string | number; height?: string | number },
    cb: (controller: SpotifyController) => void,
  ): void;
}
declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void;
    __spotifyIframeApi?: SpotifyIframeApi;
  }
}

const API_SRC = "https://open.spotify.com/embed/iframe-api/v1";

// Fixed pseudo-waveform (server & client render identically)
const WAVE = [
  38, 62, 45, 80, 55, 70, 40, 88, 60, 48, 75, 52, 66, 90, 44, 58, 72, 50, 84,
  62, 46, 68, 54, 78,
];

function fmt(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function MusicPlayer({ hostEmbed = true }: { hostEmbed?: boolean }) {
  const embedRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SpotifyController | null>(null);

  // "playlist" = the full This Is LANY compilation; a number = setlist track
  const [selection, setSelection] = useState<"playlist" | number>("playlist");
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [fraction, setFraction] = useState(0); // 0..1 from Spotify events

  const song = selection === "playlist" ? null : LANY_SETLIST[selection];
  const durationSec = song?.duration ?? 0;
  const elapsed = fraction * durationSec;

  // ── Boot the Spotify iFrame API and build a controller ──────
  useEffect(() => {
    // Only the primary (sidebar) instance hosts the real embed; the
    // mobile-sheet copy stays a passive skin to avoid duplicate iframes.
    if (!hostEmbed || !embedRef.current) return;
    let cancelled = false;

    const build = (api: SpotifyIframeApi) => {
      if (cancelled || !embedRef.current) return;
      api.createController(
        embedRef.current,
        {
          // Boot on the full top-hits compilation — the whole catalog
          uri: `spotify:playlist:${LANY_PLAYLIST_ID}`,
          width: "100%",
          height: 152,
        },
        (controller) => {
          if (cancelled) return;
          controllerRef.current = controller;
          setReady(true);

          controller.addListener("playback_update", (e) => {
            setPlaying(!e.data.isPaused);
            const f = e.data.duration > 0 ? e.data.position / e.data.duration : 0;
            setFraction(Math.min(1, Math.max(0, f)));
          });

          // Let the reward modal force-play a real LANY song through us
          registerSpotifyPlayer((trackId) => {
            controller.loadUri(`spotify:track:${trackId}`);
            controller.play();
            const i = LANY_SETLIST.findIndex((t) => t.spotifyId === trackId);
            if (i >= 0) setSelection(i);
          });
        },
      );
    };

    if (window.__spotifyIframeApi) {
      build(window.__spotifyIframeApi);
    } else {
      // The API calls this global once the script has loaded
      window.onSpotifyIframeApiReady = (api) => {
        window.__spotifyIframeApi = api;
        build(api);
      };
      if (!document.querySelector(`script[src="${API_SRC}"]`)) {
        const s = document.createElement("script");
        s.src = API_SRC;
        s.async = true;
        document.body.appendChild(s);
      }
    }

    return () => {
      cancelled = true;
      registerSpotifyPlayer(null);
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, [hostEmbed]);

  // ── Controls (guarded — safe before ready / offline) ────────
  const selectTrack = (i: number) => {
    setSelection(i);
    setFraction(0);
    unlockAudio();
    const c = controllerRef.current;
    if (c) {
      c.loadUri(`spotify:track:${LANY_SETLIST[i].spotifyId}`);
      c.play();
    }
  };

  const selectPlaylist = () => {
    setSelection("playlist");
    setFraction(0);
    unlockAudio();
    const c = controllerRef.current;
    if (c) {
      c.loadUri(`spotify:playlist:${LANY_PLAYLIST_ID}`);
      c.play();
    }
  };

  const togglePlay = () => {
    unlockAudio();
    controllerRef.current?.togglePlay();
    if (!controllerRef.current) setPlaying((p) => !p); // optimistic when offline
  };

  const seekTo = (f: number) => {
    setFraction(f);
    if (durationSec > 0) controllerRef.current?.seek(f * durationSec);
  };

  const nextIndex = selection === "playlist" ? 0 : (selection + 1) % LANY_SETLIST.length;
  const prevIndex =
    selection === "playlist"
      ? LANY_SETLIST.length - 1
      : (selection - 1 + LANY_SETLIST.length) % LANY_SETLIST.length;

  return (
    <div className="studio-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] leading-relaxed text-mist/50">
          ♫ studio setlist
        </p>
        <span
          className={`font-mono text-[9px] uppercase tracking-[0.2em] leading-relaxed ${
            ready ? "text-mint" : "text-mist/40"
          }`}
        >
          {ready ? "● spotify live" : "○ connecting"}
        </span>
      </div>

      {/* ── Now playing (roomy bounds — titles never clip) ── */}
      <div className="flex items-start gap-3">
        <motion.div
          animate={playing ? { rotate: 360 } : {}}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-electric/30 bg-gradient-to-br from-neon/60 to-electric/20 shadow-glow"
        >
          <span className="h-2 w-2 rounded-full bg-midnight" />
        </motion.div>
        <div className="min-w-0 flex-1 py-0.5">
          {/* Plus Jakarta Sans, two-line wrap, relaxed leading — long
              titles fold beautifully instead of clipping */}
          <p className="line-clamp-2 break-words font-body text-sm font-medium leading-relaxed text-ice">
            {song ? song.title : "This Is LANY"}
          </p>
          <p className="line-clamp-1 break-words font-body text-xs leading-relaxed text-mist/60">
            {song ? `LANY · ${song.album}` : "official top hits compilation"}
          </p>
        </div>
      </div>

      {/* ── Waveform seek bar ───────────────────────────── */}
      <div className="mt-3 flex h-8 items-end gap-[3px]" role="slider" aria-label="Seek">
        {WAVE.map((h, i) => {
          const active = i / WAVE.length <= fraction;
          return (
            <button
              key={i}
              onClick={() => seekTo((i + 0.5) / WAVE.length)}
              className={`flex-1 rounded-full transition-all duration-300 ${
                active ? "bg-electric shadow-glow-electric" : "bg-line hover:bg-neon-soft/40"
              } ${playing && active ? "animate-breathe" : ""}`}
              style={{ height: `${h}%` }}
              aria-label={`Seek to ${Math.round((i / WAVE.length) * 100)}%`}
            />
          );
        })}
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] leading-relaxed text-mist/50">
        <span>{song ? fmt(elapsed) : "—"}</span>
        <span>{song ? fmt(durationSec) : "compilation"}</span>
      </div>

      {/* ── Controls ────────────────────────────────────── */}
      <div className="mt-2 flex items-center justify-center gap-5">
        <button
          onClick={() => selectTrack(prevIndex)}
          className="text-mist transition-colors hover:text-ice"
          aria-label="Previous track"
        >
          ⏮
        </button>
        <motion.button
          onClick={togglePlay}
          whileTap={{ scale: 0.92 }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-neon text-sm text-white shadow-glow transition-shadow hover:shadow-glow-lg"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? "❚❚" : "▶"}
        </motion.button>
        <button
          onClick={() => selectTrack(nextIndex)}
          className="text-mist transition-colors hover:text-ice"
          aria-label="Next track"
        >
          ⏭
        </button>
      </div>

      {/* ── Setlist (playlist first, then the classics) ──── */}
      <ul className="mt-3 border-t border-line pt-2">
        <li>
          <button
            onClick={selectPlaylist}
            className={`flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-xs leading-relaxed transition-colors ${
              selection === "playlist"
                ? "bg-surface-2 text-electric"
                : "text-mist hover:bg-surface-2/60 hover:text-ice"
            }`}
          >
            <span className="min-w-0 flex-1 break-words">This Is LANY — full compilation</span>
            <span className="shrink-0 font-mono text-[10px] text-mist/50">all</span>
          </button>
        </li>
        {LANY_SETLIST.map((s, i) => (
          <li key={s.spotifyId}>
            <button
              onClick={() => selectTrack(i)}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-xs leading-relaxed transition-colors ${
                selection === i
                  ? "bg-surface-2 text-electric"
                  : "text-mist hover:bg-surface-2/60 hover:text-ice"
              }`}
            >
              <span className="min-w-0 flex-1 break-words">{s.title}</span>
              <span className="shrink-0 font-mono text-[10px] text-mist/50">
                {fmt(s.duration)}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {/* ── The real Spotify platform widget ────────────── */}
      {hostEmbed && (
        <div className="mt-3 overflow-hidden rounded-xl">
          <div ref={embedRef} />
          {!ready && (
            <p className="pt-2 text-center font-mono text-[9px] uppercase tracking-[0.2em] leading-relaxed text-mist/30">
              streaming widget loads when online
            </p>
          )}
        </div>
      )}
    </div>
  );
}
