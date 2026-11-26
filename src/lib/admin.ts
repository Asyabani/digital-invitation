import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/*
  Penjaga route `/admin/*` dan Server Action admin.

  Sengaja TIDAK berada di file `"use server"` — sama alasannya dengan
  `src/lib/owner.ts`: setiap export di file `"use server"` menjadi endpoint
  yang bisa dipanggil langsung dari browser.

  Peran dibaca dari database, bukan dari sesi. Sesi Auth.js di sini memang
  bertipe database sehingga tiap request sudah menyentuh DB, dan membaca peran
  dari sana berarti mencabut akses admin langsung berlaku pada request
  berikutnya — bukan menunggu sesi lamanya kedaluwarsa.
*/

export type AdminUser = {
  id: string;
  email: string;
  name: string | null;
};

/** Admin yang sedang masuk, atau `null`. Dasar dari ketiga fungsi di bawah. */
async function getAdmin(): Promise<AdminUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!user || user.role !== "ADMIN") return null;

  return { id: user.id, email: user.email, name: user.name };
}

/**
 * Penjaga untuk **halaman**. Bukan admin → `notFound()`, bukan `redirect()` ke
 * halaman masuk: keberadaan panel operator tidak perlu diumumkan ke pengguna
 * biasa yang menebak-nebak URL.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) notFound();
  return admin;
}

/**
 * Penjaga untuk **Server Action**. Melempar `Error` biasa, bukan `notFound()`.
 *
 * `notFound()` melempar error kontrol-alur milik Next. Di dalam action yang
 * dipanggil dari komponen klien, error itu akan tertangkap `try/catch` di sisi
 * klien dan berubah jadi toast biasa — penolakannya jadi terlihat seperti
 * kegagalan jaringan, dan boundary 404 Next tidak pernah jalan. Error biasa
 * lebih jujur di konteks ini.
 */
export async function requireAdminForAction(): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) {
    throw new Error("Tindakan ini hanya untuk admin Lungsin.");
  }
  return admin;
}

/**
 * Versi yang tidak melempar — untuk memutuskan apakah tautan "Admin"
 * ditampilkan di dashboard. **Tidak boleh** dipakai sebagai penjaga.
 */
export async function isAdmin(): Promise<boolean> {
  return (await getAdmin()) !== null;
}
