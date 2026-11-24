"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  addGuest,
  importGuests,
  updateGuest,
  deleteGuest,
  markGuestSent,
} from "@/lib/actions/guest";
import { parseGuestRows, IMPORT_MAX_ROWS } from "@/lib/validation/guest";
import { whatsappShareUrl } from "@/lib/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const [copied, setCopied] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(fn: () => Promise<unknown>, done?: () => void) {
    startTransition(async () => {
      try {
        await fn();
        done?.();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Terjadi kesalahan.");
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
      toast.error("Gagal menyalin link.", {
        description: "Salin manual dari teks link di bawah nama tamu.",
      });
    }
  }

  const parsedBulk = parseGuestRows(bulk);
  const terkirim = guests.filter((g) => g.sentAt).length;
  const locked = !canUsePersonalLinks || pending;

  return (
    <div className="space-y-6">
      {!canUsePersonalLinks && (
        <Alert>
          <AlertDescription>
            Link personal per tamu tersedia mulai paket <strong>Premium</strong>.
            Tingkatkan paket untuk menambah dan membagikan link tamu.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total tamu", value: guests.length },
          { label: "Sudah dikirim", value: terkirim },
          { label: "Belum dikirim", value: guests.length - terkirim },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="tabular text-2xl font-semibold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tambah tamu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="flex flex-wrap items-end gap-3"
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
                  toast.success("Tamu ditambahkan.");
                },
              );
            }}
          >
            <div className="min-w-[12rem] flex-1 space-y-1.5">
              <Label htmlFor="guest-name">Nama tamu</Label>
              <Input
                id="guest-name"
                value={name}
                disabled={locked}
                onChange={(e) => setName(e.target.value)}
                placeholder="Budi Santoso"
              />
            </div>
            <div className="w-44 space-y-1.5">
              <Label htmlFor="guest-category">Kategori</Label>
              <Input
                id="guest-category"
                value={category}
                disabled={locked}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Keluarga"
              />
            </div>
            <Button type="submit" disabled={locked || !name.trim()}>
              <Plus data-icon="inline-start" />
              Tambah
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowBulk((v) => !v)}
            >
              <Upload data-icon="inline-start" />
              Import massal
            </Button>
          </form>

          {showBulk && (
            <div className="space-y-2 rounded-xl border bg-muted/40 p-4">
              <Label htmlFor="bulk">Tempel daftar tamu</Label>
              <Textarea
                id="bulk"
                rows={6}
                className="bg-card"
                placeholder={
                  "Budi Santoso, Keluarga\nSiti Aminah, Teman Kantor\nPak Joko"
                }
                value={bulk}
                disabled={locked}
                onChange={(e) => setBulk(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Satu tamu per baris, kategori opsional setelah koma. Terbaca{" "}
                <strong>{parsedBulk.length}</strong> tamu (maks {IMPORT_MAX_ROWS}
                ).
              </p>
              <Button
                type="button"
                disabled={locked || parsedBulk.length === 0}
                onClick={() =>
                  run(
                    async () => {
                      const res = await importGuests(invitationId, parsedBulk);
                      toast.success(`${res.created} tamu berhasil diimpor.`);
                    },
                    () => setBulk(""),
                  )
                }
              >
                {pending && (
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                )}
                {pending ? "Mengimpor..." : `Impor ${parsedBulk.length} tamu`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {guests.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-14 text-center">
            <p className="font-medium">Belum ada tamu</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Tambahkan tamu agar namanya muncul otomatis di cover undangan, dan
              Anda bisa melacak siapa yang sudah dikirimi link.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="divide-y rounded-xl border bg-card">
          {guests.map((g) => (
            <li
              key={g.id}
              className="flex flex-wrap items-start justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0 space-y-1">
                <p className="flex flex-wrap items-center gap-2 font-medium">
                  {g.name}
                  {g.category && (
                    <Badge variant="outline">{g.category}</Badge>
                  )}
                  {g.sentAt && <Badge variant="success">Terkirim</Badge>}
                </p>
                <p className="break-all font-mono text-xs text-muted-foreground">
                  {linkFor(g)}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <Button
                  render={
                    <a
                      href={whatsappShareUrl(
                        `${shareText}\n\nKepada Yth. ${g.name}`,
                        linkFor(g),
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                  size="sm"
                >
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyLink(g)}
                >
                  {copied === g.id ? (
                    <>
                      <Check data-icon="inline-start" /> Tersalin
                    </>
                  ) : (
                    <>
                      <Copy data-icon="inline-start" /> Salin
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() => run(() => markGuestSent(g.id))}
                >
                  {g.sentAt ? "Batal tandai" : "Tandai terkirim"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() => {
                    const next = window.prompt("Ubah nama tamu", g.name);
                    if (next && next.trim() && next.trim() !== g.name) {
                      run(() => updateGuest(g.id, { name: next.trim() }));
                    }
                  }}
                >
                  Ubah
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={pending}
                        aria-label={`Hapus ${g.name}`}
                      >
                        <Trash2 className="text-destructive" />
                      </Button>
                    }
                  />
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus tamu ini?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Link personal <strong>{g.name}</strong> akan berhenti
                        bekerja. RSVP dan ucapan yang sudah masuk tetap
                        tersimpan, tapi tidak lagi tertaut ke tamu ini.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          run(() => deleteGuest(g.id), () =>
                            toast.success("Tamu dihapus."),
                          )
                        }
                      >
                        Hapus
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
