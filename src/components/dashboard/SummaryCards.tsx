import Link from "next/link";
import type { DashboardSummary } from "@/lib/summary";

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/**
 * F11 — ringkasan satu undangan untuk pemilik.
 * Nominal amplop hanya muncul di sini (halaman pemilik), tidak pernah publik.
 */
export function SummaryCards({
  invitationId,
  summary,
}: {
  invitationId: string;
  summary: DashboardSummary;
}) {
  const cards = [
    {
      label: "Hadir",
      value: String(summary.rsvp.hadir),
      hint: `${summary.rsvp.headcount} orang`,
      href: `/dashboard/${invitationId}/rsvp`,
    },
    {
      label: "Tidak hadir",
      value: String(summary.rsvp.tidakHadir),
      hint: `${summary.rsvp.ragu} ragu`,
      href: `/dashboard/${invitationId}/rsvp`,
    },
    {
      label: "Ucapan",
      value: String(summary.greeting.approved),
      hint:
        summary.greeting.pending > 0
          ? `${summary.greeting.pending} menunggu moderasi`
          : "semua sudah ditinjau",
      href: `/dashboard/${invitationId}/ucapan`,
    },
    {
      label: "Amplop",
      value: String(summary.gift.count),
      hint: rupiah.format(summary.gift.total),
      href: `/dashboard/${invitationId}/amplop`,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((c) => (
        <Link
          key={c.label}
          href={c.href}
          className="rounded-xl border p-4 text-center transition hover:border-neutral-400"
        >
          <p className="text-2xl font-semibold">{c.value}</p>
          <p className="text-xs font-medium text-neutral-600">{c.label}</p>
          <p className="text-xs text-neutral-400">{c.hint}</p>
        </Link>
      ))}
    </div>
  );
}
