import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PACKAGES } from "@/lib/packages";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Helai, HelaiIsi } from "@/components/dashboard/Helai";

// Halaman dinamis per-user (sesi + query DB). Lihat Next 16 Cache Components.
export const instant = false;

const STATUS: Record<
  string,
  { label: string; variant: "success" | "warning" | "outline" }
> = {
  DRAFT: { label: "Draft", variant: "outline" },
  PUBLISHED: { label: "Aktif", variant: "success" },
  EXPIRED: { label: "Kedaluwarsa", variant: "warning" },
};

const tanggal = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function DashboardPage() {
  // Layout grup (dashboard) juga menjaga rute ini, tetapi layout dan page
  // dirender paralel — tanpa penjagaan sendiri, page bisa melempar lebih dulu
  // sebelum redirect layout berlaku.
  const session = await auth();
  if (!session?.user?.id) redirect("/masuk");
  const userId = session.user.id;

  const invitations = await prisma.invitation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      activeUntil: true,
      package: true,
      payments: { where: { status: "PENDING" }, select: { id: true }, take: 1 },
      _count: { select: { guests: true, rsvps: true, greetings: true } },
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Undangan saya
          </h1>
          <p className="text-sm text-muted-foreground">
            {invitations.length === 0
              ? "Belum ada yang dirangkai."
              : `${invitations.length} undangan.`}{" "}
            Merangkai dan menyunting gratis; bayar hanya saat siap dibagikan.
          </p>
        </div>
        <Button render={<Link href="/template" />} size="lg">
          Rangkai undangan baru
        </Button>
      </div>

      {invitations.length === 0 ? (
        <Helai>
          <HelaiIsi className="flex flex-col items-start gap-3 py-14">
            <h2 className="font-display text-xl font-medium">
              Mulai dari sehelai template
            </h2>
            <p className="max-w-[56ch] leading-relaxed text-muted-foreground">
              Pilih satu template, isi data acara, lalu lihat pratinjaunya
              langsung. Pembayaran baru diperlukan saat undangan siap
              dibagikan ke tamu.
            </p>
            <Button render={<Link href="/template" />} className="mt-2">
              Lihat template
            </Button>
          </HelaiIsi>
        </Helai>
      ) : (
        /* Tiap undangan adalah satu pita, bukan kartu dalam kisi. */
        <Helai className="overflow-hidden">
          <ul className="divide-y divide-border/70">
            {invitations.map((inv) => {
              const status = STATUS[inv.status] ?? {
                label: inv.status,
                variant: "outline" as const,
              };
              return (
                <li
                  key={inv.id}
                  className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 px-5 py-5 transition-colors hover:bg-accent/40 sm:px-6"
                >
                  <div className="min-w-[14rem] flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Link
                        href={`/dashboard/${inv.id}/edit`}
                        className="font-display text-xl font-medium leading-tight hover:underline"
                      >
                        {inv.title}
                      </Link>
                      <Badge variant={status.variant}>{status.label}</Badge>
                      {inv.payments.length > 0 && (
                        <Badge variant="warning">Menunggu bayar</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      /u/{inv.slug}
                      {inv.package && ` · ${PACKAGES[inv.package].name}`}
                      {inv.activeUntil &&
                        ` · aktif s/d ${tanggal.format(inv.activeUntil)}`}
                    </p>
                  </div>

                  {/* Tiga benang hitung: tamu, RSVP, ucapan. */}
                  <dl className="tabular flex gap-7">
                    {[
                      { l: "Tamu", v: inv._count.guests },
                      { l: "RSVP", v: inv._count.rsvps },
                      { l: "Ucapan", v: inv._count.greetings },
                    ].map((s) => (
                      <div key={s.l}>
                        <dd className="text-xl font-semibold leading-none">
                          {s.v}
                        </dd>
                        <dt className="mt-1 text-xs text-muted-foreground">
                          {s.l}
                        </dt>
                      </div>
                    ))}
                  </dl>

                  <Button
                    render={<Link href={`/dashboard/${inv.id}/edit`} />}
                    variant="outline"
                  >
                    Kelola
                  </Button>
                </li>
              );
            })}
          </ul>
        </Helai>
      )}
    </div>
  );
}
