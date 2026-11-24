import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canUse } from "@/lib/packages";
import { giftConfigSchema } from "@/lib/validation/invitation";
import { GiftSettings } from "@/components/dashboard/GiftSettings";
import { InvitationNav } from "@/components/dashboard/InvitationNav";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const instant = false;

const METHOD_LABEL: Record<string, string> = {
  TRANSFER: "Transfer bank",
  QRIS: "QRIS",
};

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const tanggal = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function AmplopPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/masuk");

  const inv = await prisma.invitation.findUnique({ where: { id } });
  if (!inv || inv.userId !== session.user.id) notFound();

  // Data privat — hanya dibaca di halaman pemilik ini, tidak pernah dikirim ke
  // komponen halaman publik (docs/01 F9, CLAUDE.md privasi).
  const gifts = await prisma.giftConfirmation.findMany({
    where: { invitationId: id },
    orderBy: { createdAt: "desc" },
    include: { guest: { select: { name: true } } },
  });

  const total = gifts.reduce((sum, g) => sum + (g.amount ?? 0), 0);
  const parsedConfig = giftConfigSchema.safeParse(inv.giftConfig);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Undangan Saya
        </Link>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {inv.title}
        </h1>
      </div>
      <InvitationNav invitationId={id} active="amplop" />

      <GiftSettings
        invitationId={inv.id}
        initialConfig={parsedConfig.success ? parsedConfig.data : null}
        canUseGift={canUse(inv.package, "giftEnvelope")}
      />

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Konfirmasi kado{" "}
            <span className="text-muted-foreground">({gifts.length})</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Total tercatat:{" "}
            <strong className="tabular text-foreground">
              {rupiah.format(total)}
            </strong>
          </p>
        </div>

        <Alert>
          <AlertDescription>
            Daftar dan nominal di bawah ini <strong>privat</strong> — hanya Anda
            yang bisa melihatnya. Tamu tidak pernah melihat nominal siapa pun,
            termasuk miliknya sendiri setelah terkirim.
          </AlertDescription>
        </Alert>

        {gifts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-14 text-center text-muted-foreground">
              Belum ada konfirmasi kado.
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Nominal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gifts.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell>
                      <span className="flex flex-wrap items-center gap-2 font-medium">
                        {g.name}
                        {g.guest && (
                          <Badge variant="outline">tamu: {g.guest.name}</Badge>
                        )}
                      </span>
                      {g.note && (
                        <span className="mt-0.5 block text-sm text-muted-foreground">
                          {g.note}
                        </span>
                      )}
                      {g.proofUrl && (
                        <a
                          href={g.proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs underline"
                        >
                          Lihat bukti
                        </a>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {METHOD_LABEL[g.method] ?? g.method}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {tanggal.format(g.createdAt)}
                    </TableCell>
                    <TableCell className="tabular text-right font-medium">
                      {g.amount ? rupiah.format(g.amount) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
