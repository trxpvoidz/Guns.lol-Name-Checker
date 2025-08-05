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

    // Pretend to be a real browser
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/116 Safari/537.36");

    await page.goto(`https://guns.lol/${username}`, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    const html = await page.content();

    const available = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      const h3 = document.querySelector("h3");
      const claimBtn = [...document.querySelectorAll("a")].find(
        a => a.textContent.toLowerCase().includes("claim")
      );

      return (
        h1 &&
        h1.textContent.toLowerCase().includes("not claimed") &&
        h3 &&
        h3.textContent.toLowerCase().includes("claim this name") &&
        !!claimBtn
      );
    });

    await browser.close();

    return {
      statusCode: 200,
      body: JSON.stringify({ available, htmlSnippet: html.slice(0, 1000) }),
    };
  } catch (err) {
    await browser.close();
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error checking username", details: err.message }),
    };
  }
};
