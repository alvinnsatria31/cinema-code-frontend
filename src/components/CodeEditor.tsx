"use client";

/**
 * Lightweight code editor with synth-pop syntax coloring.
 * Technique: a transparent <textarea> layered over a highlighted <pre>.
 * Zero heavy dependencies, perfectly responsive, native undo/redo.
 */
import { useRef } from "react";

/** Escape, then color HTML comments, tags, attributes, and strings. */
function highlight(code: string): string {
  const escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Single alternation pass so replacements never re-match each other
  return escaped.replace(
    /(&lt;!--[\s\S]*?--&gt;)|(&lt;\/?[a-zA-Z][\s\S]*?&gt;)|("[^"\n]*"|'[^'\n]*')/g,
    (match, comment, tag, str) => {
      if (comment) {
        return `<span class="italic text-mist/50">${comment}</span>`;
      }
      if (tag) {
        // One left-to-right pass over the tag token, so injected spans can
        // never be re-matched by a later rule.
        return tag.replace(
          /(&lt;\/?)([\w-]+)|([\w-]+)(=)|("[^"]*"|'[^']*')/g,
          (m: string, open?: string, name?: string, attr?: string, eq?: string, val?: string) => {
            if (name) return `${open}<span class="text-neon-soft">${name}</span>`; // tag name → soft cobalt
            if (attr) return `<span class="text-violet">${attr}</span>${eq}`; // attribute → violet
            if (val) return `<span class="text-mint">${val}</span>`; //          value → mint
            return m;
          },
        );
      }
      if (str) {
        return `<span class="text-mint">${str}</span>`;
      }
      return match;
    },
  );
}

const SHARED_CLASSES =
  "m-0 h-full w-full whitespace-pre-wrap break-words p-4 font-mono text-[13.5px] leading-relaxed";

export default function CodeEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string) => void;
}) {
  const preRef = useRef<HTMLPreElement>(null);

  // Keep the highlight layer scrolled exactly with the textarea
  const syncScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  return (
    <div className="relative h-64 overflow-hidden rounded-xl border border-line bg-midnight/80 lg:h-80">
      {/* Highlighted mirror (visual layer) */}
      <pre
        ref={preRef}
        aria-hidden
        className={`${SHARED_CLASSES} pointer-events-none absolute inset-0 overflow-auto text-ice/90`}
        // Trailing newline keeps the mirror's height in sync while typing
        dangerouslySetInnerHTML={{ __html: highlight(value) + "\n" }}
      />

      {/* Real input (interaction layer) — text invisible, caret neon */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        aria-label="Code editor"
        className={`${SHARED_CLASSES} focus-neon absolute inset-0 resize-none overflow-auto bg-transparent text-transparent caret-electric selection:bg-neon/25 selection:text-transparent`}
      />
    </div>
  );
}
