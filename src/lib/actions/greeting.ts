"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { GreetingStatus } from "@prisma/client";

/** F8 — moderasi ucapan buku tamu (approve/reject). Hanya pemilik undangan. */
export async function moderateGreeting(
  greetingId: string,
  status: Extract<GreetingStatus, "APPROVED" | "REJECTED">,
) {
  const session = await auth();
  if (!session?.user) redirect("/masuk");

  const greeting = await prisma.greeting.findUnique({
    where: { id: greetingId },
    include: { invitation: { select: { id: true, userId: true, slug: true } } },
  });
  if (!greeting || greeting.invitation.userId !== session.user.id) {
    throw new Error("Ucapan tidak ditemukan atau bukan milik Anda.");
  }

  await prisma.greeting.update({ where: { id: greetingId }, data: { status } });
  revalidatePath(`/dashboard/${greeting.invitation.id}/ucapan`);
  revalidatePath(`/u/${greeting.invitation.slug}`);
  return { ok: true as const };
}
