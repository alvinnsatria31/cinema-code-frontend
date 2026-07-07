"use client";

/**
 * Sidebar auth block — three states:
 *  · signed in    → Google avatar + "Andin" + sign out
 *  · signed out   → "continue with google" (only when the provider is
 *                    actually configured on the server)
 *  · offline demo → quiet "offline studio mode" chip, mock Andin profile
 */
import { useEffect, useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { useStudent } from "@/lib/useStudent";

export default function AuthPanel() {
  const student = useStudent();
  const [googleReady, setGoogleReady] = useState(false);

  // Detect whether Google OAuth is configured without leaking env vars:
  // the providers endpoint only lists what the server actually has.
  useEffect(() => {
    fetch("/api/auth/providers")
      .then((r) => (r.ok ? r.json() : {}))
      .then((providers: Record<string, unknown>) => setGoogleReady("google" in providers))
      .catch(() => setGoogleReady(false));
  }, []);

  if (student.isAuthenticated) {
    return (
      <div className="studio-card mb-3 flex items-center gap-3 p-3">
        {student.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={student.image}
            alt={student.name}
            className="h-9 w-9 shrink-0 rounded-full border border-electric/40"
          />
        ) : (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-electric/40 bg-surface-2 font-display text-sm font-bold text-electric">
            {student.name[0]}
          </span>
        )}
        <span className="min-w-0 flex-1 py-0.5">
          <span className="block truncate text-sm font-medium leading-normal text-ice">
            {student.name}
          </span>
          <span className="block truncate font-mono text-[9px] uppercase tracking-[0.15em] leading-relaxed text-mist/50">
            {student.email ?? "google account"}
          </span>
        </span>
        <button
          onClick={() => signOut()}
          className="shrink-0 font-mono text-[9px] uppercase tracking-[0.15em] leading-relaxed text-mist/50 transition-colors hover:text-electric"
        >
          out
        </button>
      </div>
    );
  }

  if (googleReady) {
    return (
      <button
        onClick={() => signIn("google")}
        className="studio-card mb-3 flex w-full items-center justify-center gap-2.5 p-3 text-sm leading-normal text-ice transition-shadow duration-500 hover:shadow-glow"
      >
        {/* Google "G" */}
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.8 2.9c2.3-2.1 3.6-5.1 3.6-8.6z" />
          <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-4.9l-3.9 3C3.4 21.3 7.4 24 12 24z" />
          <path fill="#FBBC05" d="M5.3 14.5c-.2-.7-.4-1.4-.4-2.2s.1-1.5.4-2.2l-4-3C.5 8.6 0 10.2 0 12s.5 3.4 1.3 4.9l4-2.4z" />
          <path fill="#EA4335" d="M12 4.7c2.2 0 3.7 1 4.6 1.8l3.4-3.3C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.7 1.3 6.6l4 3c.9-2.8 3.6-4.9 6.7-4.9z" />
        </svg>
        continue with google
      </button>
    );
  }

  return (
    <div className="studio-card mb-3 p-3 text-center">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] leading-relaxed text-mist/50">
        offline studio mode
      </p>
      <p className="mt-0.5 text-xs leading-relaxed text-mist">
        signed in as <span className="text-electric">{student.name}</span> · demo
      </p>
    </div>
  );
}
