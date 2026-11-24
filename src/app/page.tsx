import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <span className="rounded-full border px-3 py-1 text-xs tracking-wide text-neutral-500">
        Undangan Digital
      </span>
      <h1 className="text-balance text-4xl font-semibold sm:text-5xl">
        Buat undangan digital yang cantik & bisa dikustomisasi
      </h1>
      <p className="text-pretty text-lg text-neutral-600">
        Pilih template, isi acara, atur tema, lalu bagikan lewat WhatsApp.
        Lengkap dengan RSVP, buku tamu, galeri, dan amplop digital. Coba gratis,
        bayar hanya saat siap dibagikan.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/dashboard"
          className="rounded-lg bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Buat Undangan Gratis
        </Link>
        <Link
          href="/template"
          className="rounded-lg border px-5 py-3 text-sm font-medium hover:bg-neutral-50"
        >
          Lihat Template
        </Link>
        <Link
          href="/harga"
          className="rounded-lg border px-5 py-3 text-sm font-medium hover:bg-neutral-50"
        >
          Harga
        </Link>
      </div>
      <p className="text-sm text-neutral-400">
        Bayar sekali per acara, tanpa langganan bulanan.
      </p>
    </main>
  );
}
