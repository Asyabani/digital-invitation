import Link from "next/link";

const TABS = [
  { href: "edit", label: "Isi" },
  { href: "tema", label: "Tema" },
  { href: "tamu", label: "Tamu" },
  { href: "rsvp", label: "RSVP" },
  { href: "ucapan", label: "Ucapan" },
  { href: "amplop", label: "Amplop" },
] as const;

/**
 * Navigasi antar bagian satu undangan (docs/06 §3).
 * Satu pita benang; yang sedang dibuka ditandai ikat — celup rintang di
 * bawahnya, bukan kotak berbingkai.
 */
export function InvitationNav({
  invitationId,
  active,
}: {
  invitationId: string;
  active: (typeof TABS)[number]["href"];
}) {
  return (
    <nav
      aria-label="Bagian undangan"
      className="flex gap-1 overflow-x-auto border-b border-border/70 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {TABS.map(({ href, label }) => {
        const isActive = href === active;
        return (
          <Link
            key={href}
            href={`/dashboard/${invitationId}/${href}`}
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
