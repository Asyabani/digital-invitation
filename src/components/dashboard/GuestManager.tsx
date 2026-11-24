"use client";

import { useState, useTransition } from "react";
import {
  addGuest,
  importGuests,
  updateGuest,
  deleteGuest,
  markGuestSent,
} from "@/lib/actions/guest";
import { parseGuestRows, IMPORT_MAX_ROWS } from "@/lib/validation/guest";
import { whatsappShareUrl } from "@/lib/calendar";

type Guest = {
  id: string;
  name: string;
  category: string | null;
  personalSlug: string;
  sentAt: string | null;
};

type Props = {
  invitationId: string;
  publicUrl: string;
  guests: Guest[];
  /** Paket memuat fitur link personal? Kalau tidak, pengelolaan dikunci. */
  canUsePersonalLinks: boolean;
  /** Pesan default untuk share WhatsApp. */
  shareText: string;
};

const inputCls = "w-full rounded-lg border px-3 py-2 text-sm";

export function GuestManager({
  invitationId,
  publicUrl,
  guests,
  canUsePersonalLinks,
  shareText,
}: Props) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [bulk, setBulk] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(fn: () => Promise<unknown>, done?: () => void) {
    setError(null);
    setInfo(null);
    startTransition(async () => {
      try {
        await fn();
        done?.();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
      }
    });
  }

  function linkFor(g: Guest) {
    return `${publicUrl}?to=${encodeURIComponent(g.personalSlug)}`;
  }

  async function copyLink(g: Guest) {
    try {
      await navigator.clipboard.writeText(linkFor(g));
      setCopied(g.id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setError("Gagal menyalin link. Salin manual dari kolom link.");
    }
  }

  const parsedBulk = parseGuestRows(bulk);
  const terkirim = guests.filter((g) => g.sentAt).length;

  return (
    <div className="space-y-6">
      {!canUsePersonalLinks && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          Link personal per tamu tersedia mulai paket <strong>Premium</strong>.
          Tingkatkan paket untuk menambah dan membagikan link tamu.
        </p>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total tamu", value: guests.length },
          { label: "Sudah dikirim", value: terkirim },
          { label: "Belum dikirim", value: guests.length - terkirim },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border p-4 text-center">
            <p className="text-2xl font-semibold">{s.value}</p>
            <p className="text-xs text-neutral-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3 rounded-xl border p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Tambah Tamu
        </h2>
        <form
          className="flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            run(
              () =>
                addGuest(invitationId, {
                  name: name.trim(),
                  category: category.trim() || undefined,
                }),
              () => {
                setName("");
                setCategory("");
              },
            );
          }}
        >
          <input
            className={`${inputCls} flex-1`}
            placeholder="Nama tamu"
            value={name}
            disabled={!canUsePersonalLinks || pending}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className={`${inputCls} w-40`}
            placeholder="Kategori (opsional)"
            value={category}
            disabled={!canUsePersonalLinks || pending}
            onChange={(e) => setCategory(e.target.value)}
          />
          <button
            type="submit"
            disabled={!canUsePersonalLinks || pending || !name.trim()}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Tambah
          </button>
          <button
            type="button"
            onClick={() => setShowBulk((v) => !v)}
            className="rounded-lg border px-4 py-2 text-sm font-medium"
          >
            Import massal
          </button>
        </form>

        {showBulk && (
          <div className="space-y-2">
            <textarea
              rows={6}
              className={inputCls}
              placeholder={"Budi Santoso, Keluarga\nSiti Aminah, Teman Kantor\nPak Joko"}
              value={bulk}
              disabled={!canUsePersonalLinks || pending}
              onChange={(e) => setBulk(e.target.value)}
            />
            <p className="text-xs text-neutral-400">
              Satu tamu per baris. Kategori opsional setelah koma. Terbaca{" "}
              <strong>{parsedBulk.length}</strong> tamu (maks {IMPORT_MAX_ROWS}).
            </p>
            <button
              type="button"
              disabled={!canUsePersonalLinks || pending || parsedBulk.length === 0}
              onClick={() =>
                run(
                  async () => {
                    const res = await importGuests(invitationId, parsedBulk);
                    setInfo(`${res.created} tamu berhasil diimpor.`);
                  },
                  () => setBulk(""),
                )
              }
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {pending ? "Mengimpor..." : `Impor ${parsedBulk.length} tamu`}
            </button>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        {info && <p className="text-sm text-green-700">{info}</p>}
      </div>

      {guests.length === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-neutral-500">
          Belum ada tamu. Tambahkan supaya nama mereka muncul otomatis di cover
          undangan.
        </p>
      ) : (
        <ul className="divide-y rounded-xl border">
          {guests.map((g) => (
            <li key={g.id} className="space-y-2 px-4 py-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">
                    {g.name}
                    {g.category && (
                      <span className="ml-2 rounded-full border px-2 py-0.5 text-xs text-neutral-500">
                        {g.category}
                      </span>
                    )}
                    {g.sentAt && (
                      <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                        terkirim
                      </span>
                    )}
                  </p>
                  <p className="break-all text-xs text-neutral-500">
                    {linkFor(g)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <a
                    href={whatsappShareUrl(
                      `${shareText}\n\nKepada Yth. ${g.name}`,
                      linkFor(g),
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium"
                  >
                    WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={() => copyLink(g)}
                    className="rounded-lg border px-3 py-1.5 text-xs"
                  >
                    {copied === g.id ? "Tersalin ✓" : "Salin link"}
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => markGuestSent(g.id))}
                    className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-50"
                  >
                    {g.sentAt ? "Batal tandai" : "Tandai terkirim"}
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      const next = window.prompt("Ubah nama tamu", g.name);
                      if (next && next.trim() && next.trim() !== g.name) {
                        run(() => updateGuest(g.id, { name: next.trim() }));
                      }
                    }}
                    className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-50"
                  >
                    Ubah
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      if (window.confirm(`Hapus tamu "${g.name}"?`)) {
                        run(() => deleteGuest(g.id));
                      }
                    }}
                    className="rounded-lg border px-3 py-1.5 text-xs text-red-600 disabled:opacity-50"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
