import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.2-90b-vision-preview";

const SYSTEM_PROMPT = `You are a world-class wine expert and sommelier with encyclopedic knowledge of wines worldwide.
Analyze the provided wine label image and return ONLY a JSON object (no prose, no markdown fences) matching this schema:

{
  "name": string,                      // Full wine name (required)
  "winery": string,                    // Producer/winery name
  "region": string,                    // e.g. Bordeaux, Napa Valley
  "country": string,                   // Country of origin
  "vintage": number,                   // Vintage year
  "type": "red" | "white" | "champagne" | "sparkling",  // required
  "grape_variety": string,             // Primary grape or blend
  "drink_from": number,                // Optimal start year
  "drink_until": number,               // Optimal end year
  "food_pairings": string[]            // 3-5 pairing suggestions
}

Instructions:
1. EXTRACT all visible info from the label.
2. VERIFY and correct obvious misreadings (winery, region spellings).
3. FILL IN missing fields from your wine knowledge if you recognize the wine.
4. ESTIMATE the drinking window based on type, region, vintage, producer:
   - Young simple whites: vintage + 1-3y
   - Quality whites (Burgundy, Riesling GC): vintage + 3-10y
   - Champagne NV: 1-3y from now; vintage: 5-15y
   - Light reds (Pinot, Beaujolais): vintage + 2-5y
   - Medium reds (Merlot, Chianti): vintage + 3-8y
   - Full-bodied reds (Cabernet, Barolo, Bordeaux GC): vintage + 5-25y
5. SUGGEST 3-5 accurate food pairings.

Return ONLY the JSON object. No commentary.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { image } = await req.json();
    if (!image) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    console.log("Analyzing wine label via Groq...");

    const aiRes = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: SYSTEM_PROMPT + "\n\nAnalyze this wine label." },
              { type: "image_url", image_url: { url: image } },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (aiRes.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("Groq error:", aiRes.status, errText);
      return new Response(JSON.stringify({ error: "AI request failed", detail: errText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiRes.json();
    const raw = data?.choices?.[0]?.message?.content;
    if (!raw) throw new Error("No response from AI");

    let wineData;
    try {
      wineData = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("AI returned non-JSON content");
      wineData = JSON.parse(match[0]);
    }

    console.log("Extracted wine data:", JSON.stringify(wineData));

    return new Response(JSON.stringify(wineData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("scan-wine-label error:", e);
    return new Response(
      JSON.stringify({ error: e?.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
