const q = "Margaux";
fetch(`https://api.vivino.com/v1/wines/search?q=${encodeURIComponent(q)}`, {
  headers: {
    "User-Agent": "Vivino/8.20.0 (Android; OS 11)"
  }
}).then(res => res.json()).then(data => {
  console.log(data);
}).catch(console.error);
