import Link from "next/link";
import type { Package } from "@prisma/client";
import { PACKAGES, ACTIVE_MONTHS } from "@/lib/packages";
import { LAYOUTS, LAYOUT_KEYS } from "@/lib/invitation-layouts";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Harga — Lungsin",
  description:
    "Bayar sekali per acara, bukan langganan. Paket Basic, Premium, dan Exclusive.",
};

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const FITUR_LABEL: Record<string, string> = {
  giftEnvelope: "Amplop digital",
  personalLinks: "Link personal per tamu",
  removeWatermark: "Tanpa watermark",
  customSlug: "Alamat kustom",
  customMusic: "Musik custom",
  unlimitedGallery: "Galeri tanpa batas",
};

/** Urutan baris perbandingan — tetap, supaya kolom bisa dibaca menurun. */
const BARIS_FITUR = [
  "personalLinks",
  "removeWatermark",
  "giftEnvelope",
  "customMusic",
  "unlimitedGallery",
  "customSlug",
] as const;

const DASAR = [
  "Editor isi & pratinjau langsung",
  "RSVP & buku tamu bermoderasi",
  "Galeri, peta, hitung mundur, tambah ke kalender",
  "Foto sampul & layar “Buka Undangan”",
  "Backsound pilihan Lungsin",
];

/**
 * Tata letak yang termasuk tiap paket.
 *
 * Harga melekat pada gaya halaman, bukan pada tiap template: ini yang
 * benar-benar berbeda antar tingkat. Daftar di sini harus sama dengan
 * `minPackage` di `src/lib/invitation-layouts.ts`; kalau meleset, pembeli
 * membaca janji yang tidak ditepati saat checkout.
 */
function layoutUntuk(pkg: Package): string[] {
  return LAYOUT_KEYS.filter((k) => LAYOUTS[k].minPackage === pkg).map(
    (k) => LAYOUTS[k].label,
  );
}

export default function HargaPage() {
  const paket = Object.values(PACKAGES);

  return (
    <>
      <section className="pakan lungsin py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <h1 className="font-display max-w-[16ch] text-4xl font-semibold leading-[1.02] sm:text-6xl">
            Satu acara, satu kali bayar.
          </h1>
          <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-muted-foreground">
            Bukan langganan bulanan. Undangan aktif {ACTIVE_MONTHS} bulan sejak
            pembayaran dan bisa diperpanjang kapan saja. Merangkai, menyunting,
            dan melihat pratinjaunya tetap gratis sampai Anda siap membagikan.
          </p>
        </div>
      </section>

      {/* Tiga helai, kerapatan naik dari kiri ke kanan. */}
      <section className="pakan pinggiran-atas bg-nila-pekat py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <ul className="grid gap-px overflow-hidden border border-border/70 bg-border/70 lg:grid-cols-3">
            {paket.map((p) => (
              <li key={p.key} className="flex flex-col bg-background">
                <div className="border-b border-border/70 p-7 sm:p-8">
                  <p className="font-display text-2xl font-medium">{p.name}</p>
                  <p className="tabular mt-2 text-4xl font-semibold">
                    {rupiah.format(p.price)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    sekali bayar · aktif {ACTIVE_MONTHS} bulan
                  </p>
                  <p className="mt-5 font-medium">
                    {p.guestQuota === null
                      ? "Tamu tanpa batas"
                      : `Sampai ${p.guestQuota} tamu`}
                  </p>
                  {/*
                    Yang membedakan harga adalah gaya halamannya, jadi itu
                    yang disebut paling awal — bukan daftar fitur yang
                    sama-sama sulit dibandingkan antar paket.
                  */}
                  <p className="mt-1 text-sm text-muted-foreground">
                    Tata letak {layoutUntuk(p.key).join(", ")}
                  </p>
                </div>

                <dl className="flex-1 p-7 sm:p-8">
                  <dt className="text-xs uppercase tracking-widest text-muted-foreground">
                    Sudah termasuk
                  </dt>
                  <dd className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                    {DASAR.map((d) => (
                      <p key={d}>{d}</p>
                    ))}
                  </dd>

                  {/*
                    Hanya yang termasuk yang ditulis sebagai daftar; yang belum
                    termasuk diringkas satu baris. Menampilkan semuanya dalam
                    satu daftar abu-abu membuat paket Basic terbaca seperti
                    blok yang dimatikan, bukan paket yang memang lebih ringkas.
                  */}
                  {(() => {
                    const termasuk = BARIS_FITUR.filter((k) => p.features[k]);
                    const belum = BARIS_FITUR.filter((k) => !p.features[k]);
                    return (
                      <>
                        <dt className="mt-7 text-xs uppercase tracking-widest text-muted-foreground">
                          Fitur paket
                        </dt>
                        <dd className="mt-3">
                          {termasuk.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              Tidak ada tambahan — paket ini hanya fitur dasar
                              di atas.
                            </p>
                          ) : (
                            <ul>
                              {termasuk.map((k) => (
                                <li
                                  key={k}
                                  className="flex items-center gap-3 border-b border-border/50 py-2 text-sm last:border-b-0"
                                >
                                  <span
                                    aria-hidden
                                    className="h-[3px] w-7 shrink-0"
                                    style={{
                                      background:
                                        "repeating-linear-gradient(to right, var(--mengkudu) 0 5px, transparent 5px 7px)",
                                    }}
                                  />
                                  <span className="font-medium">
                                    {FITUR_LABEL[k]}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}

                          {belum.length > 0 && (
                            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                              <span className="text-xs uppercase tracking-widest">
                                Belum termasuk
                              </span>
                              <br />
                              {belum.map((k) => FITUR_LABEL[k]).join(", ")}.
                            </p>
                          )}
                        </dd>
                      </>
                    );
                  })()}
                </dl>

                <div className="border-t border-border/70 p-7 sm:p-8">
                  <Button
                    render={<Link href="/template" />}
                    size="lg"
                    variant={p.key === "PREMIUM" ? "default" : "outline"}
                    className="w-full"
                  >
                    Mulai dengan {p.name}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="pakan lungsin py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 md:grid-cols-2 md:gap-16">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">
            Kalau masa aktifnya habis
          </h2>
          <div className="space-y-4 leading-relaxed text-muted-foreground">
            <p>
              Undangan tidak hilang. Halamannya berganti menjadi pesan bahwa
              acaranya sudah lewat, dan seluruh data RSVP, ucapan, serta
              konfirmasi amplop tetap bisa Anda buka di dashboard.
            </p>
            <p>
              Perpanjangan dihitung dari sisa masa aktif yang masih ada, jadi
              memperpanjang lebih awal tidak membuat sisa harinya hangus.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
