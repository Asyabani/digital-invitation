import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";

// Halaman dinamis per-user (sesi + query DB). Lihat Next 16 Cache Components.
export const instant = false;

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Aktif",
  EXPIRED: "Kedaluwarsa",
};

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
    },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Undangan Saya</h1>
        <Link
          href="/template"
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          + Buat Undangan Baru
        </Link>
      </div>

      {invitations.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-neutral-500">
          <p>Belum ada undangan.</p>
          <p className="text-sm">
            Mulai dengan memilih template di{" "}
            <Link href="/template" className="underline">
              galeri template
            </Link>
            .
          </p>
        </div>
      ) : (
        <ul className="divide-y rounded-xl border">
          {invitations.map((inv) => (
            <li
              key={inv.id}
              className="flex items-center justify-between px-5 py-4"
            >
              <div>
                <p className="font-medium">{inv.title}</p>
                <p className="text-sm text-neutral-500">/u/{inv.slug}</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="rounded-full border px-2 py-0.5 text-xs">
                  {STATUS_LABEL[inv.status] ?? inv.status}
                </span>
                <Link
                  href={`/dashboard/${inv.id}/edit`}
                  className="text-neutral-700 hover:underline"
                >
                  Edit
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
