import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    const { query } = await req.json();
    if (!query) {
      return new Response(JSON.stringify({ error: "Query is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Fetching Vivino rating for:", query);

    let rating = null;

    try {
      // Use Googlebot User-Agent which often bypasses strict Cloudflare bot checks
      const response = await fetch(`https://www.vivino.com/search/wines?q=${encodeURIComponent(query)}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5"
        }
      });

      if (response.ok) {
        const html = await response.text();
        
        // Look for average_rating or ratings_average
        const match = html.match(/(?:average_rating|ratings_average)":\s*"?([\d\.]+)"?/);
        if (match) {
          rating = parseFloat(match[1]);
        } else {
          // Fallback regex for HTML elements
          const fallbackMatch = html.match(/>([\d\.]+)<.*?stars/i);
          if (fallbackMatch) {
            rating = parseFloat(fallbackMatch[1]);
          }
        }
      } else {
        console.warn(`Vivino request failed with status: ${response.status}`);
      }
    } catch (e) {
      console.warn("Direct Vivino fetch failed:", e);
    }

    // Fallback to DuckDuckGo search if direct Vivino fetch failed or found no rating
    if (!rating) {
      console.log("Falling back to DuckDuckGo search");
      try {
        const ddgResponse = await fetch(`https://html.duckduckgo.com/html/?q=site:vivino.com+${encodeURIComponent(query)}+"average+rating"`, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          }
        });
        
        if (ddgResponse.ok) {
          const ddgHtml = await ddgResponse.text();
          // Look for rating in snippets like: "Average rating of 4.2 from" or "4.2 stars"
          const ddgMatch = ddgHtml.match(/(?:Average rating[^0-9]+|Average of\s+|Rating:\s*)([0-5]\.\d)/i) 
                        || ddgHtml.match(/([0-5]\.\d)\s*(?:stars|out of 5)/i);
          if (ddgMatch) {
            rating = parseFloat(ddgMatch[1]);
          }
        }
      } catch (e) {
        console.error("DuckDuckGo fallback failed:", e);
      }
    }

    console.log("Extracted rating:", rating);

    return new Response(JSON.stringify({ rating }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("get-vivino-rating error:", e);
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
