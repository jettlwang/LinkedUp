type ChatOptions = { temperature?: number };
type ChatResponse = { answer: string };
type ApiError = { code?: string; message?: string };

const DEFAULT_TIMEOUT_MS = 25000;

function withTimeout<T>(promise: Promise<T>, ms = DEFAULT_TIMEOUT_MS): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error("Request timed out")), ms);
    promise.then(
      (val) => { clearTimeout(id); resolve(val); },
      (err) => { clearTimeout(id); reject(err); }
    );
  });
}

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };
type ChatPayload = { messages: ChatMessage[]; model?: string; temperature?: number };

export async function chat(payload: ChatPayload, signal?: AbortSignal): Promise<ChatResponse> {
  const res = await withTimeout(
    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal
    })
  );

  if (!res.ok) {
    let detail: ApiError | undefined;
    try { detail = await res.json(); } catch {}
    throw new Error(detail?.message || `Request failed: ${res.status}`);
  }

  return res.json();
}

