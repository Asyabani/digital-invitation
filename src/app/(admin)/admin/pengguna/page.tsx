import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { AdminNav } from "@/components/admin/AdminNav";
import { Helai, HelaiKepala } from "@/components/dashboard/Helai";
import { Tabel, Th, Td, Kosong } from "@/components/admin/Tabel";
import { Badge } from "@/components/ui/badge";
import { RoleToggle } from "@/components/admin/RoleToggle";

export const metadata = { title: "Pengguna — Admin Lungsin" };
export const instant = false;

const BATAS = 200;

const tanggal = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function AdminPenggunaPage() {
  const admin = await requireAdmin();

  const [pengguna, total, jumlahAdmin] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: BATAS,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { invitations: true } },
      },
    }),
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Pengguna
        </h1>
        <p className="mt-2 max-w-[64ch] text-muted-foreground">
          {total} akun terdaftar, {jumlahAdmin} di antaranya admin. Peran admin
          hanya membuka panel ini — ia tidak memberi akses ke undangan milik
          orang lain lewat dashboard.
        </p>
      </div>

      <AdminNav active="/admin/pengguna" />

      <Helai>
        <HelaiKepala
          title="Akun"
          description={
            total > BATAS
              ? `Menampilkan ${BATAS} akun terbaru dari ${total}.`
              : undefined
          }
        />

        <Tabel caption="Daftar pengguna terdaftar">
          <thead>
            <tr>
              <Th>Akun</Th>
              <Th>Peran</Th>
              <Th numeric>Undangan</Th>
              <Th>Terdaftar</Th>
              <Th>Ubah peran</Th>
            </tr>
          </thead>
          <tbody>
            {pengguna.length === 0 ? (
              <Kosong colSpan={5}>
                Belum ada akun. Akun pertama muncul setelah seseorang masuk
                lewat Google atau tautan email.
              </Kosong>
            ) : (
              pengguna.map((u) => (
                <tr key={u.id} className="hover:bg-accent/30">
                  <Td>
                    <span className="block max-w-[30ch] truncate font-medium">
                      {u.name ?? "Tanpa nama"}
                    </span>
                    <span className="block max-w-[30ch] truncate text-xs text-muted-foreground">
                      {u.email}
                    </span>
                  </Td>
                  <Td>
                    {u.role === "ADMIN" ? (
                      <Badge>Admin</Badge>
                    ) : (
                      <Badge variant="outline">Pengguna</Badge>
                    )}
                  </Td>
                  <Td numeric>{u._count.invitations}</Td>
                  <Td>{tanggal.format(u.createdAt)}</Td>
                  <Td>
                    <RoleToggle
                      userId={u.id}
                      email={u.email}
                      role={u.role}
                      diriSendiri={u.id === admin.id}
                    />
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </Tabel>
      </Helai>
    </div>
  );
}
