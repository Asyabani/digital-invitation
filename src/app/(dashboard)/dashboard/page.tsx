import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PACKAGES } from "@/lib/packages";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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
  const session = await auth();
  const userId = session!.user!.id!;

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
      payments: {
        where: { status: "PENDING" },
        select: { id: true },
        take: 1,
      },
      _count: { select: { guests: true, rsvps: true, greetings: true } },
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Undangan Saya
          </h1>
          <p className="text-sm text-muted-foreground">
            {invitations.length === 0
              ? "Belum ada undangan."
              : `${invitations.length} undangan.`}{" "}
            Buat dan sunting gratis, bayar hanya saat siap dibagikan.
          </p>
        </div>
        <Button render={<Link href="/template" />} size="lg">
          <Plus data-icon="inline-start" />
          Buat Undangan Baru
        </Button>
      </div>

      {invitations.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="font-medium">Mulai dari sebuah template</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Pilih template, isi data acara, lalu lihat pratinjaunya langsung.
              Pembayaran baru diperlukan saat undangan siap dibagikan ke tamu.
            </p>
            <Button render={<Link href="/template" />} className="mt-2">
              Lihat Galeri Template
              <ArrowRight data-icon="inline-end" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {invitations.map((inv) => {
            const status = STATUS[inv.status] ?? {
              label: inv.status,
              variant: "outline" as const,
            };
            return (
              <li key={inv.id}>
                <Card className="h-full transition-colors hover:border-foreground/20">
                  <CardContent className="flex h-full flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <Link
                          href={`/dashboard/${inv.id}/edit`}
                          className="font-display block truncate text-lg font-semibold tracking-tight hover:underline"
                        >
                          {inv.title}
                        </Link>
                        <p className="truncate font-mono text-xs text-muted-foreground">
                          /u/{inv.slug}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <Badge variant={status.variant}>{status.label}</Badge>
                        {inv.payments.length > 0 && (
                          <Badge variant="warning">Menunggu bayar</Badge>
                        )}
                      </div>
                    </div>

                    <dl className="tabular grid grid-cols-3 gap-2 border-y border-border/70 py-3 text-center">
                      {[
                        { label: "Tamu", value: inv._count.guests },
                        { label: "RSVP", value: inv._count.rsvps },
                        { label: "Ucapan", value: inv._count.greetings },
                      ].map((s) => (
                        <div key={s.label}>
                          <dd className="text-lg font-semibold">{s.value}</dd>
                          <dt className="text-xs text-muted-foreground">
                            {s.label}
                          </dt>
                        </div>
                      ))}
                    </dl>

                    <div className="mt-auto flex items-center justify-between gap-3">
                      <p className="text-xs text-muted-foreground">
                        {inv.package ? PACKAGES[inv.package].name : "Trial"}
                        {inv.activeUntil &&
                          ` · s/d ${tanggal.format(inv.activeUntil)}`}
                      </p>
                      <Button
                        render={<Link href={`/dashboard/${inv.id}/edit`} />}
                        variant="outline"
                        size="sm"
                      >
                        Kelola
                        <ArrowRight data-icon="inline-end" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
