import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { InvitationNav } from "@/components/dashboard/InvitationNav";
import { Badge } from "@/components/ui/badge";
import { Helai, HelaiIsi } from "@/components/dashboard/Helai";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const instant = false;

const STATUS: Record<
  string,
  { label: string; variant: "success" | "warning" | "outline" }
> = {
  HADIR: { label: "Hadir", variant: "success" },
  TIDAK_HADIR: { label: "Tidak hadir", variant: "outline" },
  RAGU: { label: "Ragu", variant: "warning" },
};

const tanggal = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function RsvpRekapPage({
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

  const rsvps = await prisma.rsvp.findMany({
    where: { invitationId: id },
    orderBy: { createdAt: "desc" },
  });

  const hadir = rsvps.filter((r) => r.status === "HADIR");
  const summary = [
    { label: "Hadir", value: hadir.length },
    {
      label: "Tidak hadir",
      value: rsvps.filter((r) => r.status === "TIDAK_HADIR").length,
    },
    { label: "Ragu", value: rsvps.filter((r) => r.status === "RAGU").length },
    {
      label: "Total orang",
      value: hadir.reduce((sum, r) => sum + r.headcount, 0),
    },
  ];

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
      <InvitationNav invitationId={id} active="rsvp" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summary.map((s) => (
          <Helai key={s.label}>
            <HelaiIsi className="p-4">
              <p className="tabular text-2xl font-semibold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </HelaiIsi>
          </Helai>
        ))}
      </div>

      {rsvps.length === 0 ? (
        <Helai className="border-dashed">
          <HelaiIsi className="flex flex-col items-center gap-2 py-14 text-center">
            <p className="font-medium">Belum ada konfirmasi</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Jawaban tamu muncul di sini begitu mereka mengisi form RSVP di
              undangan.
            </p>
          </HelaiIsi>
        </Helai>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Kehadiran</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead className="text-right">Tanggal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rsvps.map((r) => {
                const status = STATUS[r.status] ?? {
                  label: r.status,
                  variant: "outline" as const,
                };
                return (
                  <TableRow key={r.id}>
                    <TableCell>
                      <span className="font-medium">{r.name}</span>
                      {r.message && (
                        <span className="mt-0.5 block text-sm text-muted-foreground">
                          {r.message}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="tabular text-right">
                      {r.status === "HADIR" ? `${r.headcount} orang` : "—"}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {tanggal.format(r.createdAt)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
