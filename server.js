const express = require("express");
const puppeteer = require("puppeteer");
const chromium = require("chrome-aws-lambda");

const app = express();
const PORT = process.env.PORT || 3000;

async function launchBrowser() {
  if (process.env.IS_OFFLINE || !chromium.executablePath) {
    // En local ou si chromium.executablePath est null => lance puppeteer normalement
    return puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      defaultViewport: { width: 1200, height: 630 },
    });
  } else {
    // En prod (Render), utilise chrome-aws-lambda
    return chromium.puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
      defaultViewport: { width: 1200, height: 630 },
    });
  }
}

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

  let browser = null;
  try {
    console.log("Launching browser...");
    browser = await launchBrowser();
    console.log("Browser launched.");

    const page = await browser.newPage();
    await page.setContent(html);

    const buffer = await page.screenshot({ type: "png" });

    res.set("Content-Type", "image/png");
    res.send(buffer);

  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).send("Erreur lors de la génération de l'image");
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
