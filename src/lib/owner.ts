import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

/**
 * Pastikan undangan milik user yang sedang login.
 * Dipakai bersama oleh Server Actions (undangan, pembayaran, moderasi).
 * Sengaja TIDAK berada di file "use server" agar tidak ikut terekspos
 * sebagai endpoint Server Action.
 */
export async function ownInvitation(id: string) {
  const session = await auth();
  if (!session?.user) redirect("/masuk");
  const inv = await prisma.invitation.findUnique({ where: { id } });
  if (!inv || inv.userId !== session.user.id) {
    throw new Error("Undangan tidak ditemukan atau bukan milik Anda.");
  }
  return inv;
}
