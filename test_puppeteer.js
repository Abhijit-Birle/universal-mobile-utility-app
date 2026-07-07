import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('PAGE LOG:', msg.text());
  });
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });

  await page.goto('http://localhost:5173');
  // Wait for the app to load
  await page.waitForSelector('text/Insights');
  
  // Click on the Insights tab
  const tabs = await page.$$('text/Insights');
  if (tabs.length > 0) {
      await tabs[0].click();
      await new Promise(r => setTimeout(r, 1000));
  }
  
  await browser.close();
})();
