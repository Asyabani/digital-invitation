import { prisma } from "@/lib/db";
import Link from "next/link";

export const metadata = { title: "Galeri Template — Undangan Digital" };

// Membaca template dari DB per-request untuk saat ini (Fase 0).
// Fase lanjutan: cache dengan "use cache" / ISR (lihat docs/02 ADR-007).
export const instant = false;

export default async function TemplateGaleriPage() {
  const templates = await prisma.template.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, slug: true, category: true },
  });

  return (
    <main className="mx-auto max-w-5xl flex-1 px-6 py-12">
      <div className="mb-8 space-y-2">
        <Link href="/" className="text-sm text-neutral-500 hover:underline">
          ← Beranda
        </Link>
        <h1 className="text-2xl font-semibold">Galeri Template</h1>
        <p className="text-neutral-600">
          Pilih template untuk memulai undangan Anda.
        </p>
      </div>

      {templates.length === 0 ? (
        <p className="text-neutral-500">
          Belum ada template. Jalankan <code>pnpm db:seed</code> untuk mengisi
          template contoh.
        </p>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <li
              key={t.id}
              className="overflow-hidden rounded-xl border transition hover:shadow-md"
            >
              <div className="flex aspect-[3/4] items-center justify-center bg-neutral-100 text-neutral-400">
                Preview
              </div>
              <div className="space-y-1 p-4">
                <p className="font-medium">{t.name}</p>
                <p className="text-xs uppercase tracking-wide text-neutral-400">
                  {t.category}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
