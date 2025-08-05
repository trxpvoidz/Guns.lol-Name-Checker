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

  const page = await browser.newPage();
  await page.goto(`https://guns.lol/${username}`, {
    waitUntil: "domcontentloaded",
  });

  const available = await page.evaluate(() => {
    const claimButton = [...document.querySelectorAll("button, a")].find(el =>
      el.textContent.toLowerCase().includes("claim")
    );
    return !!claimButton;
  });

  await browser.close();

  return {
    statusCode: 200,
    body: JSON.stringify({ available }),
  };
};
