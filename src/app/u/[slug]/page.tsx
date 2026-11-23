import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getPublishedInvitationBySlug, findGuest } from "@/lib/public";
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

  const inv = await getPublishedInvitationBySlug(slug);
  if (!inv) notFound();

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
      showWatermark={inv.package === null}
    />
  );
}
