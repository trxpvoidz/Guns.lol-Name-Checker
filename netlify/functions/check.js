const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

exports.handler = async (event) => {
  const name = event.queryStringParameters.name;
  if (!name || name.length > 20) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid name' }),
    };
  }

  let browser;

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless
    });

    const page = await browser.newPage();
    await page.goto(`https://guns.lol/${name}`, { waitUntil: 'domcontentloaded', timeout: 15000 });

    const claimable = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const btns = Array.from(document.querySelectorAll('a')).map(a => a.textContent.trim());
      return h1 && h1.innerText.toLowerCase().includes("not claimed") && btns.includes("Claim Now!");
    });

    await browser.close();
    return {
      statusCode: 200,
      body: JSON.stringify({ available: claimable }),
    };

  } catch (error) {
    if (browser) await browser.close();
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Unknown error occurred', detail: error.message }),
    };
  }
};
