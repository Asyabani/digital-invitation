// "Tambah ke Kalender" untuk halaman publik (docs/06 §4). Tanpa dependensi:
// cukup membentuk URL Google Calendar dari data acara.

const TZ_OFFSET_HOURS: Record<string, number> = { WIB: 7, WITA: 8, WIT: 9 };

/** Durasi acara default bila pemilik tidak menyebutkan jam selesai. */
const DEFAULT_DURATION_HOURS = 2;

function toUtcStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/**
 * Bentuk URL Google Calendar. Mengembalikan `null` bila tanggal/jam tidak
 * valid, sehingga pemanggil bisa menyembunyikan tombolnya.
 */
export function googleCalendarUrl(input: {
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  timezone: string; // WIB | WITA | WIT
  venueName: string;
  address: string;
}): string | null {
  const offset = TZ_OFFSET_HOURS[input.timezone] ?? 7;
  const time = /^\d{2}:\d{2}$/.test(input.time) ? input.time : "00:00";
  // Jam lokal Indonesia → UTC dengan menyatakan offsetnya secara eksplisit.
  const start = new Date(
    `${input.date}T${time}:00+${String(offset).padStart(2, "0")}:00`,
  );
  if (Number.isNaN(start.getTime())) return null;

  const end = new Date(start.getTime() + DEFAULT_DURATION_HOURS * 3_600_000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: input.title,
    dates: `${toUtcStamp(start)}/${toUtcStamp(end)}`,
    location: [input.venueName, input.address].filter(Boolean).join(", "),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Tautan share WhatsApp berisi teks undangan + URL. */
export function whatsappShareUrl(text: string, url: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
}
