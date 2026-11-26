import { themeSchema, contentSchema } from "@/lib/validation/invitation";
import { fontStack } from "@/lib/font-stacks";
import { layoutSpec } from "@/lib/invitation-layouts";

/** Palet cadangan bila `defaultTheme` tidak lolos validasi. */
const CADANGAN = {
  palette: {
    primary: "#13233f",
    secondary: "#c08a2e",
    background: "#e6e2d8",
    text: "#16213a",
  },
  font: { heading: "Playfair Display", body: "Inter" },
  layout: "klasik" as const,
};

/**
 * Pratinjau template sebagai sehelai kain: paletnya sendiri yang jadi
 * gambarnya, bukan foto stok. Dipakai galeri publik dan panel admin, jadi
 * keduanya tidak pernah menunjukkan template yang sama dengan warna berbeda.
 *
 * Font judul ikut dipakai di sini — itulah separuh dari yang membedakan satu
 * template dari yang lain, dan swatch yang semuanya memakai satu font membuat
 * empat puluh template terlihat seperti empat puluh kotak warna.
 */
/**
 * Ambil `coverImage` dari kolom `defaultContent` sebuah template.
 *
 * Dipakai galeri publik dan panel admin. Sengaja longgar: `defaultContent`
 * bertipe `Json` dari Prisma, dan template lama bisa saja belum punya foto.
 * Yang tidak cocok mengembalikan `undefined`, dan kartunya jatuh ke kain
 * berpalet — bukan gambar rusak.
 */
export function coverOf(defaultContent: unknown): string | undefined {
  const parsed = contentSchema.safeParse(defaultContent);
  return parsed.success ? parsed.data.coverImage : undefined;
}

export function TemplateSwatch({
  theme,
  name,
  coverImage,
  caption,
  ratio = "aspect-[4/5]",
}: {
  theme: unknown;
  name: string;
  /** Foto sampul template; tanpa ini kartunya jatuh ke kain berpalet. */
  coverImage?: string;
  /** Baris tambahan di bawah tata letak; kosongkan bila tidak perlu. */
  caption?: string;
  ratio?: string;
}) {
  const parsed = themeSchema.safeParse(theme);
  const t = parsed.success ? parsed.data : CADANGAN;
  const p = t.palette;

  const adaFoto = Boolean(coverImage);

  return (
    <span
      className={`relative flex ${ratio} flex-col justify-between overflow-hidden p-7`}
      style={{
        backgroundColor: p.background,
        color: adaFoto ? "#fff" : p.text,
        backgroundImage: adaFoto
          ? undefined
          : `repeating-linear-gradient(to right, ${p.text}14 0 1px, transparent 1px 2.25rem)`,
      }}
    >
      {/*
        Kalau template punya foto sampul, fotonya yang jadi kartunya — itu
        yang sebenarnya dilihat calon pemilik. Paletnya tetap disebut lewat
        pita benang di atas, jadi dua sinyalnya tidak saling menghapus.
      */}
      {coverImage && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverImage}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <span
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgb(0 0 0 / .30), rgb(0 0 0 / .12) 38%, rgb(0 0 0 / .78))",
            }}
          />
        </>
      )}

      <span
        aria-hidden
        className="relative block h-1.5 w-full"
        style={{
          background: `repeating-linear-gradient(to right, ${p.primary} 0 14px, ${p.secondary} 14px 20px)`,
        }}
      />
      {/*
        Nama duduk di bawah, bukan di tengah. Di tengah ia jatuh tepat di
        bagian foto yang paling terang dan scrim-nya paling tipis — "Sage
        Tenang" di atas kebaya putih praktis hilang. Di bawah, scrim selalu
        paling pekat.
      */}
      <span className="relative block">
        <span
          aria-hidden
          className="mb-4 block h-px w-16"
          style={{ backgroundColor: adaFoto ? "#ffffff99" : p.secondary }}
        />
        <span
          className="block text-3xl leading-tight transition-opacity group-hover:opacity-80"
          style={{
            color: adaFoto ? "#fff" : p.primary,
            fontFamily: fontStack(t.font.heading, "serif"),
          }}
        >
          {name}
        </span>
        {/*
          Yang disebut di sini adalah arketipe tata letak, bukan kategori:
          kartu sudah dikelompokkan per kategori, sementara susunan halaman
          justru yang paling membedakan satu template dari yang lain dan
          paling sulit ditebak dari sepetak warna.
        */}
        <span className="mt-2 block text-sm opacity-70">
          Tata letak {layoutSpec(t.layout).label}
        </span>
        {caption && (
          <span className="mt-0.5 block text-xs opacity-55">{caption}</span>
        )}
      </span>
    </span>
  );
}
