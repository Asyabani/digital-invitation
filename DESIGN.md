---
name: Lungsin
description: Undangan digital yang dirangkai seperti kain tenun — produk memasang struktur, pemilik menenun isi dan warnanya.
colors:
  nila: "#13233f"
  nila-pekat: "#0a1426"
  kapas: "#e6e2d8"
  mengkudu: "#9e2b1e"
  benang: "#c08a2e"
  day-bg: "#efece4"
  day-surface: "#f3f1ea"
  day-card: "#f7f5f0"
  day-ink: "#16213a"
  day-muted-ink: "#5d6476"
  day-border: "#cfc9ba"
  night-bg: "#0a1426"
  night-surface: "#13233f"
  night-ink: "#e6e2d8"
  night-muted-ink: "#9aa4b8"
  night-border: "#253a5e"
  success: "#2f6b4f"
  warning: "#9a6a16"
typography:
  display:
    fontFamily: "Bricolage Grotesque, var(--font-sans-ui), sans-serif"
    fontSize: "clamp(1.75rem, 5vw, 3.75rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.1em"
rounded:
  sm: "2px"
  lg: "3px"
  "2xl": "4px"
spacing:
  lungsin-jarak: "2.5rem"
  band-y: "5rem"
  gutter: "1.25rem"
components:
  button-primary:
    backgroundColor: "{colors.nila}"
    textColor: "{colors.day-bg}"
    rounded: "{rounded.lg}"
    padding: "0 0.625rem"
    height: "2rem"
  button-outline:
    backgroundColor: "{colors.day-bg}"
    textColor: "{colors.day-ink}"
    rounded: "{rounded.lg}"
    padding: "0 0.625rem"
    height: "2rem"
  inv-button:
    backgroundColor: "{colors.day-ink}"
    textColor: "{colors.kapas}"
    rounded: "{rounded.sm}"
    padding: "0.625rem 1.25rem"
    height: "2.75rem"
  inv-field:
    backgroundColor: "{colors.day-surface}"
    textColor: "{colors.day-ink}"
    rounded: "{rounded.sm}"
    padding: "0.625rem 0.875rem"
  helai:
    backgroundColor: "{colors.day-surface}"
    textColor: "{colors.day-ink}"
    rounded: "{rounded.sm}"
    padding: "1.25rem 1.5rem"
---

# Design System: Lungsin

## Overview

**Creative North Star: "Kain Tenun"** — satu lembar kain yang ditenun, bukan tumpukan kartu.

Lungsin mengambil kosakata tenun tradisional Indonesia dan memakainya sebagai struktur, bukan sebagai motif tempel. Produk memasang *lungsin* (benang tegak — kerangka kolom yang konstan) dan *pinggiran* (tepi kain yang dimatikan dengan benang emas); pengguna menenun *pakan* (pita isi yang melintang). Halaman tidak disusun dari kartu seragam yang mengambang; ia disusun dari pita penuh lebar yang berganti kerapatan, dibatasi garis benang emas setipis 1px. Ini jawaban langsung atas dua refleks kategori yang dunia ini tolak: krem + serif kontras tinggi + foil emas + huruf skrip (bawaan industri undangan), dan kisi kartu identik bersudut membulat (bawaan SaaS).

Nadanya tenang, hangat, dan matang — cocok untuk momen sekali seumur hidup, tanpa gaya diskon. Kehangatan datang dari warna kain (nila pekat, kapas, mengkudu) dan dari struktur tenunannya, bukan dari ornamen. Tipografinya grotesque konstruksi, bukan serif romantis. Sudutnya dipotong tegas (2px), bukan dibulatkan. Satu-satunya "kemewahan" yang diizinkan adalah benang emas, dan ia hanya pernah muncul sebagai garis, tidak pernah sebagai bidang.

Sistem ini hidup di **tiga lingkungan**, satu kain: **kain malam** (marketing, dasar nila pekat, dibungkus kelas `dark`), **kain siang** (dashboard, bidang kapas terang untuk kerja berjam-jam), dan **permukaan undangan** `/u/[slug]` yang warna serta fontnya milik tiap pemilik lewat `themeConfig` — di sana produk hanya menyumbang kerangka tenunnya lewat token `--inv-*`.

**Key Characteristics:**
- Pita penuh lebar (*pakan*) dengan kerapatan berganti, bukan kisi kartu.
- Benang emas `#C08A2E` hanya sebagai garis 1px — tidak pernah jadi fill.
- Sudut 2px di mana-mana: kain punya tepi potong.
- Dua palet token (siang/malam) + satu keluarga `--inv-*` yang netral terhadap tema pemilik.
- Satu momen bergerak: kain ditenun kiri-ke-kanan saat halaman dibuka.

## Colors

Palet berangkat dari kain tenun: dasar nila yang dalam, bidang kapas untuk membaca, satu benang merah mengkudu, dan garis emas yang langka.

### Primary
- **Nila** (`#13233F`): warna tinta utama. Jadi `primary` di kain siang (tombol, judul di dashboard) dan warna teks di permukaan baca. Di kain malam ia naik jadi warna *surface* kartu di atas dasar nila pekat.
- **Nila Pekat** (`#0A1426`): dasar lingkungan marketing dan warna pita gelap yang menyela pita terang pada halaman marketing (`bg-nila-pekat`).

### Secondary
- **Mengkudu** (`#9E2B1E`): satu-satunya benang merah yang ditarik. Dipakai sangat hemat sebagai aksen status/terpilih — garis `ikat` di bawah tab aktif, benang penanda pada paket terpilih, dan isi benang proporsional di `SummaryCards`. Juga `destructive` dan `ring` fokus. Bukan warna tombol utama.

### Tertiary
- **Benang (Emas)** (`#C08A2E`): aksen termewah dan paling langka. Hanya sebagai garis 1px — pinggiran kain, sisi kiri-kanan `.kain`, garis tipis di `@theme` chart. Lihat The Benang Rule.

### Neutral
- **Kapas** (`#E6E2D8`): bidang kain terang; warna teks di kain malam dan latar dasar helai.
- **Day BG / Surface / Card** (`#EFECE4` / `#F3F1EA` / `#F7F5F0`): tiga lapis terang dashboard — latar halaman, bidang `.kain`, dan kartu di dalamnya.
- **Day Ink** (`#16213A`): teks utama kain siang.
- **Day Muted Ink** (`#5D6476`): teks sekunder, label, keterangan.
- **Day Border** (`#CFC9BA`): garis pemisah netral di kain siang (biasa dipakai pada opasitas `/70`).
- **Night Surface / Border / Muted Ink** (`#13233F` / `#253A5E` / `#9AA4B8`): padanannya di kain malam.

### Status (satu arti warna di seluruh aplikasi)
- **Success** (`#2F6B4F`, surface `#DDE5DC`): undangan aktif/terbit, RSVP hadir.
- **Warning** (`#9A6A16`, surface `#EEE3CD`): masa aktif berakhir, ucapan perlu ditinjau.

### Named Rules
**The Benang Rule.** Emas `#C08A2E` hanya hadir sebagai garis 1px (pinggiran, sisi helai, hairline). Emas yang menjadi bidang isi akan terbaca sebagai foil — refleks industri undangan yang dunia ini tolak. Audit: tidak boleh ada `background`/`fill` emas di mana pun.

**The One Thread Rule.** Mengkudu adalah satu-satunya warna merah, dan ia aksen, bukan permukaan. Muncul sebagai garis `ikat`/benang di bawah 10% luas layar. Kelangkaannya yang membuatnya terbaca sebagai penanda.

**The Two Cloths Rule.** Warna tidak di-hardcode per komponen; ia datang dari token yang di-*remap* per lingkungan (`:root` siang, `.dark` malam). Komponen menulis `bg-card`/`text-foreground`, bukan hex, supaya ikut kain tempatnya duduk.

## Typography

**Display Font:** Bricolage Grotesque (fallback `--font-sans-ui`, sans-serif)
**Body / UI Font:** Archivo (fallback ui-sans-serif, system-ui)

**Character:** Dua grotesque yang bersaudara, bukan pasangan serif–skrip. Bricolage sebagai suara judul: terkonstruksi dan berirama seperti benang, selalu dengan `letter-spacing: -0.03em` dan `text-wrap: balance`. Archivo sebagai pekerja antarmuka: tajam dan terbaca di ukuran kecil. Pemilihan ini sengaja menolak serif kontras-tinggi dan huruf skrip emas yang jadi bawaan kategori.

### Hierarchy
- **Display** (600, `clamp(1.75rem → 3.75rem)`, line-height ~1): judul hero dan kepala pita. Kelas `.font-display`; selalu tracking rapat −0.03em.
- **Headline** (500–600, `text-3xl`–`text-4xl`): judul tiap pita di marketing dan judul bagian.
- **Title** (500, `text-lg`–`text-xl`): judul kartu/helai, nama paket, `HelaiKepala`.
- **Body** (400, `text-base`/`text-sm`, line-height 1.6): teks paragraf, dibatasi `max-w-[62ch]` pada deskripsi agar baris tidak terlalu panjang.
- **Label** (400, `text-xs`, `tracking-widest`, UPPERCASE): eyebrow pada daftar fitur, kolom footer, label "UNDANGAN". Angka memakai `.tabular` (tabular-nums) untuk harga dan rekap.

### Named Rules
**The Woven Voice Rule.** Judul memakai `.font-display` (Bricolage, tracking −0.03em, `text-wrap: balance`); tidak pernah serif atau skrip. Rasa "undangan" datang dari warna dan struktur, bukan dari bentuk huruf.

**The Owner's Letters Rule.** Font di atas hanya untuk kerangka produk (marketing + dashboard). Permukaan undangan memakai enam famili milik pemilik (`fonts-invitation.ts`) lewat `--inv-heading`/`--inv-body`; jangan terapkan `.font-display` pada konten undangan.

## Layout

Model spasialnya adalah **tenun, bukan kisi kartu.** Tiap bagian halaman adalah satu **pita (`.pakan`)** penuh lebar; konten di dalamnya dibatasi `max-w-6xl` (marketing/dashboard) atau `max-w-lg`/`max-w-3xl` untuk teks terpusat. Benang tegak **lungsin (`.lungsin`)** adalah garis kolom tipis (`currentColor`, opasitas 0.07) berulang tiap `--lungsin-jarak: 2.5rem`, dipasang pada pita — bukan pada kartu — sebagai pengganti kisi.

**Irama kerapatan adalah aturan, bukan dekorasi.** Pita diselang-seling: rapat lalu lapang. Di marketing, pita terang berganti dengan pita `bg-nila-pekat`; padding vertikal berayun antara `py-16`/`py-20` dan `py-24`/`py-28`. Di permukaan undangan, `Section` memakai `index % 2` untuk memberi pita genap latar `color-mix(... 3.5%)` dan padding lebih rapat, pita ganjil lebih lapang — sehingga guliran punya denyut, bukan jarak seragam.

Grid dipakai hanya di dalam pita: hero marketing `md:grid-cols-[minmax(0,1fr)_26rem]` (judul + helai pratinjau), daftar fitur `md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]`, dan tiga paket `md:grid-cols-3` yang dipisah **garis** (`gap-px bg-border/70`), bukan jarak antar kartu. Responsif: satu kolom di mobile, pita tetap penuh lebar; navigasi `Template` disembunyikan di bawah `sm`.

Target sentuh dan ukuran teks tidak mengecil demi estetika (rentang usia tamu lebar): tombol undangan `min-height: 2.75rem`, field undangan padding `0.625rem 0.875rem`.

## Elevation & Depth

Sistem ini **nyaris datar; kedalamannya ditenun, bukan diangkat.** Tidak ada bayangan ambient atau drop-shadow di permukaan. Pemisahan lapisan datang dari (1) pergeseran tona — latar `#EFECE4`, bidang `.kain` `#F3F1EA`, kartu `#F7F5F0`; (2) garis — border 1px dan `divide`/`gap-px`; dan (3) **benang emas** yang menandai tepi kain.

### Shadow Vocabulary
Hanya satu "bayangan", dan ia bukan bayangan lembut melainkan **benang emas kedua** yang mensimulasikan tepi kain yang dimatikan:
- **Pinggiran** (`box-shadow: 0 3px 0 -2px color-mix(... benang 45%)`): garis emas kedua rapat di bawah/atas border `.pinggiran-atas`/`.pinggiran-bawah`. Spread negatif membuatnya garis, bukan gumpalan.

### Named Rules
**The Flat Cloth Rule.** Permukaan tidak diangkat dengan bayangan. Kedalaman = tona + garis + benang. Satu-satunya `box-shadow` yang sah adalah hairline emas `pinggiran`; jangan tambah drop-shadow lembut.

## Shapes

Bahasa bentuknya adalah **kain dengan tepi potong**, bukan objek yang dibulatkan. Semua radius token kecil dan hampir rata: `--radius-sm/md: 2px`, `--radius-lg/xl: 3px`, `--radius-2xl…4xl: 4px`. Praktiknya: helai, field, chip, dan permukaan undangan memakai **2px**; tombol shadcn `base-nova` memakai `rounded-lg` (**3px**). Tidak ada sudut membulat besar.

Siluet khasnya:
- **Benang sejajar**: garis `repeating-linear-gradient` setebal `3px` — penanda di bawah judul (`var(--inv-secondary)`), isi benang `SummaryCards`/paket (`var(--mengkudu)`), garis `ikat`. Selalu putus-putus (segmen 5–6px, celah 2–3px), menyerupai benang, bukan garis solid.
- **Pinggiran emas**: border 1px + hairline `box-shadow` emas pada tepi pita/helai.
- **Tepi helai**: `.kain` selalu punya `border-left`/`border-right` benang emas 40%.

## Components

### Buttons
- **Shape:** sudut 3px (`rounded-lg`), tinggi padat (`h-8` default, `h-9` lg; hero menaikkan ke `h-11`).
- **Primary (default):** `bg-primary text-primary-foreground`, hover `bg-primary/80`. Di kain malam `primary` = kapas terang; di kain siang = nila. Satu tombol primer per pita.
- **Outline:** `border-border bg-background`, hover `bg-muted`. Aksi sekunder ("Lihat contoh dulu", "Perbandingan lengkap").
- **Ghost:** tanpa latar, hover `bg-muted`. Navigasi header.
- **Hover/Focus/Active:** transisi halus; `focus-visible` memberi `ring-3 ring-ring/50`; `active` menggeser `translate-y-px`. Jangan buat tombol fill emas atau fill mengkudu.

### Chips / Pilihan
- **Dashboard (paket & tab):** bukan pil berlatar. Baris penuh dengan **benang tepi**: paket terpilih ditandai `border-l-2 border-l-mengkudu bg-accent/50`; tab aktif ditandai `.ikat` (celup rintang putus-putus mengkudu di bawahnya), bukan kotak berbingkai.
- **Undangan (`.inv-chip`):** border 1px tipis warna teks pemilik, radius 2px, `min-height: 2.75rem`; saat `aria-pressed="true"` terisi `--inv-primary` dengan teks `--inv-bg`.

### Cards / Containers → Helai
Tidak ada komponen "Card"; wadah baku dashboard adalah **`Helai`** (`src/components/dashboard/Helai.tsx`).
- **Corner:** 2px (`rounded-sm`). **Background:** `.kain` (`#F3F1EA`).
- **Border:** sisi kiri-kanan benang emas 40%; atas ditutup `.pinggiran-atas` (garis + hairline emas).
- **Padding:** `HelaiIsi` `px-5 py-5 sm:px-6`; `HelaiKepala` memisah judul (kiri) dan aksi (kanan) dengan satu garis `border-b border-border/70`.
- **The Reset Rule:** `.kain` me-reset token ke palet siang **termasuk di dalam shell `.dark`** — jadi helai selalu kapas dan komponen anaknya (tombol, input, lencana) ikut kain siang tanpa perlu tahu lingkungannya.

### Inputs / Fields
- **Dashboard:** input shadcn `base-nova` standar di atas kain siang.
- **Undangan (`.inv-field`):** border 1px `color-mix(inv-text 20%)`, radius 2px, latar `color-mix(inv-bg 70%, white)`. Fokus: `border-color: var(--inv-primary)` + `box-shadow: 0 0 0 3px color-mix(inv-primary 18%)` — glow dalam warna pemilik, bukan warna sistem.

### Navigation
- **Marketing header:** `.pakan .lungsin`, wordmark `Lungsin` dengan `.font-display`; tautan ghost; "Masuk" outline. Tersembunyi `Template` di bawah `sm`.
- **InvitationNav (dashboard):** satu pita tab yang bisa digulir; tab aktif memakai `.ikat` (garis celup rintang mengkudu) + `text-foreground`, nonaktif `text-muted-foreground`.

### Signature: SummaryCards (benang proporsional)
Rekap satu undangan dibaca sebagai **tiga kelompok benang** yang panjangnya sebanding dengan angkanya (`width: (value/of)*100%`, minimal 6% bila > 0), bukan empat kotak angka besar seragam. Isi benang memakai `repeating-linear-gradient` mengkudu. Nominal amplop hanya muncul di sini (halaman pemilik), tidak pernah publik.

### Signature: Momen "menenun"
Satu animasi diorkestrasi: `@keyframes tenun` menyapu `clip-path: inset(0 100% 0 0) → inset(0)` — kain tertenun kiri-ke-kanan dengan `cubic-bezier(0.16, 1, 0.3, 1)` selama 900ms. Dipakai di hero marketing, lalu **dipakai ulang** sebagai penanda status terbit di `PublishPanel` (pita hijau tertenun saat undangan aktif). Varian `.menenun-2/3/4` memberi jeda berundak (110/220/330ms). `prefers-reduced-motion` menerima kain yang sudah jadi (animasi dimatikan).

### Permukaan undangan (`--inv-*`)
Bukan konsumen token dashboard. `InvitationView` memasang `--inv-primary/secondary/bg/text/heading/body` dari `themeConfig` pada elemen akar; kelas `.inv-*` menurunkannya. Produk hanya menyumbang **struktur**: pita `Section` berganti kerapatan, `.inv-pinggiran` (benang warna pendukung pemilik), `.inv-lungsin` (benang tegak dalam warna teks pemilik, opasitas 0.05), dan benang putus-putus di bawah judul. Editor tema hanya menawarkan font yang benar-benar dimuat (`HEADING_FONTS`/`BODY_FONTS` di `font-stacks.ts`; nama asing jatuh ke serif/sans aman).

## Do's and Don'ts

### Do:
- **Do** susun halaman sebagai pita penuh lebar (`.pakan`) dengan kerapatan berganti (rapat ⇄ lapang); pisahkan kolom dengan **garis** (`gap-px bg-border/70`), bukan jarak antar kartu.
- **Do** pakai `Helai` sebagai wadah dashboard, bukan `Card`; biarkan `.kain` me-reset ke palet siang dan komponen anak mengikut.
- **Do** tulis warna lewat token (`bg-card`, `text-foreground`, `var(--mengkudu)`), supaya komponen ikut kain siang/malam tempatnya duduk.
- **Do** jaga sudut 2px (helai/field/chip/undangan) dan 3px (tombol); gunakan `.font-display` + tracking −0.03em untuk judul.
- **Do** biarkan permukaan undangan mengambil warna & font dari `--inv-*`/`themeConfig`; uji kontras pada palet pemilik, bukan hanya palet contoh.
- **Do** hormati `prefers-reduced-motion`: sajikan kain yang sudah jadi.

### Don't:
- **Don't** jadikan emas `#C08A2E` sebagai bidang/fill — emas hanya garis 1px. Fill emas terbaca sebagai foil.
- **Don't** pakai mengkudu sebagai permukaan atau tombol utama; ia aksen garis yang langka (< 10% layar).
- **Don't** bangun kisi kartu identik bersudut membulat dengan bayangan lembut — itu bawaan SaaS yang ditolak; dan jangan pakai krem + serif kontras-tinggi + skrip emas — itu bawaan industri undangan.
- **Don't** biarkan permukaan undangan `/u/[slug]` menyentuh token dashboard; gunakan hanya kelas `.inv-*`.
- **Don't** bocorkan daftar tamu lengkap atau nominal amplop ke tampilan publik; keduanya hanya di dashboard pemilik.
- **Don't** tambah font undangan di editor tanpa mendeklarasikannya di `fonts-invitation.ts`, atau pilihan pemilik diam-diam jatuh ke font bawaan browser.
