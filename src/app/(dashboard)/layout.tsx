import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

/**
 * Kain siang — kerangka dashboard.
 * Terang karena ini permukaan kerja berjam-jam; marketing memakai kain malam.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/masuk");

  // Tautan ke panel operator hanya muncul untuk admin. Ini kenyamanan, bukan
  // pengamanan — penjaganya ada di `/admin/*` sendiri.
  const admin = await isAdmin();

  return (
    <div className="flex min-h-full flex-col">
      <header className="pinggiran-bawah sticky top-0 z-30 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link
            href="/dashboard"
            className="font-display text-xl font-semibold tracking-tight"
          >
            Lungsin
          </Link>
          <div className="flex items-center gap-3">
            {admin && (
              <Button render={<Link href="/admin" />} variant="ghost" size="sm">
                Admin
              </Button>
            )}
            <span className="hidden max-w-[24ch] truncate text-sm text-muted-foreground sm:inline">
              {session.user.email}
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
