"use client";

import { useState, useTransition } from "react";
import { Loader2, Smartphone } from "lucide-react";
import { toast } from "sonner";
import type {
  Content,
  Theme,
  SectionsOrder,
} from "@/lib/validation/invitation";
import { InvitationView } from "@/components/invitation/InvitationView";
import { updateInvitationContent } from "@/lib/actions/invitation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Helai, HelaiKepala, HelaiIsi } from "@/components/dashboard/Helai";

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
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function ContentEditor({
  invitationId,
  slug,
  initialContent,
  theme,
  sections,
  showWatermark,
}: Props) {
  const [content, setContent] = useState<Content>(initialContent);
  const [pending, startTransition] = useTransition();

  function patchSubject(patch: Partial<Content["subject"]>) {
    setContent((c) => ({ ...c, subject: { ...c.subject, ...patch } }));
  }
  function patchEvent(patch: Partial<Content["event"]>) {
    setContent((c) => ({ ...c, event: { ...c.event, ...patch } }));
  }

  function save() {
    startTransition(async () => {
      try {
        await updateInvitationContent(invitationId, content);
        toast.success("Perubahan tersimpan.");
      } catch {
        toast.error("Gagal menyimpan.", {
          description: "Periksa isian — field wajib tidak boleh kosong.",
        });
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
      <div className="space-y-5">
        <Helai>
          <HelaiKepala title="Mempelai / Subjek" />
          <HelaiIsi className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama pria" htmlFor="groomName">
              <Input
                id="groomName"
                value={content.subject.groomName ?? ""}
                onChange={(e) => patchSubject({ groomName: e.target.value })}
              />
            </Field>
            <Field label="Nama wanita" htmlFor="brideName">
              <Input
                id="brideName"
                value={content.subject.brideName ?? ""}
                onChange={(e) => patchSubject({ brideName: e.target.value })}
              />
            </Field>
          </HelaiIsi>
        </Helai>

        <Helai>
          <HelaiKepala title="Acara" />
          <HelaiIsi className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tanggal" htmlFor="date">
                <Input
                  id="date"
                  type="date"
                  value={content.event.date}
                  onChange={(e) => patchEvent({ date: e.target.value })}
                />
              </Field>
              <Field label="Waktu" htmlFor="time">
                <Input
                  id="time"
                  type="time"
                  value={content.event.time}
                  onChange={(e) => patchEvent({ time: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Nama tempat" htmlFor="venueName">
              <Input
                id="venueName"
                value={content.event.venueName}
                onChange={(e) => patchEvent({ venueName: e.target.value })}
              />
            </Field>
            <Field label="Alamat" htmlFor="address">
              <Input
                id="address"
                value={content.event.address}
                onChange={(e) => patchEvent({ address: e.target.value })}
              />
            </Field>
            <Field
              label="Link Google Maps"
              htmlFor="maps"
              hint="Opsional. Tempel tautan berbagi dari aplikasi Maps."
            >
              <Input
                id="maps"
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
          </HelaiIsi>
        </Helai>

        <Helai>
          <HelaiKepala title="Galeri" />
          <HelaiIsi>
            <Field
              label="URL gambar"
              htmlFor="gallery"
              hint="Satu tautan per baris. Unggah langsung via Cloudinary menyusul."
            >
              <Textarea
                id="gallery"
                rows={4}
                placeholder="https://.../foto1.jpg"
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
              />
            </Field>
          </HelaiIsi>
        </Helai>

        <Helai>
          <HelaiKepala title="Kutipan pembuka" />
          <HelaiIsi>
            <Field label="Teks" htmlFor="quote" hint="Opsional.">
              <Textarea
                id="quote"
                rows={2}
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

      {/* Bilah simpan — selalu terjangkau tanpa menggulir ke atas. */}
      <div className="sticky bottom-0 z-20 -mx-4 border-t border-border/70 bg-background/90 px-4 py-3 backdrop-blur lg:col-span-2 sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Perubahan baru tersimpan setelah ditekan Simpan.
          </p>
          <Button onClick={save} disabled={pending} size="lg">
            {pending && (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            )}
            {pending ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>
    </div>
  );
}
