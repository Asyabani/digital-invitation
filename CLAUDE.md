# Undangan Digital

Platform web untuk membuat **undangan digital yang dapat dikustomisasi** (nikah, aqiqah, ulang tahun, acara korporat), menyasar pasar Indonesia. Model bisnis **B2C one-time per event**: user membuat & mengedit gratis (mode trial berwatermark), lalu membayar sekali untuk mem-*publish* dan membuka fitur premium.

**Status saat ini: Fase 3 (fitur lanjutan) SELESAI.** Fase 0–3 beres: fondasi, MVP inti (template → editor → `/u/[slug]` → RSVP → buku tamu + moderasi), monetisasi (**trial → bayar → publish** via Xendit: invoice, webhook idempoten, paket, masa aktif 6 bulan, watermark per paket, cron kedaluwarsa), dan fitur Should (editor tema + toggle/urutan section, kelola tamu + link personal + share WhatsApp + import massal, amplop digital, dashboard rekap, add-to-calendar, musik latar). Semua `typecheck`/`lint`/`build` hijau; jalur publik, webhook, dan privasi data terverifikasi end-to-end di lokal. Sebelum menulis kode, baca dokumen desain di `docs/`. Fase berikutnya: Fase 4 (pasca-MVP — section builder drag-drop, custom domain, analytics) — lihat `docs/09-roadmap.md`.

Setup lokal:

```bash
pnpm install && pnpm db:up && pnpm db:migrate && pnpm db:seed && pnpm dev
```

Yang **wajib** untuk menjalankan editor hanya `DATABASE_URL` (Postgres). Kunci Xendit & Cloudinary baru dibutuhkan untuk alur publish/pembayaran dan upload galeri; tanpa keduanya, editor + preview tetap jalan dalam mode trial.

## Peta dokumentasi

| Dokumen | Isi |
|---|---|
| `docs/01-prd.md` | Kebutuhan produk, user stories + acceptance criteria, MoSCoW, metrik, risiko |
| `docs/02-arsitektur.md` | Arsitektur sistem, ADR, struktur folder yang direncanakan |
| `docs/03-data-model.md` | Skema Postgres/Prisma final (nama tabel & kolom WAJIB diikuti persis) |
| `docs/04-api-spec.md` | Server Actions + Route Handlers + webhook final (nama & path WAJIB diikuti persis) |
| `docs/05-pembayaran-xendit.md` | Pipeline trial → bayar → publish via Xendit, webhook, masa aktif |
| `docs/06-ui-ux.md` | Spesifikasi halaman, komponen, interaksi, copywriting |
| `docs/07-setup-development.md` | Setup dev dari nol (scaffold, integrasi, env, migrasi) |
| `docs/08-deployment.md` | Deploy ke Vercel, env per environment, proteksi, rollback |
| `docs/09-roadmap.md` | Fase 0–4 dengan checklist tugas & definition of done |

## Keputusan kunci (ringkas)

- **Model bisnis:** B2C one-time per event. Trial gratis (watermark, slug belum aktif) → bayar sekali → publish. "Recurring" diwakili **masa aktif undangan** (default 6 bulan); perpanjangan = pembayaran baru. **Bukan** subscription recurring API.
- **Kustomisasi Level 2:** pilih template, isi konten, atur tema (warna/font/musik) + urutan section (toggle & reorder). Full canvas editor (Level 4) adalah non-goal MVP.
- **Stack:** Next.js 16 App Router + TypeScript strict + Tailwind v4 + shadcn/ui; package manager **pnpm**.
- **DB:** Postgres (Neon via Vercel Marketplace) + **Prisma ORM**; migrasi `prisma migrate`.
- **Auth:** Auth.js (NextAuth) — Google + email magic link. Hanya **pemilik acara** yang login; tamu tidak perlu akun.
- **Storage gambar:** Cloudinary (upload galeri + transformasi/optimasi otomatis). Alternatif: Vercel Blob.
- **Pembayaran:** Xendit (Invoice API) — one-time payment, dukung QRIS/VA/e-wallet. Webhook memverifikasi header `x-callback-token`.
- **Hosting:** Vercel (Fluid Compute).
- **Dua konteks data yang TIDAK boleh bocor ke publik:** daftar tamu lengkap dan nominal amplop digital. API publik hanya meng-expose data minimum.
- **Halaman publik `/u/[slug]`** harus cepat (dibuka dari WhatsApp di HP): SSR + ISR cache, optimasi gambar, lazy-load musik & galeri.

## Catatan operasional (mudah salah)

- **Port DB dev = 5435** (bukan 5432). Port 5432–5434 dipakai Postgres project lain di mesin ini (kartinis dll); mitu pakai 55432. Lihat `docker-compose.yml` & `.env.local`.
- **Prisma 7** memakai **driver adapter** — `url` TIDAK di `schema.prisma`; koneksi migrasi via `prisma.config.ts` (`datasource.url`), dan `PrismaClient` dibuat dengan `PrismaPg` adapter (`src/lib/db.ts`). Paket `prisma` CLI & `@prisma/client` harus **versi sama** (7.10.1); `pnpm add prisma` sempat menarik RC v8 — pin ke `@7`.
- **pnpm memblokir build script** Prisma — sudah diizinkan via `pnpm.onlyBuiltDependencies` di `package.json`.
- **Jangan pakai `dotenv -e` di script** — `dotenv@18` menimpa bin `dotenv-cli`. `prisma.config.ts` & `prisma/seed.ts` memuat `.env.local` sendiri lewat `import "dotenv"`.
- **Next 16 Cache Components aktif** (`cacheComponents: true` di `next.config.ts`). Halaman yang membaca sesi/DB per-request harus `export const instant = false` (atau bungkus Suspense / `"use cache"`), kalau tidak build gagal saat prerender. Halaman publik `/u/[slug]` nanti pakai ISR/`use cache` (docs/02 ADR-007).
- **Node 22** di mesin ini (docs menyebut 24 LTS; 22 aman untuk dev).
- **Soft 404 di `/u/[slug]`** — karena PPR mengirim shell lebih dulu, `notFound()` menghasilkan **status 200 dengan body halaman 404**. Bukan kebocoran (draft & slug tak dikenal identik), tapi jangan uji dengan `curl -w "%{http_code}"` lalu menyimpulkan undangan draft bocor. Lihat catatan di `docs/04` §5.
- **`pnpm dev` bisa gagal `Too many open files`** di mesin ini (`fs.inotify.max_user_instances` = 128 dipakai dev server project lain). Tutup dev server lain, atau uji lewat `pnpm build && PORT=xxxx pnpm start`.
- **Status bayar hanya dari webhook.** Jangan pernah menetapkan `PAID`/`PUBLISHED` dari redirect `?pay=success` — itu cuma pesan UI.
- **Gating fitur paket lewat `canUse()`** di `src/lib/packages.ts`, bukan `if (package === ...)` yang tersebar. Saat trial (`package = null`) semua fitur boleh dicoba KECUALI `removeWatermark`.
- **UI punya dua dunia visual** (lihat `docs/06` §0): dashboard/marketing pakai token shadcn + Geist/Playfair; halaman undangan pakai `themeConfig` tiap undangan lewat kelas `.inv-*`. Jangan mencampur keduanya, dan jangan pakai kelas warna Tailwind mentah (`text-neutral-500`, `bg-green-50`) di dashboard.
- **Font undangan harus benar-benar dimuat.** `HEADING_FONTS`/`BODY_FONTS` di `src/lib/font-stacks.ts` adalah satu-satunya daftar yang boleh ditawarkan editor tema; menambah nama tanpa mendeklarasikannya di `fonts-invitation.ts` membuat pilihan pemilik diam-diam jatuh ke font bawaan browser. Font undangan sengaja dipisah dari `fonts.ts` agar halaman marketing tidak ikut mengunduhnya.
- **Jangan taruh font di `@theme inline`** — Tailwind v4 menyelesaikannya saat parse, sehingga variabel runtime dari `next/font` tidak terbaca. Pasang di `@layer base` sebagai CSS biasa.
- **Helper owner ada di `src/lib/owner.ts`** (`ownInvitation`, `ownGuest`) — sengaja di luar file `"use server"`, karena setiap export di file `"use server"` menjadi endpoint yang bisa dipanggil dari browser.

## Konvensi

- Dokumen, UI, dan copywriting berbahasa Indonesia; identifier kode/DB/API berbahasa Inggris.
- Jangan menambah tabel, route, halaman, atau Server Action di luar daftar final di `docs/03` dan `docs/04` tanpa memperbarui dokumennya lebih dulu.
- Jangan commit file rahasia (`.env`, kredensial Xendit/Cloudinary).
