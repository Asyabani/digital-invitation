"use client";

import { useEffect, useRef, useState } from "react";
import { Music, Pause } from "lucide-react";

type Props = {
  /** Tampilkan gerbang "Buka Undangan" sebelum isi. */
  gate: boolean;
  coverImage?: string;
  title: string;
  guestName?: string;
  prettyDate: string;
  musicUrl?: string;
  /** Dirender di dalam bingkai (editor/galeri), bukan halaman penuh. */
  embedded: boolean;
  children: React.ReactNode;
};

/**
 * Kerangka halaman undangan: gerbang pembuka + backsound.
 *
 * Keduanya satu komponen karena saling bergantung. Browser HP menolak
 * `audio.play()` yang tidak dipicu gerakan pengguna; ketukan "Buka Undangan"
 * adalah gerakan itu. Memisahkan gerbang dan pemutar berarti pemutar tidak
 * pernah tahu kapan boleh mulai, dan backsound-nya gagal diam-diam — persis
 * yang terjadi sebelum gerbang ini ada.
 */
export function InvitationShell({
  gate,
  coverImage,
  title,
  guestName,
  prettyDate,
  musicUrl,
  embedded,
  children,
}: Props) {
  const [terbuka, setTerbuka] = useState(!gate);
  const [memutar, setMemutar] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isiRef = useRef<HTMLDivElement | null>(null);

  // Setelah gerbang dibuka, fokus pindah ke isi. Tanpa ini pengguna keyboard
  // dan pembaca layar tertinggal di tombol yang sudah hilang.
  useEffect(() => {
    if (terbuka && gate) isiRef.current?.focus();
  }, [terbuka, gate]);

  function putar() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.play().then(
      () => setMemutar(true),
      () => setMemutar(false), // ditolak browser — tombol tetap tersedia
    );
  }

  function buka() {
    setTerbuka(true);
    putar();
  }

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) putar();
    else {
      audio.pause();
      setMemutar(false);
    }
  }

  /*
    Elemen audio selalu dirender, juga saat gerbang masih tertutup.

    Kalau ia baru muncul setelah gerbang dibuka, `audioRef` masih kosong di
    saat tombol ditekan — dan `play()` yang dipanggil setelah render
    berikutnya sudah di luar gerakan pengguna, persis yang ditolak browser HP.
  */
  const audio = musicUrl ? (
    <audio ref={audioRef} src={musicUrl} loop preload="none" />
  ) : null;

  if (!terbuka) {
    return (
      <>
        {audio}
        <section
          className={`inv-sampul ${
            coverImage ? "inv-sampul-foto" : ""
          } relative flex flex-col items-center justify-center overflow-hidden px-6 py-16 text-center ${
            embedded ? "min-h-[26rem]" : "min-h-[100svh]"
          }`}
          aria-label="Pembuka undangan"
        >
        {coverImage && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImage}
              alt=""
              aria-hidden
              className="absolute inset-0 size-full object-cover"
            />
            {/*
              Scrim dua arah, bukan satu lapisan rata: gelap di atas dan
              bawah tempat teks berada, lebih terang di tengah tempat wajah
              biasanya berada. Satu lapisan rata akan mematikan fotonya.
            */}
            <span aria-hidden className="inv-scrim absolute inset-0" />
          </>
        )}

        <div className="relative z-[1] flex w-full max-w-sm flex-col items-center gap-5">
          <span
            aria-hidden
            className="block h-px w-12"
            style={{ background: "var(--inv-secondary)" }}
          />
          <p className="inv-sampul-teks text-xs tracking-[0.28em]">Undangan</p>
          <h1 className="inv-sampul-judul text-4xl font-semibold leading-[1.08] sm:text-5xl">
            {title}
          </h1>
          <p className="inv-sampul-teks text-sm">{prettyDate}</p>

          {guestName && (
            <p className="inv-sampul-teks mt-4 text-sm leading-relaxed">
              Kepada Yth. Bapak/Ibu/Saudara/i
              <br />
              <span className="inv-sampul-judul text-base font-medium">
                {guestName}
              </span>
            </p>
          )}

          <button
            type="button"
            onClick={buka}
            className="inv-button mt-3"
            autoFocus
          >
            Buka Undangan
          </button>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {audio}
      <div ref={isiRef} tabIndex={-1} className="outline-none">
        {children}
      </div>

      {musicUrl && (
        <button
          type="button"
          onClick={toggle}
          aria-label={memutar ? "Jeda musik latar" : "Putar musik latar"}
          // Di dalam bingkai pratinjau, `fixed` menempel ke viewport halaman
          // dan tombolnya mengambang di luar bingkai. Akar undangan sudah
          // `relative`, jadi `absolute` menaruhnya di tempat yang benar.
          className={`inv-musik ${
            embedded ? "absolute" : "fixed"
          } bottom-5 right-5 z-20 flex size-11 items-center justify-center rounded-full border`}
        >
          {memutar ? (
            <Pause className="size-4" aria-hidden />
          ) : (
            <Music className="size-4" aria-hidden />
          )}
        </button>
      )}
    </>
  );
}
