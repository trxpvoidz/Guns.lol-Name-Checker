const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");

exports.handler = async function (event) {
  const { username } = event.body ? JSON.parse(event.body) : event.queryStringParameters;
  if (!username) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Missing username" }),
    };
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/116 Safari/537.36");
    await page.goto(`https://guns.lol/${username}`, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Optional: Debug snippet
    const html = await page.content();
    console.log("HTML snippet:", html.slice(0, 200));

    const available = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      const h3 = document.querySelector("h3");
      const claimLink = [...document.querySelectorAll("a")].find(a =>
        a.textContent.trim().toLowerCase() === "claim now!"
      );
      return (
        h1?.innerText.toLowerCase().includes("not claimed") &&
        h3?.innerText.toLowerCase().includes("claim this name") &&
        !!claimLink
      );
    });

    await browser.close();
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available }),
    };
  } catch (err) {
    if (browser) await browser.close();
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Error checking username", details: err.message }),
    };
  }
};
