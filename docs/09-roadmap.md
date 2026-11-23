# 09 — Roadmap

> **Status:** Final v1 · **Tanggal:** 2026-11-23

Fase pengerjaan dengan checklist & **Definition of Done (DoD)**. Kerjakan
berurutan; jangan loncat fase tanpa alasan.

---

## Fase 0 — Setup (Fondasi)

**Tujuan:** proyek jalan lokal dengan DB, auth, dan struktur sesuai `docs/02`.

- [ ] Scaffold Next.js (App Router, TS strict, Tailwind v4, src dir, pnpm).
- [ ] shadcn/ui init.
- [ ] Prisma + `schema.prisma` sesuai `docs/03`; `docker-compose` DB lokal.
- [ ] `prisma migrate` sukses; `prisma/seed.ts` isi ≥1 template.
- [ ] Auth.js (Google + email) — login & dashboard kosong terlindungi.
- [ ] `.env.example` lengkap; `src/lib/{db,auth,xendit,cloudinary,slug,validation}` kerangka.

**DoD:** login berhasil, `pnpm typecheck && lint && build` hijau, dashboard
kosong tampil untuk user login.

## Fase 1 — MVP Inti (undangan + tamu + interaksi, belum bayar)

**Tujuan:** bisa buat undangan dari template, isi, preview, dan tamu bisa RSVP +
ucapan. Semua masih mode trial (watermark), publish belum butuh bayar (sementara
gratis untuk uji).

- [ ] Galeri template + `createInvitation` dari template (F2).
- [ ] Editor konten (F3) dengan validasi Zod + preview live.
- [ ] Halaman publik `/u/[slug]` render section (cover, acara, countdown,
      galeri, lokasi/maps, penutup).
- [ ] Upload galeri via Cloudinary.
- [ ] RSVP (F7): Route Handler + form + rekap dashboard.
- [ ] Buku tamu (F8): kirim ucapan `PENDING` + moderasi + tampil `APPROVED`.
- [ ] Rate limit + filter kata pada endpoint publik.

**DoD:** alur buat → isi → preview → (tamu) RSVP & ucapan → moderasi → tampil,
berjalan end-to-end di lokal.

## Fase 2 — Monetisasi

**Tujuan:** trial → bayar → publish berfungsi dengan Xendit; watermark & masa
aktif aktif.

- [ ] `src/lib/packages.ts` (paket, harga, fitur, kuota).
- [ ] `createPayment` + Xendit invoice (`docs/05`).
- [ ] Webhook `/api/webhooks/xendit` (verifikasi token, idempoten, publish).
- [ ] Watermark di preview saat belum `PAID`; slug publik gated saat `DRAFT`.
- [ ] `activeUntil` + cron `expire-invitations`.
- [ ] UI publish (pilih paket, status "menunggu konfirmasi").

**DoD:** bayar test Xendit → webhook → undangan `PUBLISHED`, watermark hilang,
slug aktif, masa aktif terisi.

## Fase 3 — Fitur Lanjutan

**Tujuan:** melengkapi fitur "Should" — tema, link personal, amplop, dashboard rekap.

- [ ] Editor tema (F4): palet, font, musik, toggle & urutan section.
- [ ] Kelola tamu + link personal (F5): `personalSlug`, `?to=`, share WhatsApp,
      import massal.
- [ ] Amplop digital (F9): `giftConfig` + form konfirmasi kado (privat).
- [ ] Dashboard rekap (F11): ringkasan RSVP/ucapan/amplop.
- [ ] Add-to-calendar + musik custom.

**DoD:** semua fitur Should berjalan; data privat (tamu/nominal) tidak bocor ke
publik (diverifikasi).

## Fase 4 — Pasca-MVP (Future)

**Tujuan:** skala & diferensiasi.

- [ ] Section builder drag-drop (kustomisasi Level 3).
- [ ] Custom domain per undangan.
- [ ] Analytics undangan (kunjungan, konversi RSVP).
- [ ] Lebih banyak template & kategori.
- [ ] Multi-bahasa undangan.

**DoD:** per item, dengan dokumen desain diperbarui lebih dulu bila mengubah
data/API.

---

## Catatan Lintas Fase

- Setiap perubahan tabel/API wajib memperbarui `docs/03`/`docs/04` lebih dulu.
- Jaga halaman publik tetap cepat (ISR, optimasi gambar) di setiap fase.
- Keamanan (webhook, privasi data, moderasi, rate limit) bukan fase terpisah —
  sudah wajib sejak fitur terkait pertama kali dibuat.
