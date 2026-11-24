"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { GiftConfig } from "@/lib/validation/invitation";

type Props = {
  invitationId: string;
  personalSlug?: string;
  defaultName?: string;
  giftConfig: GiftConfig;
  interactive?: boolean;
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
      setError("Gagal menyalin. Silakan salin nomornya secara manual.");
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

  return (
    <div className="w-full max-w-sm space-y-5">
      <p className="inv-note leading-relaxed">
        Doa restu Anda adalah hadiah terindah. Namun bila berkenan memberi tanda
        kasih, dapat melalui:
      </p>

      {giftConfig.banks && giftConfig.banks.length > 0 && (
        <ul className="space-y-2.5 text-left">
          {giftConfig.banks.map((b, i) => (
            <li key={i} className="inv-card p-4">
              <p className="inv-heading text-sm font-medium">{b.bankName}</p>
              <p className="tabular mt-0.5 text-lg">{b.accountNumber}</p>
              <p className="inv-note text-sm">a.n. {b.accountName}</p>
              <button
                type="button"
                onClick={() => copy(b.accountNumber)}
                className="inv-button inv-button-outline mt-3 h-9 min-h-9 px-3 text-xs"
              >
                {copied === b.accountNumber ? (
                  <>
                    <Check className="size-3.5" aria-hidden /> Tersalin
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" aria-hidden /> Salin nomor
                  </>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {giftConfig.qrisUrl && (
        <div className="space-y-2">
          <p className="inv-note text-xs uppercase tracking-wider">QRIS</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={giftConfig.qrisUrl}
            alt="Kode QRIS untuk amplop digital"
            loading="lazy"
            decoding="async"
            width={224}
            height={224}
            className="mx-auto w-56 rounded-xl bg-white p-2"
          />
        </div>
      )}

      {giftConfig.note && <p className="inv-note">{giftConfig.note}</p>}

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inv-button inv-button-outline"
        >
          Konfirmasi Kado
        </button>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3 text-left">
          <label className="block space-y-1.5">
            <span className="inv-note text-xs">Nama Anda</span>
            <input
              name="name"
              required
              defaultValue={defaultName}
              className="inv-field"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="inv-note text-xs">Metode</span>
            <select name="method" className="inv-field" defaultValue="TRANSFER">
              <option value="TRANSFER">Transfer bank</option>
              <option value="QRIS">QRIS</option>
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="inv-note text-xs">Nominal (opsional)</span>
            <input name="amount" type="number" min={1} className="inv-field" />
          </label>
          <label className="block space-y-1.5">
            <span className="inv-note text-xs">
              Link bukti transfer (opsional)
            </span>
            <input name="proofUrl" type="url" className="inv-field" />
          </label>
          <label className="block space-y-1.5">
            <span className="inv-note text-xs">Pesan (opsional)</span>
            <input name="note" className="inv-field" />
          </label>

          {sent && (
            <p className="inv-card p-3 text-sm" role="status">
              Terima kasih, konfirmasi kado Anda sudah kami terima.
            </p>
          )}
          {error && (
            <p className="text-sm" role="alert" style={{ color: "#b91c1c" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !interactive}
            className="inv-button w-full"
          >
            {interactive
              ? submitting
                ? "Mengirim..."
                : "Kirim Konfirmasi"
              : "Pratinjau"}
          </button>
          <p className="inv-note text-xs">
            Konfirmasi ini hanya dilihat oleh pemilik acara.
          </p>
        </form>
      )}
    </div>
  );
}
