import type { TemplateCategory } from "@prisma/client";

/**
 * Label tampilan untuk `Template.category`.
 *
 * Dulu peta ini hidup di dalam halaman galeri dan memakai kunci huruf besar
 * sementara seed menulis huruf kecil, jadi labelnya diam-diam jatuh ke nilai
 * mentah ("pernikahan"). Sekarang kolomnya enum Prisma, sehingga `Record`
 * di bawah ini wajib lengkap dan TypeScript yang menjaganya.
 */
export const KATEGORI_LABEL: Record<TemplateCategory, string> = {
  PERNIKAHAN: "Pernikahan",
  AQIQAH: "Aqiqah",
  ULANG_TAHUN: "Ulang tahun",
  KORPORAT: "Korporat",
};

/** Urutan tampil kategori — dari pasar terbesar ke terkecil. */
export const KATEGORI_URUT: TemplateCategory[] = [
  "PERNIKAHAN",
  "AQIQAH",
  "ULANG_TAHUN",
  "KORPORAT",
];

/** Potongan URL per kategori, dipakai `?kategori=` di galeri template. */
export const KATEGORI_SLUG: Record<TemplateCategory, string> = {
  PERNIKAHAN: "pernikahan",
  AQIQAH: "aqiqah",
  ULANG_TAHUN: "ulang-tahun",
  KORPORAT: "korporat",
};

/** Kebalikan `KATEGORI_SLUG`; nilai asing jadi `null` (= tampilkan semua). */
export function kategoriDariSlug(
  slug: string | undefined,
): TemplateCategory | null {
  if (!slug) return null;
  const found = KATEGORI_URUT.find((k) => KATEGORI_SLUG[k] === slug);
  return found ?? null;
}
