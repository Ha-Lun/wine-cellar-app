import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function callAI(apiKey: string, messages: any[], useTools = false) {
  const body: any = {
    model: "google/gemini-2.5-flash",
    messages,
  };

  if (useTools) {
    body.tools = [
      {
        type: "function",
        function: {
          name: "wine_data",
          description: "Return verified wine information",
          parameters: {
            type: "object",
            properties: {
              name: { type: "string", description: "Full wine name" },
              winery: { type: "string", description: "Producer/winery name" },
              region: { type: "string", description: "Wine region (e.g. Bordeaux, Napa Valley)" },
              country: { type: "string", description: "Country of origin" },
              vintage: { type: "number", description: "Vintage year" },
              type: { type: "string", enum: ["red", "white", "champagne", "sparkling"], description: "Wine type" },
              grape_variety: { type: "string", description: "Primary grape variety or blend" },
              drink_from: { type: "number", description: "Year from which this wine is optimal to drink" },
              drink_until: { type: "number", description: "Year until which this wine should be consumed" },
              food_pairings: { type: "array", items: { type: "string" }, description: "3-5 food pairing suggestions" },
            },
            required: ["name", "type"],
            additionalProperties: false,
          },
        },
      },
    ];
    body.tool_choice = { type: "function", function: { name: "wine_data" } };
  }

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const status = response.status;
    if (status === 429) throw { status: 429, message: "Rate limit exceeded, please try again later." };
    if (status === 402) throw { status: 402, message: "AI credits exhausted. Please add funds." };
    const errText = await response.text();
    console.error("AI gateway error:", status, errText);
    throw { status: 500, message: "AI gateway error" };
  }

  return await response.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate JWT authentication
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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // ── Step 1: Extract raw data from the wine label image ──
    console.log("Step 1: Extracting data from wine label...");
    const step1 = await callAI(LOVABLE_API_KEY, [
      {
        role: "system",
        content: `You are a wine expert. Extract ALL visible information from this wine label image. Return ONLY a JSON object with these fields:
- name, winery, region, country, vintage (number), type ("red"/"white"/"champagne"/"sparkling"), grape_variety
Return ONLY valid JSON, no markdown.`,
      },
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: image } },
          { type: "text", text: "Extract all visible information from this wine label. Return only JSON." },
        ],
      },
    ]);

    const rawContent = step1.choices?.[0]?.message?.content;
    if (!rawContent) throw new Error("No response from AI step 1");

    let cleaned = rawContent.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    const extractedData = JSON.parse(cleaned);
    console.log("Step 1 result:", JSON.stringify(extractedData));

    // ── Step 2: Verify and enrich using AI knowledge base ──
    console.log("Step 2: Verifying and enriching wine data...");
    const step2 = await callAI(
      LOVABLE_API_KEY,
      [
        {
          role: "system",
          content: `You are a world-class wine expert and sommelier with encyclopedic knowledge of wines worldwide.

You will receive wine data extracted from a label image. Your job is to:
1. VERIFY the data — correct any OCR errors or misreadings (e.g. wrong region, misspelled winery)
2. FILL IN missing fields using your wine knowledge (region, country, grape variety, type)
3. ESTIMATE the optimal drinking window (drink_from, drink_until) based on the wine's type, region, vintage, and producer quality
4. SUGGEST 3-5 accurate food pairings based on the specific wine style

Drinking window guidelines:
- Young simple whites: vintage + 1-3 years
- Quality whites (Burgundy, Riesling Grand Cru): vintage + 3-10 years
- Champagne NV: 1-3 years from now, vintage: 5-15 years
- Light reds (Pinot Noir, Beaujolais): vintage + 2-5 years
- Medium reds (Merlot, Chianti): vintage + 3-8 years
- Full-bodied reds (Cabernet, Barolo, Bordeaux Grand Cru): vintage + 5-25 years

Use your knowledge to give the most accurate data possible. If you recognize the specific wine/producer, use that knowledge.`,
        },
        {
          role: "user",
          content: `Here is wine data extracted from a label. Please verify, correct, and enrich it:\n\n${JSON.stringify(extractedData, null, 2)}`,
        },
      ],
      true // use tool calling for structured output
    );

    // Extract structured data from tool call
    const toolCall = step2.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("No structured response from AI step 2");
    }

    const wineData = JSON.parse(toolCall.function.arguments);
    console.log("Step 2 verified result:", JSON.stringify(wineData));

    return new Response(JSON.stringify(wineData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("scan-wine-label error:", e);
    const status = e?.status || 500;
    const message = e?.message || (e instanceof Error ? e.message : "Unknown error");
    return new Response(
      JSON.stringify({ error: message }),
      {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
