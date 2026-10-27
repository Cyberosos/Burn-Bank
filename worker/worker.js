// Burn Bank AI Worker (Cloudflare Workers)
// Receives a prompt (and up to 2 photos) from the Burn Bank website,
// asks Claude, and sends the answer back. Your API key stays here, never in the website.
//
// Settings (Cloudflare dashboard > your Worker > Settings > Variables and Secrets):
//   ANTHROPIC_API_KEY  (Secret)  your key from console.anthropic.com
//   ALLOWED_ORIGINS    (Text)    https://cyberosos.github.io   (comma-separate more if needed)
//   MODEL              (Text)    optional, defaults to claude-sonnet-5-5
// Like the tashkeel Worker, only your website is answered; no passcode is needed.

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
    const originOk = allowed.length > 0 && allowed.includes(origin);
    const cors = {
      "Access-Control-Allow-Origin": originOk && origin ? origin : allowed[0] || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-App-Passcode",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    };

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return reply({ error: "Use POST" }, 405, cors);
    if (!originOk) return reply({ error: "This website is not allowed" }, 403, cors);
    if (!env.ANTHROPIC_API_KEY) return reply({ error: "API key not set in the Worker" }, 500, cors);

    let body;
    try { body = await request.json(); } catch { return reply({ error: "Bad request" }, 400, cors); }

    const prompt = String(body.prompt || "").slice(0, 20000);
    if (!prompt) return reply({ error: "Empty prompt" }, 400, cors);
    const images = (Array.isArray(body.images) ? body.images : []).slice(0, 2).filter((im) => im && typeof im.data === "string");
    const okTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    const content = [
      ...images.map((im) => ({
        type: "image",
        source: { type: "base64", media_type: okTypes.includes(im.type) ? im.type : "image/jpeg", data: im.data },
      })),
      { type: "text", text: prompt + "\n\nReply with the JSON only, no other text." },
    ];

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: env.MODEL || "claude-sonnet-5-5",
        max_tokens: 1500,
        messages: [{ role: "user", content }],
      }),
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      const status = upstream.status === 429 ? 429 : 502;
      return reply({ error: "AI error", detail: data?.error?.message || String(upstream.status) }, status, cors);
    }
    const text = (data.content || []).filter((c) => c.type === "text").map((c) => c.text).join("");
    return reply({ text }, 200, cors);
  },
};

function reply(obj, status, headers) {
  return new Response(JSON.stringify(obj), { status, headers: { ...headers, "content-type": "application/json" } });
}
