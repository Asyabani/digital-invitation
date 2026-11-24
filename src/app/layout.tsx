import type { Metadata } from "next";
import { fontSans, fontMono, fontDisplay } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Undangan Digital",
  description:
    "Buat undangan digital yang dapat dikustomisasi — nikah, aqiqah, ulang tahun, acara korporat.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${fontSans.variable} ${fontMono.variable} ${fontDisplay.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
