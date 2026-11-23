// Rate limit sederhana berbasis memori untuk endpoint publik (RSVP, ucapan,
// amplop). Lihat docs/04 §3. Untuk produksi multi-instance, ganti dengan store
// terpusat (mis. Upstash Redis via Vercel Marketplace).

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export type RateLimitResult = { ok: boolean; remaining: number; resetAt: number };

/**
 * @param key   identitas unik (mis. `${ip}:${invitationId}:rsvp`)
 * @param limit jumlah maksimum dalam window
 * @param windowMs panjang window dalam milidetik
 */
export function rateLimit(
  key: string,
  limit = 5,
  windowMs = 60_000,
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: limit - 1, resetAt };
  }

  if (bucket.count >= limit) {
    return { ok: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { ok: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}

/** Ambil IP klien dari header request (di balik proxy Vercel). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
