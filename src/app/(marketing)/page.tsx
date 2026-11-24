import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { PACKAGES, ACTIVE_MONTHS } from "@/lib/packages";
import {
  contentSchema,
  themeSchema,
  sectionsOrderSchema,
} from "@/lib/validation/invitation";
import { InvitationView } from "@/components/invitation/InvitationView";
import { invitationFontVars } from "@/lib/fonts-invitation";
import { Button } from "@/components/ui/button";

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/**
 * Helai kedua — undangan sungguhan yang digantung di sebelah judul.
 * Dirender dari template nyata di database, bukan gambar tiruan: hero harus
 * memperlihatkan produk sedang bekerja, bukan mengklaimnya.
 */
async function HelaiPratinjau() {
  const t = await prisma.template.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });
  if (!t) return null;

  const content = contentSchema.safeParse(t.defaultContent);
  const theme = themeSchema.safeParse(t.defaultTheme);
  const sections = sectionsOrderSchema.safeParse(t.defaultSections);
  if (!content.success || !theme.success || !sections.success) return null;

  return (
    <div className={`${invitationFontVars} h-full overflow-hidden`}>
      <div className="h-full overflow-y-auto">
        <InvitationView
          invitationId="pratinjau-beranda"
          slug={t.slug}
          content={content.data}
          theme={theme.data}
          sections={sections.data}
          guestName="Nama Tamu"
          interactive={false}
        />
      </div>
    </div>
  );
}

function HelaiKosong() {
  return <div className="h-full animate-pulse bg-kapas/40" />;
}

const BENANG = [
  {
    label: "Tamu mengisi RSVP",
    body: "Konfirmasi kehadiran dan jumlah orang, langsung dari undangan. Tanpa akun, tanpa aplikasi.",
  },
  {
    label: "Buku tamu dimoderasi",
    body: "Ucapan masuk ke antrean dulu. Hanya yang Anda setujui yang tampil di undangan.",
  },
  {
    label: "Link personal per tamu",
    body: "Setiap tamu punya tautannya sendiri, dan namanya muncul di cover begitu dibuka.",
  },
  {
    label: "Amplop digital",
    body: "Rekening dan QRIS tampil rapi. Daftar pengirim dan nominalnya hanya Anda yang melihat.",
  },
  {
    label: "Galeri, peta, hitung mundur",
    body: "Foto, tombol buka Maps, tambah ke kalender, dan waktu menuju hari H yang terus berjalan.",
  },
  {
    label: "Musik latar",
    body: "Satu lagu yang diputar tamu saat membuka undangan. Tidak pernah memaksa autoplay.",
  },
];

export default function Beranda() {
  const termurah = Math.min(...Object.values(PACKAGES).map((p) => p.price));
  const paket = Object.values(PACKAGES);

  return (
    <>
      {/* ── Pita 1: hero. Kain kapas menenun diri di atas dasar nila. ── */}
      <section className="pakan lungsin pb-20 pt-16 sm:pb-28 sm:pt-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="kain pinggiran-atas pinggiran-bawah menenun grid items-stretch gap-0 overflow-hidden md:grid-cols-[minmax(0,1fr)_26rem]">
            <div className="min-w-0 px-7 py-12 sm:px-12 sm:py-16">
              <h1 className="font-display text-[2.6rem] font-semibold leading-[0.98] sm:text-6xl">
                Undangan pernikahan yang Anda rangkai sendiri, sampai detail
                terakhir.
              </h1>
              <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-muted-foreground">
                Pilih template, isi acara, atur warna dan fontnya, lalu bagikan
                satu tautan lewat WhatsApp. RSVP, buku tamu, galeri, dan amplop
                digital sudah menyatu di dalamnya.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Button
                  render={<Link href="/dashboard" />}
                  size="lg"
                  className="h-11 px-6 text-base"
                >
                  Rangkai undangan
                </Button>
                <Button
                  render={<Link href="/template" />}
                  variant="outline"
                  size="lg"
                  className="h-11 px-6 text-base"
                >
                  Lihat contoh dulu
                </Button>
              </div>

              <p className="mt-5 text-sm text-muted-foreground">
                Merangkai dan menyunting gratis. Bayar sekali mulai{" "}
                <span className="tabular text-foreground">
                  {rupiah.format(termurah)}
                </span>{" "}
                hanya ketika undangan siap dibagikan.
              </p>
            </div>

            {/* Helai kedua: produk sedang bekerja, bukan klaim tentang produk. */}
            <div className="menenun menenun-2 relative min-w-0 overflow-hidden border-t border-border/60 md:border-l md:border-t-0">
              <div className="h-[20rem] min-w-0 overflow-hidden md:h-full md:max-h-[34rem]">
                <Suspense fallback={<HelaiKosong />}>
                  <HelaiPratinjau />
                </Suspense>
              </div>
              <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#f3f1ea] via-[#f3f1ea] to-transparent pb-3 pt-16 text-center text-xs text-muted-foreground">
                Salah satu template, apa adanya
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pita 2: mekanisme. Jarang, lapang — satu gagasan saja. ── */}
      <section className="pakan pinggiran-atas bg-nila-pekat py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 md:grid-cols-2 md:gap-16">
          <h2 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Kami pasang lungsinnya. Anda yang menenun.
          </h2>
          <div className="space-y-5 text-lg leading-relaxed text-muted-foreground">
            <p>
              Lungsin adalah benang tegak yang sudah terpasang di alat tenun
              sebelum sehelai kain dimulai — ia yang menentukan lebar, kekuatan,
              dan bentuknya.
            </p>
            <p className="text-foreground">
              Itu bagian kami: struktur undangan, alur RSVP, moderasi ucapan,
              privasi amplop, dan kecepatan halaman di HP tamu. Warna, font,
              foto, urutan bagian, dan setiap kata di dalamnya adalah pakan yang
              Anda tenun sendiri.
            </p>
          </div>
        </div>
      </section>

      {/* ── Pita 3: kemampuan. Rapat — benang demi benang. ── */}
      <section className="pakan lungsin py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Yang sudah tertenun di dalamnya
          </h2>
          <dl className="mt-10 border-t border-border/70">
            {BENANG.map((b) => (
              <div
                key={b.label}
                className="grid gap-1.5 border-b border-border/70 py-5 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] md:gap-10 md:py-6"
              >
                <dt className="font-display text-lg font-medium">{b.label}</dt>
                <dd className="max-w-[62ch] leading-relaxed text-muted-foreground">
                  {b.body}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Pita 4: alur. Tiga lintasan pakan. ── */}
      <section className="pakan pinggiran-atas bg-nila-pekat py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Tiga lintasan sampai undangan tersebar
          </h2>
          <ol className="mt-10 grid gap-px border-y border-border/70 bg-border/70 md:grid-cols-3">
            {[
              {
                t: "Pilih template",
                b: "Lihat contoh utuhnya lebih dulu, tanpa akun. Template hanya titik awal — semuanya bisa diubah.",
              },
              {
                t: "Rangkai isinya",
                b: "Isi data acara, atur palet dan font, nyalakan atau matikan bagian. Pratinjaunya mengikuti setiap ketikan.",
              },
              {
                t: "Bayar & bagikan",
                b: `Sekali bayar. Undangan aktif ${ACTIVE_MONTHS} bulan, watermark hilang, tautannya siap dikirim ke seluruh tamu.`,
              },
            ].map((s) => (
              <li key={s.t} className="bg-background p-6 sm:p-8">
                <h3 className="font-display text-xl font-medium">{s.t}</h3>
                <p className="mt-2.5 leading-relaxed text-muted-foreground">
                  {s.b}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Pita 5: harga ringkas. Kerapatan naik tiap paket. ── */}
      <section className="pakan lungsin py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              Bayar sekali, per acara
            </h2>
            <Button render={<Link href="/harga" />} variant="outline">
              Perbandingan lengkap
            </Button>
          </div>
          <ul className="mt-10 grid gap-px border-y border-border/70 bg-border/70 md:grid-cols-3">
            {paket.map((p) => (
              <li key={p.key} className="bg-background p-6 sm:p-8">
                <p className="font-display text-xl font-medium">{p.name}</p>
                <p className="tabular mt-1 text-3xl font-semibold">
                  {rupiah.format(p.price)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {p.guestQuota === null
                    ? "Tamu tanpa batas"
                    : `Sampai ${p.guestQuota} tamu`}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-muted-foreground">
            Bukan langganan bulanan. Pernikahan terjadi sekali; menagihnya tiap
            bulan tidak masuk akal.
          </p>
        </div>
      </section>

      {/* ── Pita 6: penutup. Kain ditutup pinggiran. ── */}
      <section className="pakan pinggiran-atas bg-nila-pekat py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <h2 className="font-display text-3xl font-semibold sm:text-5xl">
            Mulai dari sehelai template.
          </h2>
          <p className="mx-auto mt-5 max-w-[52ch] text-lg leading-relaxed text-muted-foreground">
            Lihat contohnya sekarang tanpa membuat akun. Anda baru diminta masuk
            saat benar-benar ingin merangkai yang pertama.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button render={<Link href="/template" />} size="lg">
              Lihat contoh template
            </Button>
            <Button
              render={<Link href="/harga" />}
              variant="outline"
              size="lg"
            >
              Lihat harga
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
