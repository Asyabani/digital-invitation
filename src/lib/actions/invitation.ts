"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { uniqueSlug } from "@/lib/slug";
import { ownInvitation } from "@/lib/owner";
import {
  contentSchema,
  themeSchema,
  sectionsOrderSchema,
  giftConfigSchema,
} from "@/lib/validation/invitation";
import { Prisma } from "@prisma/client";

/** F2 — buat undangan baru dari template. Dipakai sebagai form action. */
export async function createInvitation(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/masuk");

  const templateId = String(formData.get("templateId") ?? "");
  const template = await prisma.template.findUnique({
    where: { id: templateId },
  });
  if (!template) throw new Error("Template tidak ditemukan.");

  const title = String(formData.get("title") ?? "").trim() || template.name;
  const slug = await uniqueSlug(
    title,
    async (s) => Boolean(await prisma.invitation.findUnique({ where: { slug: s } })),
  );

  const inv = await prisma.invitation.create({
    data: {
      userId: session.user.id,
      templateId: template.id,
      slug,
      title,
      content: template.defaultContent as Prisma.InputJsonValue,
      themeConfig: template.defaultTheme as Prisma.InputJsonValue,
      sectionsOrder: template.defaultSections as Prisma.InputJsonValue,
    },
  });

  redirect(`/dashboard/${inv.id}/edit`);
}

/** F3 — simpan konten undangan (divalidasi Zod). */
export async function updateInvitationContent(id: string, rawContent: unknown) {
  const inv = await ownInvitation(id);
  const content = contentSchema.parse(rawContent);
  await prisma.invitation.update({
    where: { id },
    data: { content: content as Prisma.InputJsonValue },
  });
  revalidatePath(`/dashboard/${id}/edit`);
  revalidatePath(`/u/${inv.slug}`);
  return { ok: true as const };
}

/** F4 — simpan tema (palet, font, musik). */
export async function updateInvitationTheme(id: string, rawTheme: unknown) {
  const inv = await ownInvitation(id);
  const themeConfig = themeSchema.parse(rawTheme);
  await prisma.invitation.update({
    where: { id },
    data: { themeConfig: themeConfig as Prisma.InputJsonValue },
  });
  revalidatePath(`/dashboard/${id}/tema`);
  revalidatePath(`/dashboard/${id}/edit`);
  revalidatePath(`/u/${inv.slug}`);
  return { ok: true as const };
}

/** F4 — simpan toggle & urutan section. */
export async function updateSectionsOrder(id: string, rawSections: unknown) {
  const inv = await ownInvitation(id);
  const sectionsOrder = sectionsOrderSchema.parse(rawSections);
  await prisma.invitation.update({
    where: { id },
    data: { sectionsOrder: sectionsOrder as Prisma.InputJsonValue },
  });
  revalidatePath(`/dashboard/${id}/tema`);
  revalidatePath(`/dashboard/${id}/edit`);
  revalidatePath(`/u/${inv.slug}`);
  return { ok: true as const };
}

/**
 * F9 — simpan konfigurasi amplop digital (rekening/QRIS).
 * `null` menghapus konfigurasi. Data ini ditampilkan ke tamu, tetapi daftar
 * konfirmasi & nominalnya tetap privat (docs/01 F9).
 */
export async function updateGiftConfig(id: string, rawGiftConfig: unknown) {
  const inv = await ownInvitation(id);
  const giftConfig =
    rawGiftConfig === null ? null : giftConfigSchema.parse(rawGiftConfig);
  await prisma.invitation.update({
    where: { id },
    data: {
      giftConfig: (giftConfig as Prisma.InputJsonValue) ?? Prisma.DbNull,
    },
  });
  revalidatePath(`/dashboard/${id}/amplop`);
  revalidatePath(`/u/${inv.slug}`);
  return { ok: true as const };
}

/**
 * Kembalikan undangan ke DRAFT (menonaktifkan tautan publik).
 * Masa aktif & paket TIDAK dihapus: pemilik yang sudah membayar bisa
 * mengaktifkan lagi lewat `republishInvitation` tanpa membayar ulang.
 */
export async function unpublishInvitation(id: string) {
  const inv = await ownInvitation(id);
  await prisma.invitation.update({
    where: { id },
    data: { status: "DRAFT" },
  });
  revalidatePath(`/u/${inv.slug}`);
  revalidatePath(`/dashboard/${id}/edit`);
  return { ok: true as const };
}

/**
 * Aktifkan kembali undangan yang sudah dibayar dan masa aktifnya belum habis.
 * Tidak pernah bisa dipakai untuk menerbitkan undangan yang belum dibayar —
 * publish pertama hanya lewat webhook pembayaran (docs/05 §7).
 */
export async function republishInvitation(id: string) {
  const inv = await ownInvitation(id);
  if (!inv.package) throw new Error("Undangan belum dibayar.");
  if (!inv.activeUntil || inv.activeUntil.getTime() < Date.now()) {
    throw new Error("Masa aktif undangan sudah berakhir. Silakan perpanjang.");
  }
  await prisma.invitation.update({
    where: { id },
    data: { status: "PUBLISHED" },
  });
  revalidatePath(`/u/${inv.slug}`);
  revalidatePath(`/dashboard/${id}/edit`);
  return { ok: true as const };
}

export async function deleteInvitation(id: string) {
  await ownInvitation(id);
  await prisma.invitation.delete({ where: { id } });
  redirect("/dashboard");
}
