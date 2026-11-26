"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { setUserRole } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

/**
 * Angkat atau turunkan admin.
 *
 * Akun yang sedang masuk tidak punya tombol sama sekali — `setUserRole`
 * menolaknya di server, dan menampilkan tombol yang pasti gagal hanya
 * mengundang orang menekannya.
 */
export function RoleToggle({
  userId,
  email,
  role,
  diriSendiri,
}: {
  userId: string;
  email: string;
  role: "USER" | "ADMIN";
  diriSendiri: boolean;
}) {
  const [pending, startTransition] = useTransition();

  if (diriSendiri) {
    return <span className="text-xs text-muted-foreground">akun Anda</span>;
  }

  const jadi = role === "ADMIN" ? "USER" : "ADMIN";

  function ubah() {
    startTransition(async () => {
      try {
        await setUserRole({ userId, role: jadi });
        toast.success(
          jadi === "ADMIN"
            ? `${email} diangkat jadi admin`
            : `${email} diturunkan jadi pengguna biasa`,
        );
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Gagal mengubah peran pengguna.",
        );
      }
    });
  }

  return (
    <Button onClick={ubah} disabled={pending} variant="outline" size="sm">
      {pending
        ? "Menyimpan..."
        : role === "ADMIN"
          ? "Turunkan"
          : "Jadikan admin"}
    </Button>
  );
}
