# 03 — Data Model (Final)

> **Status:** Final v1 · **Tanggal:** 2026-11-23
>
> Nama model, kolom, dan enum di bawah **WAJIB diikuti persis**. Perubahan harus
> memperbarui dokumen ini lebih dulu. ORM: **Prisma** (Postgres).

---

## 1. Diagram Relasi (ringkas)

```
User 1───∞ Invitation 1───∞ Guest
                │               │
                │               ├──∞ Rsvp
                │               ├──∞ Greeting
                │               └──∞ GiftConfirmation
                └───∞ Payment
Template 1───∞ Invitation
```

- `Guest`, `Rsvp`, `Greeting`, `GiftConfirmation` boleh berelasi ke `Guest`
  (via link personal) atau berdiri sendiri (tamu anonim tanpa `?to`).

## 2. Enum

```prisma
enum InvitationStatus {
  DRAFT
  PUBLISHED
  EXPIRED
}

enum Package {
  BASIC
  PREMIUM
  EXCLUSIVE
}

enum RsvpStatus {
  HADIR
  TIDAK_HADIR
  RAGU
}

enum GreetingStatus {
  PENDING
  APPROVED
  REJECTED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  EXPIRED
}

enum GiftMethod {
  TRANSFER
  QRIS
}
```

## 3. Skema Prisma

```prisma
// --- Auth.js (NextAuth) standard models ---
model User {
  id            String       @id @default(cuid())
  name          String?
  email         String       @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  invitations   Invitation[]
  payments      Payment[]
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}

// --- Domain ---
model Template {
  id           String       @id @default(cuid())
  name         String
  slug         String       @unique
  category     String       // "pernikahan" | "aqiqah" | "ulang-tahun" | "korporat"
  previewImage String
  // struktur default section + nilai awal content/theme
  defaultContent  Json
  defaultTheme    Json
  defaultSections Json       // urutan & toggle section default
  isActive     Boolean      @default(true)
  invitations  Invitation[]
  createdAt    DateTime     @default(now())
}

model Invitation {
  id            String            @id @default(cuid())
  userId        String
  templateId    String
  slug          String            @unique        // dipakai di /u/[slug]
  title         String                            // label internal untuk pemilik
  status        InvitationStatus  @default(DRAFT)
  package       Package?                           // null saat masih trial/draft
  activeUntil   DateTime?                          // diisi saat PUBLISHED (now + 6 bln)
  publishedAt   DateTime?

  // Kustomisasi Level 2 — divalidasi Zod di aplikasi (lihat docs/06 & validation)
  content       Json              // data mempelai/acara, galeri, cerita, lokasi, dll
  themeConfig   Json              // warna, font, musik, dll
  sectionsOrder Json              // array section + flag on/off + urutan

  // Pengaturan privat yang TIDAK di-expose publik mentah
  giftConfig    Json?             // rekening/QRIS untuk amplop digital

  user          User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  template      Template          @relation(fields: [templateId], references: [id])
  guests        Guest[]
  rsvps         Rsvp[]
  greetings     Greeting[]
  gifts         GiftConfirmation[]
  payments      Payment[]

  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  @@index([userId])
  @@index([status])
}

model Guest {
  id           String      @id @default(cuid())
  invitationId String
  name         String
  personalSlug String                              // unik per undangan (?to=<personalSlug>)
  category     String?                             // "keluarga" | "teman" | dll
  sentAt       DateTime?                           // kapan link dibagikan
  invitation   Invitation  @relation(fields: [invitationId], references: [id], onDelete: Cascade)
  rsvps        Rsvp[]
  greetings    Greeting[]
  gifts        GiftConfirmation[]
  createdAt    DateTime    @default(now())

  @@unique([invitationId, personalSlug])
  @@index([invitationId])
}

model Rsvp {
  id           String      @id @default(cuid())
  invitationId String
  guestId      String?                             // null jika tamu anonim
  name         String                              // nama yang diisi tamu
  status       RsvpStatus
  headcount    Int         @default(1)
  message      String?                             // pesan opsional saat RSVP
  invitation   Invitation  @relation(fields: [invitationId], references: [id], onDelete: Cascade)
  guest        Guest?      @relation(fields: [guestId], references: [id], onDelete: SetNull)
  createdAt    DateTime    @default(now())

  @@index([invitationId])
}

model Greeting {
  id           String         @id @default(cuid())
  invitationId String
  guestId      String?
  name         String
  message      String
  status       GreetingStatus @default(PENDING)    // moderasi: hanya APPROVED tampil
  invitation   Invitation     @relation(fields: [invitationId], references: [id], onDelete: Cascade)
  guest        Guest?         @relation(fields: [guestId], references: [id], onDelete: SetNull)
  createdAt    DateTime       @default(now())

  @@index([invitationId, status])
}

model GiftConfirmation {
  id           String      @id @default(cuid())
  invitationId String
  guestId      String?
  name         String
  method       GiftMethod
  amount       Int?                                // nominal (rupiah) — PRIVAT, tak di-expose publik
  proofUrl     String?                             // bukti transfer opsional (Cloudinary)
  note         String?
  invitation   Invitation  @relation(fields: [invitationId], references: [id], onDelete: Cascade)
  guest        Guest?      @relation(fields: [guestId], references: [id], onDelete: SetNull)
  createdAt    DateTime    @default(now())

  @@index([invitationId])
}

model Payment {
  id            String        @id @default(cuid())
  invitationId  String
  userId        String
  provider      String        @default("xendit")
  externalId    String        @unique             // id invoice Xendit
  amount        Int                               // rupiah
  package       Package
  status        PaymentStatus @default(PENDING)
  invoiceUrl    String?                           // URL bayar Xendit
  paidAt        DateTime?
  raw           Json?                             // payload webhook mentah (audit)
  invitation    Invitation    @relation(fields: [invitationId], references: [id], onDelete: Cascade)
  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@index([invitationId])
  @@index([status])
}
```

## 4. Skema JSON (divalidasi Zod)

Kolom `Json` punya kontrak yang divalidasi di `src/lib/validation/`:

### `Invitation.content`
```ts
{
  subject: { groomName?, brideName?, childName?, title? },   // tergantung kategori
  event: { date: string, time: string, timezone: "WIB"|"WITA"|"WIT",
           venueName: string, address: string,
           maps?: { lat: number, lng: number, url?: string } },
  gallery: string[],            // URL Cloudinary
  story?: { title: string, body: string }[],   // timeline/cerita
  quote?: { text: string, source?: string },
  protocol?: string,            // info protokol/dress code
}
```

### `Invitation.themeConfig`
```ts
{
  palette: { primary: string, secondary: string, background: string, text: string },
  font: { heading: string, body: string },
  music?: { url: string, autoplay: boolean },
}
```

### `Invitation.sectionsOrder`
```ts
Array<{ key: "cover"|"opening"|"couple"|"countdown"|"gallery"
        |"location"|"rsvp"|"greetings"|"gift"|"closing",
        enabled: boolean, order: number }>
```

### `Invitation.giftConfig` (privat)
```ts
{
  banks?: { bankName: string, accountNumber: string, accountName: string }[],
  qrisUrl?: string,     // URL gambar QRIS (Cloudinary)
  note?: string,
}
```

## 5. Catatan Integritas & Privasi

- **Jangan** meng-expose `GiftConfirmation.amount`, daftar `Guest`, atau
  `Invitation.giftConfig` detail ke endpoint/komponen publik. Halaman publik
  hanya menampilkan rekening/QRIS untuk *mengirim* kado, bukan daftar siapa yang
  sudah kirim/berapa.
- `Greeting` publik difilter `status = APPROVED`.
- `personalSlug` unik per undangan (lihat `@@unique`). Generator di
  `src/lib/slug.ts` menambahkan suffix bila bentrok.
- Hapus `User` → cascade ke undangan & turunannya. Hapus `Guest` → `Rsvp`/
  `Greeting`/`Gift` di-`SetNull` (data tetap ada sebagai anonim).
