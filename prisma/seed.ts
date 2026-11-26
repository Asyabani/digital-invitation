import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  TEMPLATE_CATALOG,
  assertCatalogSehat,
  toTemplateRow,
} from "./templates";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  assertCatalogSehat();

  let dibuat = 0;
  let diperbarui = 0;

  // Urutan dalam kategori menentukan foto sampul mana yang dipakai, supaya
  // sepuluh template satu kategori tidak semuanya memakai foto yang sama.
  const urutanKategori = new Map<string, number>();

  for (const t of TEMPLATE_CATALOG) {
    const urutan = urutanKategori.get(t.category) ?? 0;
    urutanKategori.set(t.category, urutan + 1);
    const row = toTemplateRow(t, urutan);
    const ada = await prisma.template.findUnique({
      where: { slug: t.slug },
      select: { id: true },
    });

    await prisma.template.upsert({
      where: { slug: t.slug },
      // `isActive` sengaja TIDAK ikut diperbarui: admin mungkin sudah
      // mematikan sebuah template, dan seed ulang tidak boleh menyalakannya
      // kembali diam-diam.
      update: {
        name: row.name,
        category: row.category,
        previewImage: row.previewImage,
        defaultContent: row.defaultContent,
        defaultTheme: row.defaultTheme,
        defaultSections: row.defaultSections,
      },
      create: row,
    });

    if (ada) diperbarui++;
    else dibuat++;
  }

  const perKategori = await prisma.template.groupBy({
    by: ["category"],
    _count: true,
    orderBy: { category: "asc" },
  });

  console.log(`✓ template: ${dibuat} dibuat, ${diperbarui} diperbarui`);
  for (const k of perKategori) {
    console.log(`  ${k.category}: ${k._count}`);
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  if (adminEmail) {
    const user = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: { id: true, role: true },
    });
    if (!user) {
      console.log(
        `! SEED_ADMIN_EMAIL=${adminEmail} belum pernah masuk — jalankan lagi setelah login pertamanya.`,
      );
    } else if (user.role === "ADMIN") {
      console.log(`✓ admin: ${adminEmail} (sudah admin)`);
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "ADMIN" },
      });
      console.log(`✓ admin: ${adminEmail} diangkat jadi ADMIN`);
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
