// Uji logika penjaga tingkat harga. Sementara, bukan bagian aplikasi.
import { packageAtLeast } from "../src/lib/packages";
import { LAYOUTS, LAYOUT_KEYS, minPackageForLayout } from "../src/lib/invitation-layouts";

const kasus: [string, string | null, boolean][] = [
  ["naskah", "BASIC", false],
  ["naskah", "PREMIUM", false],
  ["naskah", "EXCLUSIVE", true],
  ["pias", "BASIC", false],
  ["pias", "PREMIUM", true],
  ["pias", "EXCLUSIVE", true],
  ["klasik", "BASIC", true],
  ["galeri", "BASIC", false],
  ["bingkai", "PREMIUM", false],
];

let gagal = 0;
for (const [layout, pkg, harusBoleh] of kasus) {
  const perlu = minPackageForLayout(layout);
  const boleh = packageAtLeast(pkg as never, perlu);
  const ok = boleh === harusBoleh;
  if (!ok) gagal++;
  console.log(
    `${ok ? "✓" : "✗"} ${layout.padEnd(8)} + ${String(pkg).padEnd(9)} -> ${boleh ? "boleh" : "ditolak"} (perlu ${perlu})`,
  );
}

const perTingkat = new Map<string, number>();
for (const k of LAYOUT_KEYS) {
  perTingkat.set(LAYOUTS[k].minPackage, (perTingkat.get(LAYOUTS[k].minPackage) ?? 0) + 1);
}
console.log("arketipe per tingkat:", Object.fromEntries(perTingkat));
process.exit(gagal === 0 ? 0 : 1);
