import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

/*
============================================================
SECTION 1 — FONTS
============================================================
*/

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/*
============================================================
SECTION 2 — METADATA
============================================================
*/

export const metadata = {
  title: "OMMT Airlines",
  description: "OMMT Airlines — Marketing Made in Greece On Air",
};

/*
============================================================
SECTION 3 — ROOT LAYOUT
============================================================
*/

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="
          min-h-screen
          bg-[#02050c]
          text-white
          overflow-x-hidden
        "
      >
        {children}
      </body>
    </html>
  );
}
