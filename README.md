# Undangan Digital

Platform web untuk membuat **undangan digital yang dapat dikustomisasi** — pilih template, isi acara, atur tema, bagikan link, dan kelola RSVP tamu. Dirancang untuk pasar Indonesia (nikah, aqiqah, ulang tahun, acara korporat).

## Deskripsi

Membuat undangan cetak itu mahal, lambat, dan sulit diubah. Undangan Digital menggantinya dengan satu halaman web cantik yang bisa dibagikan lewat WhatsApp, lengkap dengan RSVP, buku tamu, galeri, lokasi, countdown, dan amplop digital.

Model bisnisnya **B2C one-time per event**:

- **Trial (gratis):** daftar, pilih template, isi data, atur tema, kelola tamu, lihat preview. Undangan masih **berwatermark** dan **belum bisa di-share publik**.
- **Bayar (sekali):** unlock publish, hapus watermark, slug aktif, buka kuota tamu & fitur sesuai paket.
- **Masa aktif:** setelah bayar, undangan aktif **6 bulan** (default). Perpanjangan = pembayaran baru.

Dirancang agar **pemilik acara** cukup login; **tamu tidak perlu akun** untuk RSVP atau kirim ucapan.

## Fitur Utama

### MVP

- **Editor undangan** — pilih template, isi konten (mempelai/acara, tanggal, lokasi + Maps, galeri, cerita), atur tema (warna, font, musik, urutan section).
- **RSVP + buku tamu** — tamu konfirmasi kehadiran + jumlah orang; kirim ucapan/doa (dengan moderasi anti-spam).
- **Amplop digital** — tampilkan rekening/QRIS; tamu konfirmasi kado (nominal tidak diekspos ke publik).
- **Link personal per tamu** — slug unik per tamu, nama tamu muncul otomatis, share ke WhatsApp.
- **Galeri + Maps + Countdown + add-to-calendar + musik latar.**
- **Monetisasi** — paket Basic/Premium/Exclusive, pembayaran Xendit, trial→publish, masa aktif.

### Pasca-MVP

- Section builder (drag-drop), custom domain, analytics undangan, lebih banyak template.

## Tech Stack

| Lapisan | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript strict |
| UI | Tailwind CSS v4 + shadcn/ui |
| Runtime & package manager | Node.js 24 LTS + pnpm |
| Database | Postgres (Neon via Vercel Marketplace) |
| ORM & migrasi | Prisma + `prisma migrate` |
| Auth | Auth.js (NextAuth) — Google + email magic link |
| Storage gambar | Cloudinary (upload + transformasi/optimasi) |
| Pembayaran | Xendit (Invoice API) — QRIS/VA/e-wallet, one-time |
| Validasi | Zod |
| Deployment | Vercel (Fluid Compute) |

## Struktur Dokumentasi

Semua dokumen perancangan ada di `docs/`:

- `docs/01-prd.md` — PRD: produk, user stories + acceptance criteria, MoSCoW, metrik, risiko
- `docs/02-arsitektur.md` — arsitektur sistem, ADR, struktur folder
- `docs/03-data-model.md` — skema database final (Prisma)
- `docs/04-api-spec.md` — Server Actions, Route Handlers, webhook
- `docs/05-pembayaran-xendit.md` — pipeline trial → bayar → publish
- `docs/06-ui-ux.md` — halaman, komponen, interaksi, copywriting
- `docs/07-setup-development.md` — setup dev dari nol
- `docs/08-deployment.md` — deploy, env, proteksi, rollback
- `docs/09-roadmap.md` — fase 0–4, checklist, definition of done

## Status

Tahap **perancangan** — dokumen desain sudah ada, kode aplikasi belum di-scaffold. Lihat `docs/09-roadmap.md` untuk urutan pengerjaan.

## Menjalankan (rencana, setelah scaffold)

```bash
pnpm install
cp .env.example .env.local   # isi DATABASE_URL minimal
pnpm db:up                    # Postgres via Docker (dev lokal)
pnpm db:migrate               # prisma migrate
pnpm dev
```
