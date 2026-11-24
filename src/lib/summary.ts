import { prisma } from "@/lib/db";

/**
 * F11 — ringkasan untuk dashboard pemilik.
 *
 * Dibuat sebagai fungsi baca sisi server (dipanggil langsung dari RSC), bukan
 * Server Action, agar tidak ada endpoint tambahan yang terekspos. Pemanggil
 * WAJIB sudah memverifikasi kepemilikan undangan.
 *
 * Nominal amplop hanya boleh muncul di dashboard pemilik — jangan teruskan
 * hasil `giftTotal` ke komponen halaman publik (docs/01 F9).
 */
export async function getDashboardSummary(invitationId: string) {
  const [rsvps, greetingPending, greetingApproved, gifts, giftSum] =
    await Promise.all([
      prisma.rsvp.groupBy({
        by: ["status"],
        where: { invitationId },
        _count: { _all: true },
        _sum: { headcount: true },
      }),
      prisma.greeting.count({ where: { invitationId, status: "PENDING" } }),
      prisma.greeting.count({ where: { invitationId, status: "APPROVED" } }),
      prisma.giftConfirmation.count({ where: { invitationId } }),
      prisma.giftConfirmation.aggregate({
        where: { invitationId },
        _sum: { amount: true },
      }),
    ]);

  const byStatus = (s: string) => rsvps.find((r) => r.status === s);

  return {
    rsvp: {
      hadir: byStatus("HADIR")?._count._all ?? 0,
      tidakHadir: byStatus("TIDAK_HADIR")?._count._all ?? 0,
      ragu: byStatus("RAGU")?._count._all ?? 0,
      headcount: byStatus("HADIR")?._sum.headcount ?? 0,
    },
    greeting: { pending: greetingPending, approved: greetingApproved },
    gift: { count: gifts, total: giftSum._sum.amount ?? 0 },
  };
}

export type DashboardSummary = Awaited<ReturnType<typeof getDashboardSummary>>;
