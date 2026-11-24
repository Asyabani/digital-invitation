import Link from "next/link";
import { prisma } from "@/lib/db";
import { createInvitation } from "@/lib/actions/invitation";
import { themeSchema } from "@/lib/validation/invitation";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Template — Lungsin",
  description:
    "Lihat contoh utuh tiap template tanpa membuat akun, lalu rangkai milik Anda sendiri.",
};

// Membaca template dari DB per-request untuk saat ini.
// Fase lanjutan: cache dengan "use cache" / ISR (lihat docs/02 ADR-007).
export const instant = false;

const KATEGORI_LABEL: Record<string, string> = {
  PERNIKAHAN: "Pernikahan",
  AQIQAH: "Aqiqah",
  ULANG_TAHUN: "Ulang tahun",
  KORPORAT: "Korporat",
};

export default async function TemplateGaleriPage() {
  const templates = await prisma.template.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      defaultTheme: true,
    },
  });

  return (
    <>
      <section className="pakan lungsin py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <h1 className="font-display max-w-[18ch] text-4xl font-semibold leading-[1.02] sm:text-6xl">
            Pilih helai pertamanya.
          </h1>
          <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-muted-foreground">
            Template hanya menentukan titik awal. Warna, font, foto, urutan
            bagian, dan setiap kata di dalamnya tetap bisa Anda ubah setelahnya.
            Melihat contoh tidak perlu akun.
          </p>
        </div>
      </section>

      <section className="pakan pinggiran-atas bg-nila-pekat py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          {templates.length === 0 ? (
            <p className="border border-dashed border-border/70 p-16 text-center text-muted-foreground">
              Belum ada template. Jalankan{" "}
              <code className="text-foreground">pnpm db:seed</code> untuk
              mengisi contoh.
            </p>
          ) : (
            <ul className="grid gap-px overflow-hidden border border-border/70 bg-border/70 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((t) => {
                // Palet template ditampilkan sebagai benangnya sendiri.
                const parsed = themeSchema.safeParse(t.defaultTheme);
                const p = parsed.success
                  ? parsed.data.palette
                  : {
                      primary: "#13233f",
                      secondary: "#c08a2e",
                      background: "#e6e2d8",
                      text: "#16213a",
                    };

                return (
                  <li key={t.id} className="flex flex-col bg-background">
                    <Link
                      href={`/template/${t.slug}`}
                      aria-label={`Lihat contoh template ${t.name}`}
                      className="group block"
                    >
                      {/* Swatch: palet template ditenun jadi pita sungguhan. */}
                      <span
                        className="flex aspect-[4/5] flex-col justify-between p-7"
                        style={{
                          backgroundColor: p.background,
                          color: p.text,
                          backgroundImage: `repeating-linear-gradient(to right, ${p.text}14 0 1px, transparent 1px 2.25rem)`,
                        }}
                      >
                        <span
                          className="block h-1.5 w-full"
                          style={{
                            background: `repeating-linear-gradient(to right, ${p.primary} 0 14px, ${p.secondary} 14px 20px)`,
                          }}
                          aria-hidden
                        />
                        <span className="block">
                          <span
                            className="font-display block text-3xl leading-tight transition-opacity group-hover:opacity-80"
                            style={{ color: p.primary }}
                          >
                            {t.name}
                          </span>
                          <span className="mt-2 block text-xs uppercase tracking-widest opacity-60">
                            {KATEGORI_LABEL[t.category] ?? t.category}
                          </span>
                        </span>
                        <span
                          className="block h-px w-16"
                          style={{ backgroundColor: p.secondary }}
                          aria-hidden
                        />
                      </span>
                    </Link>

                    <div className="flex gap-2 border-t border-border/70 p-4">
                      <Button
                        render={<Link href={`/template/${t.slug}`} />}
                        variant="outline"
                        className="flex-1"
                      >
                        Lihat contoh
                      </Button>
                      <form action={createInvitation} className="flex-1">
                        <input type="hidden" name="templateId" value={t.id} />
                        <Button type="submit" className="w-full">
                          Pakai
                        </Button>
                      </form>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <p className="mt-6 text-sm text-muted-foreground">
            Anda baru diminta masuk saat menekan &ldquo;Pakai&rdquo;.
          </p>
        </div>
      </section>
    </>
  );
}
