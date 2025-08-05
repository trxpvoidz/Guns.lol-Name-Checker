const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

exports.handler = async (event) => {
  const username = event.queryStringParameters?.username;
  if (!username) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing username parameter" }),
    };
  }

  let browser = null;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
      "AppleWebKit/537.36 (KHTML, like Gecko) " +
      "Chrome/115.0.0.0 Safari/537.36"
    );

    await page.goto(`https://guns.lol/${username}`, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    const isAvailable = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      const buttons = Array.from(document.querySelectorAll("a"));
      return (
        h1?.textContent.toLowerCase().includes("not claimed") &&
        buttons.some(
          (btn) =>
            btn.textContent.trim() === "Claim Now!" &&
            btn.offsetHeight >= 30 &&
            btn.offsetWidth >= 100
        )
      );
    });

    await browser.close();

    return {
      statusCode: 200,
      body: JSON.stringify({ username, available: isAvailable }),
    };
  } catch (err) {
    if (browser) await browser.close();
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
