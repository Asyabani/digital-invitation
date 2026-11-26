# 05 — Pipeline Pembayaran (Xendit)

> **Status:** Final v1 · **Tanggal:** 2026-11-23

Mendeskripsikan alur **trial → bayar → publish** dan masa aktif. Model
**one-time payment** (Xendit Invoice API), bukan subscription recurring.

---

## 1. Konsep

- Undangan `DRAFT` = mode **trial**: bisa diedit & dipreview, berwatermark, slug
  publik belum aktif.
- **Publish** butuh satu pembayaran sukses. Setelah `PAID`, undangan
  `PUBLISHED`, slug aktif, `activeUntil = now + 6 bulan`.
- **Watermark** mengikuti feature flag `removeWatermark` pada paket (§2), bukan
  sekadar status bayar: `BASIC` tetap menampilkan watermark branding kecil,
  `PREMIUM`/`EXCLUSIVE` bersih. Satu sumber kebenaran: `src/lib/packages.ts`.
- **Perpanjangan** = pembayaran baru yang menambah masa aktif.
- Satu-satunya sumber kebenaran status bayar adalah **webhook Xendit**, bukan
  redirect browser.

## 2. Paket & Harga (draft — final menyusul)

| Paket | Harga (draft) | Kuota tamu | Fitur kunci |
|-------|---------------|-----------|-------------|
| `BASIC` | Rp99.000 | s/d 150 | Template, RSVP, buku tamu, galeri, maps, countdown |
| `PREMIUM` | Rp199.000 | s/d 500 | + amplop digital, link personal, hapus watermark, musik custom |
| `EXCLUSIVE` | Rp349.000 | unlimited | + custom slug, galeri tanpa batas, prioritas support |

Harga & fitur per paket disimpan sebagai **konfigurasi** (feature flags), bukan
hardcode di banyak tempat — satu sumber di `src/lib/packages.ts`.

## 2b. Tingkat Template

Katalog berisi **30 template: 10 Basic, 10 Premium, 10 Eksklusif.**

Tingkatnya **tidak** disimpan sebagai kolom di `Template`. Ia dibaca dari
`minPackage` milik arketipe tata letak yang dipakai template itu
(`src/lib/invitation-layouts.ts`):

| Tingkat | Arketipe | Harga |
|---|---|---|
| `BASIC` | Klasik, Sampul, Lugas | Rp99.000 |
| `PREMIUM` | Pias, Pita, Galeri | Rp199.000 |
| `EXCLUSIVE` | Bingkai, Naskah | Rp349.000 |

**Kenapa melekat pada gaya, bukan pada tiap template.** Riset pasar
undangan digital Indonesia (Nov 2026): mayoritas vendor menjual per **paket
fitur**; yang menjual per tema pun memakai **kelompok tema**, bukan harga
unik tiap tema — Naravitation dua tingkat, Weddingku per kelompok desain,
Kipa per gaya desain. Tidak ada yang memasang dua puluh harga berbeda, karena
galeri jadi tidak bisa dibandingkan. Mengikat tingkat ke arketipe membuat
yang dibayar memang hal yang benar-benar berbeda — susunan halamannya,
gerak masuknya, dan cara fotonya dipakai — bukan sekadar label pada palet.

Yang didapat tingkat berbayar, di luar fitur paket yang sudah ada:

- **Tata letak eksklusif.** Pias, Pita, Galeri (Premium); Bingkai, Naskah
  (Eksklusif). Tiga arketipe Basic tetap lengkap, bukan versi lumpuh.
- **Gerak masuk.** Tiap bagian naik dan memudar saat pertama terlihat
  (`motion: "masuk"`). Selalu dimatikan oleh `prefers-reduced-motion`.
- **Foto lebih kaya.** `Galeri` menyisipkan pita foto selebar layar di antara
  bagian; `Naskah` membuat fotonya melewati tepi kolom teks.

**Penegakan.** `startPayment` menolak paket yang lebih ringkas dari
`minPackage` tata letak yang sedang dipakai. Pemeriksaan ini **wajib di
server** — tanpa itu, siapa pun bisa memanggil Server Action dengan paket
Basic sambil memakai tata letak Eksklusif dan membayar sepertiga harganya.
`PublishPanel` menonaktifkan paket yang tidak memenuhi syarat beserta
alasannya, tapi itu kenyamanan, bukan pengamanan.

Saat masih trial (`package = null`) **semua** arketipe boleh dicoba, sama
seperti `canUse()`. Yang menolak adalah pembayaran, bukan editor — pemilik
harus bisa melihat apa yang ia beli.

## 3. Alur End-to-End

```
Pemilik (DRAFT) ──"Publish / pilih paket"──▶ createPayment (Server Action)
   │
   ├─ buat Payment { status: PENDING, package, amount, externalId:null }
   ├─ Xendit: POST /v2/invoices  → { invoice_url, id }
   ├─ simpan externalId = invoice.id, invoiceUrl
   └─ return { invoiceUrl } ──▶ redirect pemilik ke halaman bayar Xendit
                                        │
                   pemilik bayar (QRIS/VA/e-wallet)
                                        │
   Xendit ──POST webhook──▶ /api/webhooks/xendit
                                        │
   ├─ verifikasi header x-callback-token
   ├─ cari Payment by externalId (idempoten)
   ├─ status PAID:
   │    Payment.status=PAID, paidAt=now, raw=payload
   │    Invitation.status=PUBLISHED, publishedAt=now,
   │    activeUntil = (perpanjangan ? activeUntil : now) + 6 bulan,
   │    package = Payment.package
   │    revalidatePath('/u/[slug]')
   ├─ status EXPIRED/FAILED: Payment.status diupdate, undangan tetap DRAFT
   └─ balas 200
```

## 4. Membuat Invoice (createPayment)

- Hitung `amount` dari `package` via `src/lib/packages.ts`.
- Panggil Xendit Invoice API (`src/lib/xendit.ts`):
  - `external_id`: id internal `Payment` (atau gabungan `invoiceId`), untuk
    rekonsiliasi.
  - `amount`, `payer_email` (email pemilik), `description` (nama undangan + paket).
  - `success_redirect_url`: `/dashboard/[id]/edit?pay=success`
  - `failure_redirect_url`: `/dashboard/[id]/edit?pay=failed`
- Simpan `externalId` = `invoice.id`, `invoiceUrl` = `invoice.invoice_url`.
- `Payment.id` dibuat lebih dulu di aplikasi dan dikirim sebagai `external_id`
  Xendit, sehingga rekonsiliasi berjalan dua arah
  (`external_id` ↔ `Payment.id`, `invoice.id` ↔ `Payment.externalId`).
- Bila sudah ada `Payment` `PENDING` untuk undangan & paket yang sama, pemilik
  diarahkan ke `invoiceUrl` lama — tidak membuat tagihan ganda.

> Redirect `success` **tidak** mem-publish undangan. Ia hanya memberi tahu user;
> publish terjadi lewat webhook. UI dashboard menampilkan "menunggu konfirmasi
> pembayaran" sampai webhook tiba.

## 5. Webhook (`POST /api/webhooks/xendit`)

Wajib:
1. **Verifikasi** `x-callback-token` == `XENDIT_CALLBACK_TOKEN`. Gagal → `401`.
2. **Idempoten:** cari `Payment` by `externalId`; jika sudah `PAID`, abaikan
   (balas `200`) agar webhook ganda tidak dobel menambah masa aktif.
   Perpindahan `PENDING → PAID` dilakukan dengan **klaim atomik**
   (`updateMany` ber-kondisi `status != PAID`); hanya pemanggil yang berhasil
   mengklaim yang boleh melanjutkan mem-publish undangan.
   `externalId` tak dikenal → balas `200` dan abaikan (hindari retry tanpa akhir
   untuk invoice milik environment lain).
3. Petakan status Xendit → `PaymentStatus`:
   - `PAID` / `SETTLED` → `PAID`
   - `EXPIRED` → `EXPIRED`
   - lainnya gagal → `FAILED`
4. Pada `PAID`, jalankan dalam satu transaksi: update `Payment` + update
   `Invitation` (publish + `activeUntil`).
5. `revalidatePath` halaman publik.
6. Balas `200` secepatnya.

## 6. Masa Aktif & Perpanjangan

- `activeUntil` diset saat `PAID`. Default `+6 bulan` (konstanta `ACTIVE_MONTHS`).
- **Perpanjangan:** `extendInvitation` membuat `Payment` baru. Saat `PAID`,
  `activeUntil` dihitung dari `max(now, activeUntil) + 6 bulan` agar tidak hangus.
- **Expiry:** cron harian (Vercel Cron, `GET /api/cron/expire-invitations`)
  menandai undangan lewat `activeUntil` sebagai `EXPIRED`; halaman publik
  menampilkan status kedaluwarsa (bukan 404 mendadak) dan menawarkan
  perpanjangan ke pemilik. Halaman publik **tidak menunggu cron**: undangan yang
  `activeUntil`-nya sudah lewat langsung diperlakukan kedaluwarsa, cron hanya
  merapikan status di DB.

## 7. Keamanan & Audit

- Status `PAID` **hanya** dari webhook terverifikasi; jangan pernah dari query
  param redirect.
- Simpan `raw` payload webhook untuk audit & rekonsiliasi.
- Jangan tampilkan `amount` pembayaran atau info kartu apa pun di halaman publik.
- Rekonsiliasi manual: cocokkan `externalId` dengan dashboard Xendit bila ada
  selisih.

## 8. Lingkungan (env)

```
XENDIT_SECRET_KEY=        # API key (server only)
XENDIT_CALLBACK_TOKEN=    # verifikasi header webhook
CRON_SECRET=              # Bearer token untuk /api/cron/expire-invitations
```

Gunakan **test mode** Xendit saat pengembangan; ganti ke production key hanya di
environment Production (lihat `docs/08`).
