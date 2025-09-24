import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { openai, model } from "./openai";
import { chatBodySchema } from "./validation";
import { chatLimiter } from "./rateLimit";
import { errorHandler } from "./errors";

dotenv.config();
const app = express();

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:5173";

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// --- basic health checks ---
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "server", time: new Date().toISOString() });
});

app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hello from Express + TypeScript 👋" });
});

// --- AI endpoint with validation + rate limit ---
app.post("/api/chat", chatLimiter, async (req, res, next) => {
  try {
    const parsed = chatBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ code: "BAD_REQUEST", message: parsed.error.issues[0].message });
    }

    const { text, options } = parsed.data;

    const completion = await openai.chat.completions.create({
      model,                                           // ⬅️ uses env-driven default
      temperature: options?.temperature ?? 0.7,
      messages: [
        { role: "system", content: "You are a concise, friendly assistant." },
        { role: "user", content: text }
      ]
    });

    const answer = completion.choices[0]?.message?.content ?? "";
    res.json({ answer });
  } catch (err) {
    next(err); // let the error handler standardize the response
  }
});

// --- error handler LAST ---
app.use(errorHandler);

// --- start server LAST ---
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
