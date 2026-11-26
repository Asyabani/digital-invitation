import {
  Playfair_Display,
  Cormorant_Garamond,
  Great_Vibes,
  Marcellus,
  Italiana,
  Fraunces,
  Josefin_Sans,
  Inter,
  Lato,
  Nunito,
  Plus_Jakarta_Sans,
  Karla,
} from "next/font/google";

/*
  Font halaman undangan — pemilik memilihnya lewat `themeConfig.font`.
  Pemetaan nama → stack CSS ada di `font-stacks.ts` (modul murni, aman untuk
  komponen klien). Modul ini hanya diimpor Server Component `/u/[slug]` dan
  `/dashboard/[id]/tema`, supaya halaman marketing tidak ikut mengunduh enam
  famili font.
*/

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["400", "600"],
  subsets: ["latin"],
  display: "swap",
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const marcellus = Marcellus({
  variable: "--font-marcellus",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const italiana = Italiana({
  variable: "--font-italiana",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const josefin = Josefin_Sans({
  variable: "--font-josefin",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const lato = Lato({
  variable: "--font-lato",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
  display: "swap",
});

/** Dipasang pada elemen pembungkus agar variabel font undangan tersedia. */
export const invitationFontVars = [
  playfair.variable,
  cormorant.variable,
  greatVibes.variable,
  marcellus.variable,
  italiana.variable,
  fraunces.variable,
  josefin.variable,
  inter.variable,
  lato.variable,
  nunito.variable,
  jakarta.variable,
  karla.variable,
].join(" ");
