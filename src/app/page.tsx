import Link from "next/link";
import {
  ArrowRight,
  CalendarHeart,
  Gift,
  Images,
  Link2,
  MessageSquareHeart,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PACKAGES, ACTIVE_MONTHS } from "@/lib/packages";

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const FITUR = [
  {
    Icon: Palette,
    title: "Tema yang bisa diatur",
    body: "Pilih palet warna, font, musik latar, lalu nyalakan atau urutkan ulang setiap section.",
  },
  {
    Icon: Link2,
    title: "Link personal per tamu",
    body: "Setiap tamu punya tautan sendiri. Namanya muncul otomatis di cover undangan.",
  },
  {
    Icon: MessageSquareHeart,
    title: "RSVP & buku tamu",
    body: "Tamu konfirmasi kehadiran tanpa login. Ucapan masuk ke moderasi dulu sebelum tampil.",
  },
  {
    Icon: Gift,
    title: "Amplop digital",
    body: "Rekening dan QRIS tampil rapi. Daftar serta nominalnya hanya Anda yang lihat.",
  },
  {
    Icon: Images,
    title: "Galeri & lokasi",
    body: "Foto, peta acara, tombol buka Maps, dan tambah ke kalender dalam satu halaman.",
  },
  {
    Icon: CalendarHeart,
    title: "Hitung mundur",
    body: "Penanda waktu menuju hari H yang terus berjalan saat tamu membuka undangan.",
  },
];

export default function Home() {
  const termurah = Math.min(...Object.values(PACKAGES).map((p) => p.price));

  return (
    <>
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <span className="font-display text-base font-semibold tracking-tight">
          Undangan Digital
        </span>
        <nav className="flex items-center gap-1">
          <Button render={<Link href="/harga" />} variant="ghost" size="sm">
            Harga
          </Button>
          <Button render={<Link href="/template" />} variant="ghost" size="sm">
            Template
          </Button>
          <Button render={<Link href="/masuk" />} variant="outline" size="sm">
            Masuk
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto w-full max-w-3xl px-4 pb-16 pt-12 text-center sm:px-6 sm:pb-24 sm:pt-20">
          <h1 className="font-display text-4xl font-semibold leading-[1.1] text-balance sm:text-6xl">
            Undangan digital yang terasa dibuat khusus untuk hari Anda
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground">
            Pilih template, isi detail acara, atur temanya, lalu bagikan lewat
            WhatsApp. Lengkap dengan RSVP, buku tamu, galeri, dan amplop
            digital.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button render={<Link href="/dashboard" />} size="lg">
              Buat Undangan Gratis
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button
              render={<Link href="/template" />}
              variant="outline"
              size="lg"
            >
              Lihat Template
            </Button>
          </div>
          <p className="mt-5 text-sm text-muted-foreground">
            Coba gratis. Bayar sekali mulai {rupiah.format(termurah)} hanya saat
            undangan siap dibagikan.
          </p>
        </section>

        {/* Fitur */}
        <section className="border-t border-border/70 bg-card/50">
          <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Semua yang dibutuhkan satu acara
            </h2>
            <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {FITUR.map(({ Icon, title, body }) => (
                <div key={title}>
                  <dt className="flex items-center gap-2.5 font-medium">
                    <Icon
                      className="size-5 shrink-0 text-primary"
                      aria-hidden
                    />
                    {title}
                  </dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {body}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Cara kerja */}
        <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Tiga langkah sampai undangan tersebar
          </h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              {
                title: "Pilih template",
                body: "Mulai dari rancangan yang sudah jadi untuk pernikahan, aqiqah, atau ulang tahun.",
              },
              {
                title: "Isi & atur",
                body: "Lengkapi data acara dan atur tema. Pratinjaunya langsung mengikuti setiap perubahan.",
              },
              {
                title: "Bayar & bagikan",
                body: `Sekali bayar, undangan aktif ${ACTIVE_MONTHS} bulan dan siap dikirim ke seluruh tamu.`,
              },
            ].map((s, i) => (
              <li key={s.title} className="border-t pt-5">
                <span className="tabular text-sm text-muted-foreground">
                  {i + 1}
                </span>
                <h3 className="mt-1 font-medium">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* CTA */}
        <section className="border-t border-border/70 bg-accent/40">
          <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Siap menyiapkan undangan Anda?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Membuat dan mengedit sepenuhnya gratis. Anda baru membayar saat
              benar-benar ingin membagikannya.
            </p>
            <Button
              render={<Link href="/dashboard" />}
              size="lg"
              className="mt-7"
            >
              Mulai Sekarang
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:px-6">
          <span className="font-display font-medium text-foreground">
            Undangan Digital
          </span>
          <nav className="flex gap-5">
            <Link href="/harga" className="hover:text-foreground">
              Harga
            </Link>
            <Link href="/template" className="hover:text-foreground">
              Template
            </Link>
            <Link href="/masuk" className="hover:text-foreground">
              Masuk
            </Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
