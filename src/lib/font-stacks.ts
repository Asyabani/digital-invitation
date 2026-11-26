/*
  Pemetaan nama font undangan → stack CSS. Modul ini sengaja TIDAK mengimpor
  `next/font` agar aman dipakai komponen klien (editor tema & pratinjau).
  Deklarasi font-nya sendiri ada di `fonts-invitation.ts`, yang hanya diimpor
  dari Server Component.

  Daftar di bawah ini adalah satu-satunya font yang benar-benar dimuat — kalau
  menambah pilihan di sini, tambahkan juga deklarasinya di `fonts-invitation.ts`,
  kalau tidak pilihan pemilik akan diam-diam jatuh ke font bawaan browser.
*/

const FONT_STACK: Record<string, string> = {
  "Playfair Display": "var(--font-playfair), ui-serif, Georgia, serif",
  "Cormorant Garamond": "var(--font-cormorant), ui-serif, Georgia, serif",
  "Great Vibes": "var(--font-great-vibes), ui-serif, cursive",
  Marcellus: "var(--font-marcellus), ui-serif, Georgia, serif",
  Italiana: "var(--font-italiana), ui-serif, Georgia, serif",
  Fraunces: "var(--font-fraunces), ui-serif, Georgia, serif",
  "Josefin Sans": "var(--font-josefin), ui-sans-serif, system-ui, sans-serif",
  Inter: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
  Lato: "var(--font-lato), ui-sans-serif, system-ui, sans-serif",
  Nunito: "var(--font-nunito), ui-sans-serif, system-ui, sans-serif",
  "Plus Jakarta Sans":
    "var(--font-jakarta), ui-sans-serif, system-ui, sans-serif",
  Karla: "var(--font-karla), ui-sans-serif, system-ui, sans-serif",
};

/** Pilihan font judul yang tersedia di editor tema. */
export const HEADING_FONTS = [
  "Playfair Display",
  "Cormorant Garamond",
  "Great Vibes",
  "Marcellus",
  "Italiana",
  "Fraunces",
  "Josefin Sans",
  "Inter",
];

/** Pilihan font isi yang tersedia di editor tema. */
export const BODY_FONTS = [
  "Inter",
  "Lato",
  "Nunito",
  "Plus Jakarta Sans",
  "Karla",
];

/** Terjemahkan nama font jadi stack CSS; nama asing jatuh ke serif/sans aman. */
export function fontStack(name: string, fallback: "serif" | "sans"): string {
  return (
    FONT_STACK[name] ??
    (fallback === "serif"
      ? "ui-serif, Georgia, serif"
      : "ui-sans-serif, system-ui, sans-serif")
  );
}
