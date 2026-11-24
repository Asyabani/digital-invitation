"use client";

import { useState, useTransition } from "react";
import type {
  Content,
  Theme,
  SectionsOrder,
} from "@/lib/validation/invitation";
import { InvitationView } from "@/components/invitation/InvitationView";
import {
  updateInvitationTheme,
  updateSectionsOrder,
} from "@/lib/actions/invitation";

type Props = {
  invitationId: string;
  slug: string;
  content: Content;
  initialTheme: Theme;
  initialSections: SectionsOrder;
  showWatermark: boolean;
  /** Paket mengizinkan musik custom? Kalau tidak, field musik dikunci. */
  canUseMusic: boolean;
};

const PRESETS: { name: string; palette: Theme["palette"] }[] = [
  {
    name: "Klasik Cokelat",
    palette: {
      primary: "#8B5E3C",
      secondary: "#D9B99B",
      background: "#FAF6F0",
      text: "#3A2E26",
    },
  },
  {
    name: "Floral Lembut",
    palette: {
      primary: "#B06A7A",
      secondary: "#EBC7CF",
      background: "#FFF7F8",
      text: "#4A2F36",
    },
  },
  {
    name: "Hijau Sejuk",
    palette: {
      primary: "#3F6F52",
      secondary: "#B7D3C1",
      background: "#F4F8F5",
      text: "#24352B",
    },
  },
  {
    name: "Navy Elegan",
    palette: {
      primary: "#2E4057",
      secondary: "#A8BACC",
      background: "#F5F7FA",
      text: "#1C2733",
    },
  },
  {
    name: "Ceria Cerah",
    palette: {
      primary: "#D97706",
      secondary: "#FCD9A0",
      background: "#FFFBF2",
      text: "#4A3418",
    },
  },
];

const HEADING_FONTS = [
  "Playfair Display",
  "Cormorant Garamond",
  "Lora",
  "Great Vibes",
  "Inter",
];
const BODY_FONTS = ["Inter", "Lato", "Source Sans 3", "Nunito", "Georgia"];

const SECTION_LABEL: Record<string, string> = {
  cover: "Cover",
  opening: "Pembuka / Quote",
  couple: "Mempelai & Cerita",
  countdown: "Hitung Mundur",
  gallery: "Galeri",
  location: "Lokasi & Maps",
  rsvp: "Konfirmasi Kehadiran",
  greetings: "Buku Tamu",
  gift: "Amplop Digital",
  closing: "Penutup",
};

const inputCls = "w-full rounded-lg border px-3 py-2 text-sm";

export function ThemeEditor({
  invitationId,
  slug,
  content,
  initialTheme,
  initialSections,
  showWatermark,
  canUseMusic,
}: Props) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [sections, setSections] = useState<SectionsOrder>(
    [...initialSections].sort((a, b) => a.order - b.order),
  );
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function patchPalette(patch: Partial<Theme["palette"]>) {
    setTheme((t) => ({ ...t, palette: { ...t.palette, ...patch } }));
  }

  function move(index: number, delta: number) {
    setSections((list) => {
      const next = [...list];
      const target = index + delta;
      if (target < 0 || target >= next.length) return list;
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next.map((s, i) => ({ ...s, order: i }));
    });
  }

  function toggle(index: number) {
    setSections((list) =>
      list.map((s, i) => (i === index ? { ...s, enabled: !s.enabled } : s)),
    );
  }

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        await updateInvitationTheme(invitationId, theme);
        await updateSectionsOrder(
          invitationId,
          sections.map((s, i) => ({ ...s, order: i })),
        );
        setSavedAt(new Date().toLocaleTimeString("id-ID"));
      } catch {
        setError("Gagal menyimpan tema. Periksa isian (URL musik harus valid).");
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={save}
            disabled={pending}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending ? "Menyimpan..." : "Simpan Tema"}
          </button>
          {savedAt && (
            <span className="text-xs text-neutral-400">Tersimpan {savedAt}</span>
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="space-y-4 rounded-xl border p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Palet Warna
          </h2>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => patchPalette(p.palette)}
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs hover:border-neutral-400"
              >
                <span
                  className="h-4 w-4 rounded-full border"
                  style={{ backgroundColor: p.palette.primary }}
                />
                {p.name}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                ["primary", "Warna Utama"],
                ["secondary", "Warna Pendukung"],
                ["background", "Latar"],
                ["text", "Teks"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block space-y-1">
                <span className="text-sm font-medium text-neutral-700">
                  {label}
                </span>
                <span className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.palette[key]}
                    onChange={(e) => patchPalette({ [key]: e.target.value })}
                    className="h-9 w-12 rounded border"
                    aria-label={label}
                  />
                  <input
                    className={inputCls}
                    value={theme.palette[key]}
                    onChange={(e) => patchPalette({ [key]: e.target.value })}
                  />
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-xl border p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Font
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="text-sm font-medium text-neutral-700">Judul</span>
              <select
                className={inputCls}
                value={theme.font.heading}
                onChange={(e) =>
                  setTheme((t) => ({
                    ...t,
                    font: { ...t.font, heading: e.target.value },
                  }))
                }
              >
                {[...new Set([theme.font.heading, ...HEADING_FONTS])].map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-neutral-700">Isi</span>
              <select
                className={inputCls}
                value={theme.font.body}
                onChange={(e) =>
                  setTheme((t) => ({
                    ...t,
                    font: { ...t.font, body: e.target.value },
                  }))
                }
              >
                {[...new Set([theme.font.body, ...BODY_FONTS])].map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Musik Latar
          </h2>
          {!canUseMusic && (
            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              Musik custom tersedia mulai paket Premium.
            </p>
          )}
          <label className="block space-y-1">
            <span className="text-sm font-medium text-neutral-700">
              URL audio (mp3)
            </span>
            <input
              className={inputCls}
              disabled={!canUseMusic}
              placeholder="https://.../lagu.mp3"
              value={theme.music?.url ?? ""}
              onChange={(e) =>
                setTheme((t) => ({
                  ...t,
                  music: e.target.value
                    ? { url: e.target.value, autoplay: t.music?.autoplay ?? false }
                    : undefined,
                }))
              }
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              disabled={!canUseMusic || !theme.music?.url}
              checked={theme.music?.autoplay ?? false}
              onChange={(e) =>
                setTheme((t) =>
                  t.music
                    ? { ...t, music: { ...t.music, autoplay: e.target.checked } }
                    : t,
                )
              }
            />
            Coba putar otomatis saat undangan dibuka
          </label>
          <p className="text-xs text-neutral-400">
            Browser HP sering memblokir autoplay; tombol putar tetap tersedia
            untuk tamu.
          </p>
        </div>

        <div className="space-y-3 rounded-xl border p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Section Undangan
          </h2>
          <p className="text-xs text-neutral-400">
            Matikan section yang tidak dipakai, atau ubah urutannya.
          </p>
          <ul className="divide-y rounded-lg border">
            {sections.map((s, i) => (
              <li
                key={s.key}
                className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
              >
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={s.enabled}
                    onChange={() => toggle(i)}
                  />
                  <span className={s.enabled ? "" : "text-neutral-400"}>
                    {SECTION_LABEL[s.key] ?? s.key}
                  </span>
                </label>
                <span className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label={`Naikkan ${SECTION_LABEL[s.key] ?? s.key}`}
                    className="rounded border px-2 py-1 text-xs disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === sections.length - 1}
                    aria-label={`Turunkan ${SECTION_LABEL[s.key] ?? s.key}`}
                    className="rounded border px-2 py-1 text-xs disabled:opacity-30"
                  >
                    ↓
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-6rem)]">
        <div className="h-full overflow-y-auto rounded-xl border">
          <InvitationView
            invitationId={invitationId}
            slug={slug}
            content={content}
            theme={theme}
            sections={sections}
            guestName="Nama Tamu"
            interactive={false}
            showWatermark={showWatermark}
          />
        </div>
      </div>
    </div>
  );
}
