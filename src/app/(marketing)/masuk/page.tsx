import { signIn, auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Halaman dinamis (membaca sesi per-request). Lihat Next 16 Cache Components.
export const instant = false;

export default async function MasukPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <section className="pakan lungsin flex flex-1 items-center py-16 sm:py-24">
      <div className="mx-auto w-full max-w-md px-5 sm:px-8">
        <div className="kain pinggiran-atas pinggiran-bawah p-8 sm:p-10">
          <h1 className="font-display text-3xl font-semibold">Masuk</h1>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            Hanya pemilik acara yang perlu akun. Tamu Anda tidak akan pernah
            diminta mendaftar.
          </p>

          <form
            className="mt-8"
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <Button type="submit" variant="outline" size="lg" className="w-full">
              Lanjutkan dengan Google
            </Button>
          </form>

          <div className="my-7 flex items-center gap-4 text-xs uppercase tracking-widest text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            atau
            <span className="h-px flex-1 bg-border" />
          </div>

          <form
            action={async (formData: FormData) => {
              "use server";
              const email = String(formData.get("email") ?? "");
              await signIn("resend", { email, redirectTo: "/dashboard" });
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="nama@email.com"
              />
            </div>
            <Button type="submit" size="lg" className="w-full">
              Kirim tautan masuk
            </Button>
            <p className="text-sm text-muted-foreground">
              Kami kirimkan satu tautan sekali pakai ke email itu.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
