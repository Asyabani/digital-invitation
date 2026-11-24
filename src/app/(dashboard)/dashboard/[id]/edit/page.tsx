import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPackage } from "@/lib/packages";
import {
  contentSchema,
  themeSchema,
  sectionsOrderSchema,
} from "@/lib/validation/invitation";
import { ContentEditor } from "@/components/editor/ContentEditor";
import { PublishPanel } from "@/components/editor/PublishPanel";

export const instant = false;

export default async function EditInvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pay?: string }>;
}) {
  const { id } = await params;
  const { pay } = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/masuk");

  const inv = await prisma.invitation.findUnique({ where: { id } });
  if (!inv || inv.userId !== session.user.id) notFound();

  const content = contentSchema.safeParse(inv.content);
  const theme = themeSchema.safeParse(inv.themeConfig);
  const sections = sectionsOrderSchema.safeParse(inv.sectionsOrder);
  if (!content.success || !theme.success || !sections.success) notFound();

  // Tagihan yang masih menunggu konfirmasi webhook (docs/05 §4).
  const pendingPayment = await prisma.payment.findFirst({
    where: { invitationId: inv.id, status: "PENDING" },
    orderBy: { createdAt: "desc" },
    select: { invoiceUrl: true, package: true },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const info = inv.package ? getPackage(inv.package) : null;
  // Watermark hilang hanya untuk paket yang memang membelinya (docs/05 §2).
  const showWatermark = !info?.features.removeWatermark;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-sm text-neutral-500 hover:underline">
            ← Undangan Saya
          </Link>
          <h1 className="text-xl font-semibold">{inv.title}</h1>
        </div>
        <nav className="flex gap-4 text-sm">
          <Link href={`/dashboard/${id}/rsvp`} className="hover:underline">
            RSVP
          </Link>
          <Link href={`/dashboard/${id}/ucapan`} className="hover:underline">
            Ucapan
          </Link>
        </nav>
      </div>

      <PublishPanel
        invitationId={inv.id}
        status={inv.status}
        package={inv.package}
        activeUntil={inv.activeUntil?.toISOString() ?? null}
        publicUrl={`${appUrl}/u/${inv.slug}`}
        pendingInvoiceUrl={pendingPayment?.invoiceUrl ?? null}
        pendingPackage={pendingPayment?.package ?? null}
        payResult={pay === "success" || pay === "failed" ? pay : null}
      />

      <ContentEditor
        invitationId={inv.id}
        slug={inv.slug}
        initialContent={content.data}
        theme={theme.data}
        sections={sections.data}
        showWatermark={showWatermark}
      />
    </div>
  );
}
