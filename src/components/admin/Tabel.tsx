import { cn } from "cn";

/*
  Tabel panel operator.

  Baris dipisah benang setipis mungkin, tanpa garis vertikal dan tanpa kotak
  per sel — kain, bukan kisi. Angka memakai kelas `tabular` supaya kolom
  nominal benar-benar lurus ke bawah saat dibaca cepat.
*/

export function Tabel({
  children,
  caption,
}: {
  children: React.ReactNode;
  caption: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[46rem] border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  );
}

export function Th({
  children,
  className,
  numeric = false,
}: {
  children: React.ReactNode;
  className?: string;
  numeric?: boolean;
}) {
  return (
    <th
      scope="col"
      className={cn(
        "border-b border-border/70 px-4 py-3 text-xs font-medium uppercase tracking-widest text-muted-foreground",
        numeric ? "text-right" : "text-left",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
  numeric = false,
}: {
  children: React.ReactNode;
  className?: string;
  numeric?: boolean;
}) {
  return (
    <td
      className={cn(
        "border-b border-border/50 px-4 py-3 align-middle",
        numeric && "tabular text-right",
        className,
      )}
    >
      {children}
    </td>
  );
}

/** Baris kosong yang menjelaskan apa yang harus dilakukan, bukan "no data". */
export function Kosong({
  colSpan,
  children,
}: {
  colSpan: number;
  children: React.ReactNode;
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-4 py-12 text-center text-muted-foreground"
      >
        {children}
      </td>
    </tr>
  );
}
