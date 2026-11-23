import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getActiveInvitationById, findGuest } from "@/lib/public";
import { rsvpInputSchema } from "@/lib/validation/public";
import { rateLimit, clientIp } from "@/lib/ratelimit";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const inv = await getActiveInvitationById(id);
  if (!inv) {
    return NextResponse.json({ ok: false, error: "Undangan tidak tersedia." }, { status: 404 });
  }

  const limit = rateLimit(`${clientIp(req)}:${id}:rsvp`, 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ ok: false, error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Payload tidak valid." }, { status: 400 });
  }

  const parsed = rsvpInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Data tidak valid." }, { status: 400 });
  }
  const data = parsed.data;

  const guest = await findGuest(id, data.personalSlug);

  await prisma.rsvp.create({
    data: {
      invitationId: id,
      guestId: guest?.id ?? null,
      name: data.name,
      status: data.status,
      headcount: data.headcount,
      message: data.message,
    },
  });

  return NextResponse.json({ ok: true });
}
