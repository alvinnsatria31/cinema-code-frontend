/**
 * NextAuth (Auth.js v5) configuration — production Google OAuth.
 *
 * On sign-in the jwt callback syncs the Google profile to the Express +
 * Prisma backend (/api/users/sync): the user is upserted by email, gets
 * their role (ADMIN for ADMIN_EMAILS, STUDENT otherwise), and their
 * persistent database id — which every progress/reward row binds to —
 * rides along in the session as session.user.id / session.user.role.
 *
 * Offline-safe: without Google credentials the provider list is empty,
 * and if the API is unreachable the role falls back to the local
 * ADMIN_EMAILS check so sign-in never hard-fails.
 */
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import type { Role } from "@/types";

const googleConfigured = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
);

// Server-to-server base URL for the Express API
const API_URL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "alvinatmaja23@gmail.com")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  // Real deployments MUST set AUTH_SECRET; the fallback only exists so
  // the offline demo preview never crashes.
  secret: process.env.AUTH_SECRET ?? "cinema-code-offline-demo-secret",
  providers: googleConfigured
    ? [
        Google({
          clientId: process.env.AUTH_GOOGLE_ID,
          clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
      ]
    : [],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Runs once at sign-in: bind this Google account to a DB user
      if (account && profile?.email) {
        const email = profile.email.toLowerCase();
        const fallbackRole: Role = adminEmails().includes(email) ? "ADMIN" : "STUDENT";
        try {
          const res = await fetch(`${API_URL}/api/users/sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: profile.email, name: profile.name }),
          });
          if (res.ok) {
            const data = (await res.json()) as {
              user: { id: string; role: Role };
            };
            token.userId = data.user.id;
            token.role = data.user.role;
          } else {
            token.role = fallbackRole;
          }
        } catch {
          // API offline — keep the session usable with a local role guess
          token.role = fallbackRole;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.userId as string | undefined) ?? session.user.id;
        session.user.role = (token.role as Role | undefined) ?? "STUDENT";
        // App-identity mapping: student accounts present as "Andin";
        // the admin keeps their real Google name.
        if (session.user.role === "STUDENT") {
          session.user.name = "Andin";
        }
      }
      return session;
    },
  },
});
