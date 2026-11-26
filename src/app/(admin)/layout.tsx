import Link from "next/link";
import { signOut } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

/**
 * Kerangka panel operator.
 *
 * Kain siang yang sama dengan dashboard — ini juga permukaan kerja — tapi
 * ditandai benang mengkudu di tepi atas dan kata "Admin" di sebelah logo,
 * supaya tidak pernah tertukar dengan dashboard undangan sendiri. Itu satu-
 * satunya pemakaian mengkudu di kerangka ini; sisanya tetap tenang.
 *
 * Penjaga di sini bukan satu-satunya: setiap halaman memanggil
 * `requireAdmin()` sendiri, karena Next merender layout dan page paralel.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-full flex-col">
      <span aria-hidden className="block h-[3px] w-full bg-mengkudu" />

      <header className="pinggiran-bawah sticky top-0 z-30 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-baseline gap-2.5">
            <Link
              href="/admin"
              className="font-display text-xl font-semibold tracking-tight"
            >
              Lungsin
            </Link>
            <span className="text-sm uppercase tracking-widest text-mengkudu">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button render={<Link href="/dashboard" />} variant="ghost" size="sm">
              Undangan saya
            </Button>
            <span className="hidden max-w-[24ch] truncate text-sm text-muted-foreground sm:inline">
              {admin.email}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button type="submit" variant="ghost" size="sm">
                Keluar
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="lungsin flex-1">
        <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
          {children}
        </div>
      </main>
      <Toaster position="top-center" />
    </div>
  );
}
