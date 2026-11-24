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
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-neutral-500 hover:underline">
          ← Undangan Saya
        </Link>
        <h1 className="text-xl font-semibold">{inv.title}</h1>
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
      />
    </div>
  );
}
