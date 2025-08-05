const puppeteer = require("@sparticuz/chromium");
const puppeteerCore = require("puppeteer-core");

exports.handler = async (event) => {
  const username = event.queryStringParameters.name;
  const url = `https://guns.lol/${username}`;

  let browser = null;

  try {
    const executablePath = await puppeteer.executablePath();
    browser = await puppeteerCore.launch({
      args: puppeteer.args,
      defaultViewport: puppeteer.defaultViewport,
      executablePath,
      headless: puppeteer.headless,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const isAvailable = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      const h3 = document.querySelector("h3");
      const claimBtn = [...document.querySelectorAll("a")].find(a =>
        a.textContent.toLowerCase().includes("claim")
      );

      return (
        h1?.innerText.includes("not claimed") &&
        h3?.innerText.includes("Claim this name") &&
        claimBtn
      );
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ available: isAvailable }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Unknown error", details: err.message }),
    };
  } finally {
    if (browser) await browser.close();
  }
};
