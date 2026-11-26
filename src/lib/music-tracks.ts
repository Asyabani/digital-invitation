/*
  Backsound bawaan.

  Semua berkas di bawah berasal dari koleksi **Musopen – The Complete Chopin
  Collection** di Internet Archive, berlisensi **CC0 1.0 Universal** (domain
  publik, bebas komersial, tanpa kewajiban atribusi):
  https://archive.org/details/musopen-chopin

  Karya Chopin sendiri sudah domain publik; rekaman Musopen dilepas CC0, jadi
  dua lapis hak ciptanya bersih. Tiap URL sudah diperiksa mengembalikan
  `audio/mpeg` dan mendukung range request.

  CATATAN PRODUKSI: saat ini berkasnya di-hotlink dari archive.org. Internet
  Archive mengizinkannya, tapi kecepatannya di luar kendali kita dan bisa
  lambat dari Indonesia. Begitu Cloudinary aktif, unduh berkas-berkas ini dan
  layani dari sana — cukup ganti `url` di bawah, tidak ada kode lain yang
  perlu berubah.

  Modul ini murni (tanpa impor apa pun) supaya bisa dipakai komponen klien,
  Server Component, maupun skrip seed.
*/

export type MusicTrack = {
  /** Kunci stabil; dipakai editor untuk menandai pilihan yang sedang aktif. */
  key: string;
  /** Nama yang dilihat pemilik. */
  title: string;
  /** Satu kata suasana, supaya pemilik tidak perlu tahu repertoar klasik. */
  mood: string;
  url: string;
  /**
   * Ukuran berkas dalam MB, dibulatkan. Ditampilkan di editor: tamu membuka
   * undangan dari HP dengan kuota, dan pemilik berhak tahu lagu mana yang
   * membuat undangannya lebih berat.
   */
  sizeMb: number;
};

const ARSIP = "https://archive.org/download/musopen-chopin";

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    key: "nocturne-9-2",
    title: "Nocturne Op. 9 No. 2 — Chopin",
    mood: "Syahdu",
    url: `${ARSIP}/Nocturne%20Op.%209%20no.%202%20in%20E%20flat%20major.mp3`,
    sizeMb: 5.4,
  },
  {
    key: "prelude-7",
    title: "Prelude Op. 28 No. 7 — Chopin",
    mood: "Tenang",
    url: `${ARSIP}/Prelude%20Op.%2028%20no.%207.mp3`,
    sizeMb: 3.3,
  },
  {
    key: "prelude-13",
    title: "Prelude Op. 28 No. 13 — Chopin",
    mood: "Hangat",
    url: `${ARSIP}/Prelude%20Op.%2028%20no.%2013.mp3`,
    sizeMb: 3.2,
  },
  {
    key: "prelude-23",
    title: "Prelude Op. 28 No. 23 — Chopin",
    mood: "Ringan",
    url: `${ARSIP}/Prelude%20Op.%2028%20no.%2023.mp3`,
    sizeMb: 1.2,
  },
  {
    key: "valse-18",
    title: "Grande Valse Brillante Op. 18 — Chopin",
    mood: "Riang",
    url: `${ARSIP}/Grande%20Valse%20Brilliante%20Op.18%20In%20E%20flat%20major.mp3`,
    sizeMb: 6.9,
  },
];

/** Lagu bawaan yang cocok untuk satu suasana; dipakai katalog template. */
export function trackUrl(key: string): string | undefined {
  return MUSIC_TRACKS.find((t) => t.key === key)?.url;
}

/** Lagu bawaan yang URL-nya cocok, untuk menandai pilihan aktif di editor. */
export function trackByUrl(url: string | undefined): MusicTrack | undefined {
  if (!url) return undefined;
  return MUSIC_TRACKS.find((t) => t.url === url);
}
