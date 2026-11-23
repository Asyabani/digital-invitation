import { z } from "zod";

// Skema JSON untuk kolom Json di Invitation. Lihat docs/03 §4.

export const contentSchema = z.object({
  subject: z.object({
    groomName: z.string().optional(),
    brideName: z.string().optional(),
    childName: z.string().optional(),
    title: z.string().optional(),
  }),
  event: z.object({
    date: z.string(), // ISO date
    time: z.string(),
    timezone: z.enum(["WIB", "WITA", "WIT"]).default("WIB"),
    venueName: z.string(),
    address: z.string(),
    maps: z
      .object({
        lat: z.number(),
        lng: z.number(),
        url: z.string().url().optional(),
      })
      .optional(),
  }),
  gallery: z.array(z.string().url()).default([]),
  story: z
    .array(z.object({ title: z.string(), body: z.string() }))
    .optional(),
  quote: z.object({ text: z.string(), source: z.string().optional() }).optional(),
  protocol: z.string().optional(),
});

export const themeSchema = z.object({
  palette: z.object({
    primary: z.string(),
    secondary: z.string(),
    background: z.string(),
    text: z.string(),
  }),
  font: z.object({
    heading: z.string(),
    body: z.string(),
  }),
  music: z
    .object({ url: z.string().url(), autoplay: z.boolean().default(false) })
    .optional(),
});

export const sectionKey = z.enum([
  "cover",
  "opening",
  "couple",
  "countdown",
  "gallery",
  "location",
  "rsvp",
  "greetings",
  "gift",
  "closing",
]);

export const sectionsOrderSchema = z.array(
  z.object({
    key: sectionKey,
    enabled: z.boolean(),
    order: z.number().int(),
  }),
);

export const giftConfigSchema = z.object({
  banks: z
    .array(
      z.object({
        bankName: z.string(),
        accountNumber: z.string(),
        accountName: z.string(),
      }),
    )
    .optional(),
  qrisUrl: z.string().url().optional(),
  note: z.string().optional(),
});

export type Content = z.infer<typeof contentSchema>;
export type Theme = z.infer<typeof themeSchema>;
export type SectionsOrder = z.infer<typeof sectionsOrderSchema>;
export type GiftConfig = z.infer<typeof giftConfigSchema>;
