import type {
  Content,
  Theme,
  SectionsOrder,
  GiftConfig,
} from "@/lib/validation/invitation";
import { googleCalendarUrl, whatsappShareUrl } from "@/lib/calendar";
import { fontStack } from "@/lib/font-stacks";
import { invitationTitle, prettyEventDate } from "@/lib/invitation-title";
import { layoutSpec, type LayoutSpec } from "@/lib/invitation-layouts";
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
  /**
   * Undangan dirender di dalam bingkai (pratinjau editor, galeri, hero), bukan
   * sebagai halaman penuh. Arketipe `sampul` memakai `100svh` untuk sampulnya;
   * di dalam bingkai setinggi 38rem itu berarti tamu hanya melihat sampul dan
   * harus menebak ada isi di bawahnya.
   */
  embedded?: boolean;
  showWatermark?: boolean;
  /**
   * `preview` = bilah "mode pratinjau" untuk pemilik di editor.
   * `brand` = baris branding halus di kaki undangan yang sudah terbit.
   */
  watermarkVariant?: "preview" | "brand";
  /** Teks bilah pratinjau; default ditujukan untuk pemilik di editor. */
  watermarkLabel?: string;
};

/* ─── Bagian ──────────────────────────────────────────────────────────── */

/**
 * Satu bagian undangan. Jarak, rona latar, pemisah, dan posisi judulnya
 * ditentukan arketipe (lihat `src/lib/invitation-layouts.ts`) — bukan
 * diputuskan di sini, supaya menambah arketipe tidak berarti menyisir ulang
 * berkas ini.
 */
function Section({
  spec,
  index,
  title,
  children,
}: {
  spec: LayoutSpec;
  index: number;
  title?: string;
  children: React.ReactNode;
}) {
  const first = index === 0;
  const rapat = index % 2 === 0;
  const pad = first
    ? spec.pad.first
    : rapat
      ? spec.pad.rapat
      : spec.pad.lapang;

  let bg: React.CSSProperties | undefined;
  if (spec.band === "selang" && rapat && !first) {
    bg = { background: "color-mix(in oklab, var(--inv-text) 3.5%, transparent)" };
  } else if (spec.band === "pita" && rapat && !first) {
    bg = { background: "color-mix(in oklab, var(--inv-primary) 9%, var(--inv-bg))" };
  }

  const pemisah = first
    ? ""
    : spec.divider === "pinggiran"
      ? "inv-pinggiran"
      : spec.divider === "halus"
        ? "inv-garis"
        : "";

  const rata = spec.align === "center" ? "text-center" : "text-left";
  const sumbu = spec.align === "center" ? "items-center" : "items-stretch";

  // Arketipe "pias" memindahkan judul ke kolom kiri, sejajar isinya. Di layar
  // sempit kolom itu tidak muat, jadi judulnya naik ke atas dengan garis tegak
  // yang sama sebagai penanda — bukan hilang begitu saja.
  const samping = spec.heading === "samping" && title;

  return (
    <section
      className={`relative px-6 ${pad} ${pemisah} ${rata}`}
      style={bg}
    >
      <div className={`relative z-[1] mx-auto w-full ${spec.measure}`}>
        <Wadah spec={spec}>
          {samping ? (
            <div className="grid gap-x-8 gap-y-4 sm:grid-cols-[7rem_minmax(0,1fr)]">
              <h2 className="inv-pias-judul">{title}</h2>
              <div className={`flex min-w-0 flex-col ${spec.gap}`}>
                {children}
              </div>
            </div>
          ) : (
            <div className={`flex flex-col ${sumbu} ${spec.gap}`}>
              {title && <Judul spec={spec}>{title}</Judul>}
              {children}
            </div>
          )}
        </Wadah>
      </div>
    </section>
  );
}

/** Arketipe "bingkai" membungkus tiap bagian jadi panel berbingkai ganda. */
function Wadah({
  spec,
  children,
}: {
  spec: LayoutSpec;
  children: React.ReactNode;
}) {
  if (spec.panel !== "bingkai") return <>{children}</>;
  return <div className="inv-bingkai px-5 py-8 sm:px-8">{children}</div>;
}

/** Judul bagian. Enam cara mengumumkan diri, satu per arketipe. */
function Judul({
  spec,
  children,
}: {
  spec: LayoutSpec;
  children: React.ReactNode;
}) {
  switch (spec.heading) {
    case "halus":
      return (
        // Lapang bukan berarti samar: ini satu-satunya penanda bagian di
        // arketipe sampul, jadi ia tetap memakai warna primer penuh.
        <h2 className="inv-heading text-base font-medium tracking-[0.16em]">
          {children}
        </h2>
      );

    case "ganda":
      return (
        <div className="inv-ganda w-full py-2.5">
          <h2 className="inv-heading text-xl font-medium sm:text-2xl">
            {children}
          </h2>
        </div>
      );

    case "besar":
      return (
        <h2 className="inv-heading w-full text-3xl font-semibold leading-[1.04] sm:text-4xl">
          {children}
        </h2>
      );

    // Tanpa `.inv-heading`: arketipe lugas memakai font isi dan warna teks
    // biasa. Tidak adanya font display itulah pembedanya.
    case "polos":
      return <h2 className="w-full text-lg font-semibold">{children}</h2>;

    case "samping":
    case "benang":
    default:
      return (
        <div className="flex w-full flex-col items-center gap-3">
          <h2 className="inv-heading text-2xl font-semibold sm:text-3xl">
            {children}
          </h2>
          <span aria-hidden className="inv-benang" />
        </div>
      );
  }
}

/** Wadah blok isi. */
function Panel({
  spec,
  className = "",
  children,
}: {
  spec: LayoutSpec;
  className?: string;
  children: React.ReactNode;
}) {
  const gaya: Record<LayoutSpec["panel"], string> = {
    kotak: "inv-card p-5",
    // Bingkai luar sudah dipasang `Wadah`; di dalamnya cukup satu garis.
    bingkai: "inv-garis-atas pt-5",
    garis: "inv-garis-bawah pb-5",
    blok: "inv-blok p-5",
    polos: "",
  };
  return (
    <div className={`w-full ${gaya[spec.panel]} ${className}`}>{children}</div>
  );
}

/**
 * Fakta acara. `paragraf` = baris mengalir; `daftar` = pasangan label/nilai.
 *
 * Bentuk daftar bukan hiasan: tempat, alamat, dan waktu memang data
 * berpasangan, dan arketipe yang rata kiri bisa menyejajarkan kolomnya.
 */
function Fakta({
  spec,
  rows,
}: {
  spec: LayoutSpec;
  rows: { label: string; value: React.ReactNode }[];
}) {
  if (spec.fakta === "daftar") {
    return (
      <dl className="grid w-full grid-cols-[5.5rem_minmax(0,1fr)] gap-x-5 gap-y-2.5 text-left">
        {rows.map((r) => (
          <div key={r.label} className="contents">
            <dt className="inv-note pt-px text-sm">{r.label}</dt>
            <dd className="min-w-0">{r.value}</dd>
          </div>
        ))}
      </dl>
    );
  }
  return (
    <div className="w-full space-y-1">
      {rows.map((r) => (
        <p key={r.label} className="min-w-0">
          {r.value}
        </p>
      ))}
    </div>
  );
}

/* ─── Sampul ──────────────────────────────────────────────────────────── */

function Sampul({
  spec,
  title,
  prettyDate,
  guestName,
  content,
  embedded,
}: {
  spec: LayoutSpec;
  title: string;
  prettyDate: string;
  guestName?: string;
  content: Content;
  embedded: boolean;
}) {
  const kepada = guestName ? (
    <p className="inv-note text-sm">
      Kepada Yth. {guestName}
    </p>
  ) : null;

  switch (spec.cover) {
    /*
      Metafora fisiknya amplop: layar pertama terisi penuh, dan tamu
      membukanya dengan menggulir. Satu benang tegak menggantung di bawah nama
      sebagai satu-satunya ornamen — sekaligus isyarat bahwa masih ada di
      bawahnya.
    */
    case "portal":
      return (
        <section
          className={`flex flex-col items-center justify-center px-6 py-16 text-center ${
            embedded ? "min-h-[26rem]" : "min-h-[100svh]"
          }`}
        >
          {kepada && <div className="mb-10">{kepada}</div>}
          <h1 className="inv-heading text-[3.25rem] font-semibold leading-[1.02] sm:text-7xl">
            {title}
          </h1>
          <span
            aria-hidden
            className="my-9 block h-20 w-px"
            style={{
              background:
                "linear-gradient(to bottom, var(--inv-secondary), transparent)",
            }}
          />
          <p className="text-sm tracking-[0.2em]">{prettyDate}</p>
        </section>
      );

    case "pias":
      return (
        <section className={`px-6 ${spec.pad.first}`}>
          <div className={`mx-auto w-full ${spec.measure}`}>
            <div
              className="border-l-2 pl-6"
              style={{ borderColor: "var(--inv-secondary)" }}
            >
              {kepada}
              <h1 className="inv-heading mt-3 text-4xl font-semibold leading-[1.04] sm:text-5xl">
                {title}
              </h1>
              <p className="mt-4 text-lg">{prettyDate}</p>
              <p className="inv-note mt-1">{content.event.venueName}</p>
            </div>
          </div>
        </section>
      );

    /* Nama dan tanggal dipisah satu pita tebal — pembuka yang sama tegasnya
       dengan pita-pita di bawahnya. */
    case "pita":
      return (
        <section className={`px-6 ${spec.pad.first}`}>
          <div className={`mx-auto w-full ${spec.measure}`}>
            {kepada}
            <h1 className="inv-heading mt-3 text-[2.75rem] font-semibold leading-[1.02] sm:text-6xl">
              {title}
            </h1>
            <span
              aria-hidden
              className="my-7 block h-2 w-full"
              style={{ background: "var(--inv-primary)" }}
            />
            <p className="text-lg">{prettyDate}</p>
          </div>
        </section>
      );

    case "lugas":
      return (
        <section className={`px-6 ${spec.pad.first}`}>
          <div className={`mx-auto w-full ${spec.measure}`}>
            {kepada}
            <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 text-lg">{prettyDate}</p>
            <p className="inv-note">
              {content.event.time} {content.event.timezone} ·{" "}
              {content.event.venueName}
            </p>
          </div>
        </section>
      );

    case "bingkai":
      return (
        <section className={`px-6 ${spec.pad.first}`}>
          <div className={`mx-auto w-full ${spec.measure}`}>
            <div className="inv-bingkai px-6 py-12 text-center sm:px-10 sm:py-16">
              {kepada && <div className="mb-6">{kepada}</div>}
              {spec.eyebrow && (
                <p className="text-xs tracking-[0.25em] opacity-60">Undangan</p>
              )}
              <h1 className="inv-heading mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
                {title}
              </h1>
              <div className="inv-ganda mx-auto mt-6 w-full max-w-[14rem] py-2.5">
                <p className="text-sm">{prettyDate}</p>
              </div>
            </div>
          </div>
        </section>
      );

    case "tumpuk":
    default:
      return (
        <section className={`px-6 text-center ${spec.pad.first}`}>
          <div
            className={`mx-auto flex w-full flex-col items-center gap-6 ${spec.measure}`}
          >
            {guestName && (
              <p className="inv-card px-5 py-3 text-sm">
                <span className="opacity-70">
                  Kepada Yth. Bapak/Ibu/Saudara/i
                </span>
                <br />
                <span className="font-medium">{guestName}</span>
              </p>
            )}
            {spec.eyebrow && (
              <p className="text-xs tracking-[0.25em] opacity-60">Undangan</p>
            )}
            <h1 className="inv-heading text-4xl font-semibold leading-tight sm:text-5xl">
              {title}
            </h1>
            <span aria-hidden className="inv-benang inv-benang-lebar" />
            <p className="text-base">{prettyDate}</p>
          </div>
        </section>
      );
  }
}

/* ─── Halaman ─────────────────────────────────────────────────────────── */

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
    embedded = false,
    showWatermark = false,
    watermarkVariant = "preview",
    watermarkLabel = "Mode pratinjau — terbitkan untuk membagikan ke tamu.",
  } = props;

  const spec = layoutSpec(theme.layout);
  // Kelas font untuk teks menonjol di luar judul bagian; arketipe lugas
  // sengaja memakai font isi (lihat `display` di invitation-layouts.ts).
  const display = spec.display === "judul" ? "inv-heading" : "";

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

  const tombolLokasi = (
    <div
      className={`flex flex-wrap gap-2.5 ${
        spec.align === "center" ? "justify-center" : "justify-start"
      }`}
    >
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
  );

  function render(key: string, index: number) {
    switch (key) {
      case "cover":
        return (
          <Sampul
            key={key}
            spec={spec}
            title={title}
            prettyDate={prettyDate}
            guestName={guestName}
            content={content}
            embedded={embedded}
          />
        );

      case "opening":
        return content.quote ? (
          <Section key={key} spec={spec} index={index}>
            <p className={`${display} text-xl italic leading-relaxed sm:text-2xl`}>
              “{content.quote.text}”
            </p>
            {content.quote.source && (
              <p className="inv-note text-sm">— {content.quote.source}</p>
            )}
          </Section>
        ) : null;

      case "couple":
        return (
          <Section key={key} spec={spec} index={index} title={title}>
            {content.story && content.story.length > 0 && (
              <div className="w-full space-y-4 text-left">
                {content.story.map((item, i) => (
                  <Panel key={i} spec={spec}>
                    <h3 className={`${display} text-base font-medium`}>
                      {item.title}
                    </h3>
                    <p className="inv-note mt-1 leading-relaxed">{item.body}</p>
                  </Panel>
                ))}
              </div>
            )}
          </Section>
        );

      case "countdown":
        return (
          <Section
            key={key}
            spec={spec}
            index={index}
            title="Menuju Hari Bahagia"
          >
            <Countdown target={eventDateTime} />
          </Section>
        );

      case "gallery":
        return content.gallery.length > 0 ? (
          <Section key={key} spec={spec} index={index} title="Galeri">
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
          <Section key={key} spec={spec} index={index} title="Lokasi Acara">
            <Panel spec={spec}>
              <Fakta
                spec={spec}
                rows={[
                  {
                    label: "Tempat",
                    value: (
                      <span className={`${display} text-lg font-medium`}>
                        {content.event.venueName}
                      </span>
                    ),
                  },
                  {
                    label: "Alamat",
                    value: (
                      <span className="inv-note">{content.event.address}</span>
                    ),
                  },
                  {
                    label: "Waktu",
                    value: (
                      <span className="inv-note">
                        {prettyDate}, {content.event.time}{" "}
                        {content.event.timezone}
                      </span>
                    ),
                  },
                ]}
              />
            </Panel>
            {tombolLokasi}
          </Section>
        );

      case "rsvp":
        return (
          <Section
            key={key}
            spec={spec}
            index={index}
            title="Konfirmasi Kehadiran"
          >
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
          <Section key={key} spec={spec} index={index} title="Ucapan & Doa">
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
          <Section key={key} spec={spec} index={index} title="Amplop Digital">
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
          <Section key={key} spec={spec} index={index}>
            <p className="inv-note leading-relaxed">
              Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila
              Bapak/Ibu/Saudara/i berkenan hadir.
            </p>
            <h2 className={`${display} text-3xl font-semibold`}>Terima Kasih</h2>
            <p className={`${display} text-lg`}>{title}</p>
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
    // struktur dari produk, warna dari pemilik. Arketipe bingkai memakai dasar
    // berona supaya panelnya benar-benar terbaca mengambang di atasnya.
    <div
      style={rootStyle}
      className={`inv-lungsin relative min-h-full ${
        spec.panel === "bingkai" ? "inv-dasar" : ""
      }`}
    >
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
          Dibuat dengan Lungsin
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
