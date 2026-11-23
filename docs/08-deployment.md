# 08 — Deployment

> **Status:** Final v1 · **Tanggal:** 2026-11-23

Deploy ke **Vercel** (Fluid Compute). Database **Neon** via Vercel Marketplace.

---

## 1. Environment di Vercel

Tiga environment: **Development** (lokal), **Preview** (tiap PR/branch),
**Production**.

| Variabel | Development | Preview | Production |
|----------|-------------|---------|------------|
| `DATABASE_URL` | Postgres Docker lokal | Neon (branch/preview DB) | Neon production |
| `AUTH_SECRET` | lokal | set | set (unik) |
| `AUTH_GOOGLE_ID/SECRET` | test OAuth | test | production OAuth |
| `CLOUDINARY_*` | test cloud | test | production |
| `XENDIT_SECRET_KEY` | **test key** | **test key** | **production key** |
| `XENDIT_CALLBACK_TOKEN` | test token | test token | production token |
| `NEXT_PUBLIC_APP_URL` | localhost:3000 | URL preview | domain produksi |

Atur via `vercel env` atau dashboard. **Jangan** pakai Xendit production key di
Preview.

## 2. Database & Migrasi

- Provision Neon lewat Vercel Marketplace (ikuti skill `marketplace`).
- Migrasi dijalankan saat build/deploy: `prisma migrate deploy` (bukan
  `migrate dev`) di Production.
- Pertimbangkan Neon branching untuk DB preview terisolasi.

## 3. Konfigurasi Project (`vercel.ts`)

```ts
import { type VercelConfig } from '@vercel/config/v1';

export const config: VercelConfig = {
  framework: 'nextjs',
  buildCommand: 'prisma generate && prisma migrate deploy && next build',
  crons: [
    // tandai undangan lewat masa aktif sebagai EXPIRED (harian)
    { path: '/api/cron/expire-invitations', schedule: '0 1 * * *' },
  ],
};
```

> Route transkripsi tidak ada di proyek ini; namun jika ada operasi panjang
> (mis. pemrosesan gambar besar), gunakan durasi default Functions (300s) atau
> set `maxDuration` per route sesuai kebutuhan.

## 4. Webhook Xendit (Production)

- Daftarkan URL callback production: `https://<domain>/api/webhooks/xendit`.
- Set `XENDIT_CALLBACK_TOKEN` yang sama di dashboard Xendit & env Vercel.
- Uji dengan invoice test sebelum go-live dengan production key.

## 5. Proteksi & Keamanan Deploy

- **Preview** sebaiknya dilindungi (Vercel Deployment Protection — Vercel
  Authentication) agar data uji tidak publik. **Production** terbuka (halaman
  undangan harus bisa diakses tamu tanpa login), kecuali dashboard yang digate
  Auth.js.
- Webhook endpoint harus tetap dapat diakses Xendit (jangan terkunci di balik
  proteksi preview saat menguji).
- Firewall/WAF Vercel untuk rate limit tambahan bila perlu.

## 6. Domain

- MVP: subdomain/slug di domain utama (`domain.com/u/[slug]`).
- Custom domain per undangan = pasca-MVP (lihat `docs/09` Fase 4).

## 7. Rollback & Rilis

- Gunakan **Rolling Releases** / promote-rollback bawaan Vercel.
- Migrasi DB harus **backward-compatible** saat rolling (hindari drop kolom yang
  masih dipakai versi lama). Pola: tambah kolom → deploy → backfill → baru hapus
  di rilis berikutnya.
- Simpan backup DB sebelum migrasi besar.

## 8. Checklist Go-Live

- [ ] Env Production lengkap (termasuk Xendit **production** key & callback token).
- [ ] Webhook production terdaftar & teruji.
- [ ] OAuth Google production (redirect URI domain produksi) aktif.
- [ ] Cron expire-invitations aktif.
- [ ] Minimal 1 template produksi di-seed.
- [ ] Uji end-to-end: buat → bayar (nominal kecil real) → publish → RSVP.
- [ ] `typecheck`, `lint`, `build` hijau di CI.
