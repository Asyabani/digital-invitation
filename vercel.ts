import { type VercelConfig } from "@vercel/config/v1";

// Konfigurasi project Vercel — lihat docs/08-deployment.md §3.
export const config: VercelConfig = {
  framework: "nextjs",
  buildCommand: "prisma generate && prisma migrate deploy && next build",
  crons: [
    // Tandai undangan yang lewat masa aktif sebagai EXPIRED (harian, 01:00 UTC).
    { path: "/api/cron/expire-invitations", schedule: "0 1 * * *" },
  ],
};

export default config;
