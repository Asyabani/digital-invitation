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
    <div className="mx-auto max-w-md space-y-5">
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          name="name"
          required
          defaultValue={defaultName}
          placeholder="Nama Anda"
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
        <textarea
          name="message"
          required
          rows={3}
          placeholder="Tulis ucapan & doa..."
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
        {sent && (
          <p className="text-sm text-green-700">
            Ucapanmu terkirim dan akan tampil setelah ditinjau.
          </p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !interactive}
          className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {interactive ? (submitting ? "Mengirim..." : "Kirim Ucapan") : "Pratinjau"}
        </button>
      </form>

      {initialGreetings.length > 0 && (
        <ul className="space-y-3">
          {initialGreetings.map((g) => (
            <li key={g.id} className="rounded-lg bg-black/5 p-3 text-sm">
              <p className="font-medium">{g.name}</p>
              <p className="opacity-80">{g.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
