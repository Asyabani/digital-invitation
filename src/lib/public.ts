import { prisma } from "@/lib/db";
import { isExpired } from "@/lib/active-period";

/**
 * Ambil undangan untuk halaman publik `/u/[slug]`.
 *
 * - `DRAFT` / tidak ada → `null` (pemanggil memperlakukannya 404; docs/04 §5:
 *   jangan bocorkan keberadaan undangan draft).
 * - Lewat masa aktif → dikembalikan dengan `state: "expired"` agar halaman bisa
 *   menampilkan pesan kedaluwarsa, bukan 404 mendadak (docs/05 §6).
 */
export async function getInvitationForPublic(slug: string) {
  const inv = await prisma.invitation.findUnique({ where: { slug } });
  if (!inv) return null;
  if (inv.status === "DRAFT") return null;
  const state = isExpired(inv.status, inv.activeUntil) ? "expired" : "ok";
  return { invitation: inv, state } as const;
}

/**
 * Cari undangan yang benar-benar aktif berdasarkan id (untuk endpoint publik
 * aksi tamu: RSVP, ucapan, amplop). Draft & kedaluwarsa → null.
 */
export async function getActiveInvitationById(id: string) {
  const inv = await prisma.invitation.findUnique({ where: { id } });
  if (!inv) return null;
  if (inv.status !== "PUBLISHED") return null;
  if (isExpired(inv.status, inv.activeUntil)) return null;
  return inv;
}

/** Cari tamu via personalSlug pada suatu undangan (untuk link personal). */
export async function findGuest(invitationId: string, personalSlug?: string) {
  if (!personalSlug) return null;
  return prisma.guest.findUnique({
    where: { invitationId_personalSlug: { invitationId, personalSlug } },
  });
}
