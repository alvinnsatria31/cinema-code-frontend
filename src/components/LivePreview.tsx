"use client";

/**
 * Live Preview — renders her HTML/CSS in a sandboxed iframe, updating
 * a beat after she stops typing. The instant "I can do this!" moment.
 */
import { useEffect, useState } from "react";

const FRAME_STYLES = `
  <style>
    body {
      font-family: system-ui, sans-serif;
      padding: 20px;
      color: #1a1625;
      background: #ffffff;
      line-height: 1.6;
    }
  </style>
`;

export default function LivePreview({ code }: { code: string }) {
  const [doc, setDoc] = useState(FRAME_STYLES + code);

  // Near-instant: re-render 150ms after the last keystroke. The iframe is
  // fed her raw code verbatim via srcDoc — whatever she types, renders.
  useEffect(() => {
    const t = setTimeout(() => setDoc(FRAME_STYLES + code), 150);
    return () => clearTimeout(t);
  }, [code]);

  return (
    <div data-tour="preview" className="studio-card overflow-hidden">
      <header className="flex items-center justify-between border-b border-line px-5 py-3">
        <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-mist">
          live preview
        </h3>
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-mint">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint shadow-glow-mint" />
          live
        </span>
      </header>

      <iframe
        title="Live preview of your code"
        // allow-scripts so her first JS lessons work; no same-origin access
        sandbox="allow-scripts"
        srcDoc={doc}
        className="h-48 w-full bg-white lg:h-56"
      />
    </div>
  );
}
