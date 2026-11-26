import Link from "next/link";

const TABS = [
  { href: "/admin", label: "Ringkasan" },
  { href: "/admin/template", label: "Template" },
  { href: "/admin/undangan", label: "Undangan" },
  { href: "/admin/pembayaran", label: "Pembayaran" },
  { href: "/admin/pengguna", label: "Pengguna" },
] as const;

export type AdminTab = (typeof TABS)[number]["href"];

/** Navigasi panel operator; satu pita benang, yang aktif ditandai ikat. */
export function AdminNav({ active }: { active: AdminTab }) {
  return (
    <nav
      aria-label="Bagian panel admin"
      className="flex gap-1 overflow-x-auto border-b border-border/70 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {TABS.map(({ href, label }) => {
        const isActive = href === active;
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`${
              isActive ? "ikat text-foreground" : "text-muted-foreground"
            } relative shrink-0 px-4 py-3 text-sm transition-colors hover:text-foreground`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
