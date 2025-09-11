const { chromium } = require('@playwright/test');
const fs = require('fs');

async function run() {
  const username = process.env.EMED_USER;
  const password = process.env.EMED_PASS;
  if (!username || !password) {
    console.error('Missing EMED_USER/EMED_PASS');
    process.exit(1);
  }

  // Try to connect to Chrome CDP endpoint with retries
let browser;
for (let i = 0; i < 3; i++) {
  try {
    browser = await chromium.connectOverCDP('http://localhost:9222');
    break;
  } catch (e) {
    if (i === 2) throw e;
    log('CDP connection failed, retrying...');
    await new Promise(r => setTimeout(r, 5000));
  }
}
  const contexts = browser.contexts();
  const context = contexts.length ? contexts[0] : await browser.newContext();
  let page = await context.newPage();
  fs.mkdirSync('screenshots', { recursive: true });

  function log(msg) {
    console.log(`[emed] ${msg}`);
  }

  // Track active page in case a new target opens
  context.on('page', p => { page = p; });

  try {
    log('Navigating to login page...');
    await page.goto('https://service.emedpractice.com/', { timeout: 90000 });
  } catch (e) {
    await page.waitForTimeout(3000);
    await page.goto('https://service.emedpractice.com/', { timeout: 90000 });
  }

  await page.waitForTimeout(4000);

  const usernameSel = [
    'input[name="un"]',
    'input#un',
    'input[placeholder*="User" i]',
    'input[aria-label*="User" i]'
  ].join(', ');
  const passwordSel = [
    'input[type="password"]',
    'input[placeholder*="Password" i]',
    'input[aria-label*="Password" i]'
  ].join(', ');

  log('Filling credentials...');
  await page.waitForSelector(usernameSel, { timeout: 60000 });
  await page.fill(usernameSel, username, { timeout: 30000 });

  await page.waitForSelector(passwordSel, { timeout: 60000 });
  await page.fill(passwordSel, password, { timeout: 30000 });

  let clicked = false;
  try {
    await page.click('input[type="image"]', { timeout: 30000 });
    clicked = true;
    log('Clicked image submit.');
  } catch {}
  if (!clicked) {
    log('Submitting with Enter key.');
    await page.keyboard.press('Enter').catch(() => {});
  }
await page.locator('//*[starts-with(@class, "btn btn-success")]').click();
await page.waitForTimeout(3000);
await page.locator('//*[starts-with(@class, "sf-with-ul")][contains(normalize-space(.), "Patients")]').click();
await page.waitForTimeout(1000);
// Wait for and fill Patient ID in the correct frame
{
  const patientIdSelector = '#_ctl0_ContentPlaceHolder1_txtPatientID';
  const frame = page.frame({ name: 'contentframe' });
  const scope = frame || page;
  await scope.waitForSelector(patientIdSelector, { state: 'visible', timeout: 30000 });
  await scope.locator(patientIdSelector).click();
  await scope.locator(patientIdSelector).fill('745');
  await page.waitForTimeout(1000);
}
// Wait for and click Search button in the correct frame
{
  const searchBtn = '#_ctl0_ContentPlaceHolder1_btnSearch';
  const frame = page.frame({ name: 'contentframe' });
  const scope = frame || page;
  
  log('Waiting for Search button to be visible...');
  await scope.waitForSelector(searchBtn, { state: 'visible', timeout: 30000 });
  await scope.locator(searchBtn).click({ timeout: 30000 });
  
  log('Waiting for patient grid...');
  const patientRow = '#_ctl0_ContentPlaceHolder1_gvCurrentPatient__ctl2_selectedPatientID';
  await scope.waitForSelector(patientRow, { state: 'visible', timeout: 30000 });
  await scope.locator(patientRow).click({ timeout: 30000 });
  await page.waitForTimeout(3000);
}

// Wait for and click Appointments tab in the correct frame
{
  const appointmentsXPath = '//*[starts-with(@class, "ui-tab-Txt")][contains(text(), "Appointments")]';
  const frame = page.frame({ name: 'contentframe' });
  const scope = frame || page;
  
  log('Waiting for Appointments tab to be visible...');
  const tab = scope.locator(`xpath=${appointmentsXPath}`).first();
  await tab.waitFor({ state: 'visible', timeout: 30000 });
  
  // Try parent anchor first
  const anchor = tab.locator('xpath=ancestor::a[1]').first();
  if (await anchor.isVisible().catch(() => false)) {
    await anchor.click({ timeout: 30000 });
  } else {
    await tab.click({ timeout: 30000 });
  }
  await page.waitForTimeout(2000);
}
// Wait until Appointments tab is visible, then click (prefer parent anchor), frame-aware

// Click ClinicalSummary link inside contentframe using role locator
{
  const frame = page.frame({ name: 'contentframe' });
  const scope = frame || page;
  const link = scope.getByRole('link', { name: 'ClinicalSummary' }).first();
  await link.waitFor({ state: 'visible', timeout: 60000 });
  await link.click({ timeout: 30000 }).catch(async () => {
    // fallback to XPath if role locator fails
    const span = scope.locator('//*[starts-with(@class, "ui-tab-Txt")][contains(normalize-space(.), "ClinicalSummary")]').first();
    await span.waitFor({ state: 'visible', timeout: 60000 });
    const anchor = span.locator('xpath=ancestor::a[1]').first();
    if (await anchor.isVisible().catch(() => false)) {
      await anchor.click({ timeout: 30000 });
    } else {
      await span.click({ timeout: 30000 });
    }
  });
}
// Wait for and click Add New Encounter link
// {
//   const addNewEncSelector = '#lnkAddnewEnc';
  
//   // Wait for frame navigation
//   log('Waiting for frame navigation...');
//   await page.waitForTimeout(5000);
  
//   // Try to find the link in any frame
//   log('Looking for Add New Encounter link in frames...');
//   let found = false;
//   const frames = page.frames();
//   for (const frame of frames) {
//     try {
//       const isVisible = await frame.locator(addNewEncSelector).isVisible().catch(() => false);
//       if (isVisible) {
//         log(`Found link in frame: ${frame.url()}`);
//         await frame.locator(addNewEncSelector).click({ timeout: 30000 });
//         found = true;
//         break;
//       }
//     } catch {}
//   }
  
//   // Fallback to main page
//   if (!found) {
//     log('Checking main page for link...');
//     if (await page.locator(addNewEncSelector).isVisible().catch(() => false)) {
//       await page.locator(addNewEncSelector).click({ timeout: 30000 });
//       found = true;
      
//       // Wait for form to load and select date
//       await page.waitForTimeout(2000);
//       await selectDate(page, '08/25/2025'); // You can change this date as needed
//     }
//   }
  
//   if (!found) {
//     log('Add New Encounter link not found in any frame.');
//   }
//   await page.waitForTimeout(2000);
// }
// // Wait for and click chosen dropdown in any frame
// {
//   log('Waiting for frame after Add New Encounter...');
//   await page.waitForTimeout(2000);
  
//   // Try to find chosen container in any frame
//   log('Looking for chosen dropdown in frames...');
//   let found = false;
//   const frames = page.frames();
//   for (const frame of frames) {
//     try {
//       log(`Checking frame: ${frame.url()}`);
//       const chosenSelector = '.chosen-container';
//       // Get the second chosen container
//       const dropdown = frame.locator(chosenSelector).nth(1);
//       const isVisible = await dropdown.isVisible().catch(() => false);
      
//       if (isVisible) {
//         log('Found chosen dropdown, clicking...');
//         await dropdown.click();
        
//         // Wait for dropdown to activate and select first option
//         log('Waiting for dropdown options...');
//         // Look for the specific doctor option
//         const doctorOption = frame.locator('.chosen-results li', { 
//           hasText: 'ARIEL RAMIREZ NAVARRO MD'
//         }).first();
//         await doctorOption.waitFor({ state: 'visible', timeout: 10000 });
//         log('Selecting ARIEL RAMIREZ NAVARRO MD...');
//         await doctorOption.click();
        
//         found = true;
//         break;
//       }
//     } catch (e) {
//       log(`Frame check failed: ${e.message}`);
//     }
//   }
  
//   if (!found) {
//     log('Chosen dropdown not found in any frame.');
//   }
  
//   await page.waitForTimeout(1000);
// }
// {
//   log('Waiting for frame after Add New Encounter...');
//   await page.waitForTimeout(2000);
  
//   // Try to find chosen container in any frame
//   log('Looking for chosen dropdown in frames...');
//   let found = false;
//   const frames = page.frames();
//   for (const frame of frames) {
//     try {
//       log(`Checking frame: ${frame.url()}`);
//       const chosenSelector = '.chosen-container';
//       // Get the second chosen container
//       const dropdown = frame.locator(chosenSelector).nth(3);
//       const isVisible = await dropdown.isVisible().catch(() => false);
      
//       if (isVisible) {
//         log('Found chosen dropdown, clicking...');
//         await dropdown.click();
        
//         // Wait for dropdown to activate and select first option
//         log('Waiting for dropdown options...');
//         // Look for the specific doctor option
//         const doctorOption = frame.locator('.chosen-results li', { 
//           hasText: 'QHS'
//         }).first();
//         await doctorOption.waitFor({ state: 'visible', timeout: 10000 });
//         log('QHS');
//         await doctorOption.click();
        
//         found = true;
//         break;
//       }
//     } catch (e) {
//       log(`Frame check failed: ${e.message}`);
//     }
//   }
  
//   if (!found) {
//     log('Chosen dropdown not found in any frame.');
//   }
  
//   await page.waitForTimeout(1000);
// }
// {
//   log('Waiting for frame after Add New Encounter...');
//   await page.waitForTimeout(2000);
  
//   // Try to find chosen container in any frame
//   log('Looking for chosen dropdown in frames...');
//   let found = false;
//   const frames = page.frames();
//   for (const frame of frames) {
//     try {
//       log(`Checking frame: ${frame.url()}`);
//       const chosenSelector = '.chosen-container';
//       // Get the second chosen container
//       const dropdown = frame.locator(chosenSelector).nth(4);
//       const isVisible = await dropdown.isVisible().catch(() => false);
      
//       if (isVisible) {
//         log('Found chosen dropdown, clicking...');
//         await dropdown.click();
        
//         // Wait for dropdown to activate and select first option
//         log('Waiting for dropdown options...');
//         // Look for the specific doctor option
//         const doctorOption = frame.locator('.chosen-results li', { 
//           hasText: 'QHS IC (QHS - Intelligent Charts)'
//         }).first();
//         await doctorOption.waitFor({ state: 'visible', timeout: 10000 });
//         log('QHS IC (QHS - Intelligent Charts)');
//         await doctorOption.click();
        
//         found = true;
//         break;
//       }
//     } catch (e) {
//       log(`Frame check failed: ${e.message}`);
//     }
//   }
  
//   if (!found) {
//     log('Chosen dropdown not found in any frame.');
//   }
  
//   await page.waitForTimeout(1000);
// }
// // Look for Insert button in all frames
// {
//   log('Looking for Insert button in frames...');
//   let found = false;
//   const frames = page.frames();
//   for (const frame of frames) {
//     try {
//       log(`Checking frame: ${frame.url()}`);
//       const insertButton = frame.locator('#btnInsert');
//       const isVisible = await insertButton.isVisible().catch(() => false);
      
//       if (isVisible) {
//         log('Found Insert button, clicking...');
//         await insertButton.click();
//         found = true;
//         break;
//       }
//     } catch (e) {
//       log(`Frame check failed: ${e.message}`);
//     }
//   }
  
//   if (!found) {
//     log('Insert button not found in any frame.');
//   }
  
//   await page.waitForTimeout(2000);
// }
  // Look for "Work on this" link in any frame
{
  log('Looking for "Work on this" link in frames...');
  let found = false;
  const frames = page.frames();
  for (const frame of frames) {
    try {
      log(`Checking frame: ${frame.url()}`);
      // Look for link with brown color and "Work on this" text
      const workOnThisLink = frame.locator('a[style*="color: brown"], a[style*="color:brown"]').filter({ hasText: 'Work on this' });
      const isVisible = await workOnThisLink.isVisible().catch(() => false);
      
      if (isVisible) {
        log('Found "Work on this" link, clicking...');
        await workOnThisLink.waitFor({ state: 'visible', timeout: 30000 });
        await workOnThisLink.click();
        found = true;
        break;
      }
    } catch (e) {
      log(`Frame check failed: ${e.message}`);
    }
  }
  
  if (!found) {
    log('"Work on this" link not found in any frame.');
  }
  
  await page.waitForTimeout(2000);
}

await page.screenshot({ path: 'screenshots/emed-login-after-cdp.png', fullPage: true });
  await page.screenshot({ path: 'screenshots/emed-after-search.png', fullPage: true });
  await page.screenshot({ path: 'screenshots/emed-after-appointments.png', fullPage: true });
  await page.screenshot({ path: 'screenshots/emed-after-clinical-summary.png', fullPage: true });
  log('Done. Screenshot saved.');
}

run().catch(err => { console.error(err); process.exit(1); }); 