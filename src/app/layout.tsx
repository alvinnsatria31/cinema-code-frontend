import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import AppShell from "@/components/AppShell";
import Providers from "@/components/Providers";
import "./globals.css";

// Body (and heading fallback): Plus Jakarta Sans — premium, clean geometric.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700", "800"],
});

// Code: JetBrains Mono — crisp, made for editors.
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "The Cinema & Code Studio",
  description:
    "Learn HTML, CSS & JavaScript in a neon-lit, synth-pop-inspired studio.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${jetbrainsMono.variable}`}>
      <body>
        {/* Headings: Cabinet Grotesk via Fontshare (React hoists this link
            to <head>); Plus Jakarta Sans takes over if it can't load. */}
        <link
          rel="stylesheet"
          precedence="default"
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@500,700,800&display=swap"
        />
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
