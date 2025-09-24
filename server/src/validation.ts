import { z } from "zod";

export const chatBodySchema = z.object({
  text: z.string().trim().min(1, "Text is required").max(4000),
  // allow optional options now for future use
  options: z.object({
    temperature: z.number().min(0).max(2).optional()
  }).optional()
});

export type ChatBody = z.infer<typeof chatBodySchema>;
