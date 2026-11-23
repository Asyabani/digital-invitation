import type {
  Content,
  Theme,
  SectionsOrder,
} from "@/lib/validation/invitation";
import { Countdown } from "./Countdown";
import { RsvpForm } from "./RsvpForm";
import { GreetingForm } from "./GreetingForm";

type Greeting = { id: string; name: string; message: string };

export type InvitationViewProps = {
  invitationId: string;
  slug: string;
  content: Content;
  theme: Theme;
  sections: SectionsOrder;
  guestName?: string;
  personalSlug?: string;
  greetings?: Greeting[];
  interactive?: boolean;
  showWatermark?: boolean;
};

function subjectTitle(c: Content): string {
  const s = c.subject;
  if (s.groomName && s.brideName) return `${s.groomName} & ${s.brideName}`;
  if (s.childName) return s.childName;
  return s.title ?? "Undangan";
}

function Section({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <section className="px-6 py-16 text-center" style={style}>
      <div className="mx-auto max-w-xl space-y-6">{children}</div>
    </section>
  );
}

export function InvitationView(props: InvitationViewProps) {
  const {
    invitationId,
    content,
    theme,
    sections,
    guestName,
    personalSlug,
    greetings = [],
    interactive = true,
    showWatermark = false,
  } = props;

  const ordered = [...sections]
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  const title = subjectTitle(content);
  const eventDateTime = `${content.event.date}T${content.event.time || "00:00"}:00`;
  const prettyDate = (() => {
    const d = new Date(content.event.date);
    return Number.isNaN(d.getTime())
      ? content.event.date
      : d.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
  })();

  const rootStyle: React.CSSProperties = {
    backgroundColor: theme.palette.background,
    color: theme.palette.text,
    fontFamily: theme.font.body,
  };
  const headingStyle: React.CSSProperties = {
    fontFamily: theme.font.heading,
    color: theme.palette.primary,
  };

  function render(key: string) {
    switch (key) {
      case "cover":
        return (
          <Section key={key}>
            {guestName && (
              <p className="text-sm opacity-70">
                Kepada Yth. Bapak/Ibu/Saudara/i
                <br />
                <span className="font-medium">{guestName}</span>
              </p>
            )}
            <h1 className="text-4xl font-semibold" style={headingStyle}>
              {title}
            </h1>
            <p className="opacity-80">{prettyDate}</p>
          </Section>
        );
      case "opening":
        return content.quote ? (
          <Section key={key}>
            <p className="text-lg italic">“{content.quote.text}”</p>
            {content.quote.source && (
              <p className="text-sm opacity-70">— {content.quote.source}</p>
            )}
          </Section>
        ) : null;
      case "couple":
        return (
          <Section key={key}>
            <h2 className="text-2xl font-semibold" style={headingStyle}>
              {title}
            </h2>
            {content.story && content.story.length > 0 && (
              <div className="space-y-4 text-left">
                {content.story.map((item, i) => (
                  <div key={i}>
                    <h3 className="font-medium" style={headingStyle}>
                      {item.title}
                    </h3>
                    <p className="text-sm opacity-80">{item.body}</p>
                  </div>
                ))}
              </div>
            )}
          </Section>
        );
      case "countdown":
        return (
          <Section key={key}>
            <h2 className="text-xl font-semibold" style={headingStyle}>
              Menuju Hari Bahagia
            </h2>
            <Countdown target={eventDateTime} />
          </Section>
        );
      case "gallery":
        return content.gallery.length > 0 ? (
          <Section key={key}>
            <h2 className="text-xl font-semibold" style={headingStyle}>
              Galeri
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {content.gallery.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={url}
                  alt={`Galeri ${i + 1}`}
                  loading="lazy"
                  className="aspect-square w-full rounded-lg object-cover"
                />
              ))}
            </div>
          </Section>
        ) : null;
      case "location":
        return (
          <Section key={key}>
            <h2 className="text-xl font-semibold" style={headingStyle}>
              Lokasi Acara
            </h2>
            <p className="font-medium">{content.event.venueName}</p>
            <p className="text-sm opacity-80">{content.event.address}</p>
            <p className="text-sm opacity-80">
              {prettyDate} · {content.event.time} {content.event.timezone}
            </p>
            {content.event.maps?.url && (
              <a
                href={content.event.maps.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-lg border px-4 py-2 text-sm"
                style={{ borderColor: theme.palette.primary }}
              >
                Buka Google Maps
              </a>
            )}
          </Section>
        );
      case "rsvp":
        return (
          <Section key={key}>
            <h2 className="text-xl font-semibold" style={headingStyle}>
              Konfirmasi Kehadiran
            </h2>
            <RsvpForm
              invitationId={invitationId}
              personalSlug={personalSlug}
              defaultName={guestName}
              interactive={interactive}
            />
          </Section>
        );
      case "greetings":
        return (
          <Section key={key}>
            <h2 className="text-xl font-semibold" style={headingStyle}>
              Ucapan & Doa
            </h2>
            <GreetingForm
              invitationId={invitationId}
              personalSlug={personalSlug}
              defaultName={guestName}
              initialGreetings={greetings}
              interactive={interactive}
            />
          </Section>
        );
      case "closing":
        return (
          <Section key={key}>
            <p className="opacity-80">
              Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila
              Bapak/Ibu/Saudara/i berkenan hadir.
            </p>
            <h2 className="text-2xl font-semibold" style={headingStyle}>
              Terima Kasih
            </h2>
          </Section>
        );
      // "gift" dirender di Fase 3 (amplop digital).
      default:
        return null;
    }
  }

  return (
    <div style={rootStyle} className="relative min-h-full">
      {showWatermark && (
        <div className="sticky top-0 z-10 bg-amber-100 px-4 py-2 text-center text-xs text-amber-900">
          Mode pratinjau — terbitkan untuk membagikan ke tamu.
        </div>
      )}
      {ordered.map((s) => render(s.key))}
    </div>
  );
}
