import { z } from "zod";

// Skema input pengelolaan tamu (pemilik). Lihat docs/04 §2 "Tamu".

export const guestInputSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(100),
  category: z.string().trim().max(50).optional(),
});

export const guestUpdateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  category: z.string().trim().max(50).nullable().optional(),
});

/** Maksimum baris per impor massal, agar satu aksi tidak memblokir terlalu lama. */
export const IMPORT_MAX_ROWS = 500;

export const guestImportSchema = z
  .array(guestInputSchema)
  .min(1, "Tidak ada baris yang bisa diimpor")
  .max(IMPORT_MAX_ROWS, `Maksimum ${IMPORT_MAX_ROWS} tamu per impor`);

/**
 * Parse teks tempelan menjadi baris tamu.
 * Satu tamu per baris, kategori opsional setelah koma: `Budi Santoso, Keluarga`.
 */
export function parseGuestRows(raw: string): { name: string; category?: string }[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, ...rest] = line.split(",");
      const category = rest.join(",").trim();
      return {
        name: (name ?? "").trim(),
        category: category.length > 0 ? category : undefined,
      };
    })
    .filter((row) => row.name.length > 0);
}

export type GuestInput = z.infer<typeof guestInputSchema>;
