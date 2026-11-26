import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { AdminNav } from "@/components/admin/AdminNav";
import { Helai, HelaiKepala } from "@/components/dashboard/Helai";
import { TemplateToggle } from "@/components/admin/TemplateToggle";
import {
  TemplateSwatch,
  coverOf,
} from "@/components/template/TemplateSwatch";
import { invitationFontVars } from "@/lib/fonts-invitation";
import { themeSchema } from "@/lib/validation/invitation";
import { KATEGORI_LABEL, KATEGORI_URUT } from "@/lib/template-category";

export const metadata = { title: "Template — Admin Lungsin" };
export const instant = false;

export default async function AdminTemplatePage() {
  await requireAdmin();

  const templates = await prisma.template.findMany({
    orderBy: [{ category: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      isActive: true,
      defaultTheme: true,
      defaultContent: true,
      _count: { select: { invitations: true } },
    },
  });

  const aktif = templates.filter((t) => t.isActive).length;

  return (
    <div className={`${invitationFontVars} space-y-8`}>
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Template
        </h1>
        <p className="mt-2 max-w-[64ch] text-muted-foreground">
          {aktif} dari {templates.length} template tampil di galeri publik.
          Mematikan template menyembunyikannya dari galeri dan mencegahnya
          dipakai undangan baru; undangan yang sudah memakainya tidak
          terpengaruh.
        </p>
      </div>

      <AdminNav active="/admin/template" />

      {KATEGORI_URUT.map((kategori) => {
        const grup = templates.filter((t) => t.category === kategori);
        if (grup.length === 0) return null;

        return (
          <Helai key={kategori}>
            <HelaiKepala
              title={KATEGORI_LABEL[kategori]}
              description={`${grup.filter((t) => t.isActive).length} dari ${grup.length} aktif`}
            />
            {/* Garis kisi dari border tiap sel — lihat catatan di /template. */}
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3">
              {grup.map((t) => {
                const parsed = themeSchema.safeParse(t.defaultTheme);
                const font = parsed.success
                  ? `${parsed.data.font.heading} · ${parsed.data.font.body}`
                  : "tema tidak valid";

                return (
                  <li
                    key={t.id}
                    className="flex flex-col border-b border-r border-border/70 bg-card"
                    data-nonaktif={t.isActive ? undefined : ""}
                  >
                    {/*
                      Template nonaktif diredupkan, bukan disembunyikan atau
                      dicoret: admin perlu tetap melihat apa yang dimatikan
                      dan bisa menyalakannya lagi dari tempat yang sama.
                    */}
                    <Link
                      href={`/template/${t.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Buka pratinjau publik template ${t.name}`}
                      className={`group block ${t.isActive ? "" : "opacity-45 grayscale"}`}
                    >
                      <TemplateSwatch
                        theme={t.defaultTheme}
                        name={t.name}
                        coverImage={coverOf(t.defaultContent)}
                        caption={t.isActive ? "aktif" : "nonaktif"}
                        ratio="aspect-[5/3]"
                      />
                    </Link>

                    <div className="flex flex-1 flex-col gap-3 border-t border-border/70 p-4">
                      <div className="min-w-0 space-y-0.5">
                        <p className="truncate text-sm font-medium">{t.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {font}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          dipakai{" "}
                          <span className="tabular">{t._count.invitations}</span>{" "}
                          undangan
                        </p>
                      </div>
                      <div className="mt-auto">
                        <TemplateToggle
                          templateId={t.id}
                          name={t.name}
                          isActive={t.isActive}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Helai>
        );
      })}
    </div>
  );
}
