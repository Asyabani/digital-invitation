import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getActiveInvitationById, findGuest } from "@/lib/public";
import { giftInputSchema } from "@/lib/validation/public";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { canUse } from "@/lib/packages";

/**
 * POST /api/invitations/[id]/gifts — konfirmasi kado dari tamu (F9).
 * Respons TIDAK pernah meng-echo nominal; daftar & jumlahnya hanya untuk
 * pemilik di `/dashboard/[id]/amplop` (docs/04 §3).
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const inv = await getActiveInvitationById(id);
  if (!inv || !canUse(inv.package, "giftEnvelope")) {
    return NextResponse.json(
      { ok: false, error: "Undangan tidak tersedia." },
      { status: 404 },
    );
  }

  const limit = rateLimit(`${clientIp(req)}:${id}:gift`, 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "Terlalu banyak percobaan. Coba lagi nanti." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Payload tidak valid." },
      { status: 400 },
    );
  }

  const parsed = giftInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Data tidak valid." },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const guest = await findGuest(id, data.personalSlug);

  await prisma.giftConfirmation.create({
    data: {
      invitationId: id,
      guestId: guest?.id ?? null,
      name: data.name,
      method: data.method,
      amount: data.amount,
      proofUrl: data.proofUrl,
      note: data.note,
    },
  });

  return NextResponse.json({ ok: true });
}
