import { z } from "zod";

// Skema input endpoint publik (tamu). Lihat docs/04 §3.

export const rsvpInputSchema = z.object({
  name: z.string().min(1).max(100),
  status: z.enum(["HADIR", "TIDAK_HADIR", "RAGU"]),
  headcount: z.number().int().min(1).max(20).default(1),
  message: z.string().max(500).optional(),
  personalSlug: z.string().max(80).optional(),
});

export const greetingInputSchema = z.object({
  name: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  personalSlug: z.string().max(80).optional(),
});

export const giftInputSchema = z.object({
  name: z.string().min(1).max(100),
  method: z.enum(["TRANSFER", "QRIS"]),
  amount: z.number().int().positive().optional(),
  proofUrl: z.string().url().optional(),
  note: z.string().max(300).optional(),
  personalSlug: z.string().max(80).optional(),
});

export type RsvpInput = z.infer<typeof rsvpInputSchema>;
export type GreetingInput = z.infer<typeof greetingInputSchema>;
export type GiftInput = z.infer<typeof giftInputSchema>;
