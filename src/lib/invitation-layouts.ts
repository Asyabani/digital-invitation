import type { LayoutKey } from "@/lib/validation/invitation";

/*
  Arketipe tata letak halaman undangan.

  Sebelum ini semua template memakai satu kerangka: rata tengah, lebar ukur
  sama, judul bagian berornamen sama, kartu berbingkai sama. Yang berganti
  hanya warna dan font — jadi empat puluh template terbaca sebagai satu
  template dengan empat puluh palet.

  Modul ini memisahkan KOMPOSISI dari WARNA. Spesifikasi di bawah dibaca
  `InvitationView`; tidak ada rantai `if (layout === ...)` yang tersebar di
  dalam komponen, supaya menambah arketipe berarti menambah satu entri di
  sini, bukan menyisir ulang seluruh berkas.

  Modul ini murni (tidak mengimpor `next/font` maupun komponen), jadi aman
  dipakai komponen klien — editor tema memakainya untuk daftar pilihan.
*/

export type LayoutSpec = {
  /** Nama yang dilihat pemilik di editor tema. */
  label: string;
  /** Satu kalimat: apa yang berbeda, bukan kata sifat. */
  description: string;

  /** Perataan isi bagian. */
  align: "center" | "left";
  /** Lebar ukur kolom isi. Serif boleh sedikit lebih lebar. */
  measure: string;

  /**
   * Bentuk sampul — layar pertama yang dilihat tamu dari WhatsApp.
   * - `tumpuk` : nama di tengah, ornamen, tanggal (undangan cetak klasik)
   * - `portal` : setinggi layar penuh, nama sangat besar, tanggal berupa angka
   * - `pias`   : rata kiri, nama besar, tanggal di bawah garis tegak
   * - `bingkai`: panel berbingkai ganda seperti kartu undangan
   * - `pita`   : nama dan tanggal dipisah satu pita tebal
   * - `lugas`  : nama, tanggal, tempat — tanpa ornamen apa pun
   */
  cover: "tumpuk" | "portal" | "pias" | "bingkai" | "pita" | "lugas";

  /**
   * Cara judul bagian mengumumkan diri.
   * - `benang` : rata tengah, benang putus-putus di bawahnya
   * - `halus`  : kecil, berjarak huruf, tanpa ornamen
   * - `samping`: duduk di kolom kiri sendiri, sejajar isinya
   * - `ganda`  : rata tengah di antara dua garis rambut
   * - `besar`  : besar, rata kiri, tanpa ornamen
   * - `polos`  : seukuran teks biasa, hanya lebih tebal
   */
  heading: "benang" | "halus" | "samping" | "ganda" | "besar" | "polos";

  /**
   * Wadah blok isi (lokasi, cerita, galeri).
   * - `kotak`  : kotak berbingkai tipis
   * - `polos`  : tanpa wadah sama sekali
   * - `garis`  : hanya dipisah garis rambut di bawahnya
   * - `bingkai`: bingkai ganda
   * - `blok`   : bidang terisi tanpa garis
   */
  panel: "kotak" | "polos" | "garis" | "bingkai" | "blok";

  /**
   * Penyajian fakta acara (tempat, alamat, waktu).
   * `paragraf` = baris-baris mengalir; `daftar` = pasangan label/nilai.
   */
  fakta: "paragraf" | "daftar";

  /**
   * Irama latar antar bagian.
   * - `selang`: bagian genap diberi rona tipis
   * - `tidak` : rata, dibedakan jarak saja
   * - `pita`  : pita penuh lebar berona primer, bergantian
   */
  band: "selang" | "tidak" | "pita";

  /** Pemisah antar bagian. */
  divider: "pinggiran" | "halus" | "tidak";

  /** Tulisan "Undangan" di atas nama. Tidak semua arketipe memerlukannya. */
  eyebrow: boolean;

  /** Jarak vertikal bagian: pertama, rapat, lapang. */
  pad: { first: string; rapat: string; lapang: string };

  /** Jarak antar elemen di dalam satu bagian. */
  gap: string;

  /**
   * Font untuk teks menonjol di luar judul bagian — kutipan pembuka, nama
   * tempat, "Terima Kasih" di penutup.
   *
   * `isi` dipakai arketipe lugas: tidak adanya font display adalah seluruh
   * pembedanya, dan satu baris serif besar di penutup cukup untuk
   * membatalkannya.
   */
  display: "judul" | "isi";
};

export const LAYOUTS: Record<LayoutKey, LayoutSpec> = {
  /*
    Standar undangan Indonesia: simetris, berornamen, hangat. Ini yang
    diharapkan kebanyakan keluarga, jadi ia tetap ada dan tetap jadi bawaan —
    bukan karena aman, tapi karena memang bentuk yang dikenali.
  */
  klasik: {
    label: "Klasik",
    description:
      "Rata tengah dengan ornamen benang di bawah tiap judul, seperti undangan cetak.",
    align: "center",
    measure: "max-w-lg",
    cover: "tumpuk",
    heading: "benang",
    panel: "kotak",
    fakta: "paragraf",
    band: "selang",
    divider: "pinggiran",
    eyebrow: true,
    pad: { first: "pb-16 pt-20 sm:pt-28", rapat: "py-14", lapang: "py-20 sm:py-24" },
    gap: "gap-6",
    display: "judul",
  },

  /*
    Metafora fisiknya amplop: layar pertama terisi penuh oleh nama, dan tamu
    membukanya dengan menggulir. Di bawahnya sengaja kosong — tanpa rona,
    tanpa kartu, hanya garis rambut. Lapang adalah seluruh idenya.
  */
  sampul: {
    label: "Sampul",
    description:
      "Nama memenuhi layar pertama, lalu satu kolom lapang tanpa kotak sama sekali.",
    align: "center",
    measure: "max-w-md",
    cover: "portal",
    heading: "halus",
    panel: "polos",
    fakta: "paragraf",
    band: "tidak",
    divider: "halus",
    eyebrow: false,
    pad: { first: "", rapat: "py-20", lapang: "py-24 sm:py-28" },
    gap: "gap-7",
    display: "judul",
  },

  /*
    Judul pindah ke pias kiri — jalur sempit di tepi — dan isinya mengalir di
    kanan. Rata kiri sepanjang halaman. Yang paling jauh dari undangan cetak,
    dan karena itu yang paling berguna untuk acara yang tidak ingin terbaca
    seperti pernikahan.
  */
  pias: {
    label: "Pias",
    description:
      "Judul bagian duduk di kolom kiri, isinya rata kiri di sebelahnya.",
    align: "left",
    measure: "max-w-xl",
    cover: "pias",
    heading: "samping",
    panel: "garis",
    fakta: "daftar",
    band: "tidak",
    divider: "tidak",
    eyebrow: false,
    pad: { first: "pb-14 pt-16 sm:pt-20", rapat: "py-10", lapang: "py-12" },
    gap: "gap-5",
    display: "judul",
  },

  /*
    Kartu undangan yang dicetak: tiap bagian jadi panel berbingkai ganda yang
    mengambang di atas dasar berona. Paling formal. Bingkai gandanya meniru
    garis emboss di kartu asli, bukan sekadar border tebal.
  */
  bingkai: {
    label: "Bingkai",
    description:
      "Tiap bagian jadi panel berbingkai ganda yang mengambang, paling formal.",
    align: "center",
    measure: "max-w-lg",
    cover: "bingkai",
    heading: "ganda",
    panel: "bingkai",
    fakta: "paragraf",
    band: "tidak",
    divider: "tidak",
    eyebrow: true,
    pad: { first: "py-10 sm:py-14", rapat: "py-5", lapang: "py-5" },
    gap: "gap-6",
    display: "judul",
  },

  /*
    Pita penuh lebar bergantian rona primer. Judulnya besar dan rata kiri,
    jadi gulirannya terbaca seperti rangkaian papan, bukan tumpukan kartu.
    Kontemporer; cocok untuk ulang tahun dan peluncuran.
  */
  pita: {
    label: "Pita",
    description:
      "Pita penuh lebar bergantian warna, judulnya besar dan rata kiri.",
    align: "left",
    measure: "max-w-lg",
    cover: "pita",
    heading: "besar",
    panel: "blok",
    fakta: "daftar",
    band: "pita",
    divider: "tidak",
    eyebrow: false,
    pad: { first: "pb-14 pt-16 sm:pt-24", rapat: "py-14", lapang: "py-14" },
    gap: "gap-6",
    display: "judul",
  },

  /*
    Tanpa ornamen sama sekali. Hierarki hanya dari ukuran dan tebal, fakta
    acara disajikan sebagai pasangan label/nilai — bentuk yang memang dipakai
    undangan acara resmi. Untuk korporat, dan untuk orang yang tidak ingin
    undangannya terlihat "didekorasi".
  */
  lugas: {
    label: "Lugas",
    description:
      "Tanpa ornamen. Hierarki dari ukuran saja, fakta acara sebagai daftar.",
    align: "left",
    measure: "max-w-xl",
    cover: "lugas",
    heading: "polos",
    panel: "polos",
    fakta: "daftar",
    band: "tidak",
    divider: "halus",
    eyebrow: false,
    pad: { first: "pb-12 pt-16", rapat: "py-10", lapang: "py-10" },
    gap: "gap-5",
    display: "isi",
  },
};

export const LAYOUT_KEYS = Object.keys(LAYOUTS) as LayoutKey[];

/** Spesifikasi untuk satu kunci; kunci asing jatuh ke klasik. */
export function layoutSpec(key: string | undefined): LayoutSpec {
  return LAYOUTS[(key ?? "klasik") as LayoutKey] ?? LAYOUTS.klasik;
}
