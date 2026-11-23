import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { moderateGreeting } from "@/lib/actions/greeting";
import { containsProfanity } from "@/lib/moderation";

export const instant = false;

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
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Link href={`/dashboard/${id}/edit`} className="text-sm text-neutral-500 hover:underline">
          ← {inv.title}
        </Link>
        <h1 className="text-xl font-semibold">Moderasi Ucapan</h1>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Menunggu Persetujuan ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-neutral-500">Tidak ada ucapan yang menunggu.</p>
        ) : (
          <ul className="space-y-3">
            {pending.map((g) => (
              <li key={g.id} className="rounded-xl border p-4">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{g.name}</p>
                  {containsProfanity(g.message) && (
                    <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700">
                      ⚠ kata sensitif
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-neutral-700">{g.message}</p>
                <div className="mt-3 flex gap-2">
                  <form
                    action={async () => {
                      "use server";
                      await moderateGreeting(g.id, "APPROVED");
                    }}
                  >
                    <button className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white">
                      Setujui
                    </button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await moderateGreeting(g.id, "REJECTED");
                    }}
                  >
                    <button className="rounded-lg border px-3 py-1.5 text-xs font-medium">
                      Tolak
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Tampil di Undangan ({approved.length})
        </h2>
        {approved.length === 0 ? (
          <p className="text-neutral-500">Belum ada ucapan yang disetujui.</p>
        ) : (
          <ul className="space-y-3">
            {approved.map((g) => (
              <li key={g.id} className="rounded-xl border bg-neutral-50 p-4">
                <p className="font-medium">{g.name}</p>
                <p className="mt-1 text-sm text-neutral-700">{g.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
