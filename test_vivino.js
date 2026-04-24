const q = "Margaux";
fetch(`https://www.vivino.com/search/wines?q=${encodeURIComponent(q)}`, {
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  }
}).then(res => res.text()).then(html => {
  console.log("HTML length:", html.length);
  const match = html.match(/average_rating":\s*"?([\d\.]+)"?/);
  console.log("Regex match:", match ? match[1] : null);
  const preloaded = html.match(/window\.__PRELOADED_STATE__\s*=\s*({.*?});/);
  console.log("Preloaded exists?", !!preloaded);
}).catch(console.error);
