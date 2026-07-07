/**
 * Audio engine for the studio.
 *
 * Two layers, so celebrations are ALWAYS audible and real music plays
 * when the network allows:
 *
 *  1. Web Audio chime — a short major arpeggio synthesised in-browser.
 *     Needs no files and no network, so the achievement "ding" fires
 *     100% offline. This is the guaranteed layer.
 *
 *  2. Spotify iFrame API bus — the MusicPlayer registers its Spotify
 *     controller here; triggerCelebration() then force-plays a real
 *     LANY track (ILYSB / XXL). Silently no-ops offline or before the
 *     widget is ready, never throwing.
 */

// ── Curated LANY setlist (verified Spotify track ids) ────────

export interface LanyTrack {
  title: string;
  album: string;
  spotifyId: string;
  duration: number; // seconds, for the UI time labels
}

export const LANY_SETLIST: LanyTrack[] = [
  { title: "ILYSB", album: "Make Out", spotifyId: "2btKtacOXuMtC9WjcNRvAA", duration: 211 },
  { title: "Malibu Nights", album: "Malibu Nights", spotifyId: "0Eqg0CQ7bK3RQIMPw1A7pl", duration: 286 },
  { title: "XXL", album: "a beautiful blur", spotifyId: "4kFbxA8gCGx47zJrZ9KiQT", duration: 206 },
  { title: "Thru These Tears", album: "Malibu Nights", spotifyId: "6XsdD9ptVybzDNEtmfIxrv", duration: 222 },
];

/** Songs the reward modal force-plays. */
export const CELEBRATION_TRACKS = {
  romantic: "2btKtacOXuMtC9WjcNRvAA", // ILYSB
  highEnergy: "4kFbxA8gCGx47zJrZ9KiQT", // XXL
} as const;

/** Official "This Is LANY" top-hits compilation — the default embed. */
export const LANY_PLAYLIST_ID = "37i9dQZF1DZ06642clBv87";

// ── Layer 1: Web Audio celebration chime (offline-safe) ──────

let audioCtx: AudioContext | null = null;

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
  if (!Ctor) return null;
  audioCtx = audioCtx ?? new Ctor();
  return audioCtx;
}

/**
 * Resume the AudioContext inside a user gesture. Browsers block audio
 * until the first interaction, so AppShell calls this once on pointerdown.
 */
export function unlockAudio(): void {
  const ctx = getCtx();
  if (ctx && ctx.state === "suspended") void ctx.resume();
}

/** A bright C-major arpeggio — the "you did it" sparkle. */
export function playCelebrationChime(): void {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();

  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 · E5 · G5 · C6
  const master = ctx.createGain();
  master.gain.value = 0.5;
  master.connect(ctx.destination);

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const t = now + i * 0.11;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    osc.connect(gain).connect(master);
    osc.start(t);
    osc.stop(t + 0.95);
  });
}

// ── Layer 2: Spotify controller bus ──────────────────────────

type SpotifyPlayFn = (trackId: string) => void;
let spotifyPlay: SpotifyPlayFn | null = null;

/** The MusicPlayer registers (and clears) its Spotify controller here. */
export function registerSpotifyPlayer(fn: SpotifyPlayFn | null): void {
  spotifyPlay = fn;
}

/**
 * Celebrate: guaranteed chime + best-effort real LANY track. Called by
 * the reward modal the instant it appears.
 */
export function triggerCelebration(
  trackId: string = CELEBRATION_TRACKS.romantic,
): void {
  playCelebrationChime();
  try {
    spotifyPlay?.(trackId);
  } catch {
    /* widget not ready / offline — the chime already celebrated */
  }
}
