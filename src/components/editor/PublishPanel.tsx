"use client";

import { useState, useTransition } from "react";
import type { Package } from "@prisma/client";
import { PACKAGES, ACTIVE_MONTHS, getPackage } from "@/lib/packages";
import { createPayment, extendInvitation } from "@/lib/actions/payment";
import {
  unpublishInvitation,
  republishInvitation,
} from "@/lib/actions/invitation";

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

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
    <section className="space-y-4 rounded-xl border p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Status & Publikasi
          </h2>
          <p className="mt-1 text-sm">
            {status === "PUBLISHED" ? (
              <span className="font-medium text-green-700">Aktif</span>
            ) : status === "EXPIRED" ? (
              <span className="font-medium text-amber-700">
                Masa aktif berakhir
              </span>
            ) : (
              <span className="font-medium text-neutral-700">
                Draft — mode pratinjau
              </span>
            )}
            {info && <span className="text-neutral-500"> · Paket {info.name}</span>}
            {activeUntil && (
              <span className="text-neutral-500">
                {" "}
                · aktif s/d {formatDate(activeUntil)}
              </span>
            )}
          </p>
        </div>
        {isPaid && (
          <button
            onClick={toggleActive}
            disabled={pending || status === "EXPIRED"}
            className="rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {status === "PUBLISHED" ? "Jadikan Draft" : "Aktifkan Kembali"}
          </button>
        )}
      </div>

      {payResult === "success" && (
        <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
          Terima kasih! Pembayaran sedang kami konfirmasi. Undangan otomatis
          aktif begitu konfirmasi dari Xendit diterima (biasanya beberapa
          menit). Muat ulang halaman ini untuk melihat statusnya.
        </p>
      )}
      {payResult === "failed" && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          Pembayaran belum selesai atau dibatalkan. Anda bisa mencoba lagi.
        </p>
      )}

      {status === "PUBLISHED" && (
        <div className="rounded-lg border bg-green-50 p-3 text-sm">
          <p className="font-medium text-green-800">Tautan undangan</p>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-green-700 underline"
          >
            {publicUrl}
          </a>
        </div>
      )}

      {pendingInvoiceUrl && (
        <div className="rounded-lg border bg-amber-50 p-3 text-sm">
          <p className="font-medium text-amber-900">
            Menunggu konfirmasi pembayaran
          </p>
          <p className="text-amber-800">
            Tagihan sudah dibuat. Undangan terbit otomatis setelah pembayaran
            dikonfirmasi.
          </p>
          <a
            href={pendingInvoiceUrl}
            className="mt-1 inline-block font-medium text-amber-900 underline"
          >
            Lanjutkan pembayaran →
          </a>
        </div>
      )}

      <div className="space-y-3">
        <p className="text-sm text-neutral-600">
            {isPaid
              ? `Perpanjang masa aktif ${ACTIVE_MONTHS} bulan lagi:`
              : `Pilih paket untuk menerbitkan undangan (masa aktif ${ACTIVE_MONTHS} bulan):`}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {packages.map((p) => {
              const active = selected === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setSelected(p.key)}
                  className={`rounded-xl border p-4 text-left transition ${
                    active
                      ? "border-neutral-900 ring-1 ring-neutral-900"
                      : "hover:border-neutral-400"
                  }`}
                >
                  <p className="font-medium">{p.name}</p>
                  <p className="text-lg font-semibold">
                    {rupiah.format(p.price)}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {p.guestQuota === null
                      ? "Tamu tanpa batas"
                      : `s/d ${p.guestQuota} tamu`}
                  </p>
                  <ul className="mt-2 space-y-0.5 text-xs text-neutral-600">
                    {Object.entries(p.features)
                      .filter(([, on]) => on)
                      .map(([k]) => (
                        <li key={k}>✓ {FEATURE_LABEL[k] ?? k}</li>
                      ))}
                  </ul>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => pay(isPaid ? "extend" : "publish")}
            disabled={pending}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending
              ? "Menyiapkan pembayaran..."
              : isPaid
                ? "Perpanjang & Bayar"
                : "Bayar & Terbitkan"}
          </button>
          <p className="text-xs text-neutral-400">
            Pembayaran diproses oleh Xendit (QRIS, virtual account, e-wallet).
          </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </section>
  );
}
