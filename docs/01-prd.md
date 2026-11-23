# 01 — PRD (Product Requirements Document)

> **Status:** Final v1 · **Tanggal:** 2026-11-23 · **Pemilik produk:** Asep

---

## 1. Latar Belakang & Pernyataan Masalah

Undangan cetak mahal, lambat dibuat, sulit direvisi, dan tidak interaktif. Pasar
Indonesia (nikah, aqiqah, ulang tahun, acara korporat) sudah terbiasa berbagi
undangan lewat WhatsApp. Yang dibutuhkan: cara **cepat & murah** membuat undangan
digital yang cantik, bisa dikustomisasi, dan punya fitur interaktif (RSVP, buku
tamu, amplop digital) tanpa perlu skill desain.

**Masalah inti:** pembuat acara ingin undangan personal & profesional, tetapi
tidak punya waktu/skill mendesain, dan ingin mengelola konfirmasi tamu di satu
tempat.

## 2. Tujuan Produk & Non-Tujuan

### Tujuan
- Memungkinkan siapa pun membuat undangan digital cantik dalam < 30 menit.
- Monetisasi lewat pembelian **one-time per event** (bukan langganan bulanan).
- Halaman undangan publik yang cepat dibuka dari WhatsApp di HP.
- Mengelola RSVP, ucapan, dan konfirmasi amplop di dashboard pemilik.

### Non-Tujuan (Out of Scope MVP)
- Full canvas editor ala Canva (kustomisasi Level 4).
- Subscription recurring bulanan.
- Aplikasi mobile native (web responsive dulu).
- Marketplace vendor / fitur B2B untuk Wedding Organizer.
- Custom domain per undangan (menyusul pasca-MVP).

## 3. Persona & Konteks Penggunaan

- **Pemilik acara (pembeli):** calon pengantin / orang tua / panitia. Awam
  teknis, mengerjakan dari HP atau laptop, sensitif harga, ingin hasil cepat &
  cantik. **Satu-satunya peran yang login.**
- **Tamu undangan:** menerima link personal via WhatsApp, membuka di HP. Ingin
  cepat tahu detail acara, RSVP, kirim ucapan, dan tahu cara kirim kado. **Tidak
  perlu akun.**

## 4. User Stories & Acceptance Criteria

### F1 — Registrasi & Login Pemilik
**Story:** Sebagai pemilik acara, saya ingin login agar undangan saya tersimpan.
**Acceptance:**
- [ ] Bisa login dengan Google atau email magic link (Auth.js).
- [ ] Setelah login, diarahkan ke dashboard daftar undangan miliknya.
- [ ] Hanya pemilik yang bisa melihat/mengedit undangannya sendiri.

### F2 — Pilih Template & Buat Undangan
**Story:** Sebagai pemilik, saya ingin memilih template agar tidak mendesain dari nol.
**Acceptance:**
- [ ] Galeri template menampilkan preview + kategori.
- [ ] Memilih template membuat `Invitation` baru berstatus `DRAFT` dengan konten
      default dari template.
- [ ] Slug awal digenerate otomatis dan dapat diubah (jika paket mengizinkan).

### F3 — Isi Konten Undangan
**Story:** Sebagai pemilik, saya ingin mengisi data acara.
**Acceptance:**
- [ ] Form mengisi: nama mempelai/subjek, tanggal & waktu, lokasi + koordinat
      Maps, galeri foto, cerita/timeline, info protokol.
- [ ] Perubahan tersimpan (auto-save atau tombol simpan) ke `Invitation.content`.
- [ ] Validasi Zod: field wajib tidak boleh kosong sebelum publish.

### F4 — Atur Tema (Kustomisasi Level 2)
**Story:** Sebagai pemilik, saya ingin mengatur tampilan sesuai selera.
**Acceptance:**
- [ ] Bisa ganti palet warna, font, dan musik latar.
- [ ] Bisa toggle on/off dan mengurutkan ulang section.
- [ ] Preview live mencerminkan perubahan tema sebelum disimpan.

### F5 — Kelola Tamu & Link Personal
**Story:** Sebagai pemilik, saya ingin link personal agar nama tamu muncul otomatis.
**Acceptance:**
- [ ] Bisa tambah tamu satu per satu dan import massal (CSV/daftar).
- [ ] Tiap tamu punya `personalSlug` unik; link `/u/[slug]?to=<personalSlug>`.
- [ ] Membuka link personal menampilkan nama tamu di cover.
- [ ] Tombol share WhatsApp membawa teks + link personal per tamu.

### F6 — Preview & Publish
**Story:** Sebagai pemilik, saya ingin melihat preview lalu membagikan undangan.
**Acceptance:**
- [ ] Preview menampilkan undangan apa adanya (dengan watermark saat trial).
- [ ] Saat `DRAFT`, slug publik **tidak** dapat diakses tamu (404/gated).
- [ ] Setelah pembayaran `PAID`, status → `PUBLISHED`, watermark hilang, slug aktif.

### F7 — RSVP (tamu)
**Story:** Sebagai tamu, saya ingin konfirmasi kehadiran.
**Acceptance:**
- [ ] Form RSVP: status (hadir/tidak/ragu) + jumlah orang.
- [ ] Tersimpan ke `Rsvp`, terhubung ke `Guest` bila via link personal.
- [ ] Rate limit mencegah spam; satu tamu bisa memperbarui jawabannya.

### F8 — Buku Tamu (tamu)
**Story:** Sebagai tamu, saya ingin mengirim ucapan & doa.
**Acceptance:**
- [ ] Form kirim ucapan (nama + pesan).
- [ ] Ucapan masuk sebagai `PENDING`; hanya `APPROVED` yang tampil publik.
- [ ] Filter kata kasar + rate limit aktif.
- [ ] Pemilik dapat approve/reject di dashboard.

### F9 — Amplop Digital (tamu)
**Story:** Sebagai tamu, saya ingin tahu cara kirim kado dan mengonfirmasinya.
**Acceptance:**
- [ ] Menampilkan rekening/QRIS yang diisi pemilik.
- [ ] Tamu dapat konfirmasi kado (nama, metode, nominal opsional, bukti opsional).
- [ ] Nominal & daftar konfirmasi **tidak** tampil ke publik; hanya pemilik melihatnya.

### F10 — Pembayaran & Paket
**Story:** Sebagai pemilik, saya ingin membayar untuk publish.
**Acceptance:**
- [ ] Memilih paket (Basic/Premium/Exclusive) membuat invoice Xendit.
- [ ] Setelah bayar, webhook mengubah `Payment` → `PAID` dan mem-publish undangan.
- [ ] Fitur & kuota tamu mengikuti paket (feature flags).
- [ ] Masa aktif diset `now + 6 bulan`; dapat diperpanjang dengan pembayaran baru.

### F11 — Dashboard Rekap
**Story:** Sebagai pemilik, saya ingin melihat rekap RSVP & ucapan.
**Acceptance:**
- [ ] Dashboard menampilkan ringkasan: jumlah RSVP hadir/tidak, ucapan terbaru,
      konfirmasi amplop, status & masa aktif undangan.

## 5. Prioritas MoSCoW & Pemetaan Roadmap

### MoSCoW
- **Must:** F1, F2, F3, F6, F7, F8, F10 (login, template, isi konten, publish,
  RSVP, buku tamu, pembayaran).
- **Should:** F4 (tema), F5 (link personal), F9 (amplop digital), F11 (dashboard rekap).
- **Could:** import tamu massal, add-to-calendar, musik custom, filter kata lanjutan.
- **Won't (MVP):** section builder drag-drop, custom domain, analytics, multi-bahasa.

### Pemetaan Fitur → Fase (lihat `docs/09-roadmap.md`)
| Fase | Fitur |
|------|-------|
| 0 — Setup | fondasi (scaffold, DB, auth, env) |
| 1 — MVP inti | F1, F2, F3, F6 (tanpa bayar), F7, F8 |
| 2 — Monetisasi | F10, watermark, masa aktif |
| 3 — Fitur lanjutan | F4, F5, F9, F11 |
| 4 — Pasca-MVP | section builder, custom domain, analytics |

## 6. Metrik Keberhasilan
- **Conversion** trial → bayar (%).
- Jumlah undangan `PUBLISHED` / bulan.
- Rata-rata RSVP & ucapan per undangan (engagement tamu).
- **LCP** halaman publik di HP (target < 2.5 dtk).
- Tingkat kegagalan pembayaran (error Xendit / webhook).

## 7. Risiko Produk & Mitigasi

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Spam/kata kasar di buku tamu | Reputasi, pengalaman tamu | Moderasi default `PENDING`, filter kata, rate limit |
| Kebocoran data tamu/nominal amplop | Privasi, kepercayaan | API publik expose data minimum; nominal hanya untuk pemilik |
| Pembayaran palsu / webhook dipalsukan | Kehilangan pendapatan | Verifikasi `x-callback-token`; status `PAID` hanya dari webhook sah |
| Halaman publik lambat di HP | Tamu pergi | SSR/ISR, optimasi gambar Cloudinary, lazy-load musik/galeri |
| Slug bentrok (nama tamu sama) | Link salah | Generator slug unik + suffix; cek duplikat |
| Harga tidak kompetitif | Konversi rendah | Paket fleksibel (feature flags), riset harga pasar |
| Lonjakan trafik saat hari-H acara | Downtime | Cache agresif halaman publik, Fluid Compute auto-scale |

## 8. Keputusan Terbuka (ditarget sebelum rilis)
- Harga final per paket.
- Jumlah & kategori template saat launch.
- Kebijakan masa aktif/perpanjangan (6 bulan default) & refund.
- Branding, nama produk, domain.
