import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Bhagini Graphics — Online Printing Platform",
  description:
    "Professional quality printing with live pricing, bank-transfer checkout, and real-time order tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`} data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/*
          Material Symbols icon font loaded via <link> in the root layout (loads app-wide).
          display=block is intentional: it avoids a flash of the ligature text
          (e.g. "account_balance_wallet") before the icon font swaps in.

          Axes are PINNED to what the app actually renders. globals.css sets
          `"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24` and the only override in the
          whole codebase is FILL 1, so opsz/wght/GRAD never vary. Requesting the
          full axis space (20..48, 100..700, -50..200) downloaded a 3.9 MB font on
          every page; pinning them costs 449 KB — 3.79 MB less, ~88% smaller.

          Deliberately NOT using `icon_names=` subsetting: category icons come
          from the database and several components take an icon name as a prop,
          so an unlisted icon would render as raw text ("business_center").
          Narrowing the axes keeps every glyph available.
        */}
        {/* eslint-disable-next-line @next/next/google-font-display, @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&display=block"
        />
      </head>
      <body className="bg-background text-on-background overflow-x-hidden selection:bg-secondary-container selection:text-white">
        {children}
      </body>
    </html>
  );
}
