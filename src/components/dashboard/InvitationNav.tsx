import Link from "next/link";

const TABS = [
  { href: "edit", label: "Konten" },
  { href: "tema", label: "Tema" },
  { href: "tamu", label: "Tamu" },
  { href: "rsvp", label: "RSVP" },
  { href: "ucapan", label: "Ucapan" },
  { href: "amplop", label: "Amplop" },
] as const;

/** Navigasi antar halaman pengelolaan satu undangan (docs/06 §3). */
export function InvitationNav({
  invitationId,
  active,
}: {
  invitationId: string;
  active: (typeof TABS)[number]["href"];
}) {
  return (
    <nav className="flex flex-wrap gap-1 text-sm">
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={`/dashboard/${invitationId}/${t.href}`}
          aria-current={t.href === active ? "page" : undefined}
          className={
            t.href === active
              ? "rounded-lg bg-neutral-900 px-3 py-1.5 font-medium text-white"
              : "rounded-lg px-3 py-1.5 text-neutral-600 hover:bg-neutral-100"
          }
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
