// Vercel Serverless Function: send-email via Mailjet API v3.1
// Expects JSON: { to: string, subject: string, html: string }
// Env vars required: MAILJET_API_KEY, MAILJET_API_SECRET, optional MAILJET_FROM (e.g., "Plugged <info@pluggedby212.shop>")

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const parseFrom = (raw?: string) => {
  const fallback = { Name: "Plugged", Email: "info@pluggedby212.shop" };
  if (!raw) return fallback;
  const match = raw.match(/^(.*)<(.+)>$/);
  if (match) {
    return { Name: match[1].trim() || fallback.Name, Email: match[2].trim() };
  }
  return { Name: fallback.Name, Email: raw.trim() };
};

const setCors = (res: any) => {
  Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
};

const sendJson = (res: any, status: number, body: Record<string, unknown>) => {
  setCors(res);
  res.status(status).json(body);
};

export default async function handler(req: any, res: any) {
  if (req.method === "OPTIONS") {
    setCors(res);
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const { to, subject, html } = req.body || {};
  if (!to || !subject || !html) {
    sendJson(res, 400, { error: "Missing fields: to, subject, html" });
    return;
  }

  const key = process.env.MAILJET_API_KEY;
  const secret = process.env.MAILJET_API_SECRET;
  const fromRaw = process.env.MAILJET_FROM || "Plugged <info@pluggedby212.shop>";

  console.log('[EMAIL] API Key present:', !!key);
  console.log('[EMAIL] API Secret present:', !!secret);
  console.log('[EMAIL] From address:', fromRaw);

  if (!key || !secret) {
    console.error('[EMAIL] Missing Mailjet credentials');
    sendJson(res, 500, { error: "Mailjet secrets not configured" });
    return;
  }

  const auth = Buffer.from(`${key}:${secret}`).toString("base64");
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

  try {
    const mjRes = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await mjRes.json();
    if (!mjRes.ok) {
      console.error('[EMAIL] Mailjet API error:', mjRes.status, data);
      sendJson(res, mjRes.status, { error: data });
      return;
    }

    const messageId = data?.Messages?.[0]?.To?.[0]?.MessageUUID;
    sendJson(res, 200, { ok: true, messageId, data });
  } catch (error) {
    sendJson(res, 500, { error: String(error) });
  }
}
