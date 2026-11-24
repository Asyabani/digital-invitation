import Link from "next/link";
import { PACKAGES, ACTIVE_MONTHS } from "@/lib/packages";

export const metadata = {
  title: "Harga — Undangan Digital",
  description:
    "Bayar sekali per acara. Pilih paket Basic, Premium, atau Exclusive.",
};

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const FEATURE_LABEL: Record<string, string> = {
  giftEnvelope: "Amplop digital",
  personalLinks: "Link personal per tamu",
  removeWatermark: "Tanpa watermark",
  customSlug: "Alamat kustom",
  customMusic: "Musik custom",
  unlimitedGallery: "Galeri tanpa batas",
};

const BASE_FEATURES = [
  "Template siap pakai",
  "Editor konten & pratinjau",
  "RSVP & buku tamu",
  "Galeri, lokasi (maps), countdown",
];

export default function HargaPage() {
  const packages = Object.values(PACKAGES);

  return (
    <main className="mx-auto max-w-5xl flex-1 px-6 py-12">
      <div className="mb-10 space-y-2 text-center">
        <Link href="/" className="text-sm text-neutral-500 hover:underline">
          ← Beranda
        </Link>
        <h1 className="text-2xl font-semibold">Harga</h1>
        <p className="text-neutral-600">
          Bayar <strong>sekali per acara</strong> — bukan langganan bulanan.
          Undangan aktif {ACTIVE_MONTHS} bulan sejak pembayaran, dan bisa
          diperpanjang kapan saja.
        </p>
      </div>

      <ul className="grid gap-5 sm:grid-cols-3">
        {packages.map((p) => (
          <li key={p.key} className="flex flex-col rounded-xl border p-6">
            <p className="font-medium">{p.name}</p>
            <p className="mt-1 text-2xl font-semibold">
              {rupiah.format(p.price)}
            </p>
            <p className="text-xs text-neutral-500">sekali bayar per acara</p>

            <ul className="mt-5 flex-1 space-y-1 text-sm text-neutral-700">
              <li className="font-medium">
                {p.guestQuota === null
                  ? "Tamu tanpa batas"
                  : `s/d ${p.guestQuota} tamu`}
              </li>
              {BASE_FEATURES.map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
              {Object.entries(p.features)
                .filter(([, on]) => on)
                .map(([k]) => (
                  <li key={k}>✓ {FEATURE_LABEL[k] ?? k}</li>
                ))}
            </ul>

            <Link
              href="/template"
              className="mt-6 rounded-lg bg-neutral-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-neutral-700"
            >
              Mulai dengan {p.name}
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-center text-sm text-neutral-500">
        Buat dan edit undangan gratis dulu. Pembayaran hanya diperlukan saat
        undangan siap dibagikan ke tamu.
      </p>
    </main>
  );
}
