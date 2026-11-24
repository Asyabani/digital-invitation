"use client";

import { useEffect, useRef, useState } from "react";
import { Music, Pause } from "lucide-react";

type Props = {
  url: string;
  /** Mulai otomatis saat halaman dibuka; browser bisa menolaknya. */
  autoplay?: boolean;
};

/**
 * Musik latar undangan (docs/06 §4): tombol play/pause mengambang, tidak
 * memaksa autoplay. Jika browser menolak autoplay, tombol tetap tersedia.
 */
export function MusicPlayer({ url, autoplay = false }: Props) {
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
        aria-label={playing ? "Jeda musik latar" : "Putar musik latar"}
        className="fixed bottom-5 right-5 z-20 flex size-11 items-center justify-center rounded-full border shadow-lg backdrop-blur transition-opacity hover:opacity-90"
        style={{
          background: "color-mix(in oklab, var(--inv-bg) 85%, white)",
          borderColor: "color-mix(in oklab, var(--inv-primary) 35%, transparent)",
          color: "var(--inv-primary)",
          boxShadow: "0 6px 20px -8px color-mix(in oklab, var(--inv-text) 45%, transparent)",
        }}
      >
        {playing ? (
          <Pause className="size-4" aria-hidden />
        ) : (
          <Music className="size-4" aria-hidden />
        )}
      </button>
    </>
  );
}
