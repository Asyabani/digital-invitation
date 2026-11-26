import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { AdminNav } from "@/components/admin/AdminNav";
import { Helai, HelaiKepala, HelaiIsi } from "@/components/dashboard/Helai";

export const metadata = { title: "Admin — Lungsin" };
export const instant = false;

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/** Satu angka dengan penjelasannya; bukan kartu, hanya baris berbenang. */
function Angka({
  label,
  value,
  note,
  href,
}: {
  label: string;
  value: string;
  note?: string;
  href?: string;
}) {
  const isi = (
    <>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="tabular mt-1 block text-3xl font-semibold">{value}</span>
      {note && (
        <span className="mt-1 block text-xs text-muted-foreground">{note}</span>
      )}
    </>
  );

  return href ? (
    <Link
      href={href}
      className="block px-5 py-5 transition-colors hover:bg-accent/40"
    >
      {isi}
    </Link>
  ) : (
    <div className="px-5 py-5">{isi}</div>
  );
}

export default async function AdminRingkasanPage() {
  await requireAdmin();

  const awalBulan = new Date();
  awalBulan.setDate(1);
  awalBulan.setHours(0, 0, 0, 0);

  const [
    pengguna,
    undanganTotal,
    undanganTerbit,
    undanganKedaluwarsa,
    templateAktif,
    templateTotal,
    pendapatanTotal,
    pendapatanBulanIni,
    bayarTertunda,
    bayarGagal,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.invitation.count(),
    prisma.invitation.count({ where: { status: "PUBLISHED" } }),
    prisma.invitation.count({ where: { status: "EXPIRED" } }),
    prisma.template.count({ where: { isActive: true } }),
    prisma.template.count(),
    prisma.payment.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { status: "PAID", paidAt: { gte: awalBulan } },
      _sum: { amount: true },
    }),
    prisma.payment.count({ where: { status: "PENDING" } }),
    prisma.payment.count({ where: { status: "FAILED" } }),
  ]);

  const namaBulan = awalBulan.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Panel operator
        </h1>
        <p className="mt-2 max-w-[64ch] text-muted-foreground">
          Angka di halaman ini adalah metadata platform. Isi undangan, daftar
          tamu, dan nominal amplop milik pengguna tidak pernah muncul di sini.
        </p>
      </div>

      <AdminNav active="/admin" />

      <Helai>
        <HelaiKepala
          title="Pendapatan Lungsin"
          description="Hanya pembayaran yang sudah dikonfirmasi webhook Xendit yang dihitung."
        />
        <div className="grid divide-y divide-border/70 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <Angka
            label="Total diterima"
            value={rupiah.format(pendapatanTotal._sum.amount ?? 0)}
            note="seluruh waktu"
            href="/admin/pembayaran"
          />
          <Angka
            label={`Bulan ini`}
            value={rupiah.format(pendapatanBulanIni._sum.amount ?? 0)}
            note={namaBulan}
            href="/admin/pembayaran"
          />
        </div>
      </Helai>

      <Helai>
        <HelaiKepala title="Undangan & pengguna" />
        <div className="grid divide-y divide-border/70 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 [&>*]:sm:border-l [&>*]:sm:border-border/70 [&>*:first-child]:sm:border-l-0">
          <Angka
            label="Pengguna terdaftar"
            value={String(pengguna)}
            href="/admin/pengguna"
          />
          <Angka
            label="Undangan dibuat"
            value={String(undanganTotal)}
            href="/admin/undangan"
          />
          <Angka
            label="Sedang terbit"
            value={String(undanganTerbit)}
            href="/admin/undangan"
          />
          <Angka
            label="Masa aktif habis"
            value={String(undanganKedaluwarsa)}
            href="/admin/undangan"
          />
        </div>
      </Helai>

      <Helai>
        <HelaiKepala
          title="Perlu diperhatikan"
          description="Tagihan tertunda yang menumpuk biasanya berarti webhook tidak sampai — periksa log dan konfigurasi x-callback-token."
        />
        <div className="grid divide-y divide-border/70 sm:grid-cols-3 sm:divide-y-0 [&>*]:sm:border-l [&>*]:sm:border-border/70 [&>*:first-child]:sm:border-l-0">
          <Angka
            label="Tagihan tertunda"
            value={String(bayarTertunda)}
            note="status PENDING"
            href="/admin/pembayaran"
          />
          <Angka
            label="Tagihan gagal"
            value={String(bayarGagal)}
            note="dibatalkan atau kedaluwarsa"
            href="/admin/pembayaran"
          />
          <Angka
            label="Template aktif"
            value={`${templateAktif} / ${templateTotal}`}
            note="tampil di galeri publik"
            href="/admin/template"
          />
        </div>
      </Helai>

      <HelaiIsi className="border-t border-border/70 px-0 text-sm text-muted-foreground">
        Pendapatan dihitung dari kolom <code>Payment.amount</code>, bukan dari
        harga paket saat ini — jadi perubahan harga di kemudian hari tidak
        menulis ulang riwayat.
      </HelaiIsi>
    </div>
  );
}
