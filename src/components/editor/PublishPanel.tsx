"use client";

import { useState, useTransition } from "react";
import type { Package } from "@prisma/client";
import {
  PACKAGES,
  ACTIVE_MONTHS,
  getPackage,
  packageAtLeast,
} from "@/lib/packages";
import { createPayment, extendInvitation } from "@/lib/actions/payment";
import {
  unpublishInvitation,
  republishInvitation,
} from "@/lib/actions/invitation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Helai, HelaiKepala, HelaiIsi } from "@/components/dashboard/Helai";

type Props = {
  invitationId: string;
  status: "DRAFT" | "PUBLISHED" | "EXPIRED";
  package: Package | null;
  activeUntil: string | null;
  publicUrl: string;
  pendingInvoiceUrl: string | null;
  pendingPackage: Package | null;
  payResult: "success" | "failed" | null;
  /** Paket paling ringkas yang boleh menerbitkan tata letak yang dipakai. */
  minPackage: Package;
  /** Nama tata letaknya, untuk menjelaskan kenapa sebuah paket terkunci. */
  layoutLabel: string;
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

const FITUR_LABEL: Record<string, string> = {
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
  minPackage,
  layoutLabel,
}: Props) {
  const paket = Object.values(PACKAGES);
  // Pilihan awal tidak boleh jatuh ke paket yang terkunci tata letaknya.
  const [selected, setSelected] = useState<Package>(
    pendingPackage ?? pkg ?? minPackage,
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const sudahBayar = pkg !== null;
  const info = pkg ? getPackage(pkg) : null;

  function bayar(mode: "publish" | "extend") {
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

  function ubahStatus() {
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
    <Helai>
      <HelaiKepala
        title={
          <span className="flex flex-wrap items-center gap-2">
            Status undangan
            {status === "PUBLISHED" ? (
              <Badge variant="success">Aktif</Badge>
            ) : status === "EXPIRED" ? (
              <Badge variant="warning">Masa aktif berakhir</Badge>
            ) : (
              <Badge variant="outline">Draft</Badge>
            )}
          </span>
        }
        description={
          <>
            {info ? `Paket ${info.name}` : "Belum dibayar — mode pratinjau"}
            {activeUntil &&
              ` · aktif sampai ${tanggal.format(new Date(activeUntil))}`}
          </>
        }
        action={
          sudahBayar ? (
            <Button
              onClick={ubahStatus}
              disabled={pending || status === "EXPIRED"}
              variant="outline"
              size="sm"
            >
              {status === "PUBLISHED" ? "Jadikan draft" : "Aktifkan kembali"}
            </Button>
          ) : undefined
        }
      />

      <HelaiIsi className="space-y-6">
        {payResult === "success" && (
          <Alert>
            <AlertTitle>Pembayaran sedang dikonfirmasi</AlertTitle>
            <AlertDescription>
              Undangan terbit otomatis begitu konfirmasi dari Xendit tiba,
              biasanya beberapa menit. Muat ulang halaman ini untuk melihat
              statusnya.
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

        {/*
          Momen tenun yang sama dengan hero dipakai ulang di sini sebagai
          penanda status terbit: begitu undangan aktif, pitanya tertenun dari
          kiri ke kanan. Inilah paruh kedua janji SIGNATURE di kontrak arah.
          `prefers-reduced-motion` menerima pita yang sudah jadi.
        */}
        {status === "PUBLISHED" && (
          <div className="menenun border-l-2 border-success py-2 pl-4">
            <p className="text-sm font-medium text-success-foreground">
              Undangan sudah tertenun — tautannya siap dibagikan
            </p>
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-sm underline"
            >
              {publicUrl}
            </a>
            <span
              aria-hidden
              className="menenun menenun-2 mt-2 block h-[3px] w-full"
              style={{
                background:
                  "repeating-linear-gradient(to right, var(--success) 0 6px, transparent 6px 9px)",
              }}
            />
          </div>
        )}

        {pendingInvoiceUrl && (
          <Alert>
            <AlertTitle>Menunggu konfirmasi pembayaran</AlertTitle>
            <AlertDescription>
              Tagihan sudah dibuat.{" "}
              <a
                href={pendingInvoiceUrl}
                className="font-medium underline underline-offset-4"
              >
                Lanjutkan pembayaran
              </a>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {sudahBayar
              ? `Perpanjang masa aktif ${ACTIVE_MONTHS} bulan lagi:`
              : `Pilih paket untuk menerbitkan. Sekali bayar, aktif ${ACTIVE_MONTHS} bulan.`}
          </p>

          {minPackage !== "BASIC" && (
            <p className="text-sm text-muted-foreground">
              Tata letak <span className="text-foreground">{layoutLabel}</span>{" "}
              termasuk tingkat{" "}
              <span className="text-foreground">
                {getPackage(minPackage).name}
              </span>
              . Untuk memakai paket yang lebih ringkas, ganti tata letak di tab
              Tema.
            </p>
          )}

          {/* Tiga pita paket; yang dipilih ditarik benang mengkudu di tepinya. */}
          <div
            role="radiogroup"
            aria-label="Paket undangan"
            className="divide-y divide-border/70 border-y border-border/70"
          >
            {paket.map((p) => {
              const aktif = selected === p.key;
              // Paket yang lebih ringkas dari syarat tata letak dimatikan,
              // dengan alasannya tertulis di barisnya sendiri.
              const terkunci = !packageAtLeast(p.key, minPackage);
              return (
                <button
                  key={p.key}
                  type="button"
                  role="radio"
                  aria-checked={aktif}
                  disabled={terkunci}
                  onClick={() => setSelected(p.key)}
                  className={`flex w-full flex-wrap items-baseline gap-x-5 gap-y-1 border-l-2 py-4 pl-4 pr-2 text-left transition-colors ${
                    terkunci
                      ? "cursor-not-allowed border-l-transparent opacity-45"
                      : aktif
                        ? "border-l-mengkudu bg-accent/50"
                        : "border-l-transparent hover:bg-accent/30"
                  }`}
                >
                  <span className="font-display w-24 text-lg font-medium">
                    {p.name}
                  </span>
                  <span className="tabular w-32 text-lg font-semibold">
                    {rupiah.format(p.price)}
                  </span>
                  <span className="w-36 text-sm text-muted-foreground">
                    {p.guestQuota === null
                      ? "Tamu tanpa batas"
                      : `s/d ${p.guestQuota} tamu`}
                  </span>
                  <span className="flex-1 text-sm text-muted-foreground">
                    {terkunci
                      ? `Tidak termasuk tata letak ${layoutLabel}`
                      : Object.entries(p.features)
                          .filter(([, on]) => on)
                          .map(([k]) => FITUR_LABEL[k] ?? k)
                          .join(" · ") || "Fitur dasar"}
                  </span>
                </button>
              );
            })}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <Button
              onClick={() => bayar(sudahBayar ? "extend" : "publish")}
              disabled={pending}
              size="lg"
            >
              {pending
                ? "Menyiapkan pembayaran..."
                : sudahBayar
                  ? "Perpanjang & bayar"
                  : "Bayar & terbitkan"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Diproses Xendit — QRIS, virtual account, e-wallet.
            </p>
          </div>
        </div>
      </HelaiIsi>
    </Helai>
  );
}
