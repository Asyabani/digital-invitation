"use client";

import { useEffect, useState } from "react";
import type { LayoutSpec } from "@/lib/invitation-layouts";

type Sisa = { days: number; hours: number; minutes: number; seconds: number };

function diff(targetMs: number): Sisa {
  const ms = Math.max(0, targetMs - Date.now());
  const detik = Math.floor(ms / 1000);
  return {
    days: Math.floor(detik / 86400),
    hours: Math.floor((detik % 86400) / 3600),
    minutes: Math.floor((detik % 3600) / 60),
    seconds: detik % 60,
  };
}

/**
 * Hitung mundur menuju hari H.
 *
 * Bentuknya ikut arketipe (`spec.countdown`), bukan satu bentuk untuk semua.
 * Empat kotak identik di tiga puluh template adalah salah satu alasan utama
 * template terbaca sama meski palet dan fontnya berbeda.
 */
export function Countdown({
  target,
  variant = "kotak",
}: {
  target: string;
  variant?: LayoutSpec["countdown"];
}) {
  const targetMs = new Date(target).getTime();
  const [t, setT] = useState<Sisa>(() => diff(targetMs));

  useEffect(() => {
    const i = setInterval(() => setT(diff(targetMs)), 1000);
    return () => clearInterval(i);
  }, [targetMs]);

  if (Number.isNaN(targetMs)) return null;

  const items: [string, number][] = [
    ["Hari", t.days],
    ["Jam", t.hours],
    ["Menit", t.minutes],
    ["Detik", t.seconds],
  ];
  const dua = (n: number) => String(n).padStart(2, "0");

  if (variant === "baris") {
    // Satu baris mengalir, tanpa wadah apa pun. Untuk arketipe yang memang
    // tidak memakai kotak di mana pun (sampul, lugas, naskah).
    return (
      <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        {items.map(([label, value]) => (
          <span key={label} className="whitespace-nowrap">
            <span className="inv-heading text-2xl font-medium tabular-nums">
              {dua(value)}
            </span>
            <span className="inv-note ml-1.5 text-sm">{label.toLowerCase()}</span>
          </span>
        ))}
      </p>
    );
  }

  if (variant === "besar") {
    return (
      <div className="grid w-full grid-cols-4 gap-x-3">
        {items.map(([label, value]) => (
          <div key={label}>
            <span className="inv-heading block text-4xl font-semibold leading-none tabular-nums sm:text-5xl">
              {dua(value)}
            </span>
            <span className="inv-note mt-2 block text-xs">{label}</span>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "lingkar") {
    return (
      // Ukuran dipilih agar empat lingkaran tetap satu baris di 390px,
      // termasuk di arketipe bingkai yang punya padding ganda.
      <div className="flex justify-center gap-2 sm:gap-3">
        {items.map(([label, value]) => (
          <div key={label} className="flex flex-col items-center gap-1.5">
            <span className="inv-lingkar flex size-16 items-center justify-center rounded-full sm:size-[4.5rem]">
              <span className="inv-heading text-lg font-semibold tabular-nums sm:text-xl">
                {dua(value)}
              </span>
            </span>
            <span className="inv-note text-[0.6875rem] tracking-wider">
              {label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-2.5">
      {items.map(([label, value]) => (
        <div
          key={label}
          className="inv-card flex min-w-[4.25rem] flex-col items-center px-3 py-3"
        >
          <span className="inv-heading text-3xl font-semibold tabular-nums">
            {dua(value)}
          </span>
          <span className="inv-note text-[0.6875rem] uppercase tracking-wider">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
