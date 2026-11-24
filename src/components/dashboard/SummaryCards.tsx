import Link from "next/link";
import type { DashboardSummary } from "@/lib/summary";

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/** Satu benang: panjangnya sebanding dengan angkanya dalam kelompoknya. */
function Benang({
  label,
  value,
  of,
  tegas = false,
}: {
  label: string;
  value: number;
  of: number;
  tegas?: boolean;
}) {
  const pct = of > 0 ? Math.max(value > 0 ? 6 : 0, (value / of) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-3">
        <span className={`text-sm ${tegas ? "font-medium" : "text-muted-foreground"}`}>
          {label}
        </span>
        <span className="tabular text-sm font-semibold">{value}</span>
      </div>
      <span
        aria-hidden
        className="block h-[3px] w-full bg-border/60"
      >
        <span
          className="block h-full"
          style={{
            width: `${pct}%`,
            background:
              "repeating-linear-gradient(to right, var(--mengkudu) 0 5px, transparent 5px 7px)",
          }}
        />
      </span>
    </div>
  );
}

/**
 * F11 — ringkasan satu undangan untuk pemilik.
 *
 * Dibaca sebagai tiga kelompok benang dengan panjang sebanding, bukan empat
 * kotak angka besar berukuran sama. Nominal amplop hanya muncul di sini
 * (halaman pemilik), tidak pernah publik.
 */
export function SummaryCards({
  invitationId,
  summary,
}: {
  invitationId: string;
  summary: DashboardSummary;
}) {
  const totalRsvp =
    summary.rsvp.hadir + summary.rsvp.tidakHadir + summary.rsvp.ragu;
  const totalUcapan = summary.greeting.approved + summary.greeting.pending;

  return (
    <div className="kain pinggiran-atas grid rounded-sm md:grid-cols-3">
      <Link
        href={`/dashboard/${invitationId}/rsvp`}
        className="space-y-3 px-5 py-4 transition-colors hover:bg-accent/40"
      >
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-base font-medium">Kehadiran</h3>
          <span className="text-xs text-muted-foreground">
            {totalRsvp === 0
              ? "belum ada jawaban"
              : `${summary.rsvp.headcount} orang`}
          </span>
        </div>
        <Benang label="Hadir" value={summary.rsvp.hadir} of={totalRsvp} tegas />
        <Benang
          label="Tidak hadir"
          value={summary.rsvp.tidakHadir}
          of={totalRsvp}
        />
        <Benang label="Ragu" value={summary.rsvp.ragu} of={totalRsvp} />
      </Link>

      <Link
        href={`/dashboard/${invitationId}/ucapan`}
        className="space-y-3 border-t border-border/70 px-5 py-4 transition-colors hover:bg-accent/40 md:border-l md:border-t-0"
      >
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-base font-medium">Ucapan</h3>
          {summary.greeting.pending > 0 ? (
            <span className="text-xs text-warning-foreground">
              perlu ditinjau
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              semua sudah ditinjau
            </span>
          )}
        </div>
        <Benang
          label="Tayang di undangan"
          value={summary.greeting.approved}
          of={totalUcapan}
          tegas
        />
        <Benang
          label="Menunggu"
          value={summary.greeting.pending}
          of={totalUcapan}
        />
      </Link>

      <Link
        href={`/dashboard/${invitationId}/amplop`}
        className="space-y-3 border-t border-border/70 px-5 py-4 transition-colors hover:bg-accent/40 md:border-l md:border-t-0"
      >
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-base font-medium">Amplop</h3>
          <span className="text-xs text-muted-foreground">privat</span>
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="tabular font-semibold text-foreground">
            {summary.gift.count}
          </span>{" "}
          konfirmasi tercatat
        </p>
        <p className="tabular text-xl font-semibold">
          {rupiah.format(summary.gift.total)}
        </p>
      </Link>
    </div>
  );
}
