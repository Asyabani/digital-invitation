import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { prisma } from "@/lib/db";

// Auth.js (NextAuth v5). Hanya PEMILIK acara yang login; tamu tidak perlu akun.
// Kredensial dibaca otomatis dari env: AUTH_GOOGLE_ID/SECRET, AUTH_RESEND_KEY.
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  pages: {
    signIn: "/masuk",
  },
  providers: [
    Google,
    Resend({
      from: process.env.AUTH_EMAIL_FROM ?? "noreply@example.com",
    }),
  ],
  callbacks: {
    // Database session: pastikan id user tersedia di session.user.
    session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
