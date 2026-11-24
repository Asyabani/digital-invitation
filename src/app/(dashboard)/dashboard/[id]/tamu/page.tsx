import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canUse } from "@/lib/packages";
import { contentSchema } from "@/lib/validation/invitation";
import { GuestManager } from "@/components/dashboard/GuestManager";
import { InvitationNav } from "@/components/dashboard/InvitationNav";

export const instant = false;

export default async function TamuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/masuk");

  const inv = await prisma.invitation.findUnique({ where: { id } });
  if (!inv || inv.userId !== session.user.id) notFound();

  const guests = await prisma.guest.findMany({
    where: { invitationId: id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      category: true,
      personalSlug: true,
      sentAt: true,
    },
  });

  const content = contentSchema.safeParse(inv.content);
  const subject = content.success ? content.data.subject : null;
  const shareText = subject
    ? `Undangan ${
        subject.groomName && subject.brideName
          ? `${subject.groomName} & ${subject.brideName}`
          : (subject.childName ?? subject.title ?? inv.title)
      }`
    : `Undangan ${inv.title}`;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <div className="space-y-6">
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
      <InvitationNav invitationId={id} active="tamu" />

      <GuestManager
        invitationId={inv.id}
        publicUrl={`${appUrl}/u/${inv.slug}`}
        guests={guests.map((g) => ({
          ...g,
          sentAt: g.sentAt?.toISOString() ?? null,
        }))}
        canUsePersonalLinks={canUse(inv.package, "personalLinks")}
        shareText={shareText}
      />
    </div>
  );
}
