import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { AdminNav } from "@/components/admin/AdminNav";
import { Helai, HelaiKepala } from "@/components/dashboard/Helai";
import { Tabel, Th, Td, Kosong } from "@/components/admin/Tabel";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getPackage } from "@/lib/packages";

export const metadata = { title: "Undangan — Admin Lungsin" };
export const instant = false;

const BATAS = 100;

const tanggal = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function AdminUndanganPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();

  const { q } = await searchParams;
  const cari = q?.trim() ?? "";

  // Pencarian untuk dukungan: pengguna biasanya menyebut tautannya, bukan id.
  const where = cari
    ? {
        OR: [
          { slug: { contains: cari, mode: "insensitive" as const } },
          { title: { contains: cari, mode: "insensitive" as const } },
          {
            user: {
              email: { contains: cari, mode: "insensitive" as const },
            },
          },
        ],
      }
    : {};

  const [undangan, total] = await Promise.all([
    prisma.invitation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: BATAS,
      // Hanya metadata. `content`, `giftConfig`, tamu, RSVP, ucapan, dan
      // amplop sengaja tidak diambil — lihat docs/03 §5.
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        package: true,
        activeUntil: true,
        createdAt: true,
        user: { select: { email: true } },
        template: { select: { name: true } },
      },
    }),
    prisma.invitation.count({ where }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Undangan
        </h1>
        <p className="mt-2 max-w-[64ch] text-muted-foreground">
          Metadata undangan seluruh pengguna, untuk menolong saat ada yang
          bertanya. Isi undangan, daftar tamu, jawaban RSVP, dan amplop tidak
          bisa dibuka dari sini.
        </p>
      </div>

      <AdminNav active="/admin/undangan" />

      <Helai>
        <HelaiKepala
          title={
            cari
              ? `${total} hasil untuk “${cari}”`
              : `${total} undangan`
          }
          description={
            total > BATAS
              ? `Menampilkan ${BATAS} yang terbaru. Pakai pencarian untuk menemukan yang lebih lama.`
              : undefined
          }
          action={
            <form action="/admin/undangan" className="flex gap-2">
              <Input
                type="search"
                name="q"
                defaultValue={cari}
                placeholder="Slug, judul, atau email"
                aria-label="Cari undangan"
                className="w-56"
              />
              <Button type="submit" variant="outline" size="sm">
                Cari
              </Button>
            </form>
          }
        />

        <Tabel caption="Daftar undangan seluruh pengguna">
          <thead>
            <tr>
              <Th>Undangan</Th>
              <Th>Pemilik</Th>
              <Th>Status</Th>
              <Th>Paket</Th>
              <Th>Aktif sampai</Th>
              <Th>Dibuat</Th>
            </tr>
          </thead>
          <tbody>
            {undangan.length === 0 ? (
              <Kosong colSpan={6}>
                {cari ? (
                  <>
                    Tidak ada undangan yang cocok.{" "}
                    <Link href="/admin/undangan" className="underline">
                      Tampilkan semua
                    </Link>
                    .
                  </>
                ) : (
                  "Belum ada undangan yang dibuat."
                )}
              </Kosong>
            ) : (
              undangan.map((u) => (
                <tr key={u.id} className="hover:bg-accent/30">
                  <Td>
                    <span className="block max-w-[28ch] truncate font-medium">
                      {u.title}
                    </span>
                    {u.status === "PUBLISHED" ? (
                      <Link
                        href={`/u/${u.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block max-w-[28ch] truncate text-xs text-muted-foreground underline underline-offset-2"
                      >
                        /u/{u.slug}
                      </Link>
                    ) : (
                      <span className="block max-w-[28ch] truncate text-xs text-muted-foreground">
                        /u/{u.slug}
                      </span>
                    )}
                  </Td>
                  <Td>
                    <span className="block max-w-[26ch] truncate">
                      {u.user.email}
                    </span>
                    <span className="block max-w-[26ch] truncate text-xs text-muted-foreground">
                      {u.template.name}
                    </span>
                  </Td>
                  <Td>
                    {u.status === "PUBLISHED" ? (
                      <Badge variant="success">Terbit</Badge>
                    ) : u.status === "EXPIRED" ? (
                      <Badge variant="warning">Kedaluwarsa</Badge>
                    ) : (
                      <Badge variant="outline">Draft</Badge>
                    )}
                  </Td>
                  <Td>
                    {u.package ? (
                      getPackage(u.package).name
                    ) : (
                      <span className="text-muted-foreground">belum bayar</span>
                    )}
                  </Td>
                  <Td>
                    {u.activeUntil ? (
                      tanggal.format(u.activeUntil)
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </Td>
                  <Td>{tanggal.format(u.createdAt)}</Td>
                </tr>
              ))
            )}
          </tbody>
        </Tabel>
      </Helai>
    </div>
  );
}
