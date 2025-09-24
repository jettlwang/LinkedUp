import rateLimit from "express-rate-limit";

// Dev-friendly defaults; tune later.
export const chatLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 minute window
  max: 20,                   // 20 requests / minute / IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: "RATE_LIMITED", message: "Too many requests, slow down." }
});
