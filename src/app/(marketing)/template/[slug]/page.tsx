import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { createInvitation } from "@/lib/actions/invitation";
import {
  contentSchema,
  themeSchema,
  sectionsOrderSchema,
} from "@/lib/validation/invitation";
import { InvitationView } from "@/components/invitation/InvitationView";
import { invitationFontVars } from "@/lib/fonts-invitation";
import { Button } from "@/components/ui/button";

// Baca template dari DB per-request untuk saat ini.
// Fase lanjutan: cache dengan "use cache" / ISR (lihat docs/02 ADR-007).
export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const t = await prisma.template.findUnique({
    where: { slug },
    select: { name: true },
  });
  return { title: t ? `Contoh ${t.name} — Lungsin` : "Template — Lungsin" };
}

/**
 * Pratinjau publik sebuah template (docs/06 §2).
 *
 * Calon pemilik bisa menilai wujud undangan **tanpa login**; login baru diminta
 * saat menekan "Pakai template ini". Dirender dari data bawaan template, bukan
 * dari `Invitation` mana pun, dan selalu non-interaktif.
 */
export default async function TemplatePreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const t = await prisma.template.findUnique({ where: { slug } });
  if (!t || !t.isActive) notFound();

  const content = contentSchema.safeParse(t.defaultContent);
  const theme = themeSchema.safeParse(t.defaultTheme);
  const sections = sectionsOrderSchema.safeParse(t.defaultSections);
  if (!content.success || !theme.success || !sections.success) notFound();

  const p = theme.data.palette;

  return (
    <section className={`${invitationFontVars} pakan lungsin py-12 sm:py-16`}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Link
          href="/template"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Semua template
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-14">
          <div className="lg:sticky lg:top-10 lg:self-start">
            <h1 className="font-display text-4xl font-semibold leading-[1.05] sm:text-5xl">
              {t.name}
            </h1>

            {/* Benang template ini, ditarik apa adanya. */}
            <div className="mt-6 flex items-center gap-3">
              <span
                className="h-2 flex-1"
                style={{
                  background: `repeating-linear-gradient(to right, ${p.primary} 0 18px, ${p.secondary} 18px 26px, ${p.background} 26px 30px)`,
                }}
                aria-hidden
              />
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                palet bawaan
              </span>
            </div>

            <p className="mt-6 max-w-[54ch] text-lg leading-relaxed text-muted-foreground">
              Ini isi bawaannya, apa adanya. Nama, tanggal, lokasi, foto, warna,
              font, sampai urutan bagian bisa Anda ganti sepenuhnya setelah
              undangan dirangkai.
            </p>

            <form action={createInvitation} className="mt-8">
              <input type="hidden" name="templateId" value={t.id} />
              <Button type="submit" size="lg">
                Pakai template ini
              </Button>
            </form>
            <p className="mt-3 max-w-[46ch] text-sm text-muted-foreground">
              Anda akan diminta masuk dulu. Merangkai dan menyunting gratis —
              pembayaran hanya saat undangan siap dibagikan.
            </p>
          </div>

          {/* Helai: undangan utuh seukuran layar HP tamu. */}
          <div>
            <div className="kain pinggiran-atas pinggiran-bawah h-[38rem] overflow-y-auto lg:h-[calc(100vh-12rem)]">
              <InvitationView
            embedded
                invitationId="preview"
                slug={t.slug}
                content={content.data}
                theme={theme.data}
                sections={sections.data}
                guestName="Nama Tamu"
                interactive={false}
                showWatermark
                watermarkVariant="preview"
                watermarkLabel="Contoh template — isinya bisa Anda ganti sepenuhnya."
              />
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Form di dalam contoh ini tidak aktif.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
