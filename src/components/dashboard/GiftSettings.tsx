"use client";

import { useState, useTransition } from "react";
import type { GiftConfig } from "@/lib/validation/invitation";
import { updateGiftConfig } from "@/lib/actions/invitation";

type Bank = { bankName: string; accountNumber: string; accountName: string };

type Props = {
  invitationId: string;
  initialConfig: GiftConfig | null;
  /** Paket memuat fitur amplop digital? */
  canUseGift: boolean;
};

const inputCls = "w-full rounded-lg border px-3 py-2 text-sm";

export function GiftSettings({ invitationId, initialConfig, canUseGift }: Props) {
  const [banks, setBanks] = useState<Bank[]>(initialConfig?.banks ?? []);
  const [qrisUrl, setQrisUrl] = useState(initialConfig?.qrisUrl ?? "");
  const [note, setNote] = useState(initialConfig?.note ?? "");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function patchBank(i: number, patch: Partial<Bank>) {
    setBanks((list) => list.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  }

  function save(clear = false) {
    setError(null);
    startTransition(async () => {
      try {
        if (clear) {
          await updateGiftConfig(invitationId, null);
          setBanks([]);
          setQrisUrl("");
          setNote("");
        } else {
          const filled = banks.filter(
            (b) => b.bankName && b.accountNumber && b.accountName,
          );
          await updateGiftConfig(invitationId, {
            banks: filled.length > 0 ? filled : undefined,
            qrisUrl: qrisUrl.trim() || undefined,
            note: note.trim() || undefined,
          });
        }
        setSavedAt(new Date().toLocaleTimeString("id-ID"));
      } catch {
        setError(
          "Gagal menyimpan. Pastikan URL QRIS valid dan data rekening lengkap.",
        );
      }
    });
  }

  return (
    <div className="space-y-4 rounded-xl border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Rekening & QRIS
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => save(false)}
            disabled={pending}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending ? "Menyimpan..." : "Simpan"}
          </button>
          <button
            onClick={() => save(true)}
            disabled={pending}
            className="rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            Kosongkan
          </button>
        </div>
      </div>

      {!canUseGift && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          Amplop digital tersedia mulai paket <strong>Premium</strong>. Anda tetap
          bisa menyiapkan datanya sekarang; section ini baru tampil ke tamu
          setelah paketnya aktif.
        </p>
      )}

      <div className="space-y-3">
        {banks.map((b, i) => (
          <div key={i} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-4">
            <input
              className={inputCls}
              placeholder="Nama bank (BCA)"
              value={b.bankName}
              onChange={(e) => patchBank(i, { bankName: e.target.value })}
            />
            <input
              className={inputCls}
              placeholder="Nomor rekening"
              value={b.accountNumber}
              onChange={(e) => patchBank(i, { accountNumber: e.target.value })}
            />
            <input
              className={inputCls}
              placeholder="Atas nama"
              value={b.accountName}
              onChange={(e) => patchBank(i, { accountName: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setBanks((l) => l.filter((_, idx) => idx !== i))}
              className="rounded-lg border px-3 py-2 text-sm text-red-600"
            >
              Hapus
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setBanks((l) => [
              ...l,
              { bankName: "", accountNumber: "", accountName: "" },
            ])
          }
          className="rounded-lg border px-4 py-2 text-sm font-medium"
        >
          + Tambah rekening
        </button>
      </div>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-neutral-700">
          URL gambar QRIS (opsional)
        </span>
        <input
          className={inputCls}
          placeholder="https://.../qris.png"
          value={qrisUrl}
          onChange={(e) => setQrisUrl(e.target.value)}
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-neutral-700">
          Catatan untuk tamu (opsional)
        </span>
        <input
          className={inputCls}
          placeholder="Terima kasih atas doa dan perhatiannya."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>

      {savedAt && (
        <p className="text-xs text-neutral-400">Tersimpan {savedAt}</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
