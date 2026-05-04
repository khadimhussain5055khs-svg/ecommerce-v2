const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('http://localhost:5173/');
  
  await page.waitForSelector('button');
  
  // Find "Login" button
  const buttons = await page.$$('button');
  for (const button of buttons) {
    const text = await page.evaluate(el => el.textContent, button);
    if (text.includes('Login')) {
      console.log('Clicking Login button');
      await button.click();
      break;
    }
  }
  
  await new Promise(r => setTimeout(r, 1000)); // wait for modal
  
  const content = await page.content();
  if (content.includes('Email Address')) {
    console.log('Modal is visible!');
  } else {
    console.log('Modal is NOT visible.');
  }
  
  await browser.close();
})();
