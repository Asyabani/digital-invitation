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
- `deleteInvitation(input: { id: string })`

### Tamu
- `addGuest(input: { invitationId, name, category? })`
  → generate `personalSlug` unik. Return guest.
- `importGuests(input: { invitationId, rows: { name, category? }[] })`
  → batch; skip/append suffix untuk slug bentrok.
- `updateGuest(input: { id, name?, category? })`
- `deleteGuest(input: { id })`
- `markGuestSent(input: { id })` → set `sentAt = now()`.

### Moderasi & rekap
- `moderateGreeting(input: { id, status: "APPROVED" | "REJECTED" })`
  → ubah status; revalidate halaman publik.
- `getDashboardSummary(invitationId)` → ringkasan RSVP/ucapan/amplop (read).

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

Detail lengkap alur pembayaran ada di `docs/05-pembayaran-xendit.md`.

---

## 4. Halaman (bukan API, tapi kontrak route)

| Route | Render | Akses |
|-------|--------|-------|
| `/` | Static/ISR | Publik (marketing) |
| `/harga` | Static | Publik |
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
