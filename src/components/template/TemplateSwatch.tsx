import { themeSchema } from "@/lib/validation/invitation";
import { fontStack } from "@/lib/font-stacks";

/** Palet cadangan bila `defaultTheme` tidak lolos validasi. */
const CADANGAN = {
  palette: {
    primary: "#13233f",
    secondary: "#c08a2e",
    background: "#e6e2d8",
    text: "#16213a",
  },
  font: { heading: "Playfair Display", body: "Inter" },
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
export function TemplateSwatch({
  theme,
  name,
  caption,
  ratio = "aspect-[4/5]",
}: {
  theme: unknown;
  name: string;
  caption: string;
  ratio?: string;
}) {
  const parsed = themeSchema.safeParse(theme);
  const t = parsed.success ? parsed.data : CADANGAN;
  const p = t.palette;

  return (
    <span
      className={`flex ${ratio} flex-col justify-between p-7`}
      style={{
        backgroundColor: p.background,
        color: p.text,
        backgroundImage: `repeating-linear-gradient(to right, ${p.text}14 0 1px, transparent 1px 2.25rem)`,
      }}
    >
      <span
        aria-hidden
        className="block h-1.5 w-full"
        style={{
          background: `repeating-linear-gradient(to right, ${p.primary} 0 14px, ${p.secondary} 14px 20px)`,
        }}
      />
      <span className="block">
        <span
          className="block text-3xl leading-tight transition-opacity group-hover:opacity-80"
          style={{
            color: p.primary,
            fontFamily: fontStack(t.font.heading, "serif"),
          }}
        >
          {name}
        </span>
        <span className="mt-2 block text-xs uppercase tracking-widest opacity-60">
          {caption}
        </span>
      </span>
      <span
        aria-hidden
        className="block h-px w-16"
        style={{ backgroundColor: p.secondary }}
      />
    </span>
  );
}
