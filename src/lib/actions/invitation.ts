"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { uniqueSlug } from "@/lib/slug";
import { contentSchema } from "@/lib/validation/invitation";
import type { Prisma } from "@prisma/client";

/** Pastikan undangan milik user yang login; kembalikan undangan atau lempar. */
async function ownInvitation(id: string) {
  const session = await auth();
  if (!session?.user) redirect("/masuk");
  const inv = await prisma.invitation.findUnique({ where: { id } });
  if (!inv || inv.userId !== session.user.id) {
    throw new Error("Undangan tidak ditemukan atau bukan milik Anda.");
  }
  return inv;
}

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

/**
 * Fase 1 (SEMENTARA) — terbitkan undangan tanpa pembayaran untuk uji coba.
 * Di Fase 2 ini DIGANTI oleh alur pembayaran Xendit (lihat docs/05).
 */
export async function publishForTesting(id: string) {
  const inv = await ownInvitation(id);
  const oneYear = new Date();
  oneYear.setFullYear(oneYear.getFullYear() + 1);
  await prisma.invitation.update({
    where: { id },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
      activeUntil: oneYear,
    },
  });
  revalidatePath(`/u/${inv.slug}`);
  revalidatePath(`/dashboard/${id}/edit`);
  return { ok: true as const };
}

/** Kembalikan undangan ke DRAFT (menonaktifkan tautan publik). */
export async function unpublishInvitation(id: string) {
  const inv = await ownInvitation(id);
  await prisma.invitation.update({
    where: { id },
    data: { status: "DRAFT", publishedAt: null, activeUntil: null },
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
