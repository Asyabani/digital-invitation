"use client";

import { useState } from "react";
import type { GiftConfig } from "@/lib/validation/invitation";

type Props = {
  invitationId: string;
  personalSlug?: string;
  defaultName?: string;
  giftConfig: GiftConfig;
  interactive?: boolean;
  accentColor?: string;
};

/**
 * F9 — amplop digital. Menampilkan rekening/QRIS milik pemilik dan form
 * konfirmasi kado. Nominal yang dikirim tamu tidak pernah ditampilkan kembali
 * di halaman publik.
 */
export function GiftForm({
  invitationId,
  personalSlug,
  defaultName,
  giftConfig,
  interactive = true,
  accentColor,
}: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setError("Gagal menyalin. Salin manual ya.");
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!interactive) return;
    setSubmitting(true);
    setError(null);

    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const rawAmount = String(form.get("amount") ?? "").trim();
    const rawProof = String(form.get("proofUrl") ?? "").trim();
    const rawNote = String(form.get("note") ?? "").trim();

    const res = await fetch(`/api/invitations/${invitationId}/gifts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name") ?? ""),
        method: String(form.get("method") ?? "TRANSFER"),
        amount: rawAmount ? Number(rawAmount) : undefined,
        proofUrl: rawProof || undefined,
        note: rawNote || undefined,
        personalSlug,
      }),
    });

    setSubmitting(false);
    if (res.ok) {
      setSent(true);
      formEl.reset();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Gagal mengirim konfirmasi. Coba lagi.");
    }
  }

  const inputCls = "w-full rounded-lg border px-3 py-2 text-sm";

  return (
    <div className="mx-auto max-w-md space-y-5">
      <p className="text-sm opacity-80">
        Doa restu Anda adalah hadiah terindah. Namun bila berkenan memberi tanda
        kasih, dapat melalui:
      </p>

      {giftConfig.banks && giftConfig.banks.length > 0 && (
        <ul className="space-y-3">
          {giftConfig.banks.map((b, i) => (
            <li key={i} className="rounded-lg bg-black/5 p-4 text-left text-sm">
              <p className="font-medium">{b.bankName}</p>
              <p className="font-mono text-base">{b.accountNumber}</p>
              <p className="opacity-70">a.n. {b.accountName}</p>
              <button
                type="button"
                onClick={() => copy(b.accountNumber)}
                className="mt-2 rounded-lg border px-3 py-1.5 text-xs"
                style={accentColor ? { borderColor: accentColor } : undefined}
              >
                {copied === b.accountNumber ? "Tersalin ✓" : "Salin nomor"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {giftConfig.qrisUrl && (
        <div className="space-y-2">
          <p className="text-sm font-medium">QRIS</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={giftConfig.qrisUrl}
            alt="Kode QRIS untuk amplop digital"
            loading="lazy"
            className="mx-auto w-56 rounded-lg"
          />
        </div>
      )}

      {giftConfig.note && (
        <p className="text-sm opacity-70">{giftConfig.note}</p>
      )}

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg border px-4 py-2 text-sm font-medium"
          style={accentColor ? { borderColor: accentColor } : undefined}
        >
          Konfirmasi Kado
        </button>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3 text-left">
          <input
            name="name"
            required
            defaultValue={defaultName}
            placeholder="Nama Anda"
            className={inputCls}
          />
          <select name="method" className={inputCls} defaultValue="TRANSFER">
            <option value="TRANSFER">Transfer bank</option>
            <option value="QRIS">QRIS</option>
          </select>
          <input
            name="amount"
            type="number"
            min={1}
            placeholder="Nominal (opsional)"
            className={inputCls}
          />
          <input
            name="proofUrl"
            type="url"
            placeholder="Link bukti transfer (opsional)"
            className={inputCls}
          />
          <input name="note" placeholder="Pesan (opsional)" className={inputCls} />

          {sent && (
            <p className="text-sm text-green-700">
              Terima kasih, konfirmasi kado Anda sudah kami terima 🙏
            </p>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !interactive}
            className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {interactive
              ? submitting
                ? "Mengirim..."
                : "Kirim Konfirmasi"
              : "Pratinjau"}
          </button>
          <p className="text-xs opacity-60">
            Konfirmasi ini hanya dilihat oleh pemilik acara.
          </p>
        </form>
      )}
    </div>
  );
}
