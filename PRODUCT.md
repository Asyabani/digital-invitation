# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Pembeli utama: pasangan muda urban kelas menengah-atas** di kota besar
Indonesia (Jakarta, Bandung, Surabaya). Melek desain, terbiasa membandingkan
dengan undangan buatan vendor premium, dan menilai produk dari kerapian
detailnya. Biasanya salah satu dari pasangan yang mengerjakan undangan, di
sela-sela persiapan pernikahan yang sudah padat — sering larut malam, sering
dari laptop, kadang dari HP.

**Pengguna kedua: tamu undangan.** Tidak punya akun dan tidak akan membuat
akun. Hampir selalu membuka undangan dari tautan WhatsApp, di HP, sambil
mengerjakan hal lain. Rentang usianya lebar — dari rekan kerja seumuran sampai
orang tua dan sesepuh keluarga.

Kategori acara lain (aqiqah, syukuran, ulang tahun, korporat) didukung, tetapi
pernikahan adalah acara yang menentukan arah produk.

## Product Purpose

Mengganti undangan cetak — yang mahal, lambat, dan tidak bisa diubah setelah
dicetak — dengan satu halaman web yang bisa dibagikan lewat WhatsApp, lengkap
dengan RSVP, buku tamu, galeri, lokasi, hitung mundur, dan amplop digital.

Berhasil bila: pemilik acara berani mengirimkan tautannya ke keluarga besar
tanpa merasa perlu minta maaf atas tampilannya, dan tamu bisa membalas
undangan tanpa hambatan.

## Positioning

Dua hal yang membedakan:

1. **Bayar sekali per acara, bukan langganan.** Pernikahan terjadi sekali;
   menagih bulanan untuk sesuatu yang dipakai sekali terasa salah. "Masa aktif"
   6 bulan menggantikan langganan, perpanjangan = pembayaran baru.
2. **Bisa dicoba sepenuhnya sebelum bayar.** Pemilik membuat, mengisi, mengatur
   tema, dan melihat hasil jadinya dalam mode trial berwatermark. Pembayaran
   baru diminta saat undangan benar-benar siap dibagikan.

## Operating Context

- **Jalur masuk tamu hampir selalu WhatsApp.** Pratinjau tautan di WhatsApp
  adalah kesan pertama produk ini, bukan halaman marketing.
- **Undangan dibuka di HP**, sering dengan koneksi tidak ideal. Kecepatan muat
  halaman publik adalah syarat, bukan optimasi.
- **Link personal per tamu** (`?to=`) membuat nama tamu muncul otomatis — ini
  menggantikan kebiasaan menulis nama tamu di undangan cetak.
- Pemilik mengelola undangan dari dashboard berlogin; tamu tidak pernah melihat
  dashboard.
- Amplop digital adalah praktik yang sudah umum di Indonesia; yang sensitif
  adalah **nominalnya**, bukan keberadaannya.

## Capabilities and Constraints

Sudah berjalan (Fase 0–3 selesai, lihat `docs/09-roadmap.md`):

- Galeri template → editor konten dengan pratinjau langsung → halaman publik
  `/u/[slug]` → RSVP → buku tamu dengan moderasi.
- Editor tema: palet, font, musik latar, nyalakan/matikan dan urutkan section.
- Kelola tamu + link personal + bagikan WhatsApp + impor massal.
- Amplop digital, rekap dashboard, tambah ke kalender.
- Monetisasi via Xendit: paket Basic/Premium/Exclusive, webhook, masa aktif
  6 bulan, watermark per paket, cron kedaluwarsa.

Batasan yang mengikat desain:

- **Halaman undangan tidak punya satu identitas visual.** Warna dan fontnya
  milik tiap pemilik lewat `themeConfig`. Desain di sana adalah *kerangka* —
  ritme, hierarki, tipografi — bukan palet tetap.
- **Dua data yang tidak boleh bocor ke publik:** daftar tamu lengkap dan
  nominal amplop.
- Kustomisasi dibatasi Level 2 (template + isi + tema + urutan section).
  Kanvas bebas adalah non-goal.
- Next.js 16 App Router + Cache Components, Prisma 7, Auth.js, Xendit, Vercel.
- Nama tabel, kolom, rute, dan Server Action sudah final di `docs/03` & `docs/04`.

**Belum diputuskan / belum ada:**

- **Nama produk.** "Undangan Digital" adalah penamaan sementara yang
  deskriptif; pengguna meminta usulan nama baru.
- **Harga belum final.** Basic 99rb / Premium 199rb / Exclusive 349rb masih
  draft (`docs/05` §2). Perlu dicatat: rentang ini tergolong terjangkau,
  sementara sasarannya kelas menengah-atas — ketegangan ini belum diselesaikan
  dan jangan dianggap sudah final.

## Brand Commitments

Belum ada. Tidak ada logo, tidak ada palet merek, tidak ada suara merek yang
ditetapkan. Nama sekarang pun sementara.

Satu-satunya yang mengikat: **dokumen, antarmuka, dan copywriting berbahasa
Indonesia**; identifier kode/DB/API berbahasa Inggris.

## Evidence on Hand

- **Tidak ada aset gambar sama sekali.** `public/` hanya berisi SVG bawaan
  Next.js. `prisma/seed.ts` menunjuk `previewImage` ke `/templates/*.jpg` yang
  file-nya tidak pernah ada.
- **Tidak ada pelanggan, testimoni, angka, atau studi kasus.** Produk belum
  pernah dipakai siapa pun dan belum pernah di-deploy. Jangan pernah mengarang
  jumlah pengguna, testimoni, logo klien, atau rating.
- Foto stok (Unsplash/Pexels) boleh dipakai sebagai penempatan sementara, dan
  harus ditandai jelas mana yang wajib diganti sebelum rilis.
- Tiga template contoh ada di `prisma/seed.ts` (klasik-elegan, floral-lembut,
  ceria-aqiqah) — isinya placeholder, bukan desain final.

## Product Principles

1. **Tamu dulu, pemilik kemudian.** Undangan dinilai dari layar HP seorang tamu
   yang membukanya dari WhatsApp. Semua keputusan diuji di situ lebih dulu.
2. **Boleh dicoba sebelum dipercaya.** Setiap penghalang sebelum orang melihat
   hasil jadinya adalah kehilangan. Login diminta sesiang mungkin, bayar
   seterakhir mungkin.
3. **Kerangka milik produk, rasa milik pemilik.** Di halaman undangan, produk
   menyumbang struktur dan ritme; warna serta font datang dari pemilik.
4. **Privasi bukan fitur, melainkan syarat.** Daftar tamu dan nominal amplop
   tidak pernah keluar dari dashboard pemilik.
5. **Momen sekali seumur hidup.** Nada produk tenang dan hormat; tidak
   mendesak, tidak bergaya diskon.

## Accessibility & Inclusion

Rentang usia tamu lebar sampai sesepuh keluarga: ukuran teks dan target sentuh
tidak boleh mengecil demi estetika. Kontras diuji pada palet yang dipilih
pemilik, bukan hanya pada palet contoh. Animasi menghormati
`prefers-reduced-motion`.
