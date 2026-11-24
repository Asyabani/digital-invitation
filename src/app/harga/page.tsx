import Link from "next/link";
import { Check } from "lucide-react";
import { PACKAGES, ACTIVE_MONTHS } from "@/lib/packages";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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

/** Paket yang disorot sebagai pilihan paling masuk akal untuk kebanyakan acara. */
const RECOMMENDED = "PREMIUM";

export default function HargaPage() {
  const packages = Object.values(PACKAGES);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-xl text-center">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Beranda
        </Link>
        <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Harga
        </h1>
        <p className="mt-3 text-pretty text-muted-foreground">
          Bayar <strong className="text-foreground">sekali per acara</strong> —
          bukan langganan bulanan. Undangan aktif {ACTIVE_MONTHS} bulan sejak
          pembayaran dan bisa diperpanjang kapan saja.
        </p>
      </div>

      <ul className="mt-12 grid gap-5 lg:grid-cols-3">
        {packages.map((p) => {
          const recommended = p.key === RECOMMENDED;
          return (
            <li key={p.key}>
              <Card
                className={`flex h-full flex-col ${
                  recommended ? "border-primary ring-1 ring-primary" : ""
                }`}
              >
                <CardContent className="flex flex-1 flex-col p-6">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-display text-lg font-semibold">
                      {p.name}
                    </p>
                    {recommended && <Badge>Paling sering dipilih</Badge>}
                  </div>
                  <p className="tabular mt-2 text-3xl font-semibold">
                    {rupiah.format(p.price)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    sekali bayar per acara
                  </p>

                  <p className="mt-6 text-sm font-medium">
                    {p.guestQuota === null
                      ? "Tamu tanpa batas"
                      : `Sampai ${p.guestQuota} tamu`}
                  </p>
                  <ul className="mt-3 flex-1 space-y-2 text-sm text-muted-foreground">
                    {[
                      ...BASE_FEATURES,
                      ...Object.entries(p.features)
                        .filter(([, on]) => on)
                        .map(([k]) => FEATURE_LABEL[k] ?? k),
                    ].map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check
                          className="mt-0.5 size-4 shrink-0 text-primary"
                          aria-hidden
                        />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    render={<Link href="/template" />}
                    variant={recommended ? "default" : "outline"}
                    size="lg"
                    className="mt-7 w-full"
                  >
                    Mulai dengan {p.name}
                  </Button>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        Buat dan edit undangan gratis dulu. Pembayaran hanya diperlukan saat
        undangan siap dibagikan ke tamu.
      </p>
    </main>
  );
}
