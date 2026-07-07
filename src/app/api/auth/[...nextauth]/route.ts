/**
 * NextAuth route handler — serves /api/auth/* (signin, callback,
 * session, providers, …). All configuration lives in src/auth.ts.
 */
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
