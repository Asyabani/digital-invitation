import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { AdminNav } from "@/components/admin/AdminNav";
import { Helai, HelaiKepala } from "@/components/dashboard/Helai";
import { Tabel, Th, Td, Kosong } from "@/components/admin/Tabel";
import { Badge } from "@/components/ui/badge";
import { getPackage } from "@/lib/packages";

export const metadata = { title: "Pembayaran — Admin Lungsin" };
export const instant = false;

const BATAS = 100;

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const waktu = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function AdminPembayaranPage() {
  await requireAdmin();

  const [pembayaran, total, diterima] = await Promise.all([
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: BATAS,
      select: {
        id: true,
        externalId: true,
        amount: true,
        package: true,
        status: true,
        paidAt: true,
        createdAt: true,
        user: { select: { email: true } },
        invitation: { select: { slug: true } },
      },
    }),
    prisma.payment.count(),
    prisma.payment.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Pembayaran
        </h1>
        <p className="mt-2 max-w-[64ch] text-muted-foreground">
          Pendapatan Lungsin dan jejak tagihan Xendit. Ini bukan amplop digital
          — uang antara tamu dan pemilik acara tidak melewati Lungsin dan tidak
          tercatat di sini.
        </p>
      </div>

      <AdminNav active="/admin/pembayaran" />

      <Helai>
        <HelaiKepala
          title={`${rupiah.format(diterima._sum.amount ?? 0)} diterima`}
          description={
            total > BATAS
              ? `${total} tagihan tercatat; menampilkan ${BATAS} yang terbaru.`
              : `${total} tagihan tercatat.`
          }
        />

        <Tabel caption="Daftar tagihan dan pembayaran">
          <thead>
            <tr>
              <Th>Dibuat</Th>
              <Th>Pembeli</Th>
              <Th>Undangan</Th>
              <Th>Paket</Th>
              <Th numeric>Nominal</Th>
              <Th>Status</Th>
              <Th>Dibayar</Th>
            </tr>
          </thead>
          <tbody>
            {pembayaran.length === 0 ? (
              <Kosong colSpan={7}>
                Belum ada tagihan. Tagihan pertama muncul begitu ada pengguna
                yang menekan &ldquo;Bayar &amp; terbitkan&rdquo;.
              </Kosong>
            ) : (
              pembayaran.map((p) => (
                <tr key={p.id} className="hover:bg-accent/30">
                  <Td>
                    <span className="block">{waktu.format(p.createdAt)}</span>
                    {/*
                      externalId adalah kunci yang dipakai webhook Xendit untuk
                      mencocokkan tagihan. Ditampilkan supaya bisa dicari di
                      dashboard Xendit saat ada pembayaran yang tidak nyangkut.
                    */}
                    <span className="block max-w-[22ch] truncate font-mono text-xs text-muted-foreground">
                      {p.externalId}
                    </span>
                  </Td>
                  <Td>
                    <span className="block max-w-[24ch] truncate">
                      {p.user.email}
                    </span>
                  </Td>
                  <Td>
                    <span className="block max-w-[22ch] truncate text-muted-foreground">
                      /u/{p.invitation.slug}
                    </span>
                  </Td>
                  <Td>{getPackage(p.package).name}</Td>
                  <Td numeric>{rupiah.format(p.amount)}</Td>
                  <Td>
                    {p.status === "PAID" ? (
                      <Badge variant="success">Lunas</Badge>
                    ) : p.status === "PENDING" ? (
                      <Badge variant="outline">Menunggu</Badge>
                    ) : p.status === "EXPIRED" ? (
                      <Badge variant="warning">Kedaluwarsa</Badge>
                    ) : (
                      <Badge variant="destructive">Gagal</Badge>
                    )}
                  </Td>
                  <Td>
                    {p.paidAt ? (
                      waktu.format(p.paidAt)
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </Tabel>
      </Helai>

      <p className="text-sm text-muted-foreground">
        Status di tabel ini hanya berubah lewat webhook Xendit. Tidak ada tombol
        untuk menandai lunas secara manual — itu disengaja, supaya catatan
        pendapatan tidak pernah berbeda dari yang benar-benar diterima.
      </p>
    </div>
  );
}
