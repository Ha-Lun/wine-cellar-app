import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function callAI(apiKey: string, messages: any[], useTools = false) {
  const body: any = {
    model: "gemini-3-flash-preview",
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

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
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
    console.error("Gemini API error:", status, errText);
    throw { status: 500, message: "Gemini API error" };
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

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // ── Step 1 & 2 Combined: Extract, verify, and enrich from the image directly ──
    console.log("Analyzing wine label and enriching data...");
    
    const analysisResponse = await callAI(
      GEMINI_API_KEY,
      [
        {
          role: "system",
          content: `You are a world-class wine expert and sommelier with encyclopedic knowledge of wines worldwide.
Your job is to analyze the provided wine label image and return a structured JSON response with verified data.

Instructions:
1. EXTRACT ALL visible information from the wine label image.
2. VERIFY the data — correct any obvious errors or misreadings (e.g. wrong region, misspelled winery).
3. FILL IN missing fields using your wine knowledge (region, country, grape variety, type) if you recognize the wine.
4. ESTIMATE the optimal drinking window (drink_from, drink_until) based on the wine's type, region, vintage, and producer quality.
5. SUGGEST 3-5 accurate food pairings based on the specific wine style.

Drinking window guidelines:
- Young simple whites: vintage + 1-3 years
- Quality whites (Burgundy, Riesling Grand Cru): vintage + 3-10 years
- Champagne NV: 1-3 years from now, vintage: 5-15 years
- Light reds (Pinot Noir, Beaujolais): vintage + 2-5 years
- Medium reds (Merlot, Chianti): vintage + 3-8 years
- Full-bodied reds (Cabernet, Barolo, Bordeaux Grand Cru): vintage + 5-25 years`
        },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: image } },
            { type: "text", text: "Please analyze this wine label and return the structured data." }
          ]
        }
      ],
      true // use tool calling for structured output
    );

    // Extract structured data from tool call
    const toolCall = analysisResponse.choices?.[0]?.message?.tool_calls?.[0];
    
    let wineData;
    if (toolCall?.function?.arguments) {
      wineData = JSON.parse(toolCall.function.arguments);
      console.log("Structured result extracted from tool call:", JSON.stringify(wineData));
    } else {
      // Fallback in case the model ignored the tool and just returned JSON text
      let rawContent = analysisResponse.choices?.[0]?.message?.content;
      if (!rawContent) {
        throw new Error("No response from AI");
      }
      
      let cleaned = rawContent.trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      }
      wineData = JSON.parse(cleaned);
      console.log("Structured result extracted from text fallback:", JSON.stringify(wineData));
    }

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
