// Generator slug unik untuk undangan & tamu. Lihat docs/03 §5.

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // buang diakritik
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * Menghasilkan slug unik berdasarkan `base`, menambah suffix bila bentrok.
 * `exists` memeriksa keberadaan slug (mis. query DB).
 */
export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
  fallback = "undangan",
): Promise<string> {
  const root = slugify(base) || fallback;
  if (!(await exists(root))) return root;
  for (let i = 2; i < 1000; i++) {
    const candidate = `${root}-${i}`;
    if (!(await exists(candidate))) return candidate;
  }
  // fallback sangat jarang
  return `${root}-${Date.now().toString(36)}`;
}
