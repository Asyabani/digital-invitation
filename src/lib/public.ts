import { prisma } from "@/lib/db";

/**
 * Ambil undangan yang BOLEH diakses publik (PUBLISHED & belum lewat masa aktif).
 * Mengembalikan null bila tidak ada / masih draft / kedaluwarsa — pemanggil
 * memperlakukannya sebagai 404 (lihat docs/04 §5: jangan bocorkan draft).
 */
export async function getPublishedInvitationBySlug(slug: string) {
  const inv = await prisma.invitation.findUnique({ where: { slug } });
  if (!inv) return null;
  if (inv.status !== "PUBLISHED") return null;
  if (inv.activeUntil && inv.activeUntil.getTime() < Date.now()) return null;
  return inv;
}

/** Cari undangan aktif berdasarkan id (untuk endpoint publik aksi tamu). */
export async function getActiveInvitationById(id: string) {
  const inv = await prisma.invitation.findUnique({ where: { id } });
  if (!inv) return null;
  if (inv.status !== "PUBLISHED") return null;
  if (inv.activeUntil && inv.activeUntil.getTime() < Date.now()) return null;
  return inv;
}

/** Cari tamu via personalSlug pada suatu undangan (untuk link personal). */
export async function findGuest(invitationId: string, personalSlug?: string) {
  if (!personalSlug) return null;
  return prisma.guest.findUnique({
    where: { invitationId_personalSlug: { invitationId, personalSlug } },
  });
}
