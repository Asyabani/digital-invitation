import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

/**
 * GET /api/cron/expire-invitations — dijalankan harian oleh Vercel Cron
 * (lihat `vercel.ts` & docs/05 §6). Menandai undangan yang lewat `activeUntil`
 * sebagai EXPIRED sehingga halaman publik menampilkan status kedaluwarsa,
 * bukan 404 mendadak.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // Tanpa secret, endpoint hanya boleh dipakai saat development.
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { ok: false, error: "CRON_SECRET belum dikonfigurasi." },
        { status: 500 },
      );
    }
  } else if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json(
      { ok: false, error: "Tidak diizinkan." },
      { status: 401 },
    );
  }

  const now = new Date();
  const due = await prisma.invitation.findMany({
    where: { status: "PUBLISHED", activeUntil: { lt: now } },
    select: { id: true, slug: true },
  });

  if (due.length > 0) {
    await prisma.invitation.updateMany({
      where: { id: { in: due.map((i) => i.id) } },
      data: { status: "EXPIRED" },
    });
    for (const i of due) revalidatePath(`/u/${i.slug}`);
    revalidatePath("/dashboard");
  }

  return NextResponse.json({ ok: true, data: { expired: due.length } });
}
