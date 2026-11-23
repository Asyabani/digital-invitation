// Moderasi buku tamu: filter kata kasar sederhana. Ucapan baru selalu PENDING
// (lihat docs/03 & docs/04); filter ini hanya lapisan tambahan untuk auto-flag.
// Daftar kata dapat diperluas kemudian.

const BLOCKLIST = [
  // daftar minimal; perluas sesuai kebutuhan
  "anjing",
  "bangsat",
  "kontol",
  "memek",
  "babi",
  "goblok",
];

export function containsProfanity(text: string): boolean {
  const normalized = text.toLowerCase();
  return BLOCKLIST.some((word) => normalized.includes(word));
}

/** Sensor kata terlarang menjadi bintang, untuk tampilan bila tetap ditampilkan. */
export function censor(text: string): string {
  let out = text;
  for (const word of BLOCKLIST) {
    out = out.replace(new RegExp(word, "gi"), "*".repeat(word.length));
  }
  return out;
}
