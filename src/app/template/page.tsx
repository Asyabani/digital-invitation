import Link from "next/link";
import { prisma } from "@/lib/db";
import { createInvitation } from "@/lib/actions/invitation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Galeri Template — Undangan Digital" };

// Membaca template dari DB per-request untuk saat ini.
// Fase lanjutan: cache dengan "use cache" / ISR (lihat docs/02 ADR-007).
export const instant = false;

const KATEGORI_LABEL: Record<string, string> = {
  PERNIKAHAN: "Pernikahan",
  AQIQAH: "Aqiqah",
  ULANG_TAHUN: "Ulang Tahun",
  KORPORAT: "Korporat",
};

export default async function TemplateGaleriPage() {
  const templates = await prisma.template.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, slug: true, category: true },
  });

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
      <div className="max-w-xl space-y-3">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Beranda
        </Link>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Galeri Template
        </h1>
        <p className="text-pretty text-muted-foreground">
          Pilih satu untuk memulai. Warna, font, dan urutan section bisa Anda
          ubah setelahnya — template hanya titik awal.
        </p>
      </div>

      {templates.length === 0 ? (
        <Card className="mt-10 border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            Belum ada template. Jalankan{" "}
            <code className="font-mono text-foreground">pnpm db:seed</code>{" "}
            untuk mengisi template contoh.
          </CardContent>
        </Card>
      ) : (
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <li key={t.id}>
              <Card className="h-full overflow-hidden pt-0 transition-colors hover:border-foreground/20">
                <div
                  className="flex aspect-[3/4] items-center justify-center bg-accent/60"
                  aria-hidden
                >
                  <span className="font-display px-6 text-center text-xl text-primary/70">
                    {t.name}
                  </span>
                </div>
                <CardContent className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">{t.name}</p>
                    <Badge variant="outline">
                      {KATEGORI_LABEL[t.category] ?? t.category}
                    </Badge>
                  </div>
                  <form action={createInvitation}>
                    <input type="hidden" name="templateId" value={t.id} />
                    <Button type="submit" className="w-full">
                      Pakai Template Ini
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 text-sm text-muted-foreground">
        Belum punya akun? Anda akan diminta masuk dulu sebelum undangan dibuat.
      </p>
    </main>
  );
}
