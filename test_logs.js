import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  await page.goto('http://localhost:5173');
  // Wait for React to load
  await page.waitForTimeout(2000);
  
  // Click on the Planner tab. Tab labels: Timer, Expense, Planner, Todo, Insights.
  // The planner tab has text "Planner" or id "planner"
  // Using page.evaluate
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('span'));
    const plannerTab = tabs.find(t => t.textContent.includes('Planner'));
    if (plannerTab) plannerTab.click();
  });
  
  await page.waitForTimeout(1000);
  await browser.close();
})();
