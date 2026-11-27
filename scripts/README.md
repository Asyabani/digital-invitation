# Alat verifikasi UI

Skrip sekali pakai untuk memeriksa halaman undangan di browser sungguhan. Bukan
bagian aplikasi dan tidak ikut di-build — tapi disimpan karena temuan yang
dihasilkannya sulit didapat dengan cara lain, dan masalahnya mudah kambuh.

## Prasyarat

Semua skrip `.mjs` bicara ke Chrome lewat DevTools Protocol di port 9222, jadi
Chrome harus sudah jalan dengan port itu terbuka, dan server aplikasi harus
hidup:

```bash
google-chrome --headless=new --remote-debugging-port=9222 &
pnpm build && PORT=3001 pnpm start &
```

Chrome dan server harus **sepasang dengan build terakhir**. `next start` mengunci
peta aset statis saat proses dimulai; kalau `pnpm build` jalan setelahnya,
servernya menyajikan halaman tanpa CSS sampai di-restart.

## Isi

| Skrip | Kegunaan |
|---|---|
| `shot.mjs <url> <lebar> <keluaran.png> [full]` | Tangkap layar dengan device metrics override, supaya lebar tata letaknya benar. `--window-size` headless tidak melakukan ini dan menghasilkan bukti palsu. Memaksa `.inv-terlihat` dulu agar bagian yang menunggu scroll tidak tertangkap kosong. |
| `measure.mjs <url> <lebar>` | Cari elemen yang melebarkan halaman melewati viewport. |
| `minwidth.mjs <url> <lebar>` | Cari elemen yang `min-content`-nya memaksa halaman melebar — penyebab yang tidak terlihat oleh `measure.mjs`, misalnya `truncate` yang memasang `white-space: nowrap`. |
| `uji-gerbang.mjs <url>` | Tekan "Buka Undangan" dengan `userGesture`, lalu pastikan isinya terbuka **dan** audionya benar-benar berjalan. Kebijakan autoplay browser berlaku apa adanya. |
| `uji-gerak.mjs <url> [reduced]` | Pastikan salindia berganti sendiri dan Ken Burns berjalan; dengan argumen `reduced`, pastikan semuanya berhenti tapi isinya tetap ada. |
| `uji-tingkat.ts` | Uji logika penjaga tingkat harga tanpa browser. Jalankan dengan `pnpm exec tsx scripts/uji-tingkat.ts`. |
