import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canUse } from "@/lib/packages";
import { getDashboardSummary } from "@/lib/summary";
import {
  contentSchema,
  themeSchema,
  sectionsOrderSchema,
} from "@/lib/validation/invitation";
import { ContentEditor } from "@/components/editor/ContentEditor";
import { PublishPanel } from "@/components/editor/PublishPanel";
import {
  layoutSpec,
  minPackageForLayout,
} from "@/lib/invitation-layouts";
import { InvitationNav } from "@/components/dashboard/InvitationNav";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { invitationFontVars } from "@/lib/fonts-invitation";

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

  const summary = await getDashboardSummary(inv.id);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  // Watermark hilang hanya untuk paket yang memang membelinya (docs/05 §2).
  const showWatermark = !canUse(inv.package, "removeWatermark");

  return (
    <div className={`${invitationFontVars} space-y-6`}>
      <div className="space-y-1">
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Undangan saya
        </Link>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {inv.title}
        </h1>
      </div>
      <InvitationNav invitationId={id} active="edit" />

      <SummaryCards invitationId={inv.id} summary={summary} />

      <PublishPanel
        invitationId={inv.id}
        status={inv.status}
        package={inv.package}
        activeUntil={inv.activeUntil?.toISOString() ?? null}
        publicUrl={`${appUrl}/u/${inv.slug}`}
        pendingInvoiceUrl={pendingPayment?.invoiceUrl ?? null}
        pendingPackage={pendingPayment?.package ?? null}
        payResult={pay === "success" || pay === "failed" ? pay : null}
        // Tingkat harga melekat pada arketipe tata letak; panel memakai ini
        // untuk menonaktifkan paket yang tidak memenuhi syarat beserta
        // alasannya, bukan membiarkan pembeli menabrak error saat membayar.
        minPackage={minPackageForLayout(theme.data.layout)}
        layoutLabel={layoutSpec(theme.data.layout).label}
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
