"use client";

/**
 * The single source of the student's identity.
 * Signed in with Google → the session, carrying the persistent database
 * user id + role (students present as "Andin"; the admin keeps their name).
 * Offline / signed out → the safe mock profile with no database id.
 */
import { useSession } from "next-auth/react";
import { STUDENT_NAME } from "./mock-data";
import type { Role } from "@/types";

export interface StudentProfile {
  /** persistent Prisma User.id — undefined when not signed in */
  id: string | undefined;
  role: Role;
  name: string;
  email: string | null;
  image: string | null;
  isAuthenticated: boolean;
  /** true while NextAuth is still resolving the session */
  isLoading: boolean;
}

export function useStudent(): StudentProfile {
  const { data: session, status } = useSession();

  if (status === "authenticated" && session?.user) {
    return {
      id: session.user.id,
      role: session.user.role ?? "STUDENT",
      name: session.user.name ?? STUDENT_NAME,
      email: session.user.email ?? null,
      image: session.user.image ?? null,
      isAuthenticated: true,
      isLoading: false,
    };
  }

  // Safe mock parameters for local offline preview
  return {
    id: undefined,
    role: "STUDENT",
    name: STUDENT_NAME,
    email: null,
    image: null,
    isAuthenticated: false,
    isLoading: status === "loading",
  };
}
