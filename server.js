import express from "express";
import puppeteer from "puppeteer";

const app = express();

app.get("/pdf", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send("Missing ?url parameter");

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--ignore-certificate-errors",
      ],
    });

    const page = await browser.newPage();

    // 🔹 התעלמות משגיאות HTTPS
    await page.setJavaScriptEnabled(true);
    await page.setExtraHTTPHeaders({
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
    });

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 180000 });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="catalog.pdf"',
    });
    res.send(pdf);
  } catch (err) {
    console.error("❌ Error generating PDF:", err);
    res.status(500).send("Error generating PDF");
  }
});

app.listen(3000, () => console.log("🚀 PDF service running on port 3000"));
