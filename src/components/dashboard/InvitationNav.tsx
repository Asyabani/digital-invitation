import Link from "next/link";
import {
  FileText,
  Palette,
  Users,
  CalendarCheck,
  MessageSquare,
  Gift,
} from "lucide-react";

const TABS = [
  { href: "edit", label: "Konten", Icon: FileText },
  { href: "tema", label: "Tema", Icon: Palette },
  { href: "tamu", label: "Tamu", Icon: Users },
  { href: "rsvp", label: "RSVP", Icon: CalendarCheck },
  { href: "ucapan", label: "Ucapan", Icon: MessageSquare },
  { href: "amplop", label: "Amplop", Icon: Gift },
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
    <nav
      aria-label="Bagian undangan"
      className="-mx-1 flex gap-1 overflow-x-auto rounded-xl bg-muted/70 p-1"
    >
      {TABS.map(({ href, label, Icon }) => {
        const isActive = href === active;
        return (
          <Link
            key={href}
            href={`/dashboard/${invitationId}/${href}`}
            aria-current={isActive ? "page" : undefined}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${
              isActive
                ? "bg-card font-medium text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
