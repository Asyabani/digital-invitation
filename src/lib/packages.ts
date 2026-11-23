import type { Package } from "@prisma/client";

// Satu sumber kebenaran untuk paket, harga, kuota tamu, dan fitur.
// Lihat docs/05-pembayaran-xendit.md §2. Harga masih draft.

export const ACTIVE_MONTHS = 6;

export type PackageInfo = {
  key: Package;
  name: string;
  price: number; // rupiah
  guestQuota: number | null; // null = unlimited
  features: {
    giftEnvelope: boolean;
    personalLinks: boolean;
    removeWatermark: boolean;
    customSlug: boolean;
    customMusic: boolean;
    unlimitedGallery: boolean;
  };
};

export const PACKAGES: Record<Package, PackageInfo> = {
  BASIC: {
    key: "BASIC",
    name: "Basic",
    price: 99_000,
    guestQuota: 150,
    features: {
      giftEnvelope: false,
      personalLinks: false,
      removeWatermark: false,
      customSlug: false,
      customMusic: false,
      unlimitedGallery: false,
    },
  },
  PREMIUM: {
    key: "PREMIUM",
    name: "Premium",
    price: 199_000,
    guestQuota: 500,
    features: {
      giftEnvelope: true,
      personalLinks: true,
      removeWatermark: true,
      customSlug: false,
      customMusic: true,
      unlimitedGallery: false,
    },
  },
  EXCLUSIVE: {
    key: "EXCLUSIVE",
    name: "Exclusive",
    price: 349_000,
    guestQuota: null,
    features: {
      giftEnvelope: true,
      personalLinks: true,
      removeWatermark: true,
      customSlug: true,
      customMusic: true,
      unlimitedGallery: true,
    },
  },
};

export function getPackage(pkg: Package): PackageInfo {
  return PACKAGES[pkg];
}
