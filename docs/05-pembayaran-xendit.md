# 05 — Pipeline Pembayaran (Xendit)

> **Status:** Final v1 · **Tanggal:** 2026-11-23

Mendeskripsikan alur **trial → bayar → publish** dan masa aktif. Model
**one-time payment** (Xendit Invoice API), bukan subscription recurring.

---

## 1. Konsep

- Undangan `DRAFT` = mode **trial**: bisa diedit & dipreview, berwatermark, slug
  publik belum aktif.
- **Publish** butuh satu pembayaran sukses. Setelah `PAID`, undangan
  `PUBLISHED`, watermark hilang, slug aktif, `activeUntil = now + 6 bulan`.
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
  - `success_redirect_url`: `/dashboard/[id]?pay=success`
  - `failure_redirect_url`: `/dashboard/[id]?pay=failed`
- Simpan `externalId` = `invoice.id`, `invoiceUrl` = `invoice.invoice_url`.

> Redirect `success` **tidak** mem-publish undangan. Ia hanya memberi tahu user;
> publish terjadi lewat webhook. UI dashboard menampilkan "menunggu konfirmasi
> pembayaran" sampai webhook tiba.

## 5. Webhook (`POST /api/webhooks/xendit`)

Wajib:
1. **Verifikasi** `x-callback-token` == `XENDIT_CALLBACK_TOKEN`. Gagal → `401`.
2. **Idempoten:** cari `Payment` by `externalId`; jika sudah `PAID`, abaikan
   (balas `200`) agar webhook ganda tidak dobel menambah masa aktif.
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
- **Expiry:** cron harian (Vercel Cron) menandai undangan lewat `activeUntil`
  sebagai `EXPIRED`; halaman publik menampilkan status kedaluwarsa (bukan 404
  mendadak) dan menawarkan perpanjangan ke pemilik.

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
```

Gunakan **test mode** Xendit saat pengembangan; ganti ke production key hanya di
environment Production (lihat `docs/08`).
