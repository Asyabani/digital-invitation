"use client";

import { useState, useTransition } from "react";
import type {
  Content,
  Theme,
  SectionsOrder,
} from "@/lib/validation/invitation";
import { InvitationView } from "@/components/invitation/InvitationView";
import { updateInvitationContent } from "@/lib/actions/invitation";

type Props = {
  invitationId: string;
  slug: string;
  initialContent: Content;
  theme: Theme;
  sections: SectionsOrder;
  /** Pratinjau memakai watermark sesuai paket yang dibeli (docs/05 §2). */
  showWatermark: boolean;
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-neutral-700">{label}</span>
      {children}
    </label>
  );
}

const inputCls = "w-full rounded-lg border px-3 py-2 text-sm";

export function ContentEditor({
  invitationId,
  slug,
  initialContent,
  theme,
  sections,
  showWatermark,
}: Props) {
  const [content, setContent] = useState<Content>(initialContent);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function patchSubject(patch: Partial<Content["subject"]>) {
    setContent((c) => ({ ...c, subject: { ...c.subject, ...patch } }));
  }
  function patchEvent(patch: Partial<Content["event"]>) {
    setContent((c) => ({ ...c, event: { ...c.event, ...patch } }));
  }

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        await updateInvitationContent(invitationId, content);
        setSavedAt(new Date().toLocaleTimeString("id-ID"));
      } catch {
        setError("Gagal menyimpan. Periksa isian (field wajib tidak boleh kosong).");
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* FORM */}
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={save}
            disabled={pending}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending ? "Menyimpan..." : "Simpan"}
          </button>
          {savedAt && (
            <span className="text-xs text-neutral-400">Tersimpan {savedAt}</span>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="space-y-4 rounded-xl border p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Mempelai / Subjek
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nama Pria">
              <input
                className={inputCls}
                value={content.subject.groomName ?? ""}
                onChange={(e) => patchSubject({ groomName: e.target.value })}
              />
            </Field>
            <Field label="Nama Wanita">
              <input
                className={inputCls}
                value={content.subject.brideName ?? ""}
                onChange={(e) => patchSubject({ brideName: e.target.value })}
              />
            </Field>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Acara
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tanggal">
              <input
                type="date"
                className={inputCls}
                value={content.event.date}
                onChange={(e) => patchEvent({ date: e.target.value })}
              />
            </Field>
            <Field label="Waktu">
              <input
                type="time"
                className={inputCls}
                value={content.event.time}
                onChange={(e) => patchEvent({ time: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Nama Tempat">
            <input
              className={inputCls}
              value={content.event.venueName}
              onChange={(e) => patchEvent({ venueName: e.target.value })}
            />
          </Field>
          <Field label="Alamat">
            <input
              className={inputCls}
              value={content.event.address}
              onChange={(e) => patchEvent({ address: e.target.value })}
            />
          </Field>
          <Field label="Link Google Maps (opsional)">
            <input
              className={inputCls}
              placeholder="https://maps.app.goo.gl/..."
              value={content.event.maps?.url ?? ""}
              onChange={(e) =>
                patchEvent({
                  maps: {
                    lat: content.event.maps?.lat ?? 0,
                    lng: content.event.maps?.lng ?? 0,
                    url: e.target.value || undefined,
                  },
                })
              }
            />
          </Field>
        </div>

        <div className="space-y-4 rounded-xl border p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Galeri
          </h2>
          <Field label="URL gambar (satu per baris)">
            <textarea
              rows={4}
              className={inputCls}
              value={content.gallery.join("\n")}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  gallery: e.target.value
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                }))
              }
              placeholder="https://.../foto1.jpg"
            />
          </Field>
          <p className="text-xs text-neutral-400">
            Fase berikutnya: unggah langsung via Cloudinary.
          </p>
        </div>

        <div className="space-y-4 rounded-xl border p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Kutipan Pembuka (opsional)
          </h2>
          <Field label="Teks">
            <textarea
              rows={2}
              className={inputCls}
              value={content.quote?.text ?? ""}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  quote: e.target.value
                    ? { text: e.target.value, source: c.quote?.source }
                    : undefined,
                }))
              }
            />
          </Field>
        </div>
      </div>

      {/* PREVIEW */}
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
