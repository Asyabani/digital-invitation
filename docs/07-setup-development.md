# 07 — Setup Development

> **Status:** Final v1 · **Tanggal:** 2026-11-23

Panduan menyiapkan proyek dari nol. Ikuti berurutan. Fase pengerjaan ada di
`docs/09-roadmap.md`.

---

## 1. Prasyarat

- Node.js 24 LTS
- pnpm (`corepack enable && corepack prepare pnpm@latest --activate`)
- Docker (Postgres lokal untuk dev)
- Akun: Vercel, Neon (via Marketplace), Cloudinary, Xendit (test mode), Google
  Cloud (OAuth credential untuk login Google)

## 2. Scaffold (Fase 0)

```bash
# dari dalam folder proyek
pnpm dlx create-next-app@latest . --ts --app --tailwind --eslint --src-dir --use-pnpm
pnpm add @prisma/client zod next-auth @auth/prisma-adapter
pnpm add -D prisma
pnpm add cloudinary
# shadcn/ui
pnpm dlx shadcn@latest init
```

> Catatan: scaffold di folder kosong. `docs/` dan file dokumen root sudah ada —
> `create-next-app` tidak akan menimpa yang berbeda, tapi review hasilnya.

## 3. Environment Variables

Buat `.env.example` (commit) dan `.env.local` (JANGAN commit):

```bash
# --- Database ---
DATABASE_URL=postgresql://user:pass@localhost:5432/undangan   # dev lokal
# produksi: connection string Neon

# --- Auth.js ---
AUTH_SECRET=                 # pnpm dlx auth secret
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
# Email magic link (opsional provider SMTP/Resend)
AUTH_RESEND_KEY=

# --- Cloudinary ---
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=

# --- Xendit (test mode saat dev) ---
XENDIT_SECRET_KEY=
XENDIT_CALLBACK_TOKEN=

# --- App ---
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Minimal untuk menjalankan **editor + preview** hanya `DATABASE_URL` (+
`AUTH_SECRET` untuk login). Xendit & Cloudinary dibutuhkan untuk publish & upload
galeri.

## 4. Database Lokal

Tambahkan skrip di `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "typecheck": "tsc --noEmit",
    "lint": "next lint",
    "db:up": "docker compose up -d db",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts"
  }
}
```

`docker-compose.yml` (dev):

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: undangan
    ports: ["5432:5432"]
    volumes: ["dbdata:/var/lib/postgresql/data"]
volumes: { dbdata: {} }
```

Lalu:

```bash
pnpm db:up
# salin skema dari docs/03 ke prisma/schema.prisma
pnpm db:migrate
pnpm db:seed      # isi template contoh
```

## 5. Integrasi Kunci

- **Prisma client** di `src/lib/db.ts` (singleton, hindari koneksi berlebih di dev).
- **Auth.js** di `src/lib/auth.ts` (PrismaAdapter, provider Google + Resend/email).
- **Cloudinary** di `src/lib/cloudinary.ts` (signed upload dari dashboard).
- **Xendit** di `src/lib/xendit.ts` (create invoice + verifikasi callback token).
- **Webhook Xendit lokal:** gunakan tunnel (mis. `cloudflared`/`ngrok`) dan daftarkan
  URL callback di dashboard Xendit test mode; set `XENDIT_CALLBACK_TOKEN`.

## 6. Seed Template

`prisma/seed.ts` mengisi 1–3 `Template` awal dengan `defaultContent`,
`defaultTheme`, `defaultSections` yang valid terhadap skema Zod (`docs/03` §4).
Minimal satu template kategori "pernikahan" untuk MVP.

## 7. Verifikasi Lokal

Sebelum menganggap tugas selesai, jalankan:

```bash
pnpm typecheck && pnpm lint && pnpm build
```

Uji alur minimal:
1. Login → buat undangan dari template.
2. Isi konten + tema → preview tampil (watermark).
3. (Test Xendit) publish → bayar test → webhook → undangan `PUBLISHED`.
4. Buka `/u/[slug]?to=<personalSlug>` → nama tamu tampil, RSVP & ucapan masuk.
5. Moderasi ucapan di dashboard → ucapan `APPROVED` tampil publik.

## 8. Troubleshooting

- **Migrasi tak membaca env:** pastikan `DATABASE_URL` ter-load (gunakan
  `dotenv -e .env.local -- prisma migrate ...` bila perlu).
- **Webhook tak masuk:** cek tunnel aktif, URL callback terdaftar, dan
  `XENDIT_CALLBACK_TOKEN` cocok.
- **Gambar gagal upload:** cek kredensial Cloudinary & preset signed upload.
