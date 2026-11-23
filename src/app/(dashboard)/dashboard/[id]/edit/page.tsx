import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  contentSchema,
  themeSchema,
  sectionsOrderSchema,
} from "@/lib/validation/invitation";
import { ContentEditor } from "@/components/editor/ContentEditor";

export const instant = false;

export default async function EditInvitationPage({
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

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

      <ContentEditor
        invitationId={inv.id}
        slug={inv.slug}
        status={inv.status}
        initialContent={content.data}
        theme={theme.data}
        sections={sections.data}
        appUrl={appUrl}
      />
    </div>
  );
}
