import { signIn, auth } from "@/lib/auth";
import { redirect } from "next/navigation";

// Halaman dinamis (membaca sesi per-request). Lihat Next 16 Cache Components.
export const instant = false;

export default async function MasukPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="mx-auto flex max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-24">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold">Masuk</h1>
        <p className="text-sm text-neutral-500">
          Masuk untuk membuat & mengelola undangan Anda.
        </p>
      </div>

      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/dashboard" });
        }}
      >
        <button
          type="submit"
          className="w-full rounded-lg border px-4 py-3 text-sm font-medium hover:bg-neutral-50"
        >
          Masuk dengan Google
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-neutral-400">
        <span className="h-px flex-1 bg-neutral-200" />atau<span className="h-px flex-1 bg-neutral-200" />
      </div>

      <form
        action={async (formData: FormData) => {
          "use server";
          const email = String(formData.get("email") ?? "");
          await signIn("resend", { email, redirectTo: "/dashboard" });
        }}
        className="space-y-3"
      >
        <input
          type="email"
          name="email"
          required
          placeholder="nama@email.com"
          className="w-full rounded-lg border px-4 py-3 text-sm"
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-neutral-900 px-4 py-3 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Kirim tautan masuk
        </button>
      </form>
    </main>
  );
}
