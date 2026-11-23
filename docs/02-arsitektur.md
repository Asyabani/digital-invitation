# 02 — Arsitektur Sistem

> **Status:** Final v1 · **Tanggal:** 2026-11-23

---

## 1. Gambaran Umum

Aplikasi monolith Next.js (App Router) yang melayani tiga "wajah" dari satu
codebase:

1. **Marketing/landing** — publik, SEO, galeri template, halaman harga.
2. **Dashboard editor** — butuh login (pemilik acara saja).
3. **Halaman undangan publik** — `/u/[slug]`, dibuka tamu, harus cepat.

```
                       ┌─────────────────────────────────────┐
   Tamu (HP/WA) ─────▶ │  Next.js (Vercel, Fluid Compute)    │
   Pemilik (login) ──▶ │  ├─ Marketing (RSC, static/ISR)     │
                       │  ├─ Dashboard (RSC + Server Actions)│
                       │  ├─ /u/[slug] (SSR + ISR cache)     │
                       │  └─ Route Handlers (publik+webhook) │
                       └───────┬───────────────┬─────────────┘
                               │               │
                     ┌─────────▼──────┐  ┌─────▼───────┐
                     │ Postgres (Neon)│  │  Cloudinary │
                     │  via Prisma    │  │  (gambar)   │
                     └────────────────┘  └─────────────┘
                               │
                     ┌─────────▼──────┐
                     │ Xendit (Invoice)│◀── webhook ──┐
                     └─────────────────┘              │
                               └── callback ──────────┘
```

## 2. Keputusan Arsitektur (ADR ringkas)

### ADR-001 — Monolith Next.js App Router
Satu codebase untuk marketing, dashboard, halaman publik, dan API. Alasan:
tim kecil, deploy sederhana, SSR+ISR untuk SEO & kecepatan halaman publik,
Server Actions mengurangi boilerplate API untuk dashboard.

### ADR-002 — Postgres + Prisma
Data relasional (undangan ↔ tamu ↔ rsvp ↔ pembayaran) cocok untuk Postgres.
Prisma dipilih atas Drizzle untuk DX & migrasi yang matang pada tim yang baru
memulai. Koneksi via Neon serverless driver di produksi.
**Konsekuensi:** data semi-struktur (konten & tema undangan) disimpan sebagai
kolom `Json` agar fleksibel tanpa migrasi tiap perubahan template.

### ADR-003 — Konten & tema sebagai JSON
`Invitation.content`, `Invitation.themeConfig`, dan `Invitation.sectionsOrder`
disimpan sebagai `Json`. Alasan: kustomisasi Level 2 bervariasi antar template;
kolom kaku akan memaksa migrasi terus-menerus. Skema JSON divalidasi di aplikasi
dengan **Zod** (lihat `docs/03`). Saat naik ke Level 3 (section builder), skema
JSON tinggal diperkaya.

### ADR-004 — Auth hanya untuk pemilik
Tamu tidak login — RSVP/ucapan/amplop lewat endpoint publik + rate limit. Hanya
pemilik acara yang butuh akun (Auth.js, Google + email magic link). Mengurangi
friksi tamu dan permukaan serangan auth.

### ADR-005 — Pembayaran one-time via Xendit Invoice
Bukan subscription recurring. Tiap publish/perpanjangan membuat satu invoice.
Webhook (`x-callback-token`) adalah satu-satunya sumber kebenaran status bayar.
Alasan: pasar ID butuh QRIS/VA/e-wallet; model per-event lebih pas daripada
langganan bulanan.

### ADR-006 — Server Actions untuk dashboard, Route Handlers untuk publik & webhook
Mutasi milik pemilik (butuh sesi) pakai Server Actions (type-safe, tanpa API
boilerplate). Endpoint yang diakses tanpa sesi (RSVP, ucapan, amplop, webhook
Xendit) pakai Route Handlers agar bisa dipanggil dari form publik & pihak ketiga.

### ADR-007 — Halaman publik di-cache (ISR) + revalidate on-publish
`/u/[slug]` memakai ISR; di-`revalidate` saat konten/tema berubah atau saat
publish. Data interaktif (ucapan yang sudah di-approve) boleh di-fetch dengan
revalidate pendek. Alasan: tamu membuka massal saat hari-H; cache mencegah
beban DB berlebih.

## 3. Struktur Folder (rencana)

```
digital_invitation/
├── docs/                      # dokumen desain (ini)
├── prisma/
│   ├── schema.prisma          # skema final (docs/03)
│   └── migrations/
├── public/                    # aset statis, template preview
├── src/
│   ├── app/
│   │   ├── (marketing)/       # landing, harga, galeri template
│   │   │   ├── page.tsx
│   │   │   ├── harga/
│   │   │   └── template/
│   │   ├── (dashboard)/       # butuh login
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx            # daftar undangan
│   │   │   │   └── [id]/
│   │   │   │       ├── edit/           # editor konten
│   │   │   │       ├── tema/           # editor tema
│   │   │   │       ├── tamu/           # kelola tamu
│   │   │   │       ├── rsvp/           # rekap RSVP
│   │   │   │       ├── ucapan/         # moderasi buku tamu
│   │   │   │       └── amplop/         # konfirmasi kado
│   │   │   └── layout.tsx
│   │   ├── u/
│   │   │   └── [slug]/page.tsx         # halaman undangan publik
│   │   ├── api/
│   │   │   ├── invitations/[id]/rsvp/route.ts
│   │   │   ├── invitations/[id]/greetings/route.ts
│   │   │   ├── invitations/[id]/gifts/route.ts
│   │   │   └── webhooks/xendit/route.ts
│   │   └── layout.tsx
│   ├── components/            # shadcn/ui + komponen domain
│   │   ├── ui/                # shadcn
│   │   ├── editor/            # komponen editor dashboard
│   │   └── invitation/        # section undangan publik (cover, rsvp, dll)
│   ├── lib/
│   │   ├── db.ts             # Prisma client (singleton)
│   │   ├── auth.ts           # konfigurasi Auth.js
│   │   ├── actions/          # Server Actions
│   │   ├── xendit.ts         # klien Xendit + verifikasi webhook
│   │   ├── cloudinary.ts     # upload/transform gambar
│   │   ├── slug.ts           # generator slug unik
│   │   ├── moderation.ts     # filter kata + helper moderasi
│   │   ├── ratelimit.ts      # rate limit endpoint publik
│   │   └── validation/       # skema Zod (content, theme, dll)
│   └── types/
├── .env.example
├── vercel.ts                  # konfigurasi project (@vercel/config)
└── package.json
```

## 4. Lintas Potong (cross-cutting)

- **Validasi:** semua input (form & API) lewat Zod. Skema JSON `content`/`theme`
  divalidasi sebelum simpan.
- **Rate limit & anti-spam:** endpoint publik (RSVP, ucapan, amplop) wajib rate
  limit (per IP + per undangan) dan moderasi.
- **Keamanan:** webhook Xendit diverifikasi; status `PAID` hanya dari webhook;
  data tamu/nominal tidak di-expose publik.
- **Observability:** log webhook & kegagalan pembayaran; simpan `raw` payload
  webhook di `Payment.raw`.
- **i18n:** UI Indonesia; identifier kode/DB/API Inggris.

## 5. Alur Request Kunci

**Tamu buka undangan:** WA → `/u/[slug]?to=budi` → RSC render (ISR cache) →
nama tamu diambil dari `?to` → tampil. Interaksi (RSVP/ucapan) POST ke Route
Handler → validasi → simpan → revalidate bagian terkait.

**Pemilik publish:** klik "Publish" (Server Action) → buat `Payment` `PENDING`
→ create Xendit invoice → redirect ke halaman bayar → (user bayar) → Xendit
webhook → verifikasi → `Payment=PAID` → `Invitation=PUBLISHED`, set `activeUntil`
→ revalidate `/u/[slug]`.
