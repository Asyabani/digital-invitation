import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { verifyCallbackToken, mapInvoiceStatus } from "@/lib/xendit";
import { nextActiveUntil } from "@/lib/active-period";

/**
 * POST /api/webhooks/xendit — satu-satunya sumber kebenaran status bayar.
 * Lihat docs/05 §5: verifikasi token → idempoten → transaksi → 200.
 */
export async function POST(req: Request) {
  if (!verifyCallbackToken(req)) {
    return NextResponse.json(
      { ok: false, error: "Token callback tidak valid." },
      { status: 401 },
    );
  }

  let payload: { id?: string; status?: string; external_id?: string };
  try {
    payload = (await req.json()) as typeof payload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Body bukan JSON yang valid." },
      { status: 400 },
    );
  }

  const invoiceId = payload.id;
  const invoiceStatus = payload.status;
  if (!invoiceId || !invoiceStatus) {
    return NextResponse.json(
      { ok: false, error: "Payload tidak lengkap (id/status)." },
      { status: 400 },
    );
  }

  const payment = await prisma.payment.findUnique({
    where: { externalId: invoiceId },
  });
  // Invoice tak dikenal (mis. milik environment lain): jangan buat Xendit
  // retry selamanya — cukup balas 200 dan abaikan.
  if (!payment) return NextResponse.json({ ok: true });

  const raw = payload as Prisma.InputJsonValue;
  const next = mapInvoiceStatus(invoiceStatus);

  // Sudah final → idempoten, tidak diproses ulang.
  if (payment.status === "PAID") return NextResponse.json({ ok: true });

  if (next === "PENDING") {
    await prisma.payment.update({ where: { id: payment.id }, data: { raw } });
    return NextResponse.json({ ok: true });
  }

  if (next !== "PAID") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: next, raw },
    });
    revalidatePath(`/dashboard/${payment.invitationId}/edit`);
    return NextResponse.json({ ok: true });
  }

  // --- PAID ---
  const now = new Date();
  // Klaim atomik: hanya satu webhook yang boleh berhasil memindahkan
  // PENDING → PAID, agar webhook ganda tidak dobel menambah masa aktif.
  const claimed = await prisma.payment.updateMany({
    where: { id: payment.id, status: { not: "PAID" } },
    data: { status: "PAID", paidAt: now, raw },
  });
  if (claimed.count === 0) return NextResponse.json({ ok: true });

  const inv = await prisma.invitation.findUnique({
    where: { id: payment.invitationId },
    select: { id: true, slug: true, activeUntil: true, publishedAt: true },
  });
  if (!inv) return NextResponse.json({ ok: true });

  await prisma.invitation.update({
    where: { id: inv.id },
    data: {
      status: "PUBLISHED",
      publishedAt: inv.publishedAt ?? now,
      activeUntil: nextActiveUntil(inv.activeUntil, now),
      package: payment.package,
    },
  });

  revalidatePath(`/u/${inv.slug}`);
  revalidatePath(`/dashboard/${inv.id}/edit`);
  revalidatePath("/dashboard");

  return NextResponse.json({ ok: true });
}
