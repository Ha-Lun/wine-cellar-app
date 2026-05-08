import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function extractImageUrl(html: string): string | null {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return m[1];
  }
  // Fallback: any vivino label/thumbnail image
  const img = html.match(/https?:\/\/images\.vivino\.com\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)/i);
  return img?.[0] ?? null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return json(401, { error: "Unauthorized" });

    const { name, winery, vintage } = await req.json();
    if (!name || typeof name !== "string") return json(400, { error: "name required" });

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) return json(500, { error: "Firecrawl not configured" });

    const queryParts = [winery, name, vintage].filter(Boolean).join(" ");
    const query = `site:vivino.com ${queryParts}`;

    console.log("Searching Firecrawl:", query);

    const res = await fetch("https://api.firecrawl.dev/v2/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        limit: 3,
        scrapeOptions: { formats: ["html"], onlyMainContent: false },
      }),
    });

    if (res.status === 402) return json(200, { image_url: null, reason: "no_credits" });
    if (res.status === 429) return json(200, { image_url: null, reason: "rate_limited" });
    if (!res.ok) {
      const t = await res.text();
      console.error("Firecrawl error", res.status, t);
      return json(200, { image_url: null });
    }

    const data = await res.json();
    const results = data?.data?.web ?? data?.data ?? [];
    for (const r of results) {
      const html = r?.html ?? r?.rawHtml ?? "";
      if (!html) continue;
      const img = extractImageUrl(html);
      if (img) {
        console.log("Found image:", img);
        return json(200, { image_url: img });
      }
    }
    return json(200, { image_url: null });
  } catch (e) {
    console.error(e);
    return json(500, { error: (e as Error).message });
  }
});
