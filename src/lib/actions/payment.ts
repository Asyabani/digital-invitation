"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import type { Package } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ownInvitation } from "@/lib/owner";
import { getPackage, packageAtLeast } from "@/lib/packages";
import {
  layoutSpec,
  minPackageForLayout,
} from "@/lib/invitation-layouts";
import { themeSchema } from "@/lib/validation/invitation";
import { createInvoice } from "@/lib/xendit";

/**
 * Fase 2 — membuat invoice Xendit untuk mem-publish / memperpanjang undangan.
 * Lihat docs/05 §3-4. Status PAID TIDAK pernah ditetapkan di sini; hanya
 * webhook terverifikasi yang boleh mengubahnya.
 */
type Mode = "publish" | "extend";

async function startPayment(
  invitationId: string,
  pkg: Package,
  mode: Mode,
): Promise<{ invoiceUrl: string }> {
  const inv = await ownInvitation(invitationId);
  const info = getPackage(pkg);
  if (!info) throw new Error("Paket tidak dikenal.");

  if (mode === "publish" && inv.status === "PUBLISHED") {
    throw new Error("Undangan sudah aktif. Gunakan perpanjangan.");
  }

  /*
    Tingkat harga melekat pada arketipe tata letak (docs/06 §4a). Pemeriksaan
    ini ada di server, bukan hanya di tombol: tanpa ini, siapa pun bisa
    memanggil action dengan paket Basic sambil memakai tata letak Eksklusif
    dan membayar sepertiga harganya.
  */
  const theme = themeSchema.safeParse(inv.themeConfig);
  const perlu = minPackageForLayout(
    theme.success ? theme.data.layout : undefined,
  );
  if (!packageAtLeast(pkg, perlu)) {
    const spec = layoutSpec(theme.success ? theme.data.layout : undefined);
    throw new Error(
      `Tata letak ${spec.label} tersedia mulai paket ${getPackage(perlu).name}. Pilih paket itu, atau ganti tata letak di tab Tema.`,
    );
  }

  // Idempoten dari sisi pemilik: kalau sudah ada invoice PENDING untuk paket
  // yang sama, arahkan ulang ke invoice itu daripada membuat tagihan ganda.
  const pending = await prisma.payment.findFirst({
    where: { invitationId: inv.id, status: "PENDING", package: pkg },
    orderBy: { createdAt: "desc" },
  });
  if (pending?.invoiceUrl) return { invoiceUrl: pending.invoiceUrl };

  const user = await prisma.user.findUnique({
    where: { id: inv.userId },
    select: { email: true },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  // id Payment dibuat lebih dulu agar bisa dipakai sebagai `external_id`
  // Xendit (rekonsiliasi dua arah: external_id ↔ Payment.id, invoice.id ↔ externalId).
  const paymentId = randomUUID();

  const invoice = await createInvoice({
    externalId: paymentId,
    amount: info.price,
    payerEmail: user?.email ?? "",
    description: `${mode === "extend" ? "Perpanjangan" : "Publikasi"} undangan "${inv.title}" — paket ${info.name}`,
    successRedirectUrl: `${appUrl}/dashboard/${inv.id}/edit?pay=success`,
    failureRedirectUrl: `${appUrl}/dashboard/${inv.id}/edit?pay=failed`,
  });

  await prisma.payment.create({
    data: {
      id: paymentId,
      invitationId: inv.id,
      userId: inv.userId,
      amount: info.price,
      package: pkg,
      externalId: invoice.id,
      invoiceUrl: invoice.invoice_url,
      status: "PENDING",
    },
  });

  revalidatePath(`/dashboard/${inv.id}/edit`);
  return { invoiceUrl: invoice.invoice_url };
}

/** Bayar untuk menerbitkan undangan yang masih DRAFT. */
export async function createPayment(invitationId: string, pkg: Package) {
  return startPayment(invitationId, pkg, "publish");
}

/** Bayar untuk memperpanjang masa aktif undangan. */
export async function extendInvitation(invitationId: string, pkg: Package) {
  return startPayment(invitationId, pkg, "extend");
}
