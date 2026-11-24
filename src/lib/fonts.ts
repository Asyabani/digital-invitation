import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";

// Font antarmuka (dashboard & marketing). Font undangan dipisah ke
// `fonts-invitation.ts` agar hanya dimuat di route yang memang memakainya.

export const fontSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const fontMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/** Suara judul halaman marketing (kelas `.font-display` di globals.css). */
export const fontDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});
