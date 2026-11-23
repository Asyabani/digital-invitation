# 06 — UI/UX & Copywriting

> **Status:** Final v1 · **Tanggal:** 2026-11-23
>
> UI & copy berbahasa Indonesia. Komponen: shadcn/ui + Tailwind v4.

---

## 1. Prinsip Desain

- **Mobile-first.** Tamu hampir selalu membuka dari HP via WhatsApp. Semua
  halaman publik dioptimalkan untuk layar kecil & koneksi lambat.
- **Elegan & tenang.** Undangan = momen spesial; hindari UI ramai. Tipografi
  rapi, whitespace lega, animasi halus (bukan berlebihan).
- **Minim friksi tamu.** RSVP & ucapan cukup beberapa ketukan, tanpa login.
- **Editor yang memandu.** Pemilik awam teknis → langkah jelas, preview live.

## 2. Halaman Marketing

### `/` Landing
- Hero: value proposition + CTA "Buat Undangan Gratis".
- Showcase template (carousel), fitur unggulan, testimoni, harga ringkas, FAQ.
- Copy CTA: *"Coba gratis, bayar hanya saat siap dibagikan."*

### `/template` Galeri Template
- Grid preview per kategori (Pernikahan, Aqiqah, Ulang Tahun, Korporat).
- Klik → preview demo + tombol "Pakai Template Ini" (arahkan login bila belum).

### `/harga` Harga
- Tabel 3 paket (Basic/Premium/Exclusive) dengan perbandingan fitur.
- Catatan: *"Pembayaran sekali per acara. Undangan aktif 6 bulan."*

## 3. Dashboard (pemilik, login)

### `/dashboard` Daftar Undangan
- Kartu per undangan: judul, status (Draft/Published/Kedaluwarsa), masa aktif,
  tombol Edit / Lihat / Bagikan.
- Tombol "+ Buat Undangan Baru" → pilih template.

### `/dashboard/[id]/edit` Editor Konten
- Layout dua kolom di desktop: **form di kiri, preview live di kanan**; di mobile
  tab Form / Preview.
- Section form: Data Acara, Lokasi & Maps, Galeri (upload Cloudinary), Cerita,
  Quote, Protokol.
- Auto-save + indikator "tersimpan".

### `/dashboard/[id]/tema` Editor Tema
- Pilih palet warna (preset + custom), font (heading/body), musik latar.
- Daftar section dengan toggle on/off + drag untuk urutkan (`sectionsOrder`).

### `/dashboard/[id]/tamu` Kelola Tamu
- Tabel tamu: nama, kategori, link personal, status terkirim.
- Tambah manual + import (tempel daftar / CSV).
- Tombol "Salin link WhatsApp" per tamu (teks + `/u/[slug]?to=<personalSlug>`).

### `/dashboard/[id]/rsvp` Rekap RSVP
- Ringkasan: total hadir, tidak hadir, ragu, total headcount.
- Tabel jawaban RSVP.

### `/dashboard/[id]/ucapan` Moderasi Buku Tamu
- Daftar ucapan `PENDING` dengan tombol Approve/Reject.
- Tab untuk ucapan yang sudah `APPROVED`.

### `/dashboard/[id]/amplop` Konfirmasi Amplop
- **Khusus pemilik** — daftar konfirmasi kado + nominal + bukti. Jelaskan bahwa
  data ini privat.

### Alur Publish
- Tombol "Publish" → modal pilih paket → `createPayment` → redirect Xendit.
- Setelah kembali: banner "Menunggu konfirmasi pembayaran" sampai webhook tiba,
  lalu berubah jadi "Undangan aktif! Bagikan sekarang".

## 4. Halaman Undangan Publik `/u/[slug]`

Urutan section mengikuti `sectionsOrder` (default):

1. **Cover** — nama subjek/mempelai, tanggal, **nama tamu** (dari `?to`), tombol
   "Buka Undangan".
2. **Pembuka** — quote/salam.
3. **Mempelai/Acara** — foto & detail.
4. **Countdown** — hitung mundur ke tanggal acara.
5. **Galeri** — grid foto (lazy-load, Cloudinary responsive).
6. **Lokasi** — peta + tombol "Buka Maps" + "Tambah ke Kalender".
7. **RSVP** — form status + jumlah orang.
8. **Buku Tamu** — daftar ucapan `APPROVED` + form kirim ucapan.
9. **Amplop Digital** — rekening/QRIS + tombol "Konfirmasi Kado" (form).
10. **Penutup** — ucapan terima kasih.

Elemen global:
- **Musik latar**: tombol play/pause mengambang; tidak autoplay memaksa (hormati
  kebijakan browser), mulai saat "Buka Undangan" ditekan.
- **Tombol share WhatsApp**.
- **Watermark** tampil bila undangan belum `PAID` (mode preview).
- Jika `EXPIRED`: tampilkan pesan sopan "Undangan telah berakhir".

## 5. Copywriting (contoh, Bahasa Indonesia)

- Cover: *"Kepada Yth. Bapak/Ibu/Saudara/i, [Nama Tamu]"*
- RSVP sukses: *"Terima kasih, konfirmasimu sudah kami terima 🙏"*
- Ucapan terkirim: *"Ucapanmu terkirim dan akan tampil setelah ditinjau."*
- Amplop: *"Doa restu Anda adalah hadiah terindah. Namun bila berkenan memberi
  tanda kasih, dapat melalui:"*
- Watermark/preview: *"Mode pratinjau — publish untuk membagikan ke tamu."*

## 6. Aksesibilitas & Performa
- Kontras warna cukup, ukuran sentuh ≥ 44px, alt text gambar.
- Gambar via Cloudinary (format modern, ukuran responsif), lazy-load galeri &
  musik. Target LCP < 2.5s di HP.
- Hormati `prefers-reduced-motion` untuk animasi.
