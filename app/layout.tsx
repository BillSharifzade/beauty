import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { asset } from "@/lib/asset";
import "./globals.css";
import "./ui.css";
import "./landing.css";
import "./product.css";

// The font files live in the repository rather than being fetched from Google
// at build time, so the build depends on nothing but the checkout. The
// Cyrillic subsets are not optional: the page is Russian.
const inter = localFont({
  src: [
    { path: "./fonts/inter-latin-wght-normal.woff2", style: "normal", weight: "100 900" },
    { path: "./fonts/inter-cyrillic-wght-normal.woff2", style: "normal", weight: "100 900" },
  ],
  display: "swap",
  variable: "--font-sans",
});

// Cormorant carries the brand: the wordmark, the headlines, the names on the
// labels. A high-contrast serif set large and light is the register of a
// beauty house rather than of a software product.
const cormorant = localFont({
  src: [
    { path: "./fonts/cormorant-latin-wght-normal.woff2", style: "normal", weight: "300 700" },
    { path: "./fonts/cormorant-cyrillic-wght-normal.woff2", style: "normal", weight: "300 700" },
  ],
  display: "swap",
  variable: "--font-serif",
});

// Fixel Display does the small, wide, uppercase work: eyebrows, captions,
// buttons, the print on the labels.
const fixel = localFont({
  src: [
    { path: "./fonts/fixel-display-light.woff2", style: "normal", weight: "300" },
    { path: "./fonts/fixel-display-regular.woff2", style: "normal", weight: "400" },
    { path: "./fonts/fixel-display-medium.woff2", style: "normal", weight: "500" },
    { path: "./fonts/fixel-display-semibold.woff2", style: "normal", weight: "600" },
  ],
  display: "swap",
  variable: "--font-display",
});

// Relative metadata URLs (icons, the OpenGraph image) are resolved against
// this, which is how they pick up the /beauty prefix on GitHub Pages.
const site = new URL(`https://billsharifzade.github.io${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}`);

export const metadata: Metadata = {
  metadataBase: site,
  title: "Velvé — косметика, собранная точно",
  description:
    "Velvé: коллекция из пяти продуктов — крем, тинт, шампунь, тушь и карандаш. Каждая деталь на своём месте, и у каждой есть причина там находиться.",
  icons: {
    icon: [
      { url: asset("/brand/favicon.svg"), type: "image/svg+xml" },
      { url: asset("/brand/icon-192.png"), sizes: "192x192", type: "image/png" },
    ],
    apple: asset("/brand/apple-touch-180.png"),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f8" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0d" },
  ],
};

// Runs before the first paint, so a stored theme never flashes the other one.
// The key matches lib/theme.ts.
const themeBoot = `(function(){try{var t=localStorage.getItem("velve-theme");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t)}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ru"
      className={`${inter.variable} ${cormorant.variable} ${fixel.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
        {/* Without scripting the scene never arrives; the loader must not wait for it. */}
        <noscript>
          <style>{`.pr-loader{display:none}`}</style>
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
