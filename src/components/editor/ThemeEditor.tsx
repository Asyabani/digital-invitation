"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronUp, Loader2, Smartphone } from "lucide-react";
import { toast } from "sonner";
import type {
  Content,
  Theme,
  SectionsOrder,
} from "@/lib/validation/invitation";
import { HEADING_FONTS, BODY_FONTS, fontStack } from "@/lib/font-stacks";
import { LAYOUTS, LAYOUT_KEYS } from "@/lib/invitation-layouts";
import { InvitationView } from "@/components/invitation/InvitationView";
import {
  updateInvitationTheme,
  updateSectionsOrder,
} from "@/lib/actions/invitation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Helai, HelaiKepala, HelaiIsi } from "@/components/dashboard/Helai";

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

const PALETTE_FIELDS = [
  ["primary", "Warna utama"],
  ["secondary", "Warna pendukung"],
  ["background", "Latar"],
  ["text", "Teks"],
] as const;

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
    startTransition(async () => {
      try {
        await updateInvitationTheme(invitationId, theme);
        await updateSectionsOrder(
          invitationId,
          sections.map((s, i) => ({ ...s, order: i })),
        );
        toast.success("Tema tersimpan.");
      } catch {
        toast.error("Gagal menyimpan tema.", {
          description: "Periksa isian — URL musik harus berupa tautan valid.",
        });
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
      <div className="space-y-5">
        {/*
          Tata letak didahulukan karena ia menentukan bentuk halaman; warna
          dan font menumpang di atasnya. Memilihnya belakangan berarti
          pemilik menyetel warna untuk susunan yang lalu ia ganti.
        */}
        <Helai>
          <HelaiKepala
            title="Tata letak"
            description="Menentukan susunan halaman: bentuk sampul, posisi judul tiap bagian, dan ada tidaknya kotak. Warna dan font tetap milik Anda."
          />
          <HelaiIsi>
            <fieldset className="grid gap-2 sm:grid-cols-2">
              <legend className="sr-only">Pilih tata letak undangan</legend>
              {LAYOUT_KEYS.map((key) => {
                const l = LAYOUTS[key];
                const aktif = (theme.layout ?? "klasik") === key;
                return (
                  <label
                    key={key}
                    className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors ${
                      aktif
                        ? "border-foreground/30 bg-accent/50"
                        : "hover:border-foreground/20"
                    }`}
                  >
                    <input
                      type="radio"
                      name="layout"
                      className="mt-1 shrink-0"
                      checked={aktif}
                      onChange={() =>
                        setTheme((t) => ({ ...t, layout: key }))
                      }
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">
                        {l.label}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                        {l.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </fieldset>
          </HelaiIsi>
        </Helai>

        <Helai>
          <HelaiKepala title="Palet warna" />
          <HelaiIsi className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => patchPalette(p.palette)}
                  className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors hover:border-foreground/25"
                >
                  <span className="flex -space-x-1" aria-hidden>
                    {[p.palette.primary, p.palette.secondary, p.palette.background].map(
                      (c) => (
                        <span
                          key={c}
                          className="size-3.5 rounded-full border border-black/10"
                          style={{ backgroundColor: c }}
                        />
                      ),
                    )}
                  </span>
                  {p.name}
                </button>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {PALETTE_FIELDS.map(([key, label]) => (
                <div key={key} className="space-y-1.5">
                  <Label htmlFor={`color-${key}`}>{label}</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id={`color-${key}`}
                      type="color"
                      value={theme.palette[key]}
                      onChange={(e) => patchPalette({ [key]: e.target.value })}
                      className="size-9 shrink-0 cursor-pointer rounded-md border bg-card p-0.5"
                    />
                    <Input
                      aria-label={`${label} (kode hex)`}
                      value={theme.palette[key]}
                      onChange={(e) => patchPalette({ [key]: e.target.value })}
                      className="font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </HelaiIsi>
        </Helai>

        <Helai>
          <HelaiKepala title="Font" />
          <HelaiIsi className="grid gap-5 sm:grid-cols-2">
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Judul</legend>
              {HEADING_FONTS.map((f) => (
                <label
                  key={f}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
                    theme.font.heading === f
                      ? "border-primary ring-1 ring-primary"
                      : "hover:border-foreground/25"
                  }`}
                >
                  <input
                    type="radio"
                    name="heading-font"
                    className="sr-only"
                    checked={theme.font.heading === f}
                    onChange={() =>
                      setTheme((t) => ({ ...t, font: { ...t.font, heading: f } }))
                    }
                  />
                  <span
                    className="truncate text-lg"
                    style={{ fontFamily: fontStack(f, "serif") }}
                  >
                    {f}
                  </span>
                </label>
              ))}
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Isi</legend>
              {BODY_FONTS.map((f) => (
                <label
                  key={f}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
                    theme.font.body === f
                      ? "border-primary ring-1 ring-primary"
                      : "hover:border-foreground/25"
                  }`}
                >
                  <input
                    type="radio"
                    name="body-font"
                    className="sr-only"
                    checked={theme.font.body === f}
                    onChange={() =>
                      setTheme((t) => ({ ...t, font: { ...t.font, body: f } }))
                    }
                  />
                  <span
                    className="truncate"
                    style={{ fontFamily: fontStack(f, "sans") }}
                  >
                    {f}
                  </span>
                </label>
              ))}
            </fieldset>
          </HelaiIsi>
        </Helai>

        <Helai>
          <HelaiKepala title="Musik latar" />
          <HelaiIsi className="space-y-4">
            {!canUseMusic && (
              <Alert>
                <AlertDescription>
                  Musik custom tersedia mulai paket <strong>Premium</strong>.
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="music-url">URL audio (mp3)</Label>
              <Input
                id="music-url"
                type="url"
                disabled={!canUseMusic}
                placeholder="https://.../lagu.mp3"
                value={theme.music?.url ?? ""}
                onChange={(e) =>
                  setTheme((t) => ({
                    ...t,
                    music: e.target.value
                      ? {
                          url: e.target.value,
                          autoplay: t.music?.autoplay ?? false,
                        }
                      : undefined,
                  }))
                }
              />
            </div>
            <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="autoplay">Coba putar otomatis</Label>
                <p className="text-xs text-muted-foreground">
                  Browser HP sering memblokirnya; tombol putar tetap tersedia
                  untuk tamu.
                </p>
              </div>
              <Switch
                id="autoplay"
                disabled={!canUseMusic || !theme.music?.url}
                checked={theme.music?.autoplay ?? false}
                onCheckedChange={(checked) =>
                  setTheme((t) =>
                    t.music ? { ...t, music: { ...t.music, autoplay: checked } } : t,
                  )
                }
              />
            </div>
          </HelaiIsi>
        </Helai>

        <Helai>
          <HelaiKepala title="Section undangan" />
          <HelaiIsi className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Matikan section yang tidak dipakai, atau ubah urutannya.
            </p>
            <ul className="divide-y rounded-xl border">
              {sections.map((s, i) => (
                <li
                  key={s.key}
                  className="flex items-center justify-between gap-3 px-3 py-2.5"
                >
                  <label className="flex min-w-0 cursor-pointer items-center gap-3">
                    <Checkbox
                      checked={s.enabled}
                      onCheckedChange={() => toggle(i)}
                      aria-label={`Tampilkan ${SECTION_LABEL[s.key] ?? s.key}`}
                    />
                    <span
                      className={`truncate text-sm ${
                        s.enabled ? "" : "text-muted-foreground line-through"
                      }`}
                    >
                      {SECTION_LABEL[s.key] ?? s.key}
                    </span>
                  </label>
                  <span className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label={`Naikkan ${SECTION_LABEL[s.key] ?? s.key}`}
                    >
                      <ChevronUp />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => move(i, 1)}
                      disabled={i === sections.length - 1}
                      aria-label={`Turunkan ${SECTION_LABEL[s.key] ?? s.key}`}
                    >
                      <ChevronDown />
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          </HelaiIsi>
        </Helai>
      </div>

      {/* PRATINJAU */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Smartphone className="size-3.5" aria-hidden />
          Pratinjau tampilan di HP tamu
        </div>
        <div className="h-[32rem] overflow-y-auto rounded-xl border bg-card shadow-sm lg:h-[calc(100vh-14rem)]">
          <InvitationView
            embedded
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

      <div className="sticky bottom-0 z-20 -mx-4 border-t border-border/70 bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:col-span-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Pratinjau sudah memakai tema baru; tekan Simpan untuk menerapkannya.
          </p>
          <Button onClick={save} disabled={pending} size="lg">
            {pending && (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            )}
            {pending ? "Menyimpan..." : "Simpan Tema"}
          </Button>
        </div>
      </div>
    </div>
  );
}
