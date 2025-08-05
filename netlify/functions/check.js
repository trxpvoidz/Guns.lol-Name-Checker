const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");

exports.handler = async function(event) {
  const name = event.queryStringParameters.name;
  if (!name) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "No username provided." })
    };
  }

  try {
    const url = `https://guns.lol/${encodeURIComponent(name)}`;
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });

    const isAvailable = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      const claim = document.querySelector("a[href*='claim']");
      return h1 && h1.innerText.includes("not claimed") && claim;
    });

    await browser.close();

    return {
      statusCode: 200,
      body: JSON.stringify({ available: !!isAvailable })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Unknown error" })
    };
  }
};
