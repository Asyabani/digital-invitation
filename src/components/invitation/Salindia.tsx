"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Galeri salindia (slideshow) untuk arketipe berbayar.
 *
 * Berganti sendiri tiap 4 detik, berhenti saat disentuh atau difokus, dan
 * bisa digeser manual lewat tombol, titik, maupun tombol panah keyboard.
 *
 * Tiga hal yang membuatnya aman dipakai di undangan:
 * - `prefers-reduced-motion: reduce` mematikan pergantian otomatis; tamu
 *   tetap bisa menggeser sendiri. Gerak yang berjalan sendiri adalah hal
 *   pertama yang mengganggu orang dengan sensitivitas vestibular.
 * - Tanpa JavaScript, semua foto tetap terlihat sebagai satu kolom biasa.
 *   Menyembunyikan foto lewat CSS lalu bergantung pada JS berarti galeri
 *   kosong kalau skripnya gagal.
 * - Pergantian otomatis berhenti begitu tamu menggeser sendiri — ia sudah
 *   menyatakan mau mengatur sendiri.
 */
export function Salindia({
  urls,
  title,
}: {
  urls: string[];
  title: string;
}) {
  const [aktif, setAktif] = useState(0);
  const [jalan, setJalan] = useState(true);
  /*
    Mode salindia baru dipasang setelah hidrasi; sebelum itu yang dirender
    adalah daftar foto biasa yang pasti terlihat — galeri tidak boleh kosong
    kalau JavaScript gagal.

    `useSyncExternalStore` dipakai, bukan `setState` di dalam efek: ia memang
    bentuk yang disediakan React untuk membedakan server dan klien, dan tidak
    memicu render tambahan setelah mount.
  */
  const siap = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const maju = useCallback(
    (arah: number) => setAktif((i) => (i + arah + urls.length) % urls.length),
    [urls.length],
  );

  useEffect(() => {
    if (!siap || !jalan || urls.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => maju(1), 4000);
    return () => clearInterval(timer);
  }, [siap, jalan, urls.length, maju]);

  if (!siap) {
    return (
      <div className="flex w-full flex-col gap-3">
        {urls.map((u, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={u}
            alt={`Foto ${i + 1} dari ${title}`}
            loading="lazy"
            decoding="async"
            className="inv-card block aspect-[4/5] w-full rounded-sm object-cover"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="w-full"
      onMouseEnter={() => setJalan(false)}
      onMouseLeave={() => setJalan(true)}
      onFocusCapture={() => setJalan(false)}
      onBlurCapture={() => setJalan(true)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          setJalan(false);
          maju(1);
        }
        if (e.key === "ArrowLeft") {
          setJalan(false);
          maju(-1);
        }
      }}
      role="group"
      aria-roledescription="salindia"
      aria-label={`Galeri foto ${title}`}
      tabIndex={0}
    >
      <div className="inv-card relative aspect-[4/5] w-full overflow-hidden rounded-sm">
        {urls.map((u, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={u}
            alt={i === aktif ? `Foto ${i + 1} dari ${title}` : ""}
            aria-hidden={i !== aktif}
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            className="inv-salindia-foto absolute inset-0 size-full object-cover"
            data-aktif={i === aktif ? "" : undefined}
          />
        ))}
      </div>

      <div className="mt-3 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            setJalan(false);
            maju(-1);
          }}
          aria-label="Foto sebelumnya"
          className="inv-salindia-tombol"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>

        <div className="flex items-center gap-1.5">
          {urls.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setJalan(false);
                setAktif(i);
              }}
              aria-label={`Ke foto ${i + 1}`}
              aria-current={i === aktif ? "true" : undefined}
              className="inv-salindia-titik"
              data-aktif={i === aktif ? "" : undefined}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            setJalan(false);
            maju(1);
          }}
          aria-label="Foto berikutnya"
          className="inv-salindia-tombol"
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
