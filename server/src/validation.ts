import { z } from "zod";

const chatMessage = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().trim().min(1).max(4000)
});

export const chatBodySchema = z.object({
  messages: z.array(chatMessage).min(1),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional()
});

export type ChatBody = z.infer<typeof chatBodySchema>;
