import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getActiveInvitationById, findGuest } from "@/lib/public";
import { greetingInputSchema } from "@/lib/validation/public";
import { rateLimit, clientIp } from "@/lib/ratelimit";

/** GET — daftar ucapan yang sudah di-APPROVE (publik). */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const inv = await getActiveInvitationById(id);
  if (!inv) {
    return NextResponse.json({ ok: false, error: "Undangan tidak tersedia." }, { status: 404 });
  }

  const greetings = await prisma.greeting.findMany({
    where: { invitationId: id, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, name: true, message: true, createdAt: true },
  });

  return NextResponse.json({ ok: true, data: greetings });
}

/** POST — kirim ucapan baru. Selalu masuk sebagai PENDING (moderasi). */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const inv = await getActiveInvitationById(id);
  if (!inv) {
    return NextResponse.json({ ok: false, error: "Undangan tidak tersedia." }, { status: 404 });
  }

  const limit = rateLimit(`${clientIp(req)}:${id}:greeting`, 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ ok: false, error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Payload tidak valid." }, { status: 400 });
  }

  const parsed = greetingInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Data tidak valid." }, { status: 400 });
  }
  const data = parsed.data;

  const guest = await findGuest(id, data.personalSlug);

  await prisma.greeting.create({
    data: {
      invitationId: id,
      guestId: guest?.id ?? null,
      name: data.name,
      message: data.message,
      // Selalu PENDING; moderasi manual oleh pemilik (lihat dashboard ucapan).
      status: "PENDING",
    },
  });

  return NextResponse.json({ ok: true });
}
