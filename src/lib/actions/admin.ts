"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminForAction } from "@/lib/admin";

/**
 * Server Actions operator platform (docs/04 §2b).
 *
 * Tidak ada action di sini yang menyentuh `Invitation`, `Guest`, `Rsvp`,
 * `Greeting`, `GiftConfirmation`, atau `Payment`. Admin mengelola katalog dan
 * peran; ia tidak mengubah acara milik orang lain, dan status pembayaran tetap
 * hanya berubah lewat webhook Xendit.
 */

const templateActiveSchema = z.object({
  templateId: z.string().min(1),
  isActive: z.boolean(),
});

/**
 * Nyalakan/matikan template di galeri publik.
 * Template nonaktif hilang dari `/template` dan tidak bisa dipakai undangan
 * baru; undangan yang terlanjur memakainya tidak terpengaruh sama sekali.
 */
export async function setTemplateActive(input: {
  templateId: string;
  isActive: boolean;
}): Promise<void> {
  await requireAdminForAction();
  const { templateId, isActive } = templateActiveSchema.parse(input);

  await prisma.template.update({
    where: { id: templateId },
    data: { isActive },
  });

  revalidatePath("/admin/template");
  revalidatePath("/template");
}

const roleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["USER", "ADMIN"]),
});

/**
 * Angkat atau turunkan admin.
 *
 * Menolak bila sasarannya adalah admin yang sedang masuk. Tanpa itu, admin
 * terakhir bisa menurunkan dirinya sendiri dan mengunci semua orang di luar
 * panel — tidak ada jalan kembali lewat UI, hanya lewat SQL.
 */
export async function setUserRole(input: {
  userId: string;
  role: "USER" | "ADMIN";
}): Promise<void> {
  const admin = await requireAdminForAction();
  const { userId, role } = roleSchema.parse(input);

  if (userId === admin.id) {
    throw new Error(
      "Anda tidak bisa mengubah peran akun Anda sendiri. Minta admin lain yang melakukannya.",
    );
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/admin/pengguna");
}
