"use client";

import { useState, useTransition } from "react";
import { Check, ExternalLink, Loader2 } from "lucide-react";
import type { Package } from "@prisma/client";
import { PACKAGES, ACTIVE_MONTHS, getPackage } from "@/lib/packages";
import { createPayment, extendInvitation } from "@/lib/actions/payment";
import {
  unpublishInvitation,
  republishInvitation,
} from "@/lib/actions/invitation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  invitationId: string;
  status: "DRAFT" | "PUBLISHED" | "EXPIRED";
  package: Package | null;
  activeUntil: string | null;
  publicUrl: string;
  pendingInvoiceUrl: string | null;
  pendingPackage: Package | null;
  payResult: "success" | "failed" | null;
};

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const tanggal = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const FEATURE_LABEL: Record<string, string> = {
  giftEnvelope: "Amplop digital",
  personalLinks: "Link personal per tamu",
  removeWatermark: "Tanpa watermark",
  customSlug: "Alamat kustom",
  customMusic: "Musik custom",
  unlimitedGallery: "Galeri tanpa batas",
};

export function PublishPanel({
  invitationId,
  status,
  package: pkg,
  activeUntil,
  publicUrl,
  pendingInvoiceUrl,
  pendingPackage,
  payResult,
}: Props) {
  const packages = Object.values(PACKAGES);
  const [selected, setSelected] = useState<Package>(
    pendingPackage ?? pkg ?? "BASIC",
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isPaid = pkg !== null;
  const info = pkg ? getPackage(pkg) : null;

  function pay(mode: "publish" | "extend") {
    setError(null);
    startTransition(async () => {
      try {
        const res =
          mode === "extend"
            ? await extendInvitation(invitationId, selected)
            : await createPayment(invitationId, selected);
        window.location.href = res.invoiceUrl;
      } catch {
        setError(
          "Gagal membuat tagihan pembayaran. Coba lagi beberapa saat lagi.",
        );
      }
    });
  }

  function toggleActive() {
    setError(null);
    startTransition(async () => {
      try {
        if (status === "PUBLISHED") await unpublishInvitation(invitationId);
        else await republishInvitation(invitationId);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Gagal mengubah status terbit.",
        );
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          Status undangan
          {status === "PUBLISHED" ? (
            <Badge variant="success">Aktif</Badge>
          ) : status === "EXPIRED" ? (
            <Badge variant="warning">Masa aktif berakhir</Badge>
          ) : (
            <Badge variant="outline">Draft — mode pratinjau</Badge>
          )}
        </CardTitle>
        <CardDescription>
          {info ? `Paket ${info.name}` : "Belum dibayar"}
          {activeUntil && ` · aktif sampai ${tanggal.format(new Date(activeUntil))}`}
        </CardDescription>
        {isPaid && (
          <div data-slot="card-action">
            <Button
              onClick={toggleActive}
              disabled={pending || status === "EXPIRED"}
              variant="outline"
              size="sm"
            >
              {status === "PUBLISHED" ? "Jadikan Draft" : "Aktifkan Kembali"}
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-5">
        {payResult === "success" && (
          <Alert>
            <AlertTitle>Pembayaran sedang dikonfirmasi</AlertTitle>
            <AlertDescription>
              Terima kasih! Undangan otomatis aktif begitu konfirmasi dari
              Xendit diterima — biasanya beberapa menit. Muat ulang halaman ini
              untuk melihat statusnya.
            </AlertDescription>
          </Alert>
        )}
        {payResult === "failed" && (
          <Alert variant="destructive">
            <AlertTitle>Pembayaran belum selesai</AlertTitle>
            <AlertDescription>
              Tagihan dibatalkan atau kedaluwarsa. Anda bisa mencoba lagi di
              bawah.
            </AlertDescription>
          </Alert>
        )}

        {status === "PUBLISHED" && (
          <div className="rounded-xl border border-success/30 bg-success-surface p-4">
            <p className="text-sm font-medium text-success-foreground">
              Tautan undangan Anda
            </p>
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1.5 break-all font-mono text-sm text-success-foreground underline"
            >
              {publicUrl}
              <ExternalLink className="size-3.5 shrink-0" aria-hidden />
            </a>
          </div>
        )}

        {pendingInvoiceUrl && (
          <Alert>
            <AlertTitle>Menunggu konfirmasi pembayaran</AlertTitle>
            <AlertDescription>
              Tagihan sudah dibuat. Undangan terbit otomatis setelah pembayaran
              dikonfirmasi.{" "}
              <a
                href={pendingInvoiceUrl}
                className="font-medium underline underline-offset-4"
              >
                Lanjutkan pembayaran
              </a>
            </AlertDescription>
          </Alert>
        )}

        <Separator />

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {isPaid
              ? `Perpanjang masa aktif ${ACTIVE_MONTHS} bulan lagi:`
              : `Pilih paket untuk menerbitkan undangan. Sekali bayar, aktif ${ACTIVE_MONTHS} bulan.`}
          </p>

          <div
            role="radiogroup"
            aria-label="Paket undangan"
            className="grid gap-3 sm:grid-cols-3"
          >
            {packages.map((p) => {
              const active = selected === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSelected(p.key)}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    active
                      ? "border-primary bg-accent/60 ring-1 ring-primary"
                      : "hover:border-foreground/25"
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-medium">{p.name}</span>
                    {active && (
                      <Check className="size-4 text-primary" aria-hidden />
                    )}
                  </span>
                  <span className="tabular mt-1 block text-lg font-semibold">
                    {rupiah.format(p.price)}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {p.guestQuota === null
                      ? "Tamu tanpa batas"
                      : `s/d ${p.guestQuota} tamu`}
                  </span>
                  <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                    {Object.entries(p.features)
                      .filter(([, on]) => on)
                      .map(([k]) => (
                        <li key={k} className="flex items-start gap-1.5">
                          <Check
                            className="mt-0.5 size-3 shrink-0 text-primary"
                            aria-hidden
                          />
                          {FEATURE_LABEL[k] ?? k}
                        </li>
                      ))}
                  </ul>
                </button>
              );
            })}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => pay(isPaid ? "extend" : "publish")}
              disabled={pending}
              size="lg"
            >
              {pending && (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              )}
              {pending
                ? "Menyiapkan pembayaran..."
                : isPaid
                  ? "Perpanjang & Bayar"
                  : "Bayar & Terbitkan"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Diproses Xendit — QRIS, virtual account, e-wallet.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
