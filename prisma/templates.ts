/*
  Katalog template bawaan — 10 per kategori.

  Template hanya titik awal: pemilik bisa mengubah warna, font, urutan bagian,
  dan setiap kata setelahnya. Yang membedakan satu template dari yang lain di
  sini adalah PALET + PASANGAN FONT + SET BAGIAN yang masuk akal untuk
  kategorinya. Sebelumnya ketiga template contoh berbagi tema yang persis sama,
  jadi namanya saja yang berbeda.

  Font yang boleh dipakai di sini terbatas pada HEADING_FONTS/BODY_FONTS di
  `src/lib/font-stacks.ts`. Nama di luar daftar itu tidak dideklarasikan di
  `fonts-invitation.ts` dan akan diam-diam jatuh ke font bawaan browser.
  `assertFontsDeclared()` di bawah menjaga itu saat seed dijalankan.
*/

import { trackUrl } from "../src/lib/music-tracks";

export type CategoryKey =
  | "PERNIKAHAN"
  | "AQIQAH"
  | "ULANG_TAHUN"
  | "KORPORAT";

type Palette = {
  primary: string;
  secondary: string;
  background: string;
  text: string;
};

export type TemplateSeed = {
  name: string;
  slug: string;
  category: CategoryKey;
  palette: Palette;
  font: { heading: string; body: string };
};

/*
  Arketipe tata letak — harus sama persis dengan kunci di
  `src/lib/invitation-layouts.ts`. Inilah yang benar-benar membedakan satu
  template dari yang lain; palet dan font menumpang di atasnya.

  Sengaja dipetakan dari slug dalam satu blok, bukan ditempel di tiap entri:
  sebarannya harus bisa dibaca sekaligus. `assertCatalogSehat()` menjaga tidak
  ada slug yang terlewat dan tidak ada arketipe yang tidak terpakai.
*/
type LayoutKey =
  | "klasik"
  | "sampul"
  | "lugas"
  | "pias"
  | "pita"
  | "galeri"
  | "bingkai"
  | "naskah";

const SEMUA_LAYOUT: LayoutKey[] = [
  "klasik",
  "sampul",
  "lugas",
  "pias",
  "pita",
  "galeri",
  "bingkai",
  "naskah",
];

/*
  Tingkat harga tiap arketipe. Harus sama persis dengan `minPackage` di
  `src/lib/invitation-layouts.ts` — `assertCatalogSehat()` memakai peta ini
  untuk memastikan sebarannya 10 Basic / 10 Premium / 10 Eksklusif.
*/
const TINGKAT_LAYOUT: Record<LayoutKey, "BASIC" | "PREMIUM" | "EXCLUSIVE"> = {
  klasik: "BASIC",
  sampul: "BASIC",
  lugas: "BASIC",
  pias: "PREMIUM",
  pita: "PREMIUM",
  galeri: "PREMIUM",
  bingkai: "EXCLUSIVE",
  naskah: "EXCLUSIVE",
};

const LAYOUT_PER_SLUG: Record<string, LayoutKey> = {
  // Tingkat harga melekat pada arketipe (lihat `minPackage` di
  // src/lib/invitation-layouts.ts), jadi sebaran di bawah sekaligus
  // menentukan berapa template per tingkat: 10 Basic, 10 Premium,
  // 10 Eksklusif. `assertCatalogSehat()` menghitungnya ulang tiap seed.

  // — Pernikahan (12): 4 Basic, 4 Premium, 4 Eksklusif
  "klasik-elegan": "klasik",
  "floral-lembut": "klasik",
  "sage-tenang": "sampul",
  "mutiara-senja": "sampul",
  "terakota-jawa": "pias",
  "biru-laut": "pias",
  "hitam-putih": "pita",
  "rustic-kayu": "galeri",
  "navy-emas": "bingkai",
  "emas-tulis": "bingkai",
  "kembang-goyang": "naskah",
  "langit-senja": "naskah",

  // — Aqiqah (6): 2 Basic, 2 Premium, 2 Eksklusif
  "ceria-aqiqah": "klasik",
  "awan-putih": "sampul",
  "hijau-mint": "pias",
  "merah-muda-lembut": "galeri",
  "kuning-hangat": "bingkai",
  "ungu-lavender": "naskah",

  // — Ulang tahun (6)
  "satu-tahun": "klasik",
  "pesta-warna": "sampul",
  "balon-biru": "pita",
  "tropis-segar": "galeri",
  "neon-malam": "bingkai",
  "hitam-emas": "naskah",

  // — Korporat (6). Tidak ada yang `klasik`: bentuk undangan pernikahan
  // justru salah di acara resmi.
  "biru-korporat": "lugas",
  "abu-profesional": "lugas",
  "teknologi-terang": "pita",
  "hijau-berkelanjutan": "pias",
  "malam-gala": "bingkai",
  "ungu-inovasi": "naskah",
};

/*
  ── Foto bawaan ─────────────────────────────────────────────────────────

  Semua dari Unsplash (Unsplash License: bebas dipakai komersial, tanpa izin
  tertulis, atribusi tidak wajib). Tiap foto sudah dibuka dan dilihat satu per
  satu sebelum dimasukkan — alt text saja tidak cukup untuk menaruh gambar di
  halaman pernikahan orang. Dipilih yang bernuansa Indonesia: pengantin Jawa,
  Bali, dan Muslim, bukan stok pernikahan Barat.

  CATATAN PRODUKSI: ini di-hotlink dari `images.unsplash.com`. Begitu
  Cloudinary aktif, unggah ulang ke sana dan ganti URL di sini — tidak ada
  kode lain yang perlu berubah. Parameter `w`/`q` sengaja ditulis agar tamu di
  jaringan seluler tidak mengunduh foto 4000px.
*/
const UNSPLASH = "https://images.unsplash.com/photo-";
const SAMPUL_Q = "?w=1200&q=72&auto=format&fit=crop";
const GALERI_Q = "?w=700&q=68&auto=format&fit=crop";

const FOTO: Record<CategoryKey, string[]> = {
  PERNIKAHAN: [
    "1650377509454-1bbd8392e122", // pengantin Muslim berkebaya putih
    "1673073180049-9ef7846f28dd", // pengantin perempuan berhijab, tangan
    "1541700513212-79f419c0221d", // pengantin adat di taman tropis
    "1667353931393-7cf46f3d0649", // pengantin dengan seragam kebesaran
    // Arak-arakan pengantin berpayung di jalan desa. Catatan: alt text
    // Unsplash untuk foto ini keliru ("woman in white button up shirt"), dan
    // foto yang alt text-nya tampak cocok justru berisi anak-anak di upacara.
    // Itulah sebabnya tiap foto dibuka dan dilihat, bukan dipilih dari alt.
    "1623210412831-e29c8c5b81cf",
    "1673073220743-ee78b02eb029", // pengantin perempuan bersalam
    "1650472185090-a8cfdd9a38d3", // pasangan berbusana hitam, studio modern
    "1525272149490-82288cb110a0", // pengantin Bali duduk bersanding
    "1650377509428-11e7fe8614a9", // siger emas Sunda
    "1678782086537-0cefd87257b6", // tukar cincin, tangan berhenna
  ],
  AQIQAH: [
    "1704649917342-a6aaac5a9009", // bayi berselimut putih
    "1622996061359-0da030a44e6b", // keluarga Muslim menggendong bayi
    "1537544176619-f79b157c634b", // bayi dibedong
    "1604807788279-ea778c075cee", // bayi bertopi rajut
    "1623743360501-ff21ea5e30d7", // bayi berhijab merah muda
  ],
  ULANG_TAHUN: [
    "1530103862676-de8c9debad1d", // balon warna-warni
    "1513151233558-d860c5398176", // konfeti
    "1464349153735-7db50ed83c84", // kue dengan lilin
    "1513546493312-0066d7de3fd2", // kembang api kecil, latar gelap
    "1531956531700-dc0ee0f1f9a5", // perlengkapan pesta, tampak atas
    "1578922864601-79dcc7cbcea9", // cupcake merah muda
    "1607977166054-ba266c446ba3", // papan neon "Happy Birthday"
  ],
  KORPORAT: [
    "1559223694-98ed5e272fef", // pembicara di panggung
    "1769798643655-e0f10f62c3fd", // audiens menghadap layar
    "1781029711351-e915512bf69c", // ruang konferensi
    "1762968274962-20c12e6e8ecd", // pembicara, panggung gelap
    "1769798643630-194a0fcfa367", // diskusi panel di atas panggung
  ],
};

/*
  Foto sampul dipasangkan ke template satu per satu, bukan diputar menurut
  urutan. Pasangannya disengaja: "Navy Emas" mendapat pengantin berseragam
  angkatan laut, "Emas Tulis" mendapat siger emas, "Hitam Putih" mendapat
  studio hitam-putih, "Neon Malam" mendapat papan neon. Foto yang hanya
  diputar akan menaruh balon di template pernikahan yang tenang.

  Kategori pernikahan punya sepuluh foto untuk sepuluh template, jadi tidak
  ada yang berulang. Kategori lain kolamnya lebih kecil dan beberapa foto
  terpakai dua kali — terlihat, tapi masih jauh lebih baik daripada satu foto
  untuk sepuluh kartu.
*/
const FOTO_PER_SLUG: Record<string, string> = {
  "klasik-elegan": FOTO.PERNIKAHAN[0],
  "floral-lembut": FOTO.PERNIKAHAN[1],
  "sage-tenang": FOTO.PERNIKAHAN[2],
  "mutiara-senja": FOTO.PERNIKAHAN[5],
  "terakota-jawa": FOTO.PERNIKAHAN[4],
  "biru-laut": FOTO.PERNIKAHAN[7],
  "hitam-putih": FOTO.PERNIKAHAN[6],
  "rustic-kayu": FOTO.PERNIKAHAN[9],
  "navy-emas": FOTO.PERNIKAHAN[3],
  "emas-tulis": FOTO.PERNIKAHAN[8],
  // Dua belas template pernikahan atas sepuluh foto, jadi dua foto terpakai
  // dua kali. Dipilih yang namanya memang cocok: siger emas untuk Kembang
  // Goyang, dan pengantin bersalam untuk Langit Senja.
  "kembang-goyang": FOTO.PERNIKAHAN[8],
  "langit-senja": FOTO.PERNIKAHAN[1],

  "ceria-aqiqah": FOTO.AQIQAH[0],
  "awan-putih": FOTO.AQIQAH[3],
  "hijau-mint": FOTO.AQIQAH[2],
  "merah-muda-lembut": FOTO.AQIQAH[4],
  "kuning-hangat": FOTO.AQIQAH[1],
  "ungu-lavender": FOTO.AQIQAH[4],

  "satu-tahun": FOTO.ULANG_TAHUN[5],
  "pesta-warna": FOTO.ULANG_TAHUN[0],
  "balon-biru": FOTO.ULANG_TAHUN[4],
  "tropis-segar": FOTO.ULANG_TAHUN[1],
  "neon-malam": FOTO.ULANG_TAHUN[6],
  "hitam-emas": FOTO.ULANG_TAHUN[3],

  "biru-korporat": FOTO.KORPORAT[1],
  "abu-profesional": FOTO.KORPORAT[2],
  "teknologi-terang": FOTO.KORPORAT[4],
  "hijau-berkelanjutan": FOTO.KORPORAT[0],
  "malam-gala": FOTO.KORPORAT[3],
  "ungu-inovasi": FOTO.KORPORAT[3],
};

/** Foto sampul template. */
function coverFor(slug: string): string {
  return `${UNSPLASH}${FOTO_PER_SLUG[slug]}${SAMPUL_Q}`;
}

/** Galeri contoh: kolam kategori, digeser agar tidak mulai dari foto sampul. */
function galleryFor(category: CategoryKey, urutan: number): string[] {
  const pool = FOTO[category];
  return pool
    .slice(0, 6)
    .map((_, i) => `${UNSPLASH}${pool[(urutan + 1 + i) % pool.length]}${GALERI_Q}`);
}

/*
  Backsound bawaan per kategori. Diambil dari daftar CC0 di
  `src/lib/music-tracks.ts` — bukan URL yang ditulis ulang di sini, supaya
  mengganti sumber berkas cukup di satu tempat.

  Korporat sengaja tanpa musik: backsound di undangan rapat atau peluncuran
  justru terdengar tidak profesional.
*/
const MUSIK_PER_KATEGORI: Record<CategoryKey, string | null> = {
  PERNIKAHAN: "nocturne-9-2",
  AQIQAH: "prelude-23",
  ULANG_TAHUN: "valse-18",
  KORPORAT: null,
};

// Harus sama persis dengan src/lib/font-stacks.ts.
const HEADING_FONTS = [
  "Playfair Display",
  "Cormorant Garamond",
  "Great Vibes",
  "Marcellus",
  "Italiana",
  "Fraunces",
  "Josefin Sans",
  "Inter",
];
const BODY_FONTS = ["Inter", "Lato", "Nunito", "Plus Jakarta Sans", "Karla"];

// ─── Bagian per kategori ─────────────────────────────────────────────────

const ALL_SECTIONS = [
  "cover",
  "opening",
  "couple",
  "countdown",
  "gallery",
  "location",
  "rsvp",
  "greetings",
  "gift",
  "closing",
] as const;

/**
 * Bagian yang dimatikan secara bawaan per kategori. Yang dimatikan tetap ada
 * di `sectionsOrder` dengan `enabled: false`, jadi pemilik tinggal
 * menyalakannya di editor tema — bukan hilang.
 */
const DISABLED: Record<CategoryKey, readonly string[]> = {
  // Bagian "couple" memang untuk dua mempelai.
  PERNIKAHAN: [],
  AQIQAH: ["couple"],
  ULANG_TAHUN: ["couple", "gift"],
  // Acara korporat tidak meminta amplop, dan tidak punya mempelai.
  KORPORAT: ["couple", "gift"],
};

/*
  Susunan bagian. Sebelumnya semua template satu kategori memakai susunan yang
  persis sama — dua belas template pernikahan punya `defaultSections` dengan
  sidik jari identik, dan itu salah satu alasan terbesar template terbaca
  "beda font doang" meski palet, foto, dan tata letaknya berbeda.

  Tiap resep adalah urutan bagian yang DINYALAKAN. Bagian yang tidak disebut
  tetap ada di `sectionsOrder` dengan `enabled: false`, jadi pemilik tinggal
  menyalakannya di editor — bukan hilang.
*/
type Resep = "lengkap" | "foto-dulu" | "ringkas" | "acara-dulu" | "tanpa-cerita";

const RESEP: Record<Resep, string[]> = {
  // Urutan paling umum di undangan Indonesia.
  lengkap: [
    "cover", "opening", "couple", "countdown",
    "gallery", "location", "rsvp", "greetings", "gift", "closing",
  ],
  // Foto dulu, cerita menyusul — untuk template yang kekuatannya di gambar.
  "foto-dulu": [
    "cover", "gallery", "opening", "couple",
    "location", "countdown", "rsvp", "greetings", "gift", "closing",
  ],
  // Tanpa kutipan pembuka, hitung mundur, dan galeri. Pendek dan langsung.
  ringkas: [
    "cover", "couple", "location", "rsvp", "greetings", "gift", "closing",
  ],
  // Tempat dan waktu didahulukan; cocok untuk acara yang tamunya perlu
  // segera tahu ke mana harus datang.
  "acara-dulu": [
    "cover", "opening", "location", "countdown", "couple",
    "gallery", "rsvp", "gift", "greetings", "closing",
  ],
  // Tanpa bagian mempelai/cerita.
  "tanpa-cerita": [
    "cover", "opening", "countdown", "gallery",
    "location", "rsvp", "greetings", "gift", "closing",
  ],
};

const RESEP_PER_SLUG: Record<string, Resep> = {
  "klasik-elegan": "lengkap",
  "floral-lembut": "foto-dulu",
  "sage-tenang": "ringkas",
  "mutiara-senja": "acara-dulu",
  "terakota-jawa": "foto-dulu",
  "biru-laut": "lengkap",
  "hitam-putih": "ringkas",
  "rustic-kayu": "foto-dulu",
  "navy-emas": "acara-dulu",
  "emas-tulis": "lengkap",
  "kembang-goyang": "tanpa-cerita",
  "langit-senja": "acara-dulu",

  "ceria-aqiqah": "lengkap",
  "awan-putih": "ringkas",
  "hijau-mint": "foto-dulu",
  "merah-muda-lembut": "foto-dulu",
  "kuning-hangat": "acara-dulu",
  "ungu-lavender": "lengkap",

  "satu-tahun": "lengkap",
  "pesta-warna": "foto-dulu",
  "balon-biru": "ringkas",
  "tropis-segar": "foto-dulu",
  "neon-malam": "acara-dulu",
  "hitam-emas": "lengkap",

  "biru-korporat": "acara-dulu",
  "abu-profesional": "ringkas",
  "teknologi-terang": "foto-dulu",
  "hijau-berkelanjutan": "lengkap",
  "malam-gala": "acara-dulu",
  "ungu-inovasi": "ringkas",
};

function sectionsFor(category: CategoryKey, slug: string) {
  const off = new Set(DISABLED[category]);
  // Resep menyalakan; aturan kategori tetap menang. Korporat tidak pernah
  // punya bagian mempelai walau resepnya menyebutnya.
  const nyala = (RESEP[RESEP_PER_SLUG[slug]] ?? RESEP.lengkap).filter(
    (k) => !off.has(k),
  );
  const sisa = ALL_SECTIONS.filter((k) => !nyala.includes(k));

  return [
    ...nyala.map((key, order) => ({ key, enabled: true, order })),
    ...sisa.map((key, i) => ({ key, enabled: false, order: nyala.length + i })),
  ];
}

// ─── Isi bawaan per kategori ─────────────────────────────────────────────

/**
 * Tanggal contoh: enam bulan dari saat seed dijalankan, dibulatkan ke tanggal
 * 1. Sengaja dihitung, bukan konstanta — tanggal keras akan jadi tanggal masa
 * lalu beberapa bulan setelah ditulis, dan setiap undangan baru akan lahir
 * dengan hitung mundur yang sudah lewat.
 */
function contohTanggal(): string {
  const d = new Date();
  d.setUTCMonth(d.getUTCMonth() + 6, 1);
  return d.toISOString().slice(0, 10);
}

function contentFor(category: CategoryKey, slug: string, urutan: number) {
  const date = contohTanggal();
  const base = {
    coverImage: coverFor(slug),
    gallery: galleryFor(category, urutan),
  };

  switch (category) {
    case "PERNIKAHAN":
      return {
        ...base,
        subject: { groomName: "Mempelai Pria", brideName: "Mempelai Wanita" },
        event: {
          date,
          time: "10:00",
          timezone: "WIB",
          venueName: "Gedung Serbaguna",
          address: "Jl. Contoh No. 1, Kota",
        },
        quote: {
          text: "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya.",
          source: "QS. Ar-Rum 21",
        },
        story: [
          {
            title: "Awal bertemu",
            body: "Ceritakan di sini bagaimana kalian pertama kali bertemu.",
          },
          {
            title: "Melamar",
            body: "Ceritakan momen lamaran dan restu dari kedua keluarga.",
          },
        ],
      };

    case "AQIQAH":
      return {
        ...base,
        subject: { childName: "Nama Ananda" },
        event: {
          date,
          time: "09:00",
          timezone: "WIB",
          venueName: "Kediaman Keluarga",
          address: "Jl. Contoh No. 1, Kota",
        },
        quote: {
          text: "Setiap anak tergadai dengan aqiqahnya, disembelihkan untuknya pada hari ketujuh, dicukur rambutnya, dan diberi nama.",
          source: "HR. Abu Dawud",
        },
      };

    case "ULANG_TAHUN":
      return {
        ...base,
        subject: { childName: "Nama yang Berulang Tahun" },
        event: {
          date,
          time: "16:00",
          timezone: "WIB",
          venueName: "Tempat Acara",
          address: "Jl. Contoh No. 1, Kota",
        },
      };

    case "KORPORAT":
      return {
        ...base,
        subject: { title: "Nama Acara" },
        event: {
          date,
          time: "13:00",
          timezone: "WIB",
          venueName: "Ballroom",
          address: "Jl. Contoh No. 1, Kota",
        },
        protocol:
          "Mohon hadir 15 menit sebelum acara dimulai. Pakaian: formal.",
      };
  }
}

// ─── Katalog ─────────────────────────────────────────────────────────────

const PERNIKAHAN: TemplateSeed[] = [
  {
    name: "Klasik Elegan",
    slug: "klasik-elegan",
    category: "PERNIKAHAN",
    palette: {
      primary: "#6B4A2F",
      secondary: "#C3A06B",
      background: "#FAF6F0",
      text: "#3A2E26",
    },
    font: { heading: "Playfair Display", body: "Lato" },
  },
  {
    name: "Floral Lembut",
    slug: "floral-lembut",
    category: "PERNIKAHAN",
    palette: {
      primary: "#9C5B63",
      secondary: "#E2B4B8",
      background: "#FDF6F4",
      text: "#4A2F33",
    },
    font: { heading: "Cormorant Garamond", body: "Nunito" },
  },
  {
    name: "Sage Tenang",
    slug: "sage-tenang",
    category: "PERNIKAHAN",
    palette: {
      primary: "#4F6B52",
      secondary: "#A8C0A0",
      background: "#F3F6F1",
      text: "#2D3A2E",
    },
    font: { heading: "Marcellus", body: "Karla" },
  },
  {
    name: "Navy Emas",
    slug: "navy-emas",
    category: "PERNIKAHAN",
    palette: {
      primary: "#1C2C4C",
      secondary: "#C9A227",
      background: "#F6F4EE",
      text: "#23283A",
    },
    font: { heading: "Playfair Display", body: "Inter" },
  },
  {
    name: "Terakota Jawa",
    slug: "terakota-jawa",
    category: "PERNIKAHAN",
    palette: {
      primary: "#9C4A2F",
      secondary: "#D9A273",
      background: "#FBF3EA",
      text: "#402A20",
    },
    font: { heading: "Fraunces", body: "Lato" },
  },
  {
    name: "Mutiara Senja",
    slug: "mutiara-senja",
    category: "PERNIKAHAN",
    palette: {
      primary: "#6B4C6A",
      secondary: "#C2A3BE",
      background: "#F8F4F7",
      text: "#352734",
    },
    font: { heading: "Cormorant Garamond", body: "Plus Jakarta Sans" },
  },
  {
    name: "Hitam Putih",
    slug: "hitam-putih",
    category: "PERNIKAHAN",
    palette: {
      primary: "#1A1A1A",
      secondary: "#8A8A8A",
      background: "#FFFFFF",
      text: "#1A1A1A",
    },
    font: { heading: "Italiana", body: "Inter" },
  },
  {
    name: "Biru Laut",
    slug: "biru-laut",
    category: "PERNIKAHAN",
    palette: {
      primary: "#1F5366",
      secondary: "#86B6C4",
      background: "#F2F8F9",
      text: "#1C3139",
    },
    font: { heading: "Marcellus", body: "Karla" },
  },
  {
    name: "Emas Tulis",
    slug: "emas-tulis",
    category: "PERNIKAHAN",
    palette: {
      primary: "#A3812E",
      secondary: "#DCC48A",
      background: "#FCF8EF",
      text: "#3B3220",
    },
    font: { heading: "Great Vibes", body: "Lato" },
  },
  {
    name: "Rustic Kayu",
    slug: "rustic-kayu",
    category: "PERNIKAHAN",
    palette: {
      primary: "#6E5B3E",
      secondary: "#B09B6E",
      background: "#F5F0E6",
      text: "#332B1E",
    },
    font: { heading: "Fraunces", body: "Nunito" },
  },
  {
    name: "Kembang Goyang",
    slug: "kembang-goyang",
    category: "PERNIKAHAN",
    palette: {
      primary: "#8E2B2B",
      secondary: "#C9A227",
      background: "#FBF5EE",
      text: "#3A241F",
    },
    font: { heading: "Marcellus", body: "Plus Jakarta Sans" },
  },
  {
    name: "Langit Senja",
    slug: "langit-senja",
    category: "PERNIKAHAN",
    palette: {
      primary: "#8A4A6B",
      secondary: "#E0A66B",
      background: "#FCF6F3",
      text: "#3A2733",
    },
    font: { heading: "Cormorant Garamond", body: "Karla" },
  },
];

const AQIQAH: TemplateSeed[] = [
  {
    name: "Ceria Aqiqah",
    slug: "ceria-aqiqah",
    category: "AQIQAH",
    palette: {
      primary: "#B88A2B",
      secondary: "#F0D98C",
      background: "#FFFBEF",
      text: "#4A3A1A",
    },
    font: { heading: "Josefin Sans", body: "Nunito" },
  },
  {
    name: "Merah Muda Lembut",
    slug: "merah-muda-lembut",
    category: "AQIQAH",
    palette: {
      primary: "#C4688A",
      secondary: "#F2BCD0",
      background: "#FFF5F8",
      text: "#4C2735",
    },
    font: { heading: "Josefin Sans", body: "Karla" },
  },
  {
    name: "Hijau Mint",
    slug: "hijau-mint",
    category: "AQIQAH",
    palette: {
      primary: "#3E8572",
      secondary: "#A5D8C6",
      background: "#F2FAF7",
      text: "#1F3D35",
    },
    font: { heading: "Josefin Sans", body: "Plus Jakarta Sans" },
  },
  {
    name: "Kuning Hangat",
    slug: "kuning-hangat",
    category: "AQIQAH",
    palette: {
      primary: "#C07A1E",
      secondary: "#F2C97E",
      background: "#FFF8EC",
      text: "#4A331A",
    },
    font: { heading: "Marcellus", body: "Nunito" },
  },
  {
    name: "Awan Putih",
    slug: "awan-putih",
    category: "AQIQAH",
    palette: {
      primary: "#5B6670",
      secondary: "#C3CBD2",
      background: "#F8FAFB",
      text: "#2C343A",
    },
    font: { heading: "Josefin Sans", body: "Inter" },
  },
  {
    name: "Ungu Lavender",
    slug: "ungu-lavender",
    category: "AQIQAH",
    palette: {
      primary: "#6E5A9E",
      secondary: "#C3B5E3",
      background: "#F7F5FD",
      text: "#332A4D",
    },
    font: { heading: "Josefin Sans", body: "Karla" },
  },
];

const ULANG_TAHUN: TemplateSeed[] = [
  {
    name: "Pesta Warna",
    slug: "pesta-warna",
    category: "ULANG_TAHUN",
    palette: {
      primary: "#C32E6B",
      secondary: "#F5C23E",
      background: "#FFF9F2",
      text: "#2B2230",
    },
    font: { heading: "Josefin Sans", body: "Nunito" },
  },
  {
    name: "Balon Biru",
    slug: "balon-biru",
    category: "ULANG_TAHUN",
    palette: {
      primary: "#2563A8",
      secondary: "#7FC2E8",
      background: "#F2F8FD",
      text: "#1C3349",
    },
    font: { heading: "Josefin Sans", body: "Nunito" },
  },
  {
    name: "Satu Tahun",
    slug: "satu-tahun",
    category: "ULANG_TAHUN",
    palette: {
      primary: "#C9707F",
      secondary: "#F3C6CB",
      background: "#FFF6F6",
      text: "#452A2E",
    },
    font: { heading: "Josefin Sans", body: "Karla" },
  },
  {
    name: "Neon Malam",
    slug: "neon-malam",
    category: "ULANG_TAHUN",
    palette: {
      primary: "#F06A9B",
      secondary: "#46E0C0",
      background: "#14121C",
      text: "#F2EEF7",
    },
    font: { heading: "Josefin Sans", body: "Plus Jakarta Sans" },
  },
  {
    name: "Tropis Segar",
    slug: "tropis-segar",
    category: "ULANG_TAHUN",
    palette: {
      primary: "#13795F",
      secondary: "#F2B33D",
      background: "#F3FAF7",
      text: "#16352C",
    },
    font: { heading: "Fraunces", body: "Nunito" },
  },
  {
    name: "Hitam Emas",
    slug: "hitam-emas",
    category: "ULANG_TAHUN",
    palette: {
      primary: "#D4AF37",
      secondary: "#8A7230",
      background: "#121212",
      text: "#EFE9DA",
    },
    font: { heading: "Italiana", body: "Inter" },
  },
];

const KORPORAT: TemplateSeed[] = [
  {
    name: "Biru Korporat",
    slug: "biru-korporat",
    category: "KORPORAT",
    palette: {
      primary: "#10457E",
      secondary: "#6E9BC9",
      background: "#F5F8FC",
      text: "#16263A",
    },
    font: { heading: "Inter", body: "Inter" },
  },
  {
    name: "Abu Profesional",
    slug: "abu-profesional",
    category: "KORPORAT",
    palette: {
      primary: "#2F3A44",
      secondary: "#8A97A3",
      background: "#F6F8F9",
      text: "#1E272E",
    },
    font: { heading: "Inter", body: "Plus Jakarta Sans" },
  },
  {
    name: "Hijau Berkelanjutan",
    slug: "hijau-berkelanjutan",
    category: "KORPORAT",
    palette: {
      primary: "#1D6B4F",
      secondary: "#7FB89E",
      background: "#F3F9F6",
      text: "#14352A",
    },
    font: { heading: "Inter", body: "Karla" },
  },
  {
    name: "Malam Gala",
    slug: "malam-gala",
    category: "KORPORAT",
    palette: {
      primary: "#C9A227",
      secondary: "#6E6038",
      background: "#10141C",
      text: "#E9E4D6",
    },
    font: { heading: "Italiana", body: "Plus Jakarta Sans" },
  },
  {
    name: "Teknologi Terang",
    slug: "teknologi-terang",
    category: "KORPORAT",
    palette: {
      primary: "#2B4ACB",
      secondary: "#8FA3F2",
      background: "#F5F6FD",
      text: "#1A2140",
    },
    font: { heading: "Josefin Sans", body: "Plus Jakarta Sans" },
  },
  {
    name: "Ungu Inovasi",
    slug: "ungu-inovasi",
    category: "KORPORAT",
    palette: {
      primary: "#5B3FA8",
      secondary: "#A892DD",
      background: "#F7F5FC",
      text: "#291E47",
    },
    font: { heading: "Inter", body: "Karla" },
  },
];

export const TEMPLATE_CATALOG: TemplateSeed[] = [
  ...PERNIKAHAN,
  ...AQIQAH,
  ...ULANG_TAHUN,
  ...KORPORAT,
];

/** Baris Prisma lengkap untuk satu entri katalog. */
export function toTemplateRow(t: TemplateSeed, urutan: number) {
  const musik = MUSIK_PER_KATEGORI[t.category];
  return {
    name: t.name,
    slug: t.slug,
    category: t.category,
    // Gambar pratinjau belum ada; galeri menenun paletnya sendiri jadi swatch.
    // Path ini mengikuti konvensi docs/03 untuk saat gambar aslinya menyusul.
    previewImage: `/templates/${t.slug}.jpg`,
    defaultContent: contentFor(t.category, t.slug, urutan),
    defaultTheme: {
      palette: t.palette,
      font: t.font,
      layout: LAYOUT_PER_SLUG[t.slug],
      openingGate: true,
      ...(musik ? { music: { url: trackUrl(musik), autoplay: false } } : {}),
    },
    defaultSections: sectionsFor(t.category, t.slug),
  };
}

/** Arketipe satu template, untuk ditampilkan di galeri dan panel admin. */
export function layoutOf(slug: string): LayoutKey | undefined {
  return LAYOUT_PER_SLUG[slug];
}

/**
 * Jaga-jaga saat seed: slug ganda dan font yang tidak dideklarasikan adalah
 * dua kesalahan yang tidak menimbulkan error, hanya hasil yang salah diam-diam
 * — slug ganda membuat upsert saling menimpa, font asing jatuh ke font bawaan
 * browser.
 */
export function assertCatalogSehat(): void {
  const masalah: string[] = [];

  const terlihat = new Set<string>();
  for (const t of TEMPLATE_CATALOG) {
    if (terlihat.has(t.slug)) masalah.push(`slug ganda: ${t.slug}`);
    terlihat.add(t.slug);
    if (!HEADING_FONTS.includes(t.font.heading))
      masalah.push(`${t.slug}: font judul "${t.font.heading}" tidak terdaftar`);
    if (!BODY_FONTS.includes(t.font.body))
      masalah.push(`${t.slug}: font isi "${t.font.body}" tidak terdaftar`);
    if (!LAYOUT_PER_SLUG[t.slug])
      masalah.push(`${t.slug}: belum punya arketipe tata letak`);
    if (!FOTO_PER_SLUG[t.slug])
      masalah.push(`${t.slug}: belum punya foto sampul`);
    if (!RESEP_PER_SLUG[t.slug])
      masalah.push(`${t.slug}: belum punya resep susunan bagian`);
  }

  /*
    Susunan bagian yang sama persis untuk semua template satu kategori adalah
    kegagalan diam-diam: build hijau, seed hijau, tapi semua template terbaca
    sama. Dijaga di sini supaya ketahuan saat seed, bukan dari galeri.
  */
  for (const kategori of ["PERNIKAHAN", "AQIQAH", "ULANG_TAHUN", "KORPORAT"] as const) {
    const anggota = TEMPLATE_CATALOG.filter((t) => t.category === kategori);
    if (anggota.length < 2) continue;
    const bentuk = new Set(
      anggota.map((t) => JSON.stringify(sectionsFor(t.category, t.slug))),
    );
    if (bentuk.size < 2) {
      masalah.push(
        `semua template ${kategori} punya susunan bagian yang identik`,
      );
    }
  }

  // Slug di peta arketipe yang tidak ada di katalog = salah ketik yang tidak
  // akan ketahuan dari sisi sebaliknya.
  for (const slug of Object.keys(LAYOUT_PER_SLUG)) {
    if (!terlihat.has(slug))
      masalah.push(`peta arketipe menyebut slug asing: ${slug}`);
  }

  // Arketipe yang tidak dipakai satu template pun berarti kerja desainnya
  // tidak pernah terlihat pemilik.
  const terpakai = new Set(Object.values(LAYOUT_PER_SLUG));
  for (const l of SEMUA_LAYOUT) {
    if (!terpakai.has(l)) masalah.push(`arketipe ${l} tidak dipakai template`);
  }

  if (TEMPLATE_CATALOG.length !== 30) {
    masalah.push(`katalog berisi ${TEMPLATE_CATALOG.length} template, bukan 30`);
  }

  // Sebaran tingkat harga: 10 Basic, 10 Premium, 10 Eksklusif. Ini janji
  // produk ke pembeli, jadi digagalkan di seed kalau meleset — bukan baru
  // ketahuan dari galeri.
  const perTingkat = new Map<string, number>();
  for (const t of TEMPLATE_CATALOG) {
    const layout = LAYOUT_PER_SLUG[t.slug];
    if (!layout) continue;
    const tingkat = TINGKAT_LAYOUT[layout];
    perTingkat.set(tingkat, (perTingkat.get(tingkat) ?? 0) + 1);
  }
  for (const tingkat of ["BASIC", "PREMIUM", "EXCLUSIVE"] as const) {
    const n = perTingkat.get(tingkat) ?? 0;
    if (n !== 10) masalah.push(`tingkat ${tingkat} punya ${n} template, bukan 10`);
  }

  if (masalah.length > 0) {
    throw new Error(`Katalog template bermasalah:\n- ${masalah.join("\n- ")}`);
  }
}
