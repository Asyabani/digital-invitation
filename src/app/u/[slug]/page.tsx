import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getInvitationForPublic, findGuest } from "@/lib/public";
import { canUse } from "@/lib/packages";
import {
  contentSchema,
  themeSchema,
  sectionsOrderSchema,
  giftConfigSchema,
} from "@/lib/validation/invitation";
import { InvitationView } from "@/components/invitation/InvitationView";
import { invitationFontVars } from "@/lib/fonts-invitation";
import { invitationTitle, prettyEventDate } from "@/lib/invitation-title";
import type { Metadata } from "next";

// Dinamis: baca DB + searchParams (?to). Fase lanjutan: ISR/"use cache".
export const instant = false;

/**
 * Pratinjau saat tautan dibagikan di WhatsApp — jalur utama tamu membuka
 * undangan (docs/06 §1). Hanya data yang memang publik: judul & tanggal acara.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const found = await getInvitationForPublic(slug);
  const content = found ? contentSchema.safeParse(found.invitation.content) : null;

  if (!found || found.state === "expired" || !content?.success) {
    return { title: "Undangan Digital" };
  }

  const title = invitationTitle(content.data);
  const description = `${prettyEventDate(content.data.event.date)} · ${content.data.event.venueName}`;
  const cover = content.data.gallery[0];

  return {
    title: `Undangan ${title}`,
    description,
    openGraph: {
      title: `Undangan ${title}`,
      description,
      type: "website",
      locale: "id_ID",
      images: cover ? [cover] : undefined,
    },
  };
}

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
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Undangan sudah tidak aktif
        </h1>
        <p className="text-muted-foreground">
          Masa aktif undangan ini telah berakhir. Silakan hubungi pemilik acara
          untuk mendapatkan tautan terbaru.
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

  // Amplop digital hanya tampil bila pemilik mengisinya DAN paketnya memuat
  // fitur tersebut. `giftConfig` berisi rekening/QRIS (boleh dilihat tamu);
  // daftar konfirmasi & nominalnya tetap privat untuk pemilik (docs/01 F9).
  const gift = canUse(inv.package, "giftEnvelope")
    ? giftConfigSchema.safeParse(inv.giftConfig)
    : null;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    // Variabel font tema dipasang di sini; lihat src/lib/fonts-invitation.ts.
    <div className={`${invitationFontVars} min-h-full flex-1`}>
      <InvitationView
        invitationId={inv.id}
        slug={inv.slug}
        content={content.data}
        theme={theme.data}
        sections={sections.data}
        guestName={guest?.name ?? (to ? decodeURIComponent(to) : undefined)}
        personalSlug={to}
        greetings={greetings}
        giftConfig={gift?.success ? gift.data : null}
        publicUrl={appUrl ? `${appUrl}/u/${inv.slug}` : undefined}
        interactive
        showWatermark={!canUse(inv.package, "removeWatermark")}
        watermarkVariant="brand"
      />
    </div>
  );
}
