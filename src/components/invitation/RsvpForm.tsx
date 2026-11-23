"use client";

import { useState } from "react";

type Props = {
  invitationId: string;
  personalSlug?: string;
  defaultName?: string;
  interactive?: boolean;
};

export function RsvpForm({
  invitationId,
  personalSlug,
  defaultName,
  interactive = true,
}: Props) {
  const [status, setStatus] = useState<"HADIR" | "TIDAK_HADIR" | "RAGU">("HADIR");
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
      <p className="rounded-lg bg-black/5 p-4 text-center text-sm">
        Terima kasih, konfirmasimu sudah kami terima 🙏
      </p>
    );
  }

  const statuses: [typeof status, string][] = [
    ["HADIR", "Hadir"],
    ["TIDAK_HADIR", "Tidak hadir"],
    ["RAGU", "Masih ragu"],
  ];

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-sm space-y-3">
      <input
        name="name"
        required
        defaultValue={defaultName}
        placeholder="Nama Anda"
        className="w-full rounded-lg border px-3 py-2 text-sm"
      />
      <div className="flex gap-2">
        {statuses.map(([val, label]) => (
          <button
            key={val}
            type="button"
            onClick={() => setStatus(val)}
            className={`flex-1 rounded-lg border px-2 py-2 text-xs ${
              status === val ? "border-black bg-black text-white" : ""
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <input
        name="headcount"
        type="number"
        min={1}
        max={20}
        defaultValue={1}
        className="w-full rounded-lg border px-3 py-2 text-sm"
        placeholder="Jumlah orang"
      />
      <textarea
        name="message"
        rows={2}
        placeholder="Pesan (opsional)"
        className="w-full rounded-lg border px-3 py-2 text-sm"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting || !interactive}
        className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {interactive ? (submitting ? "Mengirim..." : "Kirim Konfirmasi") : "Pratinjau"}
      </button>
    </form>
  );
}
