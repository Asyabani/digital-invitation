import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { InvitationNav } from "@/components/dashboard/InvitationNav";

export const instant = false;

const STATUS_LABEL: Record<string, string> = {
  HADIR: "Hadir",
  TIDAK_HADIR: "Tidak hadir",
  RAGU: "Ragu",
};

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
  const totalHeadcount = hadir.reduce((sum, r) => sum + r.headcount, 0);

  const summary = [
    { label: "Hadir", value: hadir.length },
    { label: "Tidak hadir", value: rsvps.filter((r) => r.status === "TIDAK_HADIR").length },
    { label: "Ragu", value: rsvps.filter((r) => r.status === "RAGU").length },
    { label: "Total orang (hadir)", value: totalHeadcount },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href={`/dashboard/${id}/edit`} className="text-sm text-neutral-500 hover:underline">
          ← {inv.title}
        </Link>
        <h1 className="text-xl font-semibold">Rekap RSVP</h1>
      </div>
      <InvitationNav invitationId={id} active="rsvp" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {summary.map((s) => (
          <div key={s.label} className="rounded-xl border p-4 text-center">
            <p className="text-2xl font-semibold">{s.value}</p>
            <p className="text-xs text-neutral-500">{s.label}</p>
          </div>
        ))}
      </div>

      {rsvps.length === 0 ? (
        <p className="text-neutral-500">Belum ada konfirmasi.</p>
      ) : (
        <ul className="divide-y rounded-xl border">
          {rsvps.map((r) => (
            <li key={r.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <p className="font-medium">{r.name}</p>
                {r.message && <p className="text-neutral-500">{r.message}</p>}
              </div>
              <div className="text-right">
                <span className="rounded-full border px-2 py-0.5 text-xs">
                  {STATUS_LABEL[r.status] ?? r.status}
                </span>
                <p className="text-xs text-neutral-400">{r.headcount} orang</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
