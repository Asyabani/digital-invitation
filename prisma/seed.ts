import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const defaultSections = [
  { key: "cover", enabled: true, order: 0 },
  { key: "opening", enabled: true, order: 1 },
  { key: "couple", enabled: true, order: 2 },
  { key: "countdown", enabled: true, order: 3 },
  { key: "gallery", enabled: true, order: 4 },
  { key: "location", enabled: true, order: 5 },
  { key: "rsvp", enabled: true, order: 6 },
  { key: "greetings", enabled: true, order: 7 },
  { key: "gift", enabled: true, order: 8 },
  { key: "closing", enabled: true, order: 9 },
];

const defaultTheme = {
  palette: {
    primary: "#8B5E3C",
    secondary: "#D9B99B",
    background: "#FAF6F0",
    text: "#3A2E26",
  },
  font: { heading: "Playfair Display", body: "Inter" },
};

const defaultContent = {
  subject: { groomName: "Mempelai Pria", brideName: "Mempelai Wanita" },
  event: {
    date: "2026-12-31",
    time: "10:00",
    timezone: "WIB",
    venueName: "Gedung Serbaguna",
    address: "Jl. Contoh No. 1, Kota",
  },
  gallery: [],
};

async function main() {
  const templates = [
    {
      name: "Klasik Elegan",
      slug: "klasik-elegan",
      category: "pernikahan",
      previewImage: "/templates/klasik-elegan.jpg",
    },
    {
      name: "Floral Lembut",
      slug: "floral-lembut",
      category: "pernikahan",
      previewImage: "/templates/floral-lembut.jpg",
    },
    {
      name: "Ceria Aqiqah",
      slug: "ceria-aqiqah",
      category: "aqiqah",
      previewImage: "/templates/ceria-aqiqah.jpg",
    },
  ];

  for (const t of templates) {
    await prisma.template.upsert({
      where: { slug: t.slug },
      update: {},
      create: {
        ...t,
        defaultContent,
        defaultTheme,
        defaultSections,
      },
    });
    console.log(`✓ template: ${t.slug}`);
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
