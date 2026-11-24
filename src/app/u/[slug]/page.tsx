import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getInvitationForPublic, findGuest } from "@/lib/public";
import { getPackage } from "@/lib/packages";
import {
  contentSchema,
  themeSchema,
  sectionsOrderSchema,
} from "@/lib/validation/invitation";
import { InvitationView } from "@/components/invitation/InvitationView";

// Dinamis: baca DB + searchParams (?to). Fase lanjutan: ISR/"use cache".
export const instant = false;

export default async function PublicInvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ to?: string }>;
}) {
  const { slug } = await params;
  const { to } = await searchParams;

  const found = await getInvitationForPublic(slug);
  if (!found) notFound();
  const { invitation: inv, state } = found;

  // Masa aktif habis: tampilkan pesan, bukan 404 mendadak (docs/05 §6).
  if (state === "expired") {
    return (
      <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
        <h1 className="text-xl font-semibold">Undangan sudah tidak aktif</h1>
        <p className="text-neutral-600">
          Masa aktif undangan ini telah berakhir. Silakan hubungi pemilik acara
          untuk tautan terbaru.
        </p>
      </main>
    );
  }

  const content = contentSchema.safeParse(inv.content);
  const theme = themeSchema.safeParse(inv.themeConfig);
  const sections = sectionsOrderSchema.safeParse(inv.sectionsOrder);
  if (!content.success || !theme.success || !sections.success) notFound();

  const guest = await findGuest(inv.id, to);

  const greetings = await prisma.greeting.findMany({
    where: { invitationId: inv.id, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, name: true, message: true },
  });

  // Watermark branding hanya hilang pada paket yang memuat fitur itu.
  const info = inv.package ? getPackage(inv.package) : null;

  return (
    <InvitationView
      invitationId={inv.id}
      slug={inv.slug}
      content={content.data}
      theme={theme.data}
      sections={sections.data}
      guestName={guest?.name ?? (to ? decodeURIComponent(to) : undefined)}
      personalSlug={to}
      greetings={greetings}
      interactive
      showWatermark={!info?.features.removeWatermark}
      watermarkLabel="Dibuat dengan Undangan Digital"
    />
  );
}
