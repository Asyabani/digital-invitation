import Link from "next/link";
import type { TemplateCategory } from "@prisma/client";
import { prisma } from "@/lib/db";
import { createInvitation } from "@/lib/actions/invitation";
import { Button } from "@/components/ui/button";
import {
  TemplateSwatch,
  coverOf,
  tingkatOf,
} from "@/components/template/TemplateSwatch";
import { getPackage } from "@/lib/packages";
import { invitationFontVars } from "@/lib/fonts-invitation";
import {
  KATEGORI_LABEL,
  KATEGORI_SLUG,
  KATEGORI_URUT,
  kategoriDariSlug,
} from "@/lib/template-category";

export const metadata = {
  title: "Template — Lungsin",
  description:
    "Empat puluh template untuk pernikahan, aqiqah, ulang tahun, dan acara korporat. Lihat contoh utuhnya tanpa membuat akun.",
};

// Membaca template dari DB per-request untuk saat ini.
// Fase lanjutan: cache dengan "use cache" / ISR (lihat docs/02 ADR-007).
export const instant = false;

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

type Kartu = {
  id: string;
  name: string;
  slug: string;
  category: TemplateCategory;
  defaultTheme: unknown;
  defaultContent: unknown;
};

/** Satu kelompok kategori: judul + gridnya. */
function Kelompok({
  kategori,
  templates,
  tunggal,
}: {
  kategori: TemplateCategory;
  templates: Kartu[];
  tunggal: boolean;
}) {
  if (templates.length === 0) return null;

  return (
    <section className={tunggal ? "" : "mt-14 first:mt-0"}>
      <div className="flex items-baseline justify-between gap-4 border-b border-border/70 pb-3">
        <h2 className="font-display text-2xl font-medium">
          {KATEGORI_LABEL[kategori]}
        </h2>
        <span className="tabular text-sm text-muted-foreground">
          {templates.length} template
        </span>
      </div>

      {/*
        Garis kisi dibuat dari border tiap sel, bukan dari latar `ul` yang
        terlihat lewat celah `gap-px`. Cara celah itu membuat sel kosong di
        baris terakhir ikut berwarna — sepuluh template di kisi tiga kolom
        meninggalkan dua sel kosong yang terbaca sebagai blok besar.
      */}
      <ul className="mt-6 grid border-l border-t border-border/70 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <li
            key={t.id}
            className="flex flex-col border-b border-r border-border/70 bg-background"
          >
            <Link
              href={`/template/${t.slug}`}
              aria-label={`Lihat contoh template ${t.name}`}
              className="group block"
            >
              <TemplateSwatch
                theme={t.defaultTheme}
                name={t.name}
                coverImage={coverOf(t.defaultContent)}
              />
            </Link>

            {/*
              Harga disebut di kartunya, bukan hanya di halaman harga.
              Tingkat melekat pada arketipe tata letak, jadi pembeli melihat
              langsung apa yang membuat satu template lebih mahal.
            */}
            <div className="flex items-baseline justify-between gap-3 border-t border-border/70 px-4 pt-3">
              <span className="text-sm text-muted-foreground">
                {getPackage(tingkatOf(t.defaultTheme)).name}
              </span>
              <span className="tabular text-sm font-semibold">
                {rupiah.format(getPackage(tingkatOf(t.defaultTheme)).price)}
              </span>
            </div>

            <div className="flex gap-2 p-4">
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
        ))}
      </ul>
    </section>
  );
}

export default async function TemplateGaleriPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const { kategori: param } = await searchParams;
  const terpilih = kategoriDariSlug(param);

  const templates = (await prisma.template.findMany({
    where: {
      isActive: true,
      ...(terpilih ? { category: terpilih } : {}),
    },
    orderBy: [{ category: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      defaultTheme: true,
      defaultContent: true,
    },
  })) satisfies Kartu[];

  const tampil = terpilih ? [terpilih] : KATEGORI_URUT;

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

          {/* Penyaring kategori: tautan biasa, jadi bisa dibagikan dan kembali. */}
          <nav aria-label="Saring kategori" className="mt-10 flex flex-wrap">
            <Link
              href="/template"
              aria-current={terpilih === null ? "page" : undefined}
              className={`${
                terpilih === null ? "ikat text-foreground" : "text-muted-foreground"
              } relative px-4 py-2.5 text-sm transition-colors hover:text-foreground`}
            >
              Semua
            </Link>
            {KATEGORI_URUT.map((k) => (
              <Link
                key={k}
                href={`/template?kategori=${KATEGORI_SLUG[k]}`}
                aria-current={terpilih === k ? "page" : undefined}
                className={`${
                  terpilih === k ? "ikat text-foreground" : "text-muted-foreground"
                } relative px-4 py-2.5 text-sm transition-colors hover:text-foreground`}
              >
                {KATEGORI_LABEL[k]}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      {/*
        Variabel font undangan sengaja dipasang di halaman ini, satu-satunya
        halaman marketing yang memuatnya. Swatch memakai font judul template
        yang sebenarnya; tanpa variabel ini keempat puluh template akan tampil
        dengan satu font serif cadangan dan separuh pembedanya hilang. Ini
        memang menambah unduhan font di halaman galeri — harganya dibayar di
        tempat orang memang sedang membandingkan desain.
      */}
      <section
        className={`${invitationFontVars} pakan pinggiran-atas bg-nila-pekat py-16 sm:py-20`}
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          {templates.length === 0 ? (
            <p className="border border-dashed border-border/70 p-16 text-center text-muted-foreground">
              {terpilih ? (
                <>
                  Belum ada template aktif untuk kategori ini.{" "}
                  <Link href="/template" className="underline">
                    Lihat semua kategori
                  </Link>
                  .
                </>
              ) : (
                <>
                  Belum ada template. Jalankan{" "}
                  <code className="text-foreground">pnpm db:seed</code> untuk
                  mengisi katalog.
                </>
              )}
            </p>
          ) : (
            tampil.map((k) => (
              <Kelompok
                key={k}
                kategori={k}
                templates={templates.filter((t) => t.category === k)}
                tunggal={terpilih !== null}
              />
            ))
          )}

          <p className="mt-8 text-sm text-muted-foreground">
            Anda baru diminta masuk saat menekan &ldquo;Pakai&rdquo;.
          </p>
        </div>
      </section>
    </>
  );
}
