import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { moderateGreeting } from "@/lib/actions/greeting";
import { containsProfanity } from "@/lib/moderation";
import { InvitationNav } from "@/components/dashboard/InvitationNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Helai, HelaiIsi } from "@/components/dashboard/Helai";

export const instant = false;

const tanggal = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function UcapanModerasiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/masuk");

  const inv = await prisma.invitation.findUnique({
    where: { id },
    select: { id: true, title: true, userId: true },
  });
  if (!inv || inv.userId !== session.user.id) notFound();

  const pending = await prisma.greeting.findMany({
    where: { invitationId: id, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });
  const approved = await prisma.greeting.findMany({
    where: { invitationId: id, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
  });

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
      <InvitationNav invitationId={id} active="ucapan" />

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Menunggu persetujuan
          </h2>
          {pending.length > 0 && (
            <Badge variant="warning">{pending.length}</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Ucapan tidak langsung tampil. Setujui dulu agar muncul di halaman
          undangan.
        </p>

        {pending.length === 0 ? (
          <Helai className="border-dashed">
            <HelaiIsi className="py-10 text-center text-muted-foreground">
              Tidak ada ucapan yang menunggu.
            </HelaiIsi>
          </Helai>
        ) : (
          <ul className="space-y-3">
            {pending.map((g) => (
              <li key={g.id}>
                <Helai>
                  <HelaiIsi className="space-y-3 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{g.name}</p>
                      <span className="text-xs text-muted-foreground">
                        {tanggal.format(g.createdAt)}
                      </span>
                      {containsProfanity(g.message) && (
                        <Badge variant="destructive">
                          <TriangleAlert aria-hidden />
                          Kata sensitif
                        </Badge>
                      )}
                    </div>
                    <p className="leading-relaxed">{g.message}</p>
                    <div className="flex gap-2">
                      <form
                        action={async () => {
                          "use server";
                          await moderateGreeting(g.id, "APPROVED");
                        }}
                      >
                        <Button type="submit" size="sm">
                          Setujui
                        </Button>
                      </form>
                      <form
                        action={async () => {
                          "use server";
                          await moderateGreeting(g.id, "REJECTED");
                        }}
                      >
                        <Button type="submit" size="sm" variant="outline">
                          Tolak
                        </Button>
                      </form>
                    </div>
                  </HelaiIsi>
                </Helai>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Tampil di undangan
          </h2>
          {approved.length > 0 && (
            <Badge variant="success">{approved.length}</Badge>
          )}
        </div>

        {approved.length === 0 ? (
          <Helai className="border-dashed">
            <HelaiIsi className="py-10 text-center text-muted-foreground">
              Belum ada ucapan yang disetujui.
            </HelaiIsi>
          </Helai>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {approved.map((g) => (
              <li key={g.id}>
                <Helai className="h-full bg-muted/40">
                  <HelaiIsi className="p-4">
                    <p className="font-medium">{g.name}</p>
                    <p className="mt-1 leading-relaxed text-muted-foreground">
                      {g.message}
                    </p>
                  </HelaiIsi>
                </Helai>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
