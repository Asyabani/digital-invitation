import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canUse } from "@/lib/packages";
import {
  contentSchema,
  themeSchema,
  sectionsOrderSchema,
} from "@/lib/validation/invitation";
import { ThemeEditor } from "@/components/editor/ThemeEditor";
import { InvitationNav } from "@/components/dashboard/InvitationNav";
import { invitationFontVars } from "@/lib/fonts-invitation";

export const instant = false;

export default async function TemaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/masuk");

  const inv = await prisma.invitation.findUnique({ where: { id } });
  if (!inv || inv.userId !== session.user.id) notFound();

  const content = contentSchema.safeParse(inv.content);
  const theme = themeSchema.safeParse(inv.themeConfig);
  const sections = sectionsOrderSchema.safeParse(inv.sectionsOrder);
  if (!content.success || !theme.success || !sections.success) notFound();

  return (
    // Variabel font tema dipasang di sini agar pratinjau memakai font yang
    // sama persis dengan halaman undangan (src/lib/fonts-invitation.ts).
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
      <InvitationNav invitationId={id} active="tema" />

      <ThemeEditor
        invitationId={inv.id}
        slug={inv.slug}
        content={content.data}
        initialTheme={theme.data}
        initialSections={sections.data}
        showWatermark={!canUse(inv.package, "removeWatermark")}
        canUseMusic={canUse(inv.package, "customMusic")}
        paket={inv.package}
      />
    </div>
  );
}
