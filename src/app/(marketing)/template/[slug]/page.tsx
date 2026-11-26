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
import { layoutSpec } from "@/lib/invitation-layouts";
import { getPackage } from "@/lib/packages";

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/** Nama bagian yang dimengerti calon pemilik, bukan kunci teknisnya. */
const SECTION_LABEL: Record<string, string> = {
  cover: "Sampul",
  opening: "Kutipan",
  couple: "Mempelai",
  countdown: "Hitung mundur",
  gallery: "Galeri",
  location: "Lokasi",
  rsvp: "RSVP",
  greetings: "Ucapan",
  gift: "Amplop",
  closing: "Penutup",
};

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
  const spec = layoutSpec(theme.data.layout);
  const tingkat = getPackage(spec.minPackage);

  // Bagian yang menyala di template ini, dalam urutannya. Inilah salah satu
  // pembeda terbesar antar template, dan sebelumnya tidak pernah disebut di
  // halaman ini sama sekali.
  const bagianNyala = [...sections.data]
    .filter((x) => x.enabled)
    .sort((a, b) => a.order - b.order)
    .map((x) => SECTION_LABEL[x.key] ?? x.key);

  return (
    <section className={`${invitationFontVars} pakan lungsin py-12 sm:py-16`}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Link
          href="/template"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Semua template
        </Link>

        {/*
          Dua kolom: keterangan menempel di kiri, undangannya mengalir penuh
          di kanan dan ikut guliran HALAMAN — bukan dikurung kotak 38rem.

          Kotak itu hanya menampilkan sampul, jadi semua template terlihat
          sama persis di tempat orang justru sedang membandingkan. Lebarnya
          pun hanya ~200px, lebih sempit dari HP mana pun, sehingga nama
          mempelai patah jadi empat baris.
        */}
        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-14">
          <div className="lg:sticky lg:top-10 lg:self-start">
            <h1 className="font-display text-4xl font-semibold leading-[1.05] sm:text-5xl">
              {t.name}
            </h1>

            <div className="mt-5 flex items-baseline justify-between gap-3 border-y border-border/70 py-3">
              <span className="text-sm text-muted-foreground">
                {tingkat.name}
              </span>
              <span className="tabular text-lg font-semibold">
                {rupiah.format(tingkat.price)}
              </span>
            </div>

            {/*
              Keterangan khusus template ini, bukan paragraf yang sama untuk
              ketiga puluhnya: susunan halamannya, bagian apa saja yang
              menyala, palet, dan fontnya.
            */}
            <dl className="mt-6 space-y-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Tata letak</dt>
                <dd className="mt-0.5">
                  <span className="font-medium">{spec.label}</span> —{" "}
                  <span className="text-muted-foreground">
                    {spec.description}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">
                  Bagian yang tampil ({bagianNyala.length})
                </dt>
                <dd className="mt-0.5 leading-relaxed">
                  {bagianNyala.join(" → ")}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Font</dt>
                <dd className="mt-0.5">
                  {theme.data.font.heading} &amp; {theme.data.font.body}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Palet</dt>
                <dd className="mt-1.5 flex items-center gap-2">
                  {[p.primary, p.secondary, p.background, p.text].map((c) => (
                    <span
                      key={c}
                      className="size-6 rounded-sm border border-border/70"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </dd>
              </div>
            </dl>

            <form action={createInvitation} className="mt-8">
              <input type="hidden" name="templateId" value={t.id} />
              <Button type="submit" size="lg">
                Pakai template ini
              </Button>
            </form>
            <p className="mt-3 max-w-[40ch] text-sm text-muted-foreground">
              Anda akan diminta masuk dulu. Merangkai dan menyunting gratis —
              pembayaran hanya saat undangan siap dibagikan. Semua isinya bisa
              diganti.
            </p>
          </div>

          {/*
            Bingkai selebar HP sungguhan (390px). Undangannya tampil utuh dan
            ikut guliran halaman, jadi perbedaan susunan benar-benar terlihat.
          */}
          {/*
            Di layar sempit bingkainya dibuat mepet tepi (`-mx-5`). Padding
            halaman mencuri 40px, sehingga "seukuran HP" malah jadi 350px —
            lebih sempit dari HP mana pun, dan isinya meluber keluar bingkai.
          */}
          <div className="-mx-5 min-w-0 justify-self-center sm:mx-0">
            <div className="kain pinggiran-atas pinggiran-bawah mx-auto w-full max-w-[390px] overflow-hidden">
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
              Tampilan seukuran layar HP tamu. Form di dalam contoh tidak aktif.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
