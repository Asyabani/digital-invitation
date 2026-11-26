# 06 — UI/UX & Copywriting

> **Status:** Final v1 · **Tanggal:** 2026-11-23
>
> UI & copy berbahasa Indonesia. Komponen: shadcn/ui + Tailwind v4.

---

## 0. Dunia Visual — "Lungsin"

> Dunia visual final ada di **`DESIGN.md`** (ditulis dari hasil build, bukan
> dari rencana). Bagian ini merangkum apa yang mengikat pekerjaan UI.
> Kontrak arahnya ikut terkirim sebagai komentar HTML di markup produksi —
> lihat `DIRECTION_CONTRACT` di `src/app/layout.tsx`.

**Gagasan pokok:** undangan dirangkai seperti kain tenun. Produk memasang
**lungsin** (benang tegak = struktur tetap); pemilik menenun **pakan**-nya (isi
dan warna). Nama produknya pun diambil dari situ.

Ini sekaligus menolak dua bawaan: kisi kartu identik khas SaaS, dan krem +
serif kontras tinggi + foil emas + huruf skrip khas industri undangan.

**Tiga lingkungan, satu kain:**

| | Marketing | Dashboard | Undangan `/u/[slug]` |
|---|---|---|---|
| Dasar | Kain malam — nila pekat `#0A1426` (dibungkus kelas `dark`) | Kain siang — kapas `#EFECE4` | `themeConfig.palette` milik pemilik |
| Font | Bricolage Grotesque (judul) + Archivo (teks) | sama | `themeConfig.font` |
| Wadah | pita `.pakan` penuh lebar | helai `.kain` lewat `<Helai>` | pita `Section` berkerapatan ganti |

**Kosakata tenun** (didefinisikan di `globals.css`):

- `.lungsin` — benang tegak; garis kolom tipis di latar bagian halaman.
  **Ini pengganti kisi kartu**, bukan tambahan di atasnya.
- `.pakan` — pita penuh lebar; satu bagian halaman = satu pita.
- `.pinggiran-atas` / `.pinggiran-bawah` — tepi kain yang dimatikan: dua benang
  emas rapat.
- `.kain` — sehelai kapas; **selalu kain siang**, termasuk di atas dasar nila.
  Token di-reset di dalamnya supaya komponen anaknya ikut otomatis.
- `.ikat` — penanda yang sedang terpilih (celup rintang), bukan kotak berbingkai.
- `.menenun` — satu momen terorkestrasi: kain ditenun kiri→kanan saat halaman
  dibuka; dipakai ulang sebagai penanda status terbit.

Aturan yang mengikat:

- **Emas (`--benang`, `#C08A2E`) hanya sebagai garis 1px.** Tidak pernah jadi
  bidang isi — itu foil, dan foil adalah kliseis yang ditolak dunia ini.
- **Sudut 2px.** Kain punya tepi potong, bukan sudut membulat.
- **Jangan pakai `Card` shadcn di dashboard** — pakai `<Helai>`
  (`src/components/dashboard/Helai.tsx`). `Card` masih ada karena dipakai
  komponen shadcn lain, tapi bukan wadah baku kita.
- **Jangan pakai kelas warna Tailwind mentah** (`text-neutral-500`,
  `bg-green-50`). Pakai token: `text-muted-foreground`, `bg-success-surface`,
  `text-mengkudu`, dst. Satu arti warna di seluruh aplikasi.
- **Form tamu di halaman undangan tidak boleh memakai token dashboard** —
  warnanya ikut tema pemilik lewat `.inv-field`, `.inv-button`, `.inv-chip`,
  `.inv-card`. Jangan meneruskan warna sebagai prop ke tiap komponen.
- **Editor tema hanya boleh menawarkan font yang benar-benar dimuat.** Sumbernya
  `HEADING_FONTS`/`BODY_FONTS` di `src/lib/font-stacks.ts`; menambah pilihan di
  sana wajib disertai deklarasi `next/font` di `fonts-invitation.ts`, kalau tidak
  pilihan pemilik diam-diam jatuh ke font bawaan browser.
- Angka pada tabel & rekap memakai kelas `.tabular` agar kolomnya sejajar.

## 1. Prinsip Desain

- **Mobile-first.** Tamu hampir selalu membuka dari HP via WhatsApp. Semua
  halaman publik dioptimalkan untuk layar kecil & koneksi lambat.
- **Elegan & tenang.** Undangan = momen spesial; hindari UI ramai. Tipografi
  rapi, whitespace lega, animasi halus (bukan berlebihan).
- **Minim friksi tamu.** RSVP & ucapan cukup beberapa ketukan, tanpa login.
- **Editor yang memandu.** Pemilik awam teknis → langkah jelas, preview live.

## 2. Halaman Marketing

### `/` Landing
- Hero: value proposition + CTA "Buat Undangan Gratis".
- Showcase template (carousel), fitur unggulan, testimoni, harga ringkas, FAQ.
- Copy CTA: *"Coba gratis, bayar hanya saat siap dibagikan."*

### `/template` Galeri Template
- Grid preview per kategori (Pernikahan, Aqiqah, Ulang Tahun, Korporat).
  Sampul kartu memakai palet bawaan template agar karakternya terbaca.
- Tiap kartu punya dua aksi: **Lihat Contoh** → `/template/[slug]`, dan
  **Pakai** → `createInvitation` (mengarahkan ke login bila belum masuk).
- Katalog bawaan berisi **10 template per kategori** (40 total, lihat
  `prisma/templates.ts`). Yang membedakannya adalah palet, pasangan font, dan
  set bagian yang masuk akal untuk kategorinya — bukan nama saja.
- Penyaring kategori berupa tautan `?kategori=<slug>`, bukan state klien,
  supaya hasilnya bisa dibagikan dan tombol kembali bekerja. Tanpa penyaring,
  keempat kategori tampil sebagai kelompok terpisah dengan judulnya sendiri.
- Ini satu-satunya halaman marketing yang memuat variabel font undangan.
  Swatch memakai font judul template yang sebenarnya; tanpa itu keempat puluh
  template tampil dengan satu font cadangan dan separuh pembedanya hilang.

### `/template/[slug]` Pratinjau Template
- **Publik, tanpa login** — calon pemilik harus bisa menilai template sebelum
  diminta mendaftar.
- Dirender dari `defaultContent`/`defaultTheme`/`defaultSections` milik
  template, bukan dari `Invitation` mana pun.
- Selalu `interactive={false}`: form RSVP/ucapan/amplop di dalamnya tidak
  mengirim apa pun. Bilah pratinjau menjelaskan bahwa isinya bisa diganti.
- CTA "Pakai Template Ini" → login bila belum masuk.

### `/harga` Harga
- Tabel 3 paket (Basic/Premium/Exclusive) dengan perbandingan fitur.
- Catatan: *"Pembayaran sekali per acara. Undangan aktif 6 bulan."*

## 3. Dashboard (pemilik, login)

### `/dashboard` Daftar Undangan
- Kartu per undangan: judul, status (Draft/Published/Kedaluwarsa), masa aktif,
  tombol Edit / Lihat / Bagikan.
- Tombol "+ Buat Undangan Baru" → pilih template.

### `/dashboard/[id]/edit` Editor Konten
- Layout dua kolom di desktop: **form di kiri, preview live di kanan**; di mobile
  tab Form / Preview.
- Section form: Data Acara, Lokasi & Maps, Galeri (upload Cloudinary), Cerita,
  Quote, Protokol.
- Auto-save + indikator "tersimpan".

### `/dashboard/[id]/tema` Editor Tema
- Pilih palet warna (preset + custom), font (heading/body), musik latar.
- Daftar section dengan toggle on/off + urutkan (`sectionsOrder`).
  **Implementasi MVP:** tombol naik/turun (aksesibel via keyboard); drag-drop
  menyusul bersama section builder di Fase 4.

### `/dashboard/[id]/tamu` Kelola Tamu
- Tabel tamu: nama, kategori, link personal, status terkirim.
- Tambah manual + import (tempel daftar / CSV).
- Tombol "Salin link WhatsApp" per tamu (teks + `/u/[slug]?to=<personalSlug>`).

### `/dashboard/[id]/rsvp` Rekap RSVP
- Ringkasan: total hadir, tidak hadir, ragu, total headcount.
- Tabel jawaban RSVP.

### `/dashboard/[id]/ucapan` Moderasi Buku Tamu
- Daftar ucapan `PENDING` dengan tombol Approve/Reject.
- Tab untuk ucapan yang sudah `APPROVED`.

### `/dashboard/[id]/amplop` Konfirmasi Amplop
- **Khusus pemilik** — daftar konfirmasi kado + nominal + bukti. Jelaskan bahwa
  data ini privat.

### Alur Publish
- Tombol "Publish" → modal pilih paket → `createPayment` → redirect Xendit.
- Setelah kembali: banner "Menunggu konfirmasi pembayaran" sampai webhook tiba,
  lalu berubah jadi "Undangan aktif! Bagikan sekarang".

## 3b. Panel Operator `/admin/*` (login, `role = ADMIN`)

Kain siang yang sama dengan dashboard — ini juga permukaan kerja — ditandai
benang mengkudu setebal 3px di tepi atas dan kata "ADMIN" di sebelah logo.
Itu satu-satunya pemakaian mengkudu di kerangka panel; sisanya tetap tenang.
Tautan "Admin" muncul di header dashboard hanya untuk admin.

### `/admin` Ringkasan
- Pendapatan Lungsin (total & bulan berjalan), cacah pengguna/undangan, dan
  tagihan yang perlu diperhatikan. Tiap angka menautkan ke daftarnya.
- Pendapatan dibaca dari `Payment.amount`, bukan dari harga paket saat ini,
  supaya perubahan harga tidak menulis ulang riwayat.

### `/admin/template` Kelola Template
- Dikelompokkan per kategori, tiap template tampil sebagai swatch palet +
  nama font + cacah undangan yang memakainya.
- Template nonaktif **diredupkan, bukan disembunyikan** — admin perlu melihat
  apa yang dimatikan dan menyalakannya lagi dari tempat yang sama.

### `/admin/undangan` Metadata Undangan
- Judul, slug, pemilik, template, status, paket, masa aktif, tanggal dibuat.
- Pencarian `?q=` atas slug, judul, dan email pemilik — pengguna yang meminta
  bantuan biasanya menyebut tautannya, bukan id.

### `/admin/pembayaran` Pendapatan
- Tagihan beserta `externalId`, agar bisa dicocokkan di dashboard Xendit saat
  ada pembayaran yang tidak nyangkut.
- **Tidak ada** tombol "tandai lunas". Status hanya berubah lewat webhook.

### `/admin/pengguna` Akun & Peran
- Email, nama, cacah undangan, tanggal daftar, dan tombol angkat/turunkan
  admin. Baris akun sendiri tidak punya tombol sama sekali.

### Batas data
Panel ini menampilkan metadata platform dan pendapatan Lungsin. Isi undangan,
daftar tamu, jawaban RSVP, ucapan, dan **nominal amplop** tidak pernah dibaca
dari jalur admin — lihat docs/03 §5. Amplop digital adalah uang antara tamu
dan pemilik acara; Lungsin tidak berkepentingan atasnya.

## 4a. Arketipe Tata Letak Undangan

Template dibedakan oleh **susunan**, bukan oleh warna. Palet dan font yang
berbeda di atas satu kerangka yang sama menghasilkan empat puluh template yang
terbaca sebagai satu template dengan empat puluh palet — itu kondisi sebelum
arketipe ada.

Spesifikasi tiap arketipe ada sebagai data di `src/lib/invitation-layouts.ts`
dan dibaca `InvitationView`; tidak ada rantai `if (layout === ...)` yang
tersebar di komponen. Menambah arketipe = menambah satu entri di sana.

| Arketipe | Perataan | Sampul | Foto sampul | Judul bagian | Wadah isi | Fakta acara |
|---|---|---|---|---|---|---|
| `klasik` | tengah | nama, ornamen, tanggal | sisipan berbingkai | benang putus-putus | kotak berbingkai | paragraf |
| `sampul` | tengah | setinggi layar penuh, benang tegak | latar penuh + scrim | kecil, berjarak huruf | tanpa wadah | paragraf |
| `pias` | kiri | rata kiri di balik garis tegak | panel lebar | di kolom kiri sendiri | garis bawah | daftar |
| `bingkai` | tengah | panel berbingkai ganda | persegi di dalam bingkai | di antara dua garis | bingkai ganda | paragraf |
| `pita` | kiri | nama dipisah pita tebal | pita selebar layar | besar, rata kiri | bidang terisi | daftar |
| `lugas` | kiri | nama, tanggal, tempat | panel lebar | seukuran teks, tanpa ornamen | tanpa wadah | daftar |

Catatan yang mudah terlewat:

- **`lugas` tidak memakai font judul sama sekali** (`display: "isi"` di
  spesifikasi). Tidak adanya font display adalah seluruh pembedanya; satu
  baris serif besar di penutup cukup untuk membatalkannya.
- **`sampul` memakai `100svh`.** Di dalam bingkai pratinjau (editor, galeri,
  hero) itu berarti tamu hanya melihat sampul, jadi `InvitationView` menerima
  prop `embedded` yang menurunkannya ke `26rem`.
- **`pias` menaruh judul di kolom kiri** hanya mulai lebar 40rem. Di layar
  sempit judulnya naik ke atas, dan garis tegaknya pindah ke kiri sebagai
  penanda yang sama — bukan hilang.
- Sebaran arketipe ke 40 template ada di `LAYOUT_PER_SLUG`
  (`prisma/templates.ts`), satu blok supaya bisa dibaca sekaligus.
  `assertCatalogSehat()` menolak slug yang terlewat dan arketipe yang tidak
  terpakai satu template pun.
- Editor tema (`/dashboard/[id]/tema`) menaruh pilihan tata letak **paling
  atas**, sebelum warna: ia menentukan bentuk, jadi memilihnya belakangan
  berarti pemilik menyetel warna untuk susunan yang lalu ia ganti.
- Tiap sampul harus tetap utuh **tanpa** `coverImage`. Foto adalah tambahan,
  bukan syarat; undangan yang fotonya belum diunggah tidak boleh tampil rusak.

## 4b. Gerbang “Buka Undangan” & Backsound

Layar pertama yang dilihat tamu dari WhatsApp: foto sampul memenuhi layar,
scrim di atasnya, nama mempelai, tanggal, nama tamu (bila dibuka dari link
personal), dan satu tombol **Buka Undangan**.

**Alasan teknisnya, bukan hanya gaya.** Browser HP menolak `audio.play()`
yang tidak dipicu gerakan pengguna. Sebelum gerbang ini ada, `music.autoplay`
selalu gagal diam-diam dan backsound praktis tidak pernah terdengar. Ketukan
tombol adalah gerakan yang sah, jadi musik mulai tepat saat undangan terbuka.

Hal yang mudah salah saat menyentuh bagian ini:

- **Elemen `<audio>` harus sudah ada sebelum tombol ditekan.** Kalau ia baru
  dirender setelah gerbang terbuka, `play()` berjalan di luar gerakan
  pengguna dan ditolak. `InvitationShell` merendernya sejak awal.
- **Gerbang dan pemutar satu komponen** (`InvitationShell`). Dipisah, pemutar
  tidak tahu kapan boleh mulai.
- **Gerbang dimatikan saat `interactive={false}`** — di galeri template dan
  hero beranda tidak ada yang perlu dibuka; isinya justru yang ingin dilihat.
- Tombol musik memakai `absolute` saat `embedded`, bukan `fixed`: di dalam
  bingkai pratinjau, `fixed` menempel ke viewport halaman dan tombolnya
  mengambang di luar bingkai.
- Setelah gerbang dibuka, fokus dipindahkan ke isi. Tanpa itu pengguna
  keyboard dan pembaca layar tertinggal di tombol yang sudah hilang.

**Daftar backsound** ada di `src/lib/music-tracks.ts` — rekaman Chopin dari
koleksi Musopen di Internet Archive, berlisensi CC0. Editor menampilkan
suasana, judul, **ukuran berkas**, dan tombol “Dengar”. Ukuran ditampilkan
dengan sengaja: tamu membuka undangan dari HP dengan kuota.

## 4. Halaman Undangan Publik `/u/[slug]`

Urutan section mengikuti `sectionsOrder` (default):

1. **Cover** — nama subjek/mempelai, tanggal, **nama tamu** (dari `?to`), tombol
   "Buka Undangan".
2. **Pembuka** — quote/salam.
3. **Mempelai/Acara** — foto & detail.
4. **Countdown** — hitung mundur ke tanggal acara.
5. **Galeri** — grid foto (lazy-load, Cloudinary responsive).
6. **Lokasi** — peta + tombol "Buka Maps" + "Tambah ke Kalender".
7. **RSVP** — form status + jumlah orang.
8. **Buku Tamu** — daftar ucapan `APPROVED` + form kirim ucapan.
9. **Amplop Digital** — rekening/QRIS + tombol "Konfirmasi Kado" (form).
10. **Penutup** — ucapan terima kasih.

Elemen global:
- **Musik latar**: tombol play/pause mengambang; tidak autoplay memaksa (hormati
  kebijakan browser), mulai saat "Buka Undangan" ditekan.
- **Tombol share WhatsApp** di section penutup.
- **Metadata share** (`generateMetadata`): judul + tanggal + venue, gambar galeri
  pertama sebagai `og:image`, supaya pratinjau di WhatsApp rapi.
- **Watermark** tampil selama paket belum memuat `removeWatermark` (trial dan
  paket Basic). Lihat `docs/05` §2.
- Jika `EXPIRED`: tampilkan pesan sopan "Undangan sudah tidak aktif".
- **Amplop digital** hanya dirender bila pemilik mengisi `giftConfig` **dan**
  paketnya memuat `giftEnvelope`.

## 5. Copywriting (contoh, Bahasa Indonesia)

- Cover: *"Kepada Yth. Bapak/Ibu/Saudara/i, [Nama Tamu]"*
- RSVP sukses: *"Terima kasih, konfirmasimu sudah kami terima 🙏"*
- Ucapan terkirim: *"Ucapanmu terkirim dan akan tampil setelah ditinjau."*
- Amplop: *"Doa restu Anda adalah hadiah terindah. Namun bila berkenan memberi
  tanda kasih, dapat melalui:"*
- Watermark/preview: *"Mode pratinjau — publish untuk membagikan ke tamu."*

## 6. Aksesibilitas & Performa
- Kontras warna cukup, ukuran sentuh ≥ 44px, alt text gambar.
- Gambar via Cloudinary (format modern, ukuran responsif), lazy-load galeri &
  musik. Target LCP < 2.5s di HP.
- Hormati `prefers-reduced-motion` untuk animasi.
