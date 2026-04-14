// ═══════════════════════════════════════════════════════════════
// 🔧 Rowerowy Mechanik — Cloudflare Worker
// Obsługuje: autoryzację (whitelist telefonów) + proxy OpenRouter
//
// ZMIENNE ŚRODOWISKOWE (ustaw w Cloudflare Dashboard):
//   ALLOWED_PHONES  = "+48501234567,+48602345678,+48703456789"
//   OPENROUTER_KEY  = "sk-or-v1-twoj-klucz"
//   AUTH_SECRET     = "dowolny-losowy-ciag-32-znaki"  (np. z https://randomkeygen.com)
// ═══════════════════════════════════════════════════════════════

export default {
  async fetch(request, env) {
    // CORS — pozwól na requesty z GitHub Pages
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // ─── ENDPOINT: /auth ───────────────────────────────────
    if (url.pathname === "/auth" && request.method === "POST") {
      try {
        const { phone } = await request.json();
        const allowed = (env.ALLOWED_PHONES || "").split(",").map(p => p.trim());

        if (!phone || !allowed.includes(phone.trim())) {
          return new Response(
            JSON.stringify({ ok: false, error: "Brak dostępu" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Generuj prosty token (HMAC phone + secret)
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          "raw", encoder.encode(env.AUTH_SECRET || "default-secret"),
          { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
        );
        const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(phone));
        const token = btoa(String.fromCharCode(...new Uint8Array(signature)));

        return new Response(
          JSON.stringify({ ok: true, token }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (e) {
        return new Response(
          JSON.stringify({ ok: false, error: "Błąd serwera" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ─── ENDPOINT: /ai ─────────────────────────────────────
    if (url.pathname === "/ai" && request.method === "POST") {
      try {
        // Sprawdź token
        const authHeader = request.headers.get("Authorization") || "";
        const token = authHeader.replace("Bearer ", "");
        const body = await request.json();
        const phone = body.phone || "";

        // Weryfikuj token
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          "raw", encoder.encode(env.AUTH_SECRET || "default-secret"),
          { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
        );
        const expectedSig = await crypto.subtle.sign("HMAC", key, encoder.encode(phone));
        const expectedToken = btoa(String.fromCharCode(...new Uint8Array(expectedSig)));

        if (token !== expectedToken) {
          return new Response(
            JSON.stringify({ error: "Nieautoryzowany" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Proxy do OpenRouter
        const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${env.OPENROUTER_KEY}`,
          },
          body: JSON.stringify({
            model: body.model || "anthropic/claude-sonnet-4-20250514",
            max_tokens: 1000,
            temperature: 0.3,
            messages: body.messages || [],
          }),
        });

        const aiData = await aiResponse.json();
        return new Response(
          JSON.stringify(aiData),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (e) {
        return new Response(
          JSON.stringify({ error: "Błąd AI: " + e.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response("Rowerowy Mechanik API", {
      headers: { ...corsHeaders, "Content-Type": "text/plain" }
    });
  },
};
