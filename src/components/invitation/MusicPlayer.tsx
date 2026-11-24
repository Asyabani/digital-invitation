"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  url: string;
  /** Mulai otomatis saat halaman dibuka; browser bisa menolaknya. */
  autoplay?: boolean;
  accentColor?: string;
};

/**
 * Musik latar undangan (docs/06 §4): tombol play/pause mengambang, tidak
 * memaksa autoplay. Jika browser menolak autoplay, tombol tetap tersedia.
 */
export function MusicPlayer({ url, autoplay = false, accentColor }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!autoplay) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false)); // kebijakan browser — biarkan manual
  }, [autoplay]);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(
        () => setPlaying(true),
        () => setPlaying(false),
      );
    } else {
      audio.pause();
      setPlaying(false);
    }
  }

  return (
    <>
      <audio ref={audioRef} src={url} loop preload="none" />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Jeda musik" : "Putar musik"}
        className="fixed bottom-5 right-5 z-20 flex h-11 w-11 items-center justify-center rounded-full border bg-white/90 text-lg shadow-lg backdrop-blur"
        style={accentColor ? { borderColor: accentColor } : undefined}
      >
        {playing ? "⏸" : "♪"}
      </button>
    </>
  );
}
