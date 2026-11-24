"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { GiftConfig } from "@/lib/validation/invitation";
import { updateGiftConfig } from "@/lib/actions/invitation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Helai, HelaiKepala, HelaiIsi } from "@/components/dashboard/Helai";

type Bank = { bankName: string; accountNumber: string; accountName: string };

type Props = {
  invitationId: string;
  initialConfig: GiftConfig | null;
  /** Paket memuat fitur amplop digital? */
  canUseGift: boolean;
};

export function GiftSettings({ invitationId, initialConfig, canUseGift }: Props) {
  const [banks, setBanks] = useState<Bank[]>(initialConfig?.banks ?? []);
  const [qrisUrl, setQrisUrl] = useState(initialConfig?.qrisUrl ?? "");
  const [note, setNote] = useState(initialConfig?.note ?? "");
  const [pending, startTransition] = useTransition();

  function patchBank(i: number, patch: Partial<Bank>) {
    setBanks((list) => list.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  }

  function save(clear = false) {
    startTransition(async () => {
      try {
        if (clear) {
          await updateGiftConfig(invitationId, null);
          setBanks([]);
          setQrisUrl("");
          setNote("");
          toast.success("Konfigurasi amplop dikosongkan.");
          return;
        }
        const filled = banks.filter(
          (b) => b.bankName && b.accountNumber && b.accountName,
        );
        await updateGiftConfig(invitationId, {
          banks: filled.length > 0 ? filled : undefined,
          qrisUrl: qrisUrl.trim() || undefined,
          note: note.trim() || undefined,
        });
        toast.success("Tersimpan.");
      } catch {
        toast.error("Gagal menyimpan.", {
          description: "Pastikan URL QRIS valid dan data rekening lengkap.",
        });
      }
    });
  }

  return (
    <Helai>
      <HelaiKepala
        title="Rekening & QRIS"
        description="Data ini yang dilihat tamu di bagian amplop digital."
        action={
          <>
            <Button onClick={() => save(false)} disabled={pending}>
              {pending && (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              )}
              Simpan
            </Button>
            <Button
              onClick={() => save(true)}
              disabled={pending}
              variant="outline"
            >
              Kosongkan
            </Button>
          </>
        }
      />

      <HelaiIsi className="space-y-5">
        {!canUseGift && (
          <Alert>
            <AlertDescription>
              Amplop digital tersedia mulai paket <strong>Premium</strong>. Anda
              tetap bisa menyiapkan datanya sekarang; section ini baru tampil ke
              tamu setelah paketnya aktif.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {banks.map((b, i) => (
            <div
              key={i}
              className="grid items-end gap-3 rounded-xl border p-4 sm:grid-cols-[1fr_1.2fr_1.2fr_auto]"
            >
              <div className="space-y-1.5">
                <Label htmlFor={`bank-${i}`}>Bank</Label>
                <Input
                  id={`bank-${i}`}
                  placeholder="BCA"
                  value={b.bankName}
                  onChange={(e) => patchBank(i, { bankName: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`rek-${i}`}>Nomor rekening</Label>
                <Input
                  id={`rek-${i}`}
                  className="font-mono"
                  placeholder="1234567890"
                  value={b.accountNumber}
                  onChange={(e) =>
                    patchBank(i, { accountNumber: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`an-${i}`}>Atas nama</Label>
                <Input
                  id={`an-${i}`}
                  placeholder="Budi Santoso"
                  value={b.accountName}
                  onChange={(e) => patchBank(i, { accountName: e.target.value })}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Hapus rekening ${b.bankName || i + 1}`}
                onClick={() => setBanks((l) => l.filter((_, idx) => idx !== i))}
              >
                <Trash2 className="text-destructive" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() =>
              setBanks((l) => [
                ...l,
                { bankName: "", accountNumber: "", accountName: "" },
              ])
            }
          >
            <Plus data-icon="inline-start" />
            Tambah rekening
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="qris">URL gambar QRIS</Label>
            <Input
              id="qris"
              type="url"
              placeholder="https://.../qris.png"
              value={qrisUrl}
              onChange={(e) => setQrisUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Opsional.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="note">Catatan untuk tamu</Label>
            <Input
              id="note"
              placeholder="Terima kasih atas doa dan perhatiannya."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Opsional.</p>
          </div>
        </div>
      </HelaiIsi>
    </Helai>
  );
}
