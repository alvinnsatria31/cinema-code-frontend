"use client";

/**
 * App-wide cinematic page transition.
 * `template.tsx` remounts on every route change, so each page enters with
 * a soft fade + gentle scale — like a scene cut, never a hard reload.
 */
import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.985, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
