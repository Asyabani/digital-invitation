"use client";

import { useState } from "react";

type Greeting = { id: string; name: string; message: string };

type Props = {
  invitationId: string;
  personalSlug?: string;
  defaultName?: string;
  initialGreetings: Greeting[];
  interactive?: boolean;
};

export function GreetingForm({
  invitationId,
  personalSlug,
  defaultName,
  initialGreetings,
  interactive = true,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!interactive) return;
    setSubmitting(true);
    setError(null);

    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const res = await fetch(`/api/invitations/${invitationId}/greetings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name") ?? ""),
        message: String(form.get("message") ?? ""),
        personalSlug,
      }),
    });

    setSubmitting(false);
    if (res.ok) {
      setSent(true);
      formEl.reset();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Gagal mengirim. Coba lagi.");
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <form onSubmit={onSubmit} className="space-y-3 text-left">
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
        <label className="block space-y-1.5">
          <span className="inv-note text-xs">Ucapan & doa</span>
          <textarea
            name="message"
            required
            rows={3}
            placeholder="Tulis ucapan untuk mempelai..."
            className="inv-field"
          />
        </label>

        {sent && (
          <p className="inv-card p-3 text-sm" role="status">
            Ucapanmu terkirim dan akan tampil setelah ditinjau.
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
              : "Kirim Ucapan"
            : "Pratinjau"}
        </button>
      </form>

      {initialGreetings.length > 0 && (
        <ul className="space-y-2.5 text-left">
          {initialGreetings.map((g) => (
            <li key={g.id} className="inv-card p-4 text-sm">
              <p className="inv-heading font-medium">{g.name}</p>
              <p className="inv-note mt-1 leading-relaxed">{g.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
