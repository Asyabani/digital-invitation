import { cn } from "cn";

/**
 * Sehelai kain — wadah baku di dashboard.
 *
 * Bukan kartu: tepinya potong (radius 2px), sisi kiri-kanan diikat benang emas
 * tipis, dan atasnya ditutup pinggiran. Dipakai menggantikan `Card` supaya
 * dashboard tidak jatuh jadi kisi kartu identik — lihat kontrak arah di
 * `src/app/layout.tsx`.
 */
export function Helai({
  className,
  children,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section
      className={cn("kain pinggiran-atas rounded-sm", className)}
      {...props}
    >
      {children}
    </section>
  );
}

/** Kepala helai: judul kiri, aksi kanan, dipisah satu benang. */
export function HelaiKepala({
  title,
  description,
  action,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/70 px-5 py-4 sm:px-6">
      <div className="min-w-0 space-y-1">
        <h2 className="font-display text-lg font-medium leading-tight">
          {title}
        </h2>
        {description && (
          <p className="max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex shrink-0 gap-2">{action}</div>}
    </div>
  );
}

/** Isi helai. */
export function HelaiIsi({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("px-5 py-5 sm:px-6", className)} {...props}>
      {children}
    </div>
  );
}
