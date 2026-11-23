<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Panduan untuk Agent / Kontributor AI

Dokumen ini mengarahkan agent (atau kontributor baru) yang bekerja di repo Undangan Digital. Baca `CLAUDE.md` dan `docs/` sebelum menulis kode.

## Prinsip

1. **Dokumen adalah sumber kebenaran.** Keputusan produk & teknis sudah final di `docs/`. Nama tabel/kolom (`docs/03`) dan nama/path API (`docs/04`) **wajib diikuti persis**. Jika perlu menyimpang, perbarui dokumennya lebih dulu dalam perubahan yang sama.
2. **Bahasa.** Dokumen, UI, dan copywriting berbahasa Indonesia. Identifier kode/DB/API berbahasa Inggris.
3. **Privasi.** Daftar tamu lengkap dan nominal amplop digital **tidak boleh** bocor ke endpoint publik. Selalu cek apakah data yang di-expose sudah minimum.
4. **Halaman publik cepat.** `/u/[slug]` dibuka dari HP via WhatsApp — jaga agar ringan (SSR/ISR, optimasi gambar, lazy-load).

## Alur kerja

- Scaffold & fase pengerjaan mengikuti `docs/09-roadmap.md`. Kerjakan per fase; jangan loncat.
- Sebelum menambah fitur baru, cek apakah termasuk **Non-Goal** di `docs/01-prd.md`.
- Gunakan **pnpm**. Jangan campur dengan npm/yarn.
- Validasi semua input dengan **Zod**, terutama endpoint publik (RSVP, buku tamu, amplop).
- Setiap endpoint publik yang menerima input harus punya **rate limit** + anti-spam.

## Keamanan wajib

- Verifikasi webhook Xendit lewat header `x-callback-token` sebelum memproses.
- Jangan pernah mempercayai status pembayaran dari redirect browser; hanya webhook yang sah yang boleh mengubah `Payment.status` → `PAID`.
- Jangan commit `.env*` atau kredensial Xendit/Cloudinary.
- Buku tamu publik: moderasi (`PENDING` default) + filter kata + rate limit.

## Gaya kode

- TypeScript strict, hindari `any`.
- Komponen UI pakai shadcn/ui + Tailwind v4.
- Mutasi dashboard pakai **Server Actions**; endpoint publik & webhook pakai **Route Handlers**.
- Jalankan `pnpm typecheck && pnpm lint && pnpm build` sebelum menganggap tugas selesai.

## Atribusi commit

Akhiri pesan commit dengan baris atribusi yang ditetapkan harness pada sesi berjalan (lihat instruksi sesi). Jangan menambah baris atribusi lain.
