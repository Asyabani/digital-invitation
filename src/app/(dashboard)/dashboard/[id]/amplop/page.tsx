import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canUse } from "@/lib/packages";
import { giftConfigSchema } from "@/lib/validation/invitation";
import { GiftSettings } from "@/components/dashboard/GiftSettings";
import { InvitationNav } from "@/components/dashboard/InvitationNav";

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
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-neutral-500 hover:underline">
          ← Undangan Saya
        </Link>
        <h1 className="text-xl font-semibold">{inv.title}</h1>
      </div>
      <InvitationNav invitationId={id} active="amplop" />

      <GiftSettings
        invitationId={inv.id}
        initialConfig={parsedConfig.success ? parsedConfig.data : null}
        canUseGift={canUse(inv.package, "giftEnvelope")}
      />

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Konfirmasi Kado ({gifts.length})
          </h2>
          <p className="text-sm text-neutral-600">
            Total tercatat:{" "}
            <strong className="text-neutral-900">{rupiah.format(total)}</strong>
          </p>
        </div>
        <p className="rounded-lg bg-neutral-50 p-3 text-xs text-neutral-500">
          Daftar dan nominal di bawah ini <strong>privat</strong> — hanya Anda
          yang bisa melihatnya. Tamu tidak pernah melihat nominal siapa pun,
          termasuk miliknya sendiri setelah terkirim.
        </p>

        {gifts.length === 0 ? (
          <p className="rounded-xl border border-dashed p-10 text-center text-neutral-500">
            Belum ada konfirmasi kado.
          </p>
        ) : (
          <ul className="divide-y rounded-xl border">
            {gifts.map((g) => (
              <li
                key={g.id}
                className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {g.name}
                    {g.guest && (
                      <span className="ml-2 rounded-full border px-2 py-0.5 text-xs text-neutral-500">
                        tamu: {g.guest.name}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {METHOD_LABEL[g.method] ?? g.method} ·{" "}
                    {g.createdAt.toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  {g.note && <p className="mt-1 text-neutral-700">{g.note}</p>}
                  {g.proofUrl && (
                    <a
                      href={g.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-neutral-600 underline"
                    >
                      Lihat bukti
                    </a>
                  )}
                </div>
                <p className="font-medium">
                  {g.amount ? rupiah.format(g.amount) : "—"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
