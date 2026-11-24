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
  /** Teks bilah pratinjau; default ditujukan untuk pemilik di editor. */
  watermarkLabel?: string;
};

/**
 * Satu pita pakan. Kerapatannya berganti-ganti supaya gulirannya punya irama:
 * pita rapat diikuti pita lapang, bukan jarak seragam dari atas ke bawah.
 * Produk menyumbang struktur ini; warnanya tetap milik pemilik.
 */
function Section({
  children,
  index = 0,
}: {
  children: React.ReactNode;
  index?: number;
}) {
  const first = index === 0;
  const rapat = index % 2 === 0;
  return (
    <section
      className={[
        "relative px-6 text-center",
        first ? "pb-16 pt-20 sm:pt-28" : rapat ? "py-14" : "py-20 sm:py-24",
        first ? "" : "inv-pinggiran",
      ].join(" ")}
      style={
        rapat && !first
          ? {
              background:
                "color-mix(in oklab, var(--inv-text) 3.5%, transparent)",
            }
          : undefined
      }
    >
      <div className="relative z-[1] mx-auto flex max-w-lg flex-col items-center gap-6">
        {children}
      </div>
    </section>
  );
}

/** Judul pita, ditutup sepasang benang rapat seperti pinggiran kain. */
function Heading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <h2 className="inv-heading text-2xl font-semibold sm:text-3xl">
        {children}
      </h2>
      <span
        className="block h-[3px] w-14"
        style={{
          background:
            "repeating-linear-gradient(to right, var(--inv-secondary) 0 5px, transparent 5px 8px)",
        }}
        aria-hidden
      />
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
    watermarkLabel = "Mode pratinjau — terbitkan untuk membagikan ke tamu.",
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

  function render(key: string, index: number) {
    switch (key) {
      case "cover":
        return (
          <Section key={key} index={index}>
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
            <span
              className="block h-[3px] w-20"
              style={{
                background:
                  "repeating-linear-gradient(to right, var(--inv-secondary) 0 5px, transparent 5px 8px)",
              }}
              aria-hidden
            />
            <p className="text-base">{prettyDate}</p>
          </Section>
        );

      case "opening":
        return content.quote ? (
          <Section key={key} index={index}>
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
          <Section key={key} index={index}>
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
          <Section key={key} index={index}>
            <Heading>Menuju Hari Bahagia</Heading>
            <Countdown target={eventDateTime} />
          </Section>
        );

      case "gallery":
        return content.gallery.length > 0 ? (
          <Section key={key} index={index}>
            <Heading>Galeri</Heading>
            {/*
              Tiap sel bergaris tenun. Kalau fotonya belum ada atau gagal
              dimuat, yang tampak adalah kain yang belum ditenun — bukan kotak
              abu-abu yang terbaca rusak.
            */}
            <div className="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-3">
              {content.gallery.map((url, i) => (
                <span
                  key={i}
                  className="inv-card block aspect-square w-full overflow-hidden rounded-sm"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(45deg, color-mix(in oklab, var(--inv-text) 7%, transparent) 0 1px, transparent 1px 7px)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Foto ${i + 1} dari ${title}`}
                    loading="lazy"
                    decoding="async"
                    width={400}
                    height={400}
                    className="h-full w-full object-cover"
                  />
                </span>
              ))}
            </div>
          </Section>
        ) : null;

      case "location":
        return (
          <Section key={key} index={index}>
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
          <Section key={key} index={index}>
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
          <Section key={key} index={index}>
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
          <Section key={key} index={index}>
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
          <Section key={key} index={index}>
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
    // `inv-lungsin` memasang benang tegak dalam warna teks pemilik —
    // struktur dari produk, warna dari pemilik.
    <div style={rootStyle} className="inv-lungsin relative min-h-full">
      {showWatermark && watermarkVariant === "preview" && (
        <div
          className="sticky top-0 z-10 px-4 py-2 text-center text-xs"
          style={{
            background: "color-mix(in oklab, var(--inv-primary) 12%, white)",
            color: "var(--inv-primary)",
          }}
        >
          {watermarkLabel}
        </div>
      )}

      {ordered.map((s, i) => render(s.key, i))}

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
