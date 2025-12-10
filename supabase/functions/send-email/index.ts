// Supabase Edge Function: send-email via Mailjet API v3.1
// Expects JSON: { to: string, subject: string, html: string }
// Secrets required: MAILJET_API_KEY, MAILJET_API_SECRET, optional MAILJET_FROM (e.g., "Plugged <info@pluggedby212.shop>")
/// <reference path="../types.d.ts" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "std/http/server.ts";

const parseFrom = (raw: string | undefined) => {
  const fallback = { Name: "Plugged", Email: "info@pluggedby212.shop" };
  if (!raw) return fallback;
  const match = raw.match(/^(.*)<(.+)>$/);
  if (match) {
    return { Name: match[1].trim() || fallback.Name, Email: match[2].trim() };
  }
  return { Name: fallback.Name, Email: raw.trim() };
};

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders() });
  }

  try {
    const { to, subject, html } = await req.json();
    if (!to || !subject || !html) {
      return json({ error: "Missing fields: to, subject, html" }, 400);
    }

    const key = Deno.env.get("MAILJET_API_KEY");
    const secret = Deno.env.get("MAILJET_API_SECRET");
    const fromRaw = Deno.env.get("MAILJET_FROM") || "Plugged <info@pluggedby212.shop>";

    if (!key || !secret) {
      return json({ error: "Mailjet secrets not configured" }, 500);
    }

    const auth = btoa(`${key}:${secret}`);
    const payload = {
      Messages: [
        {
          From: parseFrom(fromRaw),
          To: [{ Email: to }],
          Subject: subject,
          HTMLPart: html,
        },
      ],
    };

    const res = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return json({ error: data }, res.status);
    }

    const messageId = data?.Messages?.[0]?.To?.[0]?.MessageUUID;
    return json({ ok: true, messageId, data });
  } catch (error) {
    return json({ error: String(error) }, 500);
  }
});

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "content-type",
  };
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}
