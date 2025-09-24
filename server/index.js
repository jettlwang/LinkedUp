import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/ping", (_req, res) => {
  res.json({ ok: true, message: "pong" });
});

// placeholder for your AI endpoint (wire up later)
app.post("/api/ai/chat", async (req, res) => {
  // read req.body, call provider (later), stream/return result
  res.json({ content: "Hello from local server (fake AI for now)" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
