const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");

exports.handler = async function (event) {
  const { username } = JSON.parse(event.body || "{}");

  if (!username) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing username" }),
    };
  }

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });

  try {
    const page = await browser.newPage();
    await page.goto(`https://guns.lol/${username}`, {
      waitUntil: "domcontentloaded",
    });

    const available = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      if (!h1 || !h1.textContent.toLowerCase().includes("not claimed")) return false;

      const claimLink = [...document.querySelectorAll("a")].find(a =>
        a.textContent.trim().toLowerCase() === "claim now!"
      );
      return !!claimLink;
    });

    await browser.close();

    return {
      statusCode: 200,
      body: JSON.stringify({ available }),
    };
  } catch (err) {
    await browser.close();
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error checking username", details: err.message }),
    };
  }
};
