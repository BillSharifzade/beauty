import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { asset } from "@/lib/asset";
import "./globals.css";
import "./ui.css";
import "./landing.css";
import "./product.css";

// The font files live in the repository rather than being fetched from Google
// at build time, so the build depends on nothing but the checkout. The
// Cyrillic subset is not optional: the whole page is Russian.
const inter = localFont({
  src: [
    { path: "./fonts/inter-latin-wght-normal.woff2", style: "normal", weight: "100 900" },
    { path: "./fonts/inter-cyrillic-wght-normal.woff2", style: "normal", weight: "100 900" },
  ],
  display: "swap",
  variable: "--font-sans",
});

// Fixel Display is the face hbshop.tj sets its own headings in; four static
// weights vendored from the shop's bundle.
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
  title: "Hayat Beauty — ассистент",
  description:
    "Ассистент Hayat Beauty отвечает покупателям по реальным остаткам магазинов, ведёт дневник кожи, предсказывает спрос и сам оформляет заявки поставщикам в пределах заданного бюджета.",
  icons: {
    icon: asset("/brand/hb-favicon.png"),
    apple: asset("/brand/hb-apple-touch-180.png"),
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
const themeBoot = `(function(){try{var t=localStorage.getItem("hb-theme");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t)}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${inter.variable} ${fixel.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
