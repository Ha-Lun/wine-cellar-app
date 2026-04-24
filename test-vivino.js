const q = encodeURIComponent("Chateau Margaux 2015");
fetch(`https://www.vivino.com/search/wines?q=${q}`, {
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  }
})
.then(res => res.text())
.then(html => {
  console.log(html.substring(0, 500));
  const ratingMatch = html.match(/average_rating":"?([\d\.]+)"?/);
  console.log("Rating match:", ratingMatch);
})
.catch(console.error);
