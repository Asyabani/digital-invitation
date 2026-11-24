# 04 — API Spec (Final)

> **Status:** Final v1 · **Tanggal:** 2026-11-23
>
> Nama Server Action, path Route Handler, dan payload di bawah **WAJIB diikuti
> persis**. Perubahan harus memperbarui dokumen ini lebih dulu.

---

## 1. Pembagian

- **Server Actions** (`src/lib/actions/`) — mutasi milik pemilik, butuh sesi
  Auth.js. Dipanggil dari komponen dashboard.
- **Route Handlers** (`src/app/api/`) — endpoint tanpa sesi: aksi tamu (RSVP,
  ucapan, amplop) + webhook Xendit.

Semua input divalidasi **Zod**. Endpoint publik wajib **rate limit** + cek
bahwa undangan `PUBLISHED` dan belum `EXPIRED`.

---

## 2. Server Actions (butuh sesi pemilik)

Setiap action memverifikasi `session.user.id === invitation.userId`.

### Undangan
- `createInvitation(input: { templateId: string, title: string })`
  → buat `Invitation` `DRAFT` dari template, generate `slug`. Return `{ id }`.
- `updateInvitationContent(input: { id: string, content: ContentSchema })`
  → validasi Zod, simpan `content`, revalidate preview.
- `updateInvitationTheme(input: { id: string, themeConfig: ThemeSchema })`
- `updateSectionsOrder(input: { id: string, sectionsOrder: SectionsSchema })`
- `updateGiftConfig(input: { id: string, giftConfig: GiftConfigSchema })`
- `updateSlug(input: { id: string, slug: string })` → hanya jika paket mengizinkan;
  cek keunikan.
- `unpublishInvitation(id)` → set `DRAFT` (tautan publik mati). Paket &
  `activeUntil` dipertahankan.
- `republishInvitation(id)` → aktifkan lagi undangan yang **sudah dibayar** dan
  masa aktifnya belum habis. Tidak pernah bisa menerbitkan undangan yang belum
  dibayar (publish pertama hanya lewat webhook).
- `deleteInvitation(input: { id: string })`

### Tamu
- `addGuest(input: { invitationId, name, category? })`
  → generate `personalSlug` unik. Return guest.
- `importGuests(input: { invitationId, rows: { name, category? }[] })`
  → batch; skip/append suffix untuk slug bentrok.
- `updateGuest(input: { id, name?, category? })`
- `deleteGuest(input: { id })`
- `markGuestSent(input: { id })` → **toggle** `sentAt` (isi `now()` bila kosong,
  kosongkan bila sudah terisi) sehingga pemilik bisa membatalkan salah tandai.

> Semua aksi tamu menolak undangan yang paketnya tidak memuat `personalLinks`
> (Basic). Saat masih trial (`package = null`) fitur ini boleh dicoba — lihat
> `canUse()` di `src/lib/packages.ts`.

### Moderasi & rekap
- `moderateGreeting(input: { id, status: "APPROVED" | "REJECTED" })`
  → ubah status; revalidate halaman publik.
- `getDashboardSummary(invitationId)` → ringkasan RSVP/ucapan/amplop.
  **Bukan** Server Action: diimplementasikan sebagai fungsi baca sisi server di
  `src/lib/summary.ts` dan dipanggil langsung dari RSC, agar tidak menambah
  endpoint yang bisa dipanggil dari luar. Pemanggil wajib sudah memverifikasi
  kepemilikan undangan.

### Pembayaran (detail di docs/05)
- `createPayment(input: { invitationId, package: Package })`
  → buat `Payment` `PENDING`, panggil Xendit create invoice, simpan `externalId`
    & `invoiceUrl`. Return `{ invoiceUrl }`.
- `extendInvitation(input: { invitationId, package })`
  → seperti createPayment untuk perpanjangan masa aktif.

---

## 3. Route Handlers (publik)

Semua endpoint publik:
1. Cari `Invitation` by `id` (atau `slug`), pastikan `status = PUBLISHED` &
   `activeUntil > now`.
2. Rate limit per IP + per undangan.
3. Validasi body dengan Zod.

### `POST /api/invitations/[id]/rsvp`
Body:
```json
{ "name": "Budi", "status": "HADIR", "headcount": 2, "message": "Selamat!", "personalSlug": "budi-santoso" }
```
- `personalSlug` opsional → jika ada, hubungkan ke `Guest`.
- Buat/perbarui `Rsvp`. Return `{ ok: true }`.

### `POST /api/invitations/[id]/greetings`
Body:
```json
{ "name": "Budi", "message": "Semoga bahagia", "personalSlug": "budi-santoso" }
```
- Jalankan filter kata (`src/lib/moderation.ts`).
- Simpan `Greeting` `PENDING` (tidak langsung tampil). Return `{ ok: true }`.

### `POST /api/invitations/[id]/gifts`
Body:
```json
{ "name": "Budi", "method": "TRANSFER", "amount": 200000, "proofUrl": "https://...", "note": "" }
```
- Simpan `GiftConfirmation`. `amount` **tidak** pernah dikembalikan ke publik.
- Return `{ ok: true }` (tanpa echo nominal).
- `404` bila paket undangan tidak memuat `giftEnvelope` (Basic) — sama seperti
  undangan yang tidak tersedia, agar tidak membocorkan konfigurasi paket.

### `GET /api/invitations/[id]/greetings` (publik, read)
- Hanya `Greeting` `status = APPROVED`, paginated. Untuk menampilkan ucapan di
  halaman publik tanpa membocorkan yang `PENDING`/`REJECTED`.

### `POST /api/webhooks/xendit`
- Verifikasi header `x-callback-token` == `XENDIT_CALLBACK_TOKEN`. Jika tidak
  cocok → `401`.
- Petakan event invoice → update `Payment` (`PAID`/`EXPIRED`/`FAILED`).
- Jika `PAID`: set `Invitation.status = PUBLISHED`, `activeUntil = now + 6 bln`,
  `publishedAt = now`, simpan `paidAt` & `raw`. Revalidate `/u/[slug]`.
- Selalu balas `200` cepat setelah verifikasi (idempoten: cek `externalId` &
  status agar webhook ganda tidak dobel-proses).

### `GET /api/cron/expire-invitations`
- Dipanggil **Vercel Cron** harian (lihat `vercel.ts` & `docs/08` §3).
- Autentikasi: header `Authorization: Bearer $CRON_SECRET`. Tidak cocok → `401`.
  Di Production, `CRON_SECRET` yang kosong → `500` (endpoint menolak jalan).
- Menandai `Invitation` `PUBLISHED` yang `activeUntil < now` sebagai `EXPIRED`
  dan me-revalidate halaman publiknya.
- Return `{ ok: true, data: { expired: number } }`.

Detail lengkap alur pembayaran ada di `docs/05-pembayaran-xendit.md`.

---

## 4. Halaman (bukan API, tapi kontrak route)

| Route | Render | Akses |
|-------|--------|-------|
| `/` | Static | Publik (marketing) |
| `/harga` | Static | Publik (daftar paket dari `src/lib/packages.ts`) |
| `/template` | ISR | Publik (galeri template) |
| `/dashboard` | RSC | Login |
| `/dashboard/[id]/edit` | RSC + Server Actions | Login (pemilik) |
| `/dashboard/[id]/tema` | RSC + Server Actions | Login |
| `/dashboard/[id]/tamu` | RSC + Server Actions | Login |
| `/dashboard/[id]/rsvp` | RSC | Login |
| `/dashboard/[id]/ucapan` | RSC + Server Actions | Login |
| `/dashboard/[id]/amplop` | RSC | Login |
| `/u/[slug]` | SSR + ISR | Publik (gated jika DRAFT) |

## 5. Konvensi Response & Error

- Sukses: `{ ok: true, data? }`. Error: `{ ok: false, error: string }` + status
  HTTP sesuai (`400` validasi, `401` auth/webhook, `403` bukan pemilik, `404`
  tidak ada/draft, `429` rate limit).
- Jangan bocorkan apakah undangan ada saat `DRAFT` ke publik → perlakukan `404`.
  > **Catatan implementasi (Next 16 Cache Components):** `/u/[slug]` memakai
  > Partial Prerendering, sehingga shell terkirim lebih dulu dan `notFound()`
  > menghasilkan **status 200 dengan body halaman 404** (soft 404). Tidak ada
  > kebocoran data: undangan draft dan slug yang tidak ada menghasilkan respons
  > identik. Status 404 sebenarnya akan dikaji ulang saat `/u/[slug]` pindah ke
  > `"use cache"`/ISR (docs/02 ADR-007).
