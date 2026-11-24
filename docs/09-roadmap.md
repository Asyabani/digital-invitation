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

- [x] Galeri template + `createInvitation` dari template (F2).
- [x] Editor konten (F3) dengan validasi Zod + preview live.
- [x] Halaman publik `/u/[slug]` render section (cover, acara, countdown,
      galeri, lokasi/maps, penutup).
- [~] Upload galeri via Cloudinary — saat ini input URL; signed-upload sudah
      disiapkan di `src/lib/cloudinary.ts`, widget unggah menyusul (butuh kredensial).
- [x] RSVP (F7): Route Handler + form + rekap dashboard.
- [x] Buku tamu (F8): kirim ucapan `PENDING` + moderasi + tampil `APPROVED`.
- [x] Rate limit + filter kata pada endpoint publik.
- [x] ~~(Sementara) `publishForTesting`~~ — sudah dihapus, digantikan alur
      pembayaran Xendit di Fase 2.

**DoD:** ✅ alur buat → isi → preview → (tamu) RSVP & ucapan → moderasi → tampil,
terverifikasi end-to-end di lokal (halaman publik, API RSVP/ucapan, moderasi).
Bagian ber-login (editor/publish) lolos build & typecheck; uji login penuh
menunggu kredensial OAuth.

## Fase 2 — Monetisasi

**Tujuan:** trial → bayar → publish berfungsi dengan Xendit; watermark & masa
aktif aktif.

- [x] `src/lib/packages.ts` (paket, harga, fitur, kuota) + halaman `/harga`.
- [x] `createPayment` / `extendInvitation` + Xendit invoice (`docs/05`).
- [x] Webhook `/api/webhooks/xendit` (verifikasi token, idempoten, publish).
- [x] Watermark mengikuti feature flag paket; slug publik gated saat `DRAFT`.
- [x] `activeUntil` + cron `expire-invitations` (+ `vercel.ts`).
- [x] UI publish (`PublishPanel`: pilih paket, "menunggu konfirmasi", perpanjang).

**DoD:** ✅ webhook → undangan `PUBLISHED`, paket & `activeUntil` terisi,
watermark sesuai paket, slug aktif — diverifikasi end-to-end di lokal dengan
invoice simulasi (token callback dev): token salah `401`, body invalid `400`,
webhook ganda tidak dobel menambah masa aktif, `EXPIRED`/`FAILED` tidak
mem-publish, perpanjangan menghitung ulang dari `max(now, activeUntil)`, cron
menolak tanpa `CRON_SECRET`. Uji dengan **invoice test Xendit sungguhan**
menunggu kredensial (`XENDIT_SECRET_KEY`), begitu pula alur ber-login
(`PublishPanel` → `createPayment`) yang menunggu kredensial OAuth.

## Fase 3 — Fitur Lanjutan

**Tujuan:** melengkapi fitur "Should" — tema, link personal, amplop, dashboard rekap.

- [x] Editor tema (F4): palet (preset + custom), font, musik, toggle & urutan
      section (tombol naik/turun; drag-drop menyusul di Fase 4).
- [x] Kelola tamu + link personal (F5): `personalSlug`, `?to=`, share WhatsApp,
      import massal (tempel daftar, `Nama, Kategori` per baris).
- [x] Amplop digital (F9): `giftConfig` + form konfirmasi kado (privat).
- [x] Dashboard rekap (F11): ringkasan RSVP/ucapan/amplop per undangan.
- [x] Add-to-calendar (Google Calendar) + musik custom (pemutar mengambang,
      tanpa autoplay memaksa).

**DoD:** ✅ fitur Should berjalan dan privasi diverifikasi end-to-end di lokal:
amplop hanya tampil bila `giftConfig` terisi **dan** paket memuat
`giftEnvelope` (Basic → section hilang + endpoint `404`), nominal kado tidak
pernah muncul di HTML publik, link personal `?to=` memunculkan nama tamu dan
menautkan konfirmasi ke `Guest`, toggle & urutan section tercermin di halaman
publik, serta helper (slug tamu bentrok, parser impor, URL kalender per zona
waktu) lulus uji. Bagian ber-login (simpan tema, CRUD tamu, simpan rekening)
lolos `typecheck`/`lint`/`build`; uji klik penuh menunggu kredensial OAuth.

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
