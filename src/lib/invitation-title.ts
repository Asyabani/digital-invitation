import type { Content } from "@/lib/validation/invitation";

/**
 * Judul yang ditampilkan ke tamu: nama mempelai, nama anak, atau judul acara.
 * Dipakai halaman undangan, metadata share, dan teks share WhatsApp agar
 * ketiganya tidak pernah berbeda.
 */
export function invitationTitle(content: Content): string {
  const s = content.subject;
  if (s.groomName && s.brideName) return `${s.groomName} & ${s.brideName}`;
  if (s.childName) return s.childName;
  return s.title ?? "Undangan";
}

/** Tanggal acara dalam bahasa Indonesia; kembalikan apa adanya bila invalid. */
export function prettyEventDate(date: string): string {
  const d = new Date(date);
  return Number.isNaN(d.getTime())
    ? date
    : d.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
}
