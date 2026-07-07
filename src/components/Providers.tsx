"use client";

/**
 * Client-side context providers. SessionProvider makes useSession()
 * available everywhere; it works fine with no active session (demo mode).
 */
import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
