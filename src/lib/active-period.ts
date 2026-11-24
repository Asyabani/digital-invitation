import { ACTIVE_MONTHS } from "@/lib/packages";

/** Tambah n bulan ke sebuah tanggal (tanpa dependensi date library). */
export function addMonths(from: Date, months: number): Date {
  const d = new Date(from);
  d.setMonth(d.getMonth() + months);
  return d;
}

/**
 * Hitung masa aktif baru setelah pembayaran sukses (docs/05 §6).
 * Perpanjangan dihitung dari `max(now, activeUntil)` agar sisa masa aktif
 * tidak hangus.
 */
export function nextActiveUntil(
  currentActiveUntil: Date | null,
  now: Date = new Date(),
): Date {
  const base =
    currentActiveUntil && currentActiveUntil.getTime() > now.getTime()
      ? currentActiveUntil
      : now;
  return addMonths(base, ACTIVE_MONTHS);
}

/** Apakah undangan sudah lewat masa aktif? */
export function isExpired(
  status: string,
  activeUntil: Date | null,
  now: Date = new Date(),
): boolean {
  if (status === "EXPIRED") return true;
  return activeUntil !== null && activeUntil.getTime() < now.getTime();
}
