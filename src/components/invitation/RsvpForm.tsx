"use client";

import { useState } from "react";

type Props = {
  invitationId: string;
  personalSlug?: string;
  defaultName?: string;
  interactive?: boolean;
};

const STATUSES: [RsvpStatus, string][] = [
  ["HADIR", "Hadir"],
  ["TIDAK_HADIR", "Tidak hadir"],
  ["RAGU", "Masih ragu"],
];

type RsvpStatus = "HADIR" | "TIDAK_HADIR" | "RAGU";

export function RsvpForm({
  invitationId,
  personalSlug,
  defaultName,
  interactive = true,
}: Props) {
  const [status, setStatus] = useState<RsvpStatus>("HADIR");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!interactive) return;
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const res = await fetch(`/api/invitations/${invitationId}/rsvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name") ?? ""),
        status,
        headcount: Number(form.get("headcount") ?? 1),
        message: String(form.get("message") ?? "") || undefined,
        personalSlug,
      }),
    });

    setSubmitting(false);
    if (res.ok) {
      setDone(true);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Gagal mengirim. Coba lagi.");
    }
  }

  if (done) {
    return (
      <p className="inv-card w-full max-w-sm p-5 text-sm">
        Terima kasih, konfirmasimu sudah kami terima.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm space-y-3 text-left">
      <label className="block space-y-1.5">
        <span className="inv-note text-xs">Nama Anda</span>
        <input
          name="name"
          required
          defaultValue={defaultName}
          placeholder="Nama lengkap"
          className="inv-field"
        />
      </label>

      <fieldset className="space-y-1.5">
        <legend className="inv-note text-xs">Kehadiran</legend>
        <div className="flex gap-2">
          {STATUSES.map(([val, label]) => (
            <button
              key={val}
              type="button"
              aria-pressed={status === val}
              onClick={() => setStatus(val)}
              className="inv-chip"
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      {status !== "TIDAK_HADIR" && (
        <label className="block space-y-1.5">
          <span className="inv-note text-xs">Jumlah orang yang hadir</span>
          <input
            name="headcount"
            type="number"
            min={1}
            max={20}
            defaultValue={1}
            className="inv-field"
          />
        </label>
      )}

      <label className="block space-y-1.5">
        <span className="inv-note text-xs">Pesan (opsional)</span>
        <textarea name="message" rows={2} className="inv-field" />
      </label>

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
    </form>
  );
}
