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

function pickProductUrl(results: any[]): string | null {
  for (const r of results) {
    const url: string = r?.url ?? r?.metadata?.sourceURL ?? "";
    if (url && /https?:\/\/(www\.)?systembolaget\.se\/produkt\//i.test(url)) {
      return url;
    }
  }
  return null;
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
    const query = `site:systembolaget.se/produkt ${queryParts}`;

    console.log("Searching Systembolaget:", query);

    const res = await fetch("https://api.firecrawl.dev/v2/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, limit: 5 }),
    });

    if (res.status === 402) return json(200, { url: null, reason: "no_credits" });
    if (res.status === 429) return json(200, { url: null, reason: "rate_limited" });
    if (!res.ok) {
      const t = await res.text();
      console.error("Firecrawl error", res.status, t);
      return json(200, { url: null });
    }

    const data = await res.json();
    const results = data?.data?.web ?? data?.data ?? [];
    const url = pickProductUrl(Array.isArray(results) ? results : []);
    return json(200, { url });
  } catch (e) {
    console.error(e);
    return json(500, { error: (e as Error).message });
  }
});
