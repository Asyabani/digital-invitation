import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Kain malam — kerangka bersama semua halaman marketing.
 *
 * Kelas `dark` di sini bukan "mode gelap" yang bisa dimatikan pengguna; ia
 * memilih set benang untuk lingkungan ini. Dashboard memakai kain siang.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark flex min-h-full flex-1 flex-col bg-background text-foreground">
      <header className="pakan lungsin border-b border-border/70">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5 sm:px-8">
          <Link
            href="/"
            className="font-display shrink-0 text-xl font-semibold tracking-tight"
          >
            Lungsin
          </Link>
          <nav className="flex min-w-0 items-center gap-0.5 sm:gap-1">
            <Button
              render={<Link href="/template" />}
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
            >
              Template
            </Button>
            <Button render={<Link href="/harga" />} variant="ghost" size="sm">
              Harga
            </Button>
            <Button render={<Link href="/masuk" />} variant="outline" size="sm">
              Masuk
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="pakan pinggiran-atas">
        <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-6 px-5 py-10 sm:px-8">
          <div className="max-w-xs">
            <p className="font-display text-lg font-semibold">Lungsin</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Lungsin adalah benang tegak yang sudah terpasang di alat tenun
              sebelum menenun dimulai. Kami memasang strukturnya; Anda yang
              menenun isinya.
            </p>
          </div>
          <nav className="flex gap-8 text-sm">
            <span className="space-y-2">
              <span className="block text-xs uppercase tracking-widest text-muted-foreground">
                Produk
              </span>
              <Link href="/template" className="block hover:underline">
                Template
              </Link>
              <Link href="/harga" className="block hover:underline">
                Harga
              </Link>
            </span>
            <span className="space-y-2">
              <span className="block text-xs uppercase tracking-widest text-muted-foreground">
                Akun
              </span>
              <Link href="/masuk" className="block hover:underline">
                Masuk
              </Link>
              <Link href="/dashboard" className="block hover:underline">
                Undangan saya
              </Link>
            </span>
          </nav>
        </div>
      </footer>
    </div>
  );
}
