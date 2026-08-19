const q = "Margaux";
fetch(`https://www.vivino.com/search/wines?q=${encodeURIComponent(q)}`, {
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  }
}).then(res => res.text()).then(html => {
  const match = html.match(/.{0,50}average_rating.{0,50}/g);
  console.log(match ? match.slice(0, 3) : null);
}).catch(console.error);
