const { test } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

function getAccountOrPatientIdFromExcelOrEnv() {
  if (process.env.ACCOUNT_ID) return String(process.env.ACCOUNT_ID);
  if (process.env.PATIENT_ID) return String(process.env.PATIENT_ID);
  try {
    const XLSX = require('xlsx');
    // Resolve data file path with fallbacks
    const candidates = [];
    if (process.env.DATA_FILE) candidates.push(process.env.DATA_FILE);
    if (process.env.PATIENT_FILE) candidates.push(process.env.PATIENT_FILE);
    // tests/data/dynamicdata.xlsx (preferred)
    candidates.push(path.resolve(__dirname, './data/dynamicdata.xlsx'));
    // projectRoot/data/dynamicdata.xlsx (fallback)
    candidates.push(path.resolve(__dirname, '../data/dynamicdata.xlsx'));
    const filePath = candidates.find(p => {
      try { return fs.existsSync(p); } catch { return false; }
    });
    if (!filePath) {
      throw new Error(`Data file not found. Tried: ${candidates.join(' | ')}`);
    }
    const workbook = XLSX.readFile(filePath);
    const sheetName = process.env.DATA_SHEET || process.env.PATIENT_SHEET || workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) throw new Error(`Sheet not found: ${sheetName}`);
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    if (rows && rows.length > 0) {
      const first = rows[0];
      if (Object.prototype.hasOwnProperty.call(first, 'AccountID') && String(first.AccountID).trim() !== '') return String(first.AccountID).trim();
      if (Object.prototype.hasOwnProperty.call(first, 'PatientID') && String(first.PatientID).trim() !== '') return String(first.PatientID).trim();
      const keys = Object.keys(first);
      if (keys.length && String(first[keys[0]]).trim() !== '') return String(first[keys[0]]).trim();
    }
    if (sheet['A2'] && sheet['A2'].v != null) return String(sheet['A2'].v).trim();
    throw new Error('No AccountID/PatientID found in sheet');
  } catch (e) {
    console.warn(`Excel read failed, falling back to default. Details: ${e.message}`);
    return '745';
  }
}

function getPlanCommunicationFromExcelOrEnv() {
  if (process.env.PLAN_COMMUNICATION) return String(process.env.PLAN_COMMUNICATION);
  try {
    const XLSX = require('xlsx');
    const candidates = [];
    if (process.env.DATA_FILE) candidates.push(process.env.DATA_FILE);
    if (process.env.PATIENT_FILE) candidates.push(process.env.PATIENT_FILE);
    candidates.push(path.resolve(__dirname, './data/dynamicdata.xlsx'));
    candidates.push(path.resolve(__dirname, '../data/dynamicdata.xlsx'));
    const filePath = candidates.find(p => { try { return fs.existsSync(p); } catch { return false; } });
    if (!filePath) return 'Automated Plan details go here.';
    const workbook = XLSX.readFile(filePath);
    const sheetName = process.env.DATA_SHEET || process.env.PATIENT_SHEET || workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) return 'Automated Plan details go here.';
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    if (rows && rows.length > 0) {
      const first = rows[0];
      const keys = Object.keys(first);
      const planKey = keys.find(k => k.trim().toLowerCase() === 'plan & patient communication');
      if (planKey && String(first[planKey]).trim() !== '') return String(first[planKey]).trim();
    }
    return 'Automated Plan details go here.';
  } catch (e) {
    console.warn(`Excel read failed for plan communication. Details: ${e.message}`);
    return 'Automated Plan details go here.';
  }
}

function getHPIFromExcelOrEnv() {
  if (process.env.HPI_TEXT) return String(process.env.HPI_TEXT);
  try {
    const XLSX = require('xlsx');
    const candidates = [];
    if (process.env.DATA_FILE) candidates.push(process.env.DATA_FILE);
    if (process.env.PATIENT_FILE) candidates.push(process.env.PATIENT_FILE);
    candidates.push(path.resolve(__dirname, './data/dynamicdata.xlsx'));
    candidates.push(path.resolve(__dirname, '../data/dynamicdata.xlsx'));
    const filePath = candidates.find(p => { try { return fs.existsSync(p); } catch { return false; } });
    if (!filePath) return 'Automated HPI note text.';
    const workbook = XLSX.readFile(filePath);
    const sheetName = process.env.DATA_SHEET || process.env.PATIENT_SHEET || workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) return 'Automated HPI note text.';
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    if (rows && rows.length > 0) {
      const first = rows[0];
      const keys = Object.keys(first);
      const hpiKey = keys.find(k => k.trim().toLowerCase() === 'hpi');
      if (hpiKey && String(first[hpiKey]).trim() !== '') return String(first[hpiKey]).trim();
    }
    return 'Automated HPI note text.';
  } catch (e) {
    console.warn(`Excel read failed for HPI. Details: ${e.message}`);
    return 'Automated HPI note text.';
  }
}

function getProviderFromExcelOrEnv() {
  if (process.env.PROVIDER) return String(process.env.PROVIDER);
  try {
    const XLSX = require('xlsx');
    const candidates = [];
    if (process.env.DATA_FILE) candidates.push(process.env.DATA_FILE);
    if (process.env.PATIENT_FILE) candidates.push(process.env.PATIENT_FILE);
    candidates.push(path.resolve(__dirname, './data/dynamicdata.xlsx'));
    candidates.push(path.resolve(__dirname, '../data/dynamicdata.xlsx'));
    const filePath = candidates.find(p => { try { return fs.existsSync(p); } catch { return false; } });
    if (!filePath) throw new Error(`Data file not found. Tried: ${candidates.join(' | ')}`);
    const workbook = XLSX.readFile(filePath);
    const sheetName = process.env.DATA_SHEET || process.env.PATIENT_SHEET || workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) throw new Error(`Sheet not found: ${sheetName}`);
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    if (rows && rows.length > 0) {
      const first = rows[0];
      const keys = Object.keys(first);
      const providerKey = keys.find(k => k.trim().toLowerCase() === 'provider');
      if (providerKey && String(first[providerKey]) !== '') return String(first[providerKey]);
    }
    throw new Error('Provider column is missing or empty in the first row');
  } catch (e) {
    throw new Error(`Failed to read Provider from Excel: ${e.message}`);
  }
}

function getEncounterTypeFromExcelOrEnv() {
  if (process.env.ENCOUNTER_TYPE) return String(process.env.ENCOUNTER_TYPE);
  try {
    const XLSX = require('xlsx');
    const candidates = [];
    if (process.env.DATA_FILE) candidates.push(process.env.DATA_FILE);
    if (process.env.PATIENT_FILE) candidates.push(process.env.PATIENT_FILE);
    candidates.push(path.resolve(__dirname, './data/dynamicdata.xlsx'));
    candidates.push(path.resolve(__dirname, '../data/dynamicdata.xlsx'));
    const filePath = candidates.find(p => { try { return fs.existsSync(p); } catch { return false; } });
    if (!filePath) throw new Error(`Data file not found. Tried: ${candidates.join(' | ')}`);
    const workbook = XLSX.readFile(filePath);
    const sheetName = process.env.DATA_SHEET || process.env.PATIENT_SHEET || workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) throw new Error(`Sheet not found: ${sheetName}`);
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    if (!rows || rows.length === 0) throw new Error('Sheet has no rows');
    const keys = Object.keys(rows[0] || {});
    const encounterKey = keys.find(k => {
      const normalized = String(k).trim().toLowerCase().replace(/[\s_-]+/g, ' ');
      return normalized === 'encounter type' || normalized === 'encountertype' || normalized === 'visit type' || normalized === 'encounter';
    });
    if (!encounterKey) throw new Error('Encounter Type column not found');
    const match = rows.find(r => String(r[encounterKey]).trim() !== '');
    if (match) return String(match[encounterKey]).trim();
    throw new Error('Encounter Type column is present but has no values');
  } catch (e) {
    throw new Error(`Failed to read Encounter Type from Excel: ${e.message}`);
  }
}

function getVisitTemplateTypeFromExcelOrEnv() {
  if (process.env.VISIT_TEMPLATE_TYPE) return String(process.env.VISIT_TEMPLATE_TYPE);
  if (process.env.VISIT_TEMPLATE) return String(process.env.VISIT_TEMPLATE);
  try {
    const XLSX = require('xlsx');
    const candidates = [];
    if (process.env.DATA_FILE) candidates.push(process.env.DATA_FILE);
    if (process.env.PATIENT_FILE) candidates.push(process.env.PATIENT_FILE);
    candidates.push(path.resolve(__dirname, './data/dynamicdata.xlsx'));
    candidates.push(path.resolve(__dirname, '../data/dynamicdata.xlsx'));
    const filePath = candidates.find(p => { try { return fs.existsSync(p); } catch { return false; } });
    if (!filePath) throw new Error(`Data file not found. Tried: ${candidates.join(' | ')}`);
    const workbook = XLSX.readFile(filePath);
    const sheetName = process.env.DATA_SHEET || process.env.PATIENT_SHEET || workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) throw new Error(`Sheet not found: ${sheetName}`);
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    if (!rows || rows.length === 0) throw new Error('Sheet has no rows');
    const keys = Object.keys(rows[0] || {});
    const key = keys.find(k => {
      const normalized = String(k).trim().toLowerCase().replace(/[\s_-]+/g, '_');
      return normalized === 'visit_template_type';
    });
    if (!key) throw new Error('Visit Template Type column not found');
    const match = rows.find(r => String(r[key]).trim() !== '');
    if (match) return String(match[key]).trim();
    throw new Error('Visit Template Type column is present but has no values');
  } catch (e) {
    throw new Error(`Failed to read Visit Template Type from Excel: ${e.message}`);
  }
}

function getEncounterDateFromExcelOrEnv() {
  if (process.env.ENCOUNTER_DATE) return String(process.env.ENCOUNTER_DATE);
  try {
    const XLSX = require('xlsx');
    const candidates = [];
    if (process.env.DATA_FILE) candidates.push(process.env.DATA_FILE);
    if (process.env.PATIENT_FILE) candidates.push(process.env.PATIENT_FILE);
    candidates.push(path.resolve(__dirname, './data/dynamicdata.xlsx'));
    candidates.push(path.resolve(__dirname, '../data/dynamicdata.xlsx'));
    const filePath = candidates.find(p => { try { return fs.existsSync(p); } catch { return false; } });
    if (!filePath) throw new Error(`Data file not found. Tried: ${candidates.join(' | ')}`);
    const workbook = XLSX.readFile(filePath);
    const sheetName = process.env.DATA_SHEET || process.env.PATIENT_SHEET || workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) throw new Error(`Sheet not found: ${sheetName}`);
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    if (!rows || rows.length === 0) throw new Error('Sheet has no rows');
    const keys = Object.keys(rows[0] || {});
    const key = keys.find(k => {
      const normalized = String(k).trim().toLowerCase().replace(/[\s_-]+/g, '_');
      return normalized === 'date' || normalized === 'encounter_date' || normalized === 'visit_date';
    });
    if (!key) throw new Error('Date column not found');
    const match = rows.find(r => String(r[key]).trim() !== '');
    if (match) return String(match[key]).trim();
    throw new Error('Date column is present but has no values');
  } catch (e) {
    throw new Error(`Failed to read Encounter Date from Excel: ${e.message}`);
  }
}

function formatEncounterDateForInput(raw) {
  const value = String(raw).trim();
  if (!value) throw new Error('Encounter Date is empty');
  // Normalize separators to '/'
  const norm = value.replace(/[.\-]/g, '/');
  // Match DD/MM/YYYY or MM/DD/YYYY or YYYY/MM/DD
  const dmy = /^([0-3]?\d)\/([0-1]?\d)\/(\d{4})$/; // 15/10/2025
  const mdy = /^([0-1]?\d)\/([0-3]?\d)\/(\d{4})$/; // 10/15/2025
  const ymd = /^(\d{4})\/([0-1]?\d)\/([0-3]?\d)$/; // 2025/10/15
  let m, d, y;
  if (dmy.test(norm)) {
    const [, dd, mm, yyyy] = norm.match(dmy);
    d = dd.padStart(2, '0');
    m = mm.padStart(2, '0');
    y = yyyy;
    // If ambiguous like 01/02/2025, prefer DMY only when day > 12
    if (parseInt(dd, 10) <= 12 && parseInt(mm, 10) <= 12) {
      // Fall back to MDY for ambiguous values
      m = dd.padStart(2, '0');
      d = mm.padStart(2, '0');
    }
  } else if (ymd.test(norm)) {
    const [, yyyy, mm, dd] = norm.match(ymd);
    y = yyyy; m = mm.padStart(2, '0'); d = dd.padStart(2, '0');
  } else if (mdy.test(norm)) {
    const [, mm, dd, yyyy] = norm.match(mdy);
    m = mm.padStart(2, '0'); d = dd.padStart(2, '0'); y = yyyy;
  } else {
    // Try to parse with Date
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      m = String(parsed.getMonth() + 1).padStart(2, '0');
      d = String(parsed.getDate()).padStart(2, '0');
      y = String(parsed.getFullYear());
    } else {
      // As a last resort, return raw
      return value;
    }
  }
  return `${m}/${d}/${y}`; // Site expects MM/DD/YYYY
}

function writeTestResultToExcel(status) {
  try {
    const XLSX = require('xlsx');
    const candidates = [];
    if (process.env.DATA_FILE) candidates.push(process.env.DATA_FILE);
    if (process.env.PATIENT_FILE) candidates.push(process.env.PATIENT_FILE);
    candidates.push(path.resolve(__dirname, './data/dynamicdata.xlsx'));
    candidates.push(path.resolve(__dirname, '../data/dynamicdata.xlsx'));
    const filePath = candidates.find(p => { try { return fs.existsSync(p); } catch { return false; } });
    if (!filePath) { console.warn(`Result write skipped: data file not found. Tried: ${candidates.join(' | ')}`); return; }
    const workbook = XLSX.readFile(filePath);
    const sheetName = process.env.DATA_SHEET || process.env.PATIENT_SHEET || workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) { console.warn(`Result write skipped: sheet not found: ${sheetName}`); return; }
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (!rows || rows.length === 0) { console.warn('Result write skipped: sheet has no rows'); return; }
    const header = Array.isArray(rows[0]) ? rows[0] : [];
    let colIndex = header.findIndex(h => String(h).trim().toLowerCase() === 'result' || String(h).trim().toLowerCase() === 'status');
    if (colIndex === -1) { colIndex = header.length; header[colIndex] = 'Result'; rows[0] = header; }
    if (!rows[1]) rows[1] = [];
    rows[1][colIndex] = status;
    const newSheet = XLSX.utils.aoa_to_sheet(rows);
    workbook.Sheets[sheetName] = newSheet;
    XLSX.writeFile(workbook, filePath);
  } catch (e) {
    console.warn(`Failed to write result to Excel: ${e.message}`);
  }
}

test.use({ headless: false });

test.afterEach(async ({}, testInfo) => {
  const status = testInfo.status === 'passed' ? 'PASS' : 'FAIL';
  writeTestResultToExcel(status);
});

test('visit emedpractice loads under VPN', async ({ page }) => {
  test.setTimeout(300000);
  const log = (msg) => console.log(`[visit] ${msg}`);
  const recordIdValue = getAccountOrPatientIdFromExcelOrEnv();
  const planCommunicationText = getPlanCommunicationFromExcelOrEnv();
  const providerText = getProviderFromExcelOrEnv();
  const encounterTypeText = getEncounterTypeFromExcelOrEnv();
  const visitTemplateTypeText = getVisitTemplateTypeFromExcelOrEnv();
  const encounterDateText = getEncounterDateFromExcelOrEnv();
  await page.goto('https://service.emedpractice.com/', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  await page.waitForTimeout(5000);
  await page.locator('input[placeholder*="User" i]').fill('QHSisp25');
  await page.locator('input[placeholder*="Password" i]').fill('MedViz@2050');
  await page.locator('input[type="image"]').click();
  await page.waitForTimeout(2000);
  await page.locator('//*[starts-with(@class, "btn btn-success")]').click();
  await page.waitForTimeout(2000);
  await page.locator('//*[starts-with(@class, "sf-with-ul")][contains(normalize-space(.), "Patients")]').click();
  await page.waitForTimeout(1000);
  const content = page.frameLocator('iframe[name="contentframe"]');
// Wait for and fill Patient ID in the correct frame
{
  const patientIdSelector = '#_ctl0_ContentPlaceHolder1_txtPatientID';
  await content.locator(patientIdSelector).waitFor({ state: 'visible', timeout: 30000 });
  await content.locator(patientIdSelector).click();
  await content.locator(patientIdSelector).fill(recordIdValue);
  await page.waitForTimeout(4000);
}
// Wait for and click Search button in the correct frame
{
  const searchBtn = '#_ctl0_ContentPlaceHolder1_btnSearch';
  
  log('Waiting for Search button to be visible...');
  await content.locator(searchBtn).waitFor({ state: 'visible', timeout: 30000 });
  await content.locator(searchBtn).click({ timeout: 30000 });
  
  log('Waiting for patient grid...');
  const patientRow = '#_ctl0_ContentPlaceHolder1_gvCurrentPatient__ctl2_selectedPatientID';
  await content.locator(patientRow).waitFor({ state: 'visible', timeout: 30000 });
  await content.locator(patientRow).click({ timeout: 30000 });
  await page.waitForTimeout(3000);
}

// Wait for and click Appointments tab in the correct frame
{
  const appointmentsXPath = '//*[starts-with(@class, "ui-tab-Txt")][contains(text(), "Appointments")]';
  
  log('Waiting for Appointments tab to be visible...');
  const tab = content.locator(`xpath=${appointmentsXPath}`).first();
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
  const link = content.getByRole('link', { name: 'ClinicalSummary' }).first();
  await link.waitFor({ state: 'visible', timeout: 60000 });
  await link.click({ timeout: 30000 }).catch(async () => {
    // fallback to XPath if role locator fails
    const span = content.locator('//*[starts-with(@class, "ui-tab-Txt")][contains(normalize-space(.), "ClinicalSummary")]').first();
    await span.waitFor({ state: 'visible', timeout: 60000 });
    const anchor = span.locator('xpath=ancestor::a[1]').first();
    if (await anchor.isVisible().catch(() => false)) {
      await anchor.click({ timeout: 30000 });
    } else {
      await span.click({ timeout: 30000 });
    }
  });
}
await page.waitForTimeout(5000);
// Wait for and click Add New Encounter link
{
  const addNewEncSelector = '#lnkAddnewEnc';
  
  // Wait for frame navigation
  log('Waiting for frame navigation...');
  await page.waitForTimeout(5000);
  
  // Try to find the link in any frame
  log('Looking for Add New Encounter link in frames...');
  let found = false;
  const frames = page.frames();
  for (const frame of frames) {
    try {
      const isVisible = await frame.locator(addNewEncSelector).isVisible().catch(() => false);
      if (isVisible) {
        log(`Found link in frame: ${frame.url()}`);
        await frame.locator(addNewEncSelector).click({ timeout: 30000 });
        found = true;
        break;
      }
    } catch {}
  }
  
  // Fallback to main page
  if (!found) {
    log('Checking main page for link...');
    if (await page.locator(addNewEncSelector).isVisible().catch(() => false)) {
      await page.locator(addNewEncSelector).click({ timeout: 30000 });
      found = true;
      
      // (Date fill moved to after provider selection)
    }
  }
  
  if (!found) {
    log('Add New Encounter link not found in any frame.');
  }
  await page.waitForTimeout(2000);
}
// Wait for and click chosen dropdown in any frame
{
  log('Waiting for frame after Add New Encounter...');
  await page.waitForTimeout(2000);
  
  // Try to find chosen container in any frame
  log('Looking for chosen dropdown in frames...');
  let found = false;
  const frames = page.frames();
  for (const frame of frames) {
    try {
      log(`Checking frame: ${frame.url()}`);
      const chosenSelector = '.chosen-container';
      // Get the second chosen container
      const dropdown = frame.locator(chosenSelector).nth(1);
      const isVisible = await dropdown.isVisible().catch(() => false);
      
      if (isVisible) {
        log('Found chosen dropdown, clicking...');
        await dropdown.click();
        
        // Wait for dropdown to activate and select first option
        log('Waiting for dropdown options...');
        // Look for the specific provider option from Excel
        const providerOption = frame.locator('.chosen-results li', { hasText: providerText }).first();
        await providerOption.waitFor({ state: 'visible', timeout: 10000 });
        log(`Selecting ${providerText}...`);
        await providerOption.click();
        // After selecting provider, wait and fill the date field
        await page.waitForTimeout(5000);
        try {
          const dateInput = frame.locator('#txtDate').first();
          await dateInput.waitFor({ state: 'visible', timeout: 10000 });
          await dateInput.click({ timeout: 5000 }).catch(() => {});
          await dateInput.fill('');
          const formattedDate = formatEncounterDateForInput(encounterDateText);
          await dateInput.type(formattedDate, { delay: 10 });
        } catch (e) {
          log(`Date fill after provider failed: ${e.message}`);
        }
        
        found = true;
        break;
      }
    } catch (e) {
      log(`Frame check failed: ${e.message}`);
    }
  }
  
  if (!found) {
    log('Chosen dropdown not found in any frame.');
  }
  
  await page.waitForTimeout(1000);
}
{
  log('Waiting for frame after Add New Encounter...');
  await page.waitForTimeout(2000);
  
  // Try to find chosen container in any frame
  log('Looking for chosen dropdown in frames...');
  let found = false;
  const frames = page.frames();
  for (const frame of frames) {
    try {
      log(`Checking frame: ${frame.url()}`);
      const chosenSelector = '.chosen-container';
      // Get the second chosen container
      const dropdown = frame.locator(chosenSelector).nth(3);
      const isVisible = await dropdown.isVisible().catch(() => false);
      
      if (isVisible) {
        log('Found chosen dropdown, clicking...');
        await dropdown.click();
        
        // Wait for dropdown to activate and select first option
        log('Waiting for dropdown options...');
        // Look for the specific encounter type option from Excel
        const encounterOption = frame.locator('.chosen-results li', { hasText: encounterTypeText }).first();
        await encounterOption.waitFor({ state: 'visible', timeout: 10000 });
        log(encounterTypeText);
        await encounterOption.click();
        
        found = true;
        break;
      }
    } catch (e) {
      log(`Frame check failed: ${e.message}`);
    }
  }
  
  if (!found) {
    log('Chosen dropdown not found in any frame.');
  }
  
  await page.waitForTimeout(1000);
}
{
  log('Waiting for frame after Add New Encounter...');
  
  await page.waitForTimeout(2000);
  
  // Try to find chosen container in any frame
  log('Looking for chosen dropdown in frames...');
  let found = false;
  const frames = page.frames();
  for (const frame of frames) {
    try {
      log(`Checking frame: ${frame.url()}`);
      const chosenSelector = '.chosen-container';
      // Get the second chosen container
      const dropdown = frame.locator(chosenSelector).nth(4);
      const isVisible = await dropdown.isVisible().catch(() => false);
      
      if (isVisible) {
        log('Found chosen dropdown, clicking...');
        await dropdown.click();
        
        // Wait for dropdown to activate and select first option
        log('Waiting for dropdown options...');
        // Look for the specific visit template type option
        const visitTemplateOption = frame.locator('.chosen-results li', { hasText: visitTemplateTypeText }).first();
        await visitTemplateOption.waitFor({ state: 'visible', timeout: 10000 });
        log(visitTemplateTypeText);
        await visitTemplateOption.click();
        
        found = true;
        break;
      }
    } catch (e) {
      log(`Frame check failed: ${e.message}`);
    }
  }
  
  if (!found) {
    log('Chosen dropdown not found in any frame.');
  }
  
  await page.waitForTimeout(1000);
}
// Look for Insert button in all frames
{
  log('Looking for Insert button in frames...');
  let found = false;
  const frames = page.frames();
  for (const frame of frames) {
    try {
      log(`Checking frame: ${frame.url()}`);
      const insertButton = frame.locator('#btnInsert');
      const isVisible = await insertButton.isVisible().catch(() => false);
      
      if (isVisible) {
        log('Found Insert button, clicking...');
        await insertButton.click();
        found = true;
        break;
      }
    } catch (e) {
      log(`Frame check failed: ${e.message}`);
    }
  }
  
  if (!found) {
    log('Insert button not found in any frame.');
  }
  

await page.waitForTimeout(4000);
// Click jQuery UI dialog Close button
const closeSel = [
  'button.ui-dialog-titlebar-close[title="Close"]',
  'xpath=//button[@title="Close" and contains(@class,"ui-dialog-titlebar-close")]',
  'xpath=//span[contains(@class,"ui-icon-closethick")]/ancestor::button[1]'
];

let clicked = false;

// Try top page
for (const sel of closeSel) {
  const btn = page.locator(sel).first();
  if (!(await btn.count().catch(() => 0))) continue;
  await btn.waitFor({ state: 'attached', timeout: 3000 }).catch(() => {});
  await btn.evaluate(el => { try { el.scrollIntoView({ block: 'center', inline: 'center' }); } catch {} }).catch(() => {});
  try { await btn.click({ timeout: 2000 }); clicked = true; break; } catch {}
  try { await btn.click({ timeout: 2000, force: true }); clicked = true; break; } catch {}
}

// Fallback: search iframes
if (!clicked) {
  for (const f of page.frames()) {
    for (const sel of closeSel) {
      const btn = f.locator(sel).first();
      if (!(await btn.count().catch(() => 0))) continue;
      await btn.waitFor({ state: 'attached', timeout: 3000 }).catch(() => {});
      await btn.evaluate(el => { try { el.scrollIntoView({ block: 'center', inline: 'center' }); } catch {} }).catch(() => {});
      try { await btn.click({ timeout: 2000 }); clicked = true; break; } catch {}
      try { await btn.click({ timeout: 2000, force: true }); clicked = true; break; } catch {}
    }
    if (clicked) break;
  }
}

if (!clicked) throw new Error('Dialog Close button not found/clickable');
await page.waitForTimeout(5000);
{
  // Re-acquire and settle frame
  const frame = page.frame({ name: 'contentframe' });
  await frame?.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
  await frame?.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

  const xpaths = [
    '//a[normalize-space(.)="Work on this"]',
    '//a[contains(normalize-space(.), "Work on this")]',
    '//*[@role="link" and contains(normalize-space(.), "Work on this")]'
  ];

  let clicked = false;
  for (const xp of xpaths) {
    const loc = frame.locator(`xpath=${xp}`).first();
    const count = await loc.count().catch(() => 0);
    if (!count) continue;
    await loc.scrollIntoViewIfNeeded().catch(() => {});
    await loc.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    try { await loc.click({ timeout: 5000 }); clicked = true; break; } catch {}
    try { await loc.click({ timeout: 5000, force: true }); clicked = true; break; } catch {}
    try { await loc.evaluate((el) => el.click()); clicked = true; break; } catch {}
  }

  // Fallback: search any frame if contentframe changed internally
  if (!clicked) {
    for (const f of page.frames()) {
      try {
        const loc = f.locator('xpath=//a[contains(normalize-space(.), "Work on this")]').first();
        if (await loc.count() > 0) {
          await loc.scrollIntoViewIfNeeded().catch(() => {});
          await loc.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
          try { await loc.click({ timeout: 3000 }); clicked = true; break; } catch {}
          try { await loc.click({ timeout: 3000, force: true }); clicked = true; break; } catch {}
          try { await loc.evaluate((el) => el.click()); clicked = true; break; } catch {}
        }
      } catch {}
    }
  }
}



await page.waitForTimeout(8000);
let clickedCc = false;
{
  const frame = page.frame({ name: 'contentframe' });
  await frame?.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
  const ccXPaths = [
    '//*[contains(@class, "PreviewEditBtn")][normalize-space(.)="CC"]',
    '//*[contains(@class, "PreviewEditBtn")][contains(normalize-space(.), "CC")]'
  ];
  for (const xp of ccXPaths) {
    const loc = frame.locator(`xpath=${xp}`).first();
    const count = await loc.count().catch(() => 0);
    if (!count) continue;
    await loc.scrollIntoViewIfNeeded().catch(() => {});
    await loc.waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
    try { await loc.click({ timeout: 5000 }); clickedCc = true; break; } catch {}
    try { await loc.click({ timeout: 5000, force: true }); clickedCc = true; break; } catch {}
    try { await loc.evaluate(el => el.click()); clickedCc = true; break; } catch {}
  }
}
if (!clickedCc) {
  for (const f of page.frames()) {
    const ccXPaths = [
      '//*[contains(@class, "PreviewEditBtn")][normalize-space(.)="CC"]',
      '//*[contains(@class, "PreviewEditBtn")][contains(normalize-space(.), "CC")]'
    ];
    for (const xp of ccXPaths) {
      try {
        const loc = f.locator(`xpath=${xp}`).first();
        if (await loc.count() === 0) continue;
        await loc.scrollIntoViewIfNeeded().catch(() => {});
        await loc.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
        try { await loc.click({ timeout: 3000 }); clickedCc = true; break; } catch {}
        try { await loc.click({ timeout: 3000, force: true }); clickedCc = true; break; } catch {}
        try { await loc.evaluate(el => el.click()); clickedCc = true; break; } catch {}
      } catch {}
    }
    if (clickedCc) break;
  }
}
// find the frame that actually contains the textarea and fill it
// after CC click
// small settle time after CC
await page.waitForTimeout(500);

// find the iframe that currently has #txtsnomed_search
let targetFrame = null;
const deadline = Date.now() + 45000;
while (!targetFrame && Date.now() < deadline) {
  for (const f of page.frames()) {
    if (await f.locator('#txtsnomed_search.ui-autocomplete-input').count()) {
      targetFrame = f;
      break;
    }
  }
  if (!targetFrame) await page.waitForTimeout(300);
}
if (!targetFrame) throw new Error('Target textarea #txtsnomed_search not found after CC');

// now fill only the intended field
const snomed = targetFrame.locator('#txtsnomed_search.ui-autocomplete-input');
await snomed.waitFor({ state: 'visible', timeout: 15000 });
await snomed.fill('QHS IC');
await page.waitForTimeout(6000);
// Click Save after filling (prefer #btnAddProblem, fallback to visible Save buttons)
// After filling:
await snomed.blur().catch(() => {});

const saveSelectors = [
  '#btnAddProblem',
  'xpath=//button[normalize-space(.)="Save"]',
  'xpath=//input[@type="submit" and (contains(@value,"Save") or contains(@name,"Save"))]',
  'xpath=//a[normalize-space(.)="Save"]'
];

let saved = false;
for (const sel of saveSelectors) {
  const b = targetFrame.locator(sel).first();
  if (await b.count() === 0) continue;
  await b.scrollIntoViewIfNeeded().catch(() => {});
  await b.waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
  try { await b.click({ timeout: 5000 }); saved = true; break; } catch {}
  try { await b.click({ timeout: 5000, force: true }); saved = true; break; } catch {}
}
if (!saved) {
  for (const f of page.frames()) {
    for (const sel of saveSelectors) {
      const b = f.locator(sel).first();
      if (await b.count() === 0) continue;
      await b.scrollIntoViewIfNeeded().catch(() => {});
      await b.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      try { await b.click({ timeout: 3000 }); saved = true; break; } catch {}
      try { await b.click({ timeout: 3000, force: true }); saved = true; break; } catch {}
    }
    if (saved) break;
  }
}
if (!saved) throw new Error('Save button not found/clickable');

await page.waitForTimeout(3000);

// Click Close after saving
{
  const closeSelectors = [
    'a.CloseEditBtn[href="#CC_NEW"]',
    'xpath=//a[@class="CloseEditBtn" and @href="#CC_NEW"]',
    'xpath=//a[contains(@class,"CloseEditBtn") and normalize-space(.)="Close"]',
    'xpath=//a[@data-pagename="CC_TemplatesAPI.aspx" and @data-tabalias="CC_NEW" and @data-action="E"]'
  ];
  let closed = false;
  for (const sel of closeSelectors) {
    const b = targetFrame.locator(sel).first();
    if (await b.count() === 0) continue;
    await b.scrollIntoViewIfNeeded().catch(() => {});
    await b.waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
    try { await b.click({ timeout: 5000 }); closed = true; break; } catch {}
    try { await b.click({ timeout: 5000, force: true }); closed = true; break; } catch {}
  }
  if (!closed) {
    for (const f of page.frames()) {
      for (const sel of closeSelectors) {
        const b = f.locator(sel).first();
        if (await b.count() === 0) continue;
        await b.scrollIntoViewIfNeeded().catch(() => {});
        await b.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
        try { await b.click({ timeout: 3000 }); closed = true; break; } catch {}
        try { await b.click({ timeout: 3000, force: true }); closed = true; break; } catch {}
      }
      if (closed) break;
    }
  }
  if (!closed) throw new Error('Close button not found/clickable');
}

await page.waitForTimeout(1500);
// Click HPI button (same strategy: try strict selector, then fallbacks across frames)
{
  await page.waitForTimeout(5000);
  const hpiSelectors = [
    'a.PreviewEditBtn[href="#ASSESSMENT_HPI_V1"][data-pagename="AssessmentHPIAPI.aspx"]',
    'xpath=//a[@class="PreviewEditBtn" and @href="#ASSESSMENT_HPI_V1" and @data-pagename="AssessmentHPIAPI.aspx"]',
    'xpath=//a[contains(@class,"PreviewEditBtn") and normalize-space(.)="HPI"]'
  ];
  let hpiClicked = false;
  for (const f of page.frames()) {
    for (const sel of hpiSelectors) {
      const btn = sel.startsWith('xpath=') ? f.locator(sel).first() : f.locator(sel).first();
      if (await btn.count() === 0) continue;
      await btn.scrollIntoViewIfNeeded().catch(() => {});
      await btn.waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
      try { await btn.click({ timeout: 5000 }); hpiClicked = true; break; } catch {}
      try { await btn.click({ timeout: 5000, force: true }); hpiClicked = true; break; } catch {}
    }
    if (hpiClicked) break;
  }
  if (!hpiClicked) {
    throw new Error('HPI button not found/clickable');
  }

  // Wait for HPI editor iframe to be ready, then type into its body
  await page.waitForTimeout(1500);
  let editorFrame = null;
  const hpiDeadline = Date.now() + 30000;
  while (!editorFrame && Date.now() < hpiDeadline) {
    for (const f of page.frames()) {
      try {
        if (await f.locator('#txtCodeHPIData_ifr').count()) {
          const handle = await f.locator('#txtCodeHPIData_ifr').elementHandle();
          if (handle) {
            const inner = await handle.contentFrame();
            if (inner) { editorFrame = inner; break; }
          }
        }
      } catch {}
    }
    if (!editorFrame) await page.waitForTimeout(250);
  }
  if (!editorFrame) throw new Error('HPI editor iframe (#txtCodeHPIData_ifr) not found');

  const hpiText = getHPIFromExcelOrEnv();
  const hpiBody = editorFrame.locator('body');
  await hpiBody.waitFor({ state: 'visible', timeout: 15000 });
  await hpiBody.click({ timeout: 5000 }).catch(() => {});
  await hpiBody.fill(hpiText).catch(async () => {
    await hpiBody.type(hpiText, { delay: 10 }).catch(() => {});
  });
}
await page.waitForTimeout(8000);
// Close after saving: find in any frame, scroll up to reveal, then click
// Close after saving – bounded wait, frame-agnostic
const hpiCloseSelectors = [
  'a.CloseEditBtn[href="#ASSESSMENT_HPI_V1"][data-pagename="AssessmentHPIAPI.aspx"]',
  'xpath=//a[@class="CloseEditBtn" and @href="#ASSESSMENT_HPI_V1" and @data-pagename="AssessmentHPIAPI.aspx"]',
  'xpath=//a[contains(@class,"CloseEditBtn") and @href="#ASSESSMENT_HPI_V1" and normalize-space(.)="Close"]'
];

let hpiClosed = false;
for (const f of page.frames()) {
  for (const sel of hpiCloseSelectors) {
    const btn = f.locator(sel).first();
    if (await btn.count() === 0) continue;
    await btn.waitFor({ state: 'attached', timeout: 3000 }).catch(() => {});
    await btn.evaluate(el => el.scrollIntoView({ block: 'center', inline: 'center' })).catch(() => {});
    await btn.scrollIntoViewIfNeeded().catch(() => {});
    try { await btn.click({ timeout: 3000 }); hpiClosed = true; break; } catch {}
    try { await btn.click({ timeout: 3000, force: true }); hpiClosed = true; break; } catch {}
    try { await btn.evaluate(el => { if (el && typeof el.click === 'function') el.click(); }); hpiClosed = true; break; } catch {}
  }
  if (hpiClosed) break;
}
if (!hpiClosed) throw new Error('HPI Close button not found/clickable');
await page.waitForTimeout(5000);
// Click Plan button (frame-agnostic)
await page.waitForTimeout(3000);
const planSelectors = [
  'a.PreviewEditBtn[href="#ASSESMENT_PLAN_V1"][data-pagename="AssessmentPlanV1API.aspx"]',
  'xpath=//a[@class="PreviewEditBtn" and @href="#ASSESMENT_PLAN_V1" and @data-pagename="AssessmentPlanV1API.aspx"]',
  'xpath=//a[contains(@class,"PreviewEditBtn") and normalize-space(.)="Plan"]'
];

let planClicked = false;
for (const f of page.frames()) {
  for (const sel of planSelectors) {
    const btn = f.locator(sel).first();
    if (await btn.count() === 0) continue;
    await btn.waitFor({ state: 'attached', timeout: 3000 }).catch(() => {});
    await btn.evaluate(el => el.scrollIntoView({ block: 'center', inline: 'center' })).catch(() => {});
    await btn.scrollIntoViewIfNeeded().catch(() => {});
    try { await btn.click({ timeout: 3000 }); planClicked = true; break; } catch {}
    try { await btn.click({ timeout: 3000, force: true }); planClicked = true; break; } catch {}
    try { await btn.evaluate(el => { if (el && typeof el.click === 'function') el.click(); }); planClicked = true; break; } catch {}
  }
  if (planClicked) break;
}
if (!planClicked) throw new Error('Plan button not found/clickable');
await page.waitForTimeout(8000);
// Click “Complete Plan” (frame-agnostic)
const completePlanSelectors = [
  'xpath=//div[contains(@class,"textEllipsis") and @title="Complete Plan" and normalize-space()="Complete Plan"]',
  'css=div.textEllipsis[title="Complete Plan"]'
];

let completeClicked = false;
for (const f of page.frames()) {
  for (const sel of completePlanSelectors) {
    const el = f.locator(sel).first();
    if (await el.count() === 0) continue;
    await el.scrollIntoViewIfNeeded().catch(() => {});
    try { await el.click({ timeout: 3000 }); completeClicked = true; break; } catch {}
    try { await el.click({ timeout: 3000, force: true }); completeClicked = true; break; } catch {}
  }
  if (completeClicked) break;
}
if (!completeClicked) throw new Error('Complete Plan not found/clickable');
await page.waitForTimeout(5000);
// Select radio: rbtnRenderType_1 (value P)
// const radioSelectors = [
//   '#rbtnRenderType_1',
//   'input[type="radio"][name="rbtnRenderType"][value="P"]'
// ];

// let checked = false;

// // Try in top page first
// for (const sel of radioSelectors) {
//   const r = page.locator(sel).first();
//   if (await r.count()) {
//     await r.waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});
//     try { await r.check({ timeout: 3000 }); checked = true; break; } catch {}
//     try { await r.click({ timeout: 3000, force: true }); checked = true; break; } catch {}
//   }
// }

// // Fallback: search in iframes
// if (!checked) {
//   for (const f of page.frames()) {
//     for (const sel of radioSelectors) {
//       const r = f.locator(sel).first();
//       if (!(await r.count())) continue;
//       await r.waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});
//       try { await r.check({ timeout: 3000 }); checked = true; break; } catch {}
//       try { await r.click({ timeout: 3000, force: true }); checked = true; break; } catch {}
//     }
//     if (checked) break;
//   }
// }

// if (!checked) throw new Error('Radio rbtnRenderType_1 not found/clickable');
// await page.waitForTimeout(3000);
// // Click OK button (id=btnParagraphOk)
// const okSelectors = [
//   '#btnParagraphOk',
//   'input[type="button"][id="btnParagraphOk"][value="OK"]'
// ];

// // try top-level first
// let okClicked = false;
// for (const sel of okSelectors) {
//   const ok = page.locator(sel).first();
//   if (await ok.count()) {
//     await ok.waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});
//     await ok.scrollIntoViewIfNeeded().catch(() => {});
//     try { await ok.click({ timeout: 3000 }); okClicked = true; break; } catch {}
//     try { await ok.click({ timeout: 3000, force: true }); okClicked = true; break; } catch {}
//   }
// }

// // fallback: search frames
// if (!okClicked) {
//   for (const f of page.frames()) {
//     for (const sel of okSelectors) {
//       const ok = f.locator(sel).first();
//       if (!(await ok.count())) continue;
//       await ok.waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});
//       await ok.scrollIntoViewIfNeeded().catch(() => {});
//       try { await ok.click({ timeout: 3000 }); okClicked = true; break; } catch {}
//       try { await ok.click({ timeout: 3000, force: true }); okClicked = true; break; } catch {}
//     }
//     if (okClicked) break;
//   }
// }

// if (!okClicked) throw new Error('OK button (btnParagraphOk) not found/clickable');
// await page.waitForTimeout(5000);
// Fill Plan details (TinyMCE editor for txtCodePlanData)
// Fill Plan details (TinyMCE editor for txtCodePlanData) - bounded, scroll-aware, frame-agnostic
const PLAN_FIND_TIMEOUT_MS = 20000;
const start = Date.now();
let planInner = null;

// Try dedicated iframe first; otherwise scan frames for the editor body
while (!planInner && Date.now() - start < PLAN_FIND_TIMEOUT_MS && !page.isClosed()) {
  try {
    const iframe = page.locator('iframe#txtCodePlanData_ifr').first();
    if (await iframe.count()) {
      const handle = await iframe.elementHandle();
      if (handle) {
        await page.evaluate(el => { try { el.scrollIntoView({ block: 'center', inline: 'center' }); } catch {} }, handle).catch(() => {});
        const inner = await handle.contentFrame();
        if (inner) { planInner = inner; break; }
      }
    }
  } catch {}

  // Fallback: look for the tinymce body directly in any frame
  for (const f of page.frames()) {
    try {
      if (await f.locator('body#tinymce[data-id="txtCodePlanData"]').count()) {
        planInner = f; break;
      }
    } catch {}
  }

  if (!planInner) await page.waitForTimeout(200).catch(() => {});
}
if (!planInner) throw new Error('Plan editor (txtCodePlanData) not found');

// Scroll down toward editor, center it, then type
const planBody = planInner.locator('body#tinymce[data-id="txtCodePlanData"]');
await planBody.waitFor({ state: 'attached', timeout: 8000 }).catch(() => {});
await planInner.evaluate(() => { try { window.scrollBy(0, 600); } catch {} }).catch(() => {});
await planBody.evaluate(el => { try { el.scrollIntoView({ block: 'center', inline: 'center' }); } catch {} }).catch(() => {});
await planBody.click({ timeout: 3000 }).catch(() => {});
await planBody.fill(planCommunicationText).catch(async () => {
  await planBody.type(planCommunicationText, { delay: 8 }).catch(() => {});
});
await page.waitForTimeout(8000);
// Click Plan Close (frame-agnostic)
const planCloseSelectors = [
  'a.CloseEditBtn[href="#ASSESMENT_PLAN_V1"][data-pagename="AssessmentPlanV1API.aspx"]',
  'xpath=//a[@class="CloseEditBtn" and @href="#ASSESMENT_PLAN_V1" and @data-pagename="AssessmentPlanV1API.aspx"]',
  'xpath=//a[contains(@class,"CloseEditBtn") and @href="#ASSESMENT_PLAN_V1" and normalize-space(.)="Close"]'
];

let closed = false;
for (const f of page.frames()) {
  for (const sel of planCloseSelectors) {
    const btn = f.locator(sel).first();
    if (!(await btn.count().catch(() => 0))) continue;
    await btn.waitFor({ state: 'attached', timeout: 3000 }).catch(() => {});
    await btn.evaluate(el => { try { el.scrollIntoView({ block: 'center', inline: 'center' }); } catch {} }).catch(() => {});
    await btn.scrollIntoViewIfNeeded().catch(() => {});
    try { await btn.click({ timeout: 3000 }); closed = true; break; } catch {}
    try { await btn.click({ timeout: 3000, force: true }); closed = true; break; } catch {}
    try { await btn.evaluate(el => { if (el && typeof el.click === 'function') el.click(); }); closed = true; break; } catch {}
  }
  if (closed) break;
}
if (!closed) throw new Error('Plan Close button not found/clickable');
await page.waitForTimeout(3000);
}
});