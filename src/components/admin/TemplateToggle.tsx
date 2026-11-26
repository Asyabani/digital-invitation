"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { setTemplateActive } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

/**
 * Nyalakan/matikan satu template di galeri publik.
 *
 * Teks tombolnya menyebut tindakan yang akan terjadi, dan toast setelahnya
 * memakai kata kerja yang sama supaya jelas yang barusan berubah.
 */
export function TemplateToggle({
  templateId,
  name,
  isActive,
}: {
  templateId: string;
  name: string;
  isActive: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function ubah() {
    startTransition(async () => {
      try {
        await setTemplateActive({ templateId, isActive: !isActive });
        toast.success(
          isActive
            ? `${name} dimatikan — tidak lagi tampil di galeri`
            : `${name} dinyalakan — kembali tampil di galeri`,
        );
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Gagal mengubah status template.",
        );
      }
    });
  }

  return (
    <Button
      onClick={ubah}
      disabled={pending}
      variant={isActive ? "outline" : "default"}
      size="sm"
    >
      {pending ? "Menyimpan..." : isActive ? "Matikan" : "Nyalakan"}
    </Button>
  );
}
