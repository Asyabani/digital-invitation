import Link from "next/link";
import { signIn, auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Halaman dinamis (membaca sesi per-request). Lihat Next 16 Cache Components.
export const instant = false;

export default async function MasukPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-16 sm:px-6">
      <Link
        href="/"
        className="font-display text-center text-lg font-semibold tracking-tight"
      >
        Undangan Digital
      </Link>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="font-display text-2xl">Masuk</CardTitle>
          <CardDescription>
            Masuk untuk membuat dan mengelola undangan Anda. Tamu tidak perlu
            akun.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <Button
              type="submit"
              variant="outline"
              size="lg"
              className="w-full"
            >
              Masuk dengan Google
            </Button>
          </form>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
            className="space-y-3"
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
            <p className="text-center text-xs text-muted-foreground">
              Kami kirimkan tautan sekali pakai ke email Anda.
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
