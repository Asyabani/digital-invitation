import type { Metadata } from "next";
import { fontSans, fontDisplay } from "@/lib/fonts";
import "./globals.css";

const DIRECTION_CONTRACT = `<!--
THESIS: Undangan dirangkai seperti kain tenun — produk memasang lungsin
(struktur tetap), pemilik menenun pakannya (isi & warna). Menolak kisi kartu
identik yang jadi bawaan kategori SaaS, dan menolak krem + serif kontras tinggi
+ foil emas yang jadi bawaan industri undangan.
OWN-WORLD: nila #13233F dan nila pekat #0A1426 sebagai dasar, kapas #E6E2D8
sebagai bidang baca, mengkudu #9E2B1E sebagai satu-satunya benang merah yang
ditarik, emas #C08A2E hanya sebagai garis 1px. Bricolage Grotesque untuk judul,
Archivo untuk teks. Sudut 2px: kain punya tepi potong, bukan sudut membulat.
Tanpa kartu; isi duduk di pita pakan penuh lebar dengan kerapatan berganti,
dibatasi pinggiran benang emas.
STORY: pengunjung melihat kain terbentuk, paham produk ini merangkai undangan,
lalu mencobanya tanpa akun lewat contoh template.
FIRST VIEWPORT: dasar nila pekat bergaris lungsin; satu pita kapas penuh lebar
menenun diri dari kiri ke kanan berisi judul; aksi utama "Rangkai undangan"
berdiri di dalam pita itu, pratinjau undangan sungguhan menggantung di kanan
sebagai helai kedua.
SIGNATURE: satu momen terorkestrasi — kain ditenun dari kiri ke kanan saat
halaman dibuka (clip-path, ease-out eksponensial), dipakai ulang sebagai
penanda status terbit; prefers-reduced-motion menerima kain yang sudah jadi.
FORM: Tenun (kandidat 1 dari 7, dipilih pengguna di atas undian); seed c6356cc9.
FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, DESIGN.md, and every shipping raster carrying its
provenance.
-->`;

export const metadata: Metadata = {
  title: "Lungsin — undangan digital",
  description:
    "Rangkai undangan digital yang bisa dikustomisasi — nikah, aqiqah, ulang tahun, acara korporat. Coba gratis, bayar sekali saat siap dibagikan.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${fontSans.variable} ${fontDisplay.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/*
          Kontrak arah ditulis sebagai komentar HTML sungguhan, bukan komentar
          JSX: komentar JSX dibuang saat kompilasi, sehingga kontraknya hilang
          dari markup dan tidak bisa diaudit pada build produksi.
        */}
        <div hidden dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} />
        {children}
      </body>
    </html>
  );
}
