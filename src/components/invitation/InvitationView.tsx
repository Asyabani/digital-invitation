import type {
  Content,
  Theme,
  SectionsOrder,
  GiftConfig,
} from "@/lib/validation/invitation";
import { googleCalendarUrl, whatsappShareUrl } from "@/lib/calendar";
import { fontStack } from "@/lib/font-stacks";
import { invitationTitle, prettyEventDate } from "@/lib/invitation-title";
import { Countdown } from "./Countdown";
import { RsvpForm } from "./RsvpForm";
import { GreetingForm } from "./GreetingForm";
import { GiftForm } from "./GiftForm";
import { MusicPlayer } from "./MusicPlayer";

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
  /** Konfigurasi amplop digital; `null` = section amplop tidak dirender. */
  giftConfig?: GiftConfig | null;
  /** URL publik undangan, untuk tombol bagikan WhatsApp. */
  publicUrl?: string;
  interactive?: boolean;
  showWatermark?: boolean;
  /**
   * `preview` = bilah "mode pratinjau" untuk pemilik di editor.
   * `brand` = baris branding halus di kaki undangan yang sudah terbit.
   */
  watermarkVariant?: "preview" | "brand";
};

function Section({
  children,
  first = false,
}: {
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <section
      className={`px-6 text-center ${first ? "pb-16 pt-20 sm:pt-28" : "py-16"}`}
    >
      <div className="mx-auto flex max-w-lg flex-col items-center gap-6">
        {children}
      </div>
    </section>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <h2 className="inv-heading text-2xl font-semibold sm:text-3xl">
        {children}
      </h2>
      <span className="inv-rule" aria-hidden>
        <svg width="7" height="7" viewBox="0 0 7 7" fill="currentColor">
          <path d="M3.5 0 7 3.5 3.5 7 0 3.5z" />
        </svg>
      </span>
    </div>
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
    giftConfig = null,
    publicUrl,
    interactive = true,
    showWatermark = false,
    watermarkVariant = "preview",
  } = props;

  const ordered = [...sections]
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  const title = invitationTitle(content);
  const eventDateTime = `${content.event.date}T${content.event.time || "00:00"}:00`;
  const prettyDate = prettyEventDate(content.event.date);

  const rootStyle = {
    "--inv-primary": theme.palette.primary,
    "--inv-secondary": theme.palette.secondary,
    "--inv-bg": theme.palette.background,
    "--inv-text": theme.palette.text,
    "--inv-heading": fontStack(theme.font.heading, "serif"),
    "--inv-body": fontStack(theme.font.body, "sans"),
    backgroundColor: theme.palette.background,
    color: theme.palette.text,
    fontFamily: fontStack(theme.font.body, "sans"),
  } as React.CSSProperties;

  const calendarUrl = googleCalendarUrl({
    title,
    date: content.event.date,
    time: content.event.time,
    timezone: content.event.timezone,
    venueName: content.event.venueName,
    address: content.event.address,
  });

  function render(key: string) {
    switch (key) {
      case "cover":
        return (
          <Section key={key} first>
            {guestName && (
              <p className="inv-card px-5 py-3 text-sm">
                <span className="opacity-70">
                  Kepada Yth. Bapak/Ibu/Saudara/i
                </span>
                <br />
                <span className="font-medium">{guestName}</span>
              </p>
            )}
            <p className="text-xs uppercase tracking-[0.25em] opacity-60">
              Undangan
            </p>
            <h1 className="inv-heading text-4xl font-semibold leading-tight sm:text-5xl">
              {title}
            </h1>
            <span className="inv-rule" aria-hidden>
              <svg width="7" height="7" viewBox="0 0 7 7" fill="currentColor">
                <path d="M3.5 0 7 3.5 3.5 7 0 3.5z" />
              </svg>
            </span>
            <p className="text-base">{prettyDate}</p>
          </Section>
        );

      case "opening":
        return content.quote ? (
          <Section key={key}>
            <p className="inv-heading text-xl italic leading-relaxed sm:text-2xl">
              “{content.quote.text}”
            </p>
            {content.quote.source && (
              <p className="inv-note text-sm">— {content.quote.source}</p>
            )}
          </Section>
        ) : null;

      case "couple":
        return (
          <Section key={key}>
            <Heading>{title}</Heading>
            {content.story && content.story.length > 0 && (
              <div className="w-full space-y-5 text-left">
                {content.story.map((item, i) => (
                  <div key={i} className="inv-card p-4">
                    <h3 className="inv-heading text-base font-medium">
                      {item.title}
                    </h3>
                    <p className="inv-note mt-1 leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
            )}
          </Section>
        );

      case "countdown":
        return (
          <Section key={key}>
            <Heading>Menuju Hari Bahagia</Heading>
            <Countdown target={eventDateTime} />
          </Section>
        );

      case "gallery":
        return content.gallery.length > 0 ? (
          <Section key={key}>
            <Heading>Galeri</Heading>
            <div className="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-3">
              {content.gallery.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={url}
                  alt={`Foto ${i + 1} dari ${title}`}
                  loading="lazy"
                  decoding="async"
                  width={400}
                  height={400}
                  className="aspect-square w-full rounded-xl bg-black/5 object-cover"
                />
              ))}
            </div>
          </Section>
        ) : null;

      case "location":
        return (
          <Section key={key}>
            <Heading>Lokasi Acara</Heading>
            <div className="inv-card w-full space-y-1 p-5">
              <p className="inv-heading text-lg font-medium">
                {content.event.venueName}
              </p>
              <p className="inv-note">{content.event.address}</p>
              <p className="inv-note">
                {prettyDate} · {content.event.time} {content.event.timezone}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2.5">
              {content.event.maps?.url && (
                <a
                  href={content.event.maps.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inv-button inv-button-outline"
                >
                  Buka Google Maps
                </a>
              )}
              {calendarUrl && (
                <a
                  href={calendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inv-button inv-button-outline"
                >
                  Tambah ke Kalender
                </a>
              )}
            </div>
          </Section>
        );

      case "rsvp":
        return (
          <Section key={key}>
            <Heading>Konfirmasi Kehadiran</Heading>
            <p className="inv-note">
              Mohon konfirmasi kehadiran Anda agar kami dapat menyiapkan tempat
              dengan baik.
            </p>
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
            <Heading>Ucapan & Doa</Heading>
            <GreetingForm
              invitationId={invitationId}
              personalSlug={personalSlug}
              defaultName={guestName}
              initialGreetings={greetings}
              interactive={interactive}
            />
          </Section>
        );

      case "gift":
        // Hanya dirender bila pemilik sudah mengisi rekening/QRIS dan paketnya
        // memuat fitur amplop digital (ditentukan pemanggil lewat `giftConfig`).
        return giftConfig ? (
          <Section key={key}>
            <Heading>Amplop Digital</Heading>
            <GiftForm
              invitationId={invitationId}
              personalSlug={personalSlug}
              defaultName={guestName}
              giftConfig={giftConfig}
              interactive={interactive}
            />
          </Section>
        ) : null;

      case "closing":
        return (
          <Section key={key}>
            <p className="inv-note leading-relaxed">
              Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila
              Bapak/Ibu/Saudara/i berkenan hadir.
            </p>
            <h2 className="inv-heading text-3xl font-semibold">Terima Kasih</h2>
            <p className="inv-heading text-lg">{title}</p>
            {publicUrl && (
              <a
                href={whatsappShareUrl(
                  `Undangan ${title} — ${prettyDate}`,
                  publicUrl,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inv-button inv-button-outline"
              >
                Bagikan lewat WhatsApp
              </a>
            )}
          </Section>
        );

      default:
        return null;
    }
  }

  return (
    <div style={rootStyle} className="relative min-h-full">
      {showWatermark && watermarkVariant === "preview" && (
        <div
          className="sticky top-0 z-10 px-4 py-2 text-center text-xs"
          style={{
            background: "color-mix(in oklab, var(--inv-primary) 12%, white)",
            color: "var(--inv-primary)",
          }}
        >
          Mode pratinjau — terbitkan untuk membagikan ke tamu.
        </div>
      )}

      {ordered.map((s) => render(s.key))}

      {showWatermark && watermarkVariant === "brand" && (
        <p
          className="border-t px-6 py-5 text-center text-xs"
          style={{
            borderColor: "color-mix(in oklab, var(--inv-text) 10%, transparent)",
            color: "color-mix(in oklab, var(--inv-text) 55%, transparent)",
          }}
        >
          Dibuat dengan Undangan Digital
        </p>
      )}

      {theme.music?.url && (
        <MusicPlayer
          url={theme.music.url}
          autoplay={interactive && theme.music.autoplay}
        />
      )}
    </div>
  );
}
