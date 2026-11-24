"use client";

import { useEffect, useState } from "react";

function diff(target: number) {
  const now = Date.now();
  const delta = Math.max(0, target - now);
  return {
    days: Math.floor(delta / 86_400_000),
    hours: Math.floor((delta % 86_400_000) / 3_600_000),
    minutes: Math.floor((delta % 3_600_000) / 60_000),
    seconds: Math.floor((delta % 60_000) / 1000),
  };
}

export function Countdown({ target }: { target: string }) {
  const targetMs = new Date(target).getTime();
  const [t, setT] = useState(() => diff(targetMs));

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

  return (
    <div className="flex justify-center gap-2.5">
      {items.map(([label, value]) => (
        <div
          key={label}
          className="inv-card flex min-w-[4.25rem] flex-col items-center px-3 py-3"
        >
          <span className="inv-heading text-3xl font-semibold tabular-nums">
            {String(value).padStart(2, "0")}
          </span>
          <span className="inv-note text-[0.6875rem] uppercase tracking-wider">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
