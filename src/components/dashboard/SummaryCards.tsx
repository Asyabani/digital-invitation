import Link from "next/link";
import type { DashboardSummary } from "@/lib/summary";
import { Card, CardContent } from "@/components/ui/card";

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
      value: summary.rsvp.hadir,
      hint: `${summary.rsvp.headcount} orang`,
      href: `/dashboard/${invitationId}/rsvp`,
    },
    {
      label: "Tidak hadir",
      value: summary.rsvp.tidakHadir,
      hint: `${summary.rsvp.ragu} ragu`,
      href: `/dashboard/${invitationId}/rsvp`,
    },
    {
      label: "Ucapan tayang",
      value: summary.greeting.approved,
      hint:
        summary.greeting.pending > 0
          ? `${summary.greeting.pending} perlu ditinjau`
          : "semua sudah ditinjau",
      highlight: summary.greeting.pending > 0,
      href: `/dashboard/${invitationId}/ucapan`,
    },
    {
      label: "Amplop",
      value: summary.gift.count,
      hint: rupiah.format(summary.gift.total),
      href: `/dashboard/${invitationId}/amplop`,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c) => (
        <Card
          key={c.label}
          className="transition-colors hover:border-foreground/20"
        >
          <CardContent className="p-4">
            <Link href={c.href} className="block focus-visible:outline-none">
              <p className="tabular text-2xl font-semibold">{c.value}</p>
              <p className="text-sm font-medium">{c.label}</p>
              <p
                className={`truncate text-xs ${
                  c.highlight
                    ? "text-warning-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {c.hint}
              </p>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
