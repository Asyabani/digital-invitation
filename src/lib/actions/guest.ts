"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { ownInvitation, ownGuest } from "@/lib/owner";
import { canUse } from "@/lib/packages";
import { uniqueSlug } from "@/lib/slug";
import {
  guestInputSchema,
  guestUpdateSchema,
  guestImportSchema,
} from "@/lib/validation/guest";

/**
 * F5 — kelola tamu & link personal.
 * `personalSlug` unik per undangan dan dipakai sebagai `?to=` di `/u/[slug]`.
 */

/** Pastikan paket undangan memang memuat fitur link personal. */
function assertPersonalLinks(pkg: Parameters<typeof canUse>[0]) {
  if (!canUse(pkg, "personalLinks")) {
    throw new Error(
      "Link personal per tamu tersedia mulai paket Premium. Perpanjang atau tingkatkan paket untuk memakainya.",
    );
  }
}

/**
 * Buat `personalSlug` unik di dalam satu undangan.
 * `taken` berisi slug yang sudah dipakai di batch yang sedang berjalan, agar
 * impor massal tidak bentrok sebelum semuanya tersimpan.
 */
async function uniquePersonalSlug(
  invitationId: string,
  name: string,
  taken: Set<string>,
): Promise<string> {
  const personalSlug = await uniqueSlug(
    name,
    async (candidate) => {
      if (taken.has(candidate)) return true;
      const found = await prisma.guest.findUnique({
        where: {
          invitationId_personalSlug: { invitationId, personalSlug: candidate },
        },
        select: { id: true },
      });
      return Boolean(found);
    },
    "tamu",
  );
  taken.add(personalSlug);
  return personalSlug;
}

export async function addGuest(
  invitationId: string,
  input: { name: string; category?: string },
) {
  const inv = await ownInvitation(invitationId);
  assertPersonalLinks(inv.package);
  const data = guestInputSchema.parse(input);

  const personalSlug = await uniquePersonalSlug(inv.id, data.name, new Set());
  const guest = await prisma.guest.create({
    data: {
      invitationId: inv.id,
      name: data.name,
      category: data.category,
      personalSlug,
    },
  });

  revalidatePath(`/dashboard/${inv.id}/tamu`);
  return { ok: true as const, id: guest.id, personalSlug: guest.personalSlug };
}

/** Impor massal dari daftar tempelan/CSV sederhana. */
export async function importGuests(
  invitationId: string,
  rows: { name: string; category?: string }[],
) {
  const inv = await ownInvitation(invitationId);
  assertPersonalLinks(inv.package);
  const data = guestImportSchema.parse(rows);

  const taken = new Set<string>();
  let created = 0;
  for (const row of data) {
    const personalSlug = await uniquePersonalSlug(inv.id, row.name, taken);
    await prisma.guest.create({
      data: {
        invitationId: inv.id,
        name: row.name,
        category: row.category,
        personalSlug,
      },
    });
    created++;
  }

  revalidatePath(`/dashboard/${inv.id}/tamu`);
  return { ok: true as const, created };
}

export async function updateGuest(
  guestId: string,
  input: { name?: string; category?: string | null },
) {
  const guest = await ownGuest(guestId);
  const data = guestUpdateSchema.parse(input);
  await prisma.guest.update({
    where: { id: guestId },
    data: { name: data.name, category: data.category },
  });
  revalidatePath(`/dashboard/${guest.invitation.id}/tamu`);
  return { ok: true as const };
}

export async function deleteGuest(guestId: string) {
  const guest = await ownGuest(guestId);
  await prisma.guest.delete({ where: { id: guestId } });
  revalidatePath(`/dashboard/${guest.invitation.id}/tamu`);
  return { ok: true as const };
}

/** Tandai undangan sudah dikirim ke tamu ini (mis. setelah share WhatsApp). */
export async function markGuestSent(guestId: string) {
  const guest = await ownGuest(guestId);
  await prisma.guest.update({
    where: { id: guestId },
    data: { sentAt: guest.sentAt ? null : new Date() },
  });
  revalidatePath(`/dashboard/${guest.invitation.id}/tamu`);
  return { ok: true as const };
}
