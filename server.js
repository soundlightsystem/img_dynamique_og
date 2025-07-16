const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/og-image", async (req, res) => {
  const texte = req.query.texte || "Fada'Son";

  const html = `
    <html>
      <head>
        <style>
          body {
            width: 1200px;
            height: 630px;
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #111;
            color: white;
            font-size: 60px;
            font-family: sans-serif;
          }
        </style>
      </head>
      <body>${texte}</body>
    </html>
  `;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630 });
  await page.setContent(html);
  const buffer = await page.screenshot({ type: "png" });

  await browser.close();

  res.set("Content-Type", "image/png");
  res.send(buffer);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
