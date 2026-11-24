import { Bricolage_Grotesque, Archivo } from "next/font/google";

/*
  Dunia "Lungsin" sengaja menolak refleks kategori ini — serif kontras tinggi
  dan huruf skrip emas. Kehangatannya datang dari warna kain dan struktur
  tenunan, bukan dari bentuk huruf.

  Font undangan (milik pemilik) dipisah ke `fonts-invitation.ts`.
*/

/** Suara judul: grotesque terkonstruksi, berirama seperti benang. */
export const fontDisplay = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

/** Teks & antarmuka: grotesque pekerja, tajam di ukuran kecil. */
export const fontSans = Archivo({
  variable: "--font-sans-ui",
  subsets: ["latin"],
  display: "swap",
});
