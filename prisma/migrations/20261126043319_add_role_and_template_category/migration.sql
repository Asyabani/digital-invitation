-- Menambah Role (operator platform) dan menjadikan Template.category enum.
--
-- Prisma menawarkan DROP COLUMN + ADD COLUMN untuk perubahan tipe ini; itu akan
-- membuang kategori semua template yang sudah ada. Diganti dengan USING cast
-- yang memetakan nilai string lama ke anggota enum, termasuk varian lama
-- "ulang-tahun" (tanda hubung) yang tidak bisa jadi nama enum.

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TemplateCategory" AS ENUM ('PERNIKAHAN', 'AQIQAH', 'ULANG_TAHUN', 'KORPORAT');

-- AlterTable: konversi Template.category String -> TemplateCategory
ALTER TABLE "Template"
  ALTER COLUMN "category" TYPE "TemplateCategory"
  USING (
    CASE upper(replace(trim("category"), '-', '_'))
      WHEN 'PERNIKAHAN'  THEN 'PERNIKAHAN'
      WHEN 'AQIQAH'      THEN 'AQIQAH'
      WHEN 'ULANG_TAHUN' THEN 'ULANG_TAHUN'
      WHEN 'KORPORAT'    THEN 'KORPORAT'
      ELSE 'PERNIKAHAN'
    END
  )::"TemplateCategory";

-- AlterTable
ALTER TABLE "User" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'USER';
