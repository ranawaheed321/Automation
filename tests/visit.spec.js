const { test } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
let currentRecordIdValue = null;

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

// function getProviderFromExcelOrEnv() {
//   if (process.env.PROVIDER) return String(process.env.PROVIDER);
//   try {
//     const XLSX = require('xlsx');
//     const candidates = [];
//     if (process.env.DATA_FILE) candidates.push(process.env.DATA_FILE);
//     if (process.env.PATIENT_FILE) candidates.push(process.env.PATIENT_FILE);
//     candidates.push(path.resolve(__dirname, './data/dynamicdata.xlsx'));
//     candidates.push(path.resolve(__dirname, '../data/dynamicdata.xlsx'));
//     const filePath = candidates.find(p => { try { return fs.existsSync(p); } catch { return false; } });
//     if (!filePath) throw new Error(`Data file not found. Tried: ${candidates.join(' | ')}`);
//     const workbook = XLSX.readFile(filePath);
//     const sheetName = process.env.DATA_SHEET || process.env.PATIENT_SHEET || workbook.SheetNames[0];
//     const sheet = workbook.Sheets[sheetName];
//     if (!sheet) throw new Error(`Sheet not found: ${sheetName}`);
//     const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
//     if (rows && rows.length > 0) {
//       const first = rows[0];
//       const keys = Object.keys(first);
//       const providerKey = keys.find(k => k.trim().toLowerCase() === 'provider');
//       if (providerKey && String(first[providerKey]) !== '') return String(first[providerKey]);
//     }
//     throw new Error('Provider column is missing or empty in the first row');
//   } catch (e) {
//     throw new Error(`Failed to read Provider from Excel: ${e.message}`);
//   }
// }

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
    if (match) {
      const rawValue = match[key];
      
      // Check if it's an Excel serial number (like 45872)
      if (typeof rawValue === 'number' || (!isNaN(rawValue) && String(rawValue).match(/^\d+$/))) {
        // Convert Excel serial number to date
        const excelDate = new Date((rawValue - 25569) * 86400 * 1000);
        const month = String(excelDate.getMonth() + 1).padStart(2, '0');
        const day = String(excelDate.getDate()).padStart(2, '0');
        const year = excelDate.getFullYear();
        const formattedDate = `${month}-${day}-${year}`;
        console.log(`Converted Excel serial ${rawValue} to date: ${formattedDate}`);
        return formattedDate;
      } else {
        // It's already a formatted date string
        return String(rawValue).trim();
      }
    }
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

function formatAppointmentDateForXPath(dateString) {
  if (!dateString) return '';
  
  log(`Converting appointmentDateText for XPath from: "${dateString}"`);
  
  // Remove any extra whitespace
  let cleanDate = dateString.trim();
  
  // Handle different possible formats and convert to MM/DD/YYYY format for XPath matching
  
  // If already in MM/DD/YYYY format
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(cleanDate)) {
    log(`Date already in MM/DD/YYYY format: ${cleanDate}`);
    return cleanDate;
  }
  
  // If in MM-DD-YYYY format, convert to MM/DD/YYYY
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(cleanDate)) {
    const converted = cleanDate.replace(/-/g, '/');
    log(`Converted MM-DD-YYYY to MM/DD/YYYY: ${cleanDate} -> ${converted}`);
    return converted;
  }
  
  // If in YYYY-MM-DD format, convert to MM/DD/YYYY
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(cleanDate)) {
    const parts = cleanDate.split('-');
    const month = parts[1].padStart(2, '0');
    const day = parts[2].padStart(2, '0');
    const year = parts[0];
    const converted = `${month}/${day}/${year}`;
    log(`Converted YYYY-MM-DD to MM/DD/YYYY: ${cleanDate} -> ${converted}`);
    return converted;
  }
  
  // Try to use the existing formatEncounterDateForInput function
  try {
    const converted = formatEncounterDateForInput(cleanDate);
    log(`Used formatEncounterDateForInput: ${cleanDate} -> ${converted}`);
    return converted;
  } catch (e) {
    log(`formatEncounterDateForInput failed: ${e.message}`);
  }
  
  // If all else fails, return the original string
  log(`Could not convert date format, returning original: ${cleanDate}`);
  return cleanDate;
}

function buildFlexibleProviderRegex(name) {
  const raw = String(name || '').trim();
  if (!raw) return /.+/;
  
  // Handle common provider text variations
  let normalized = raw;
  // Convert "M.D" to "MD" for matching
  normalized = normalized.replace(/\bM\.D\b/gi, 'MD');
  // Allow both "APRN" and ", APRN" formats
  normalized = normalized.replace(/\bAPRN\b/gi, '(?:,?\\s*APRN)');
  // Allow both "MD" and "M.D" formats  
  normalized = normalized.replace(/\bMD\b/gi, '(?:MD|M\\.D)');
  
  // Escape regex specials
  const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Allow commas or spaces between tokens (e.g., "JOEL MOLINA APRN" vs "JOEL MOLINA, APRN")
  const pattern = escaped.replace(/\s+/g, '[\\s,]*');

  return new RegExp(pattern, 'i');
}

function writeResultForCurrentRecord(status) {
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
    let resultCol = header.findIndex(h => String(h).trim().toLowerCase() === 'result' || String(h).trim().toLowerCase() === 'status');
    if (resultCol === -1) { resultCol = header.length; header[resultCol] = 'Result'; rows[0] = header; }
    const normalized = header.map(h => String(h).trim().toLowerCase().replace(/[\s_-]+/g, '_'));
    const idColCandidates = ['accountid', 'patientid', 'account_id', 'patient_id'];
    const idIndexes = normalized
      .map((name, idx) => ({ name, idx }))
      .filter(({ name }) => idColCandidates.includes(name))
      .map(({ idx }) => idx);
    let targetRow = -1;
    if (currentRecordIdValue != null) {
      const idStr = String(currentRecordIdValue).trim();
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i] || [];
        if (idIndexes.length) {
          if (idIndexes.some(ci => String(row[ci] ?? '').trim() === idStr)) { targetRow = i; break; }
        } else {
          // Fallback: first column match
          if (String(row[0] ?? '').trim() === idStr) { targetRow = i; break; }
        }
      }
    }
    if (targetRow === -1) { console.warn('Result write: matching row not found for Account/Patient ID'); return; }
    while (rows.length <= targetRow) rows.push([]);
    while (rows[targetRow].length <= resultCol) rows[targetRow].push('');
    rows[targetRow][resultCol] = status;
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
  writeResultForCurrentRecord(status);
});

test('visit emedpractice loads under VPN', async ({ page }) => {
  test.setTimeout(300000);
  const log = (msg) => console.log(`[visit] ${msg}`);
  const recordIdValue = getAccountOrPatientIdFromExcelOrEnv();
  currentRecordIdValue = recordIdValue;
  const planCommunicationText = getPlanCommunicationFromExcelOrEnv();
  let providerText = '';
  const encounterTypeText = getEncounterTypeFromExcelOrEnv();
  const visitTemplateTypeText = getVisitTemplateTypeFromExcelOrEnv();
  const encounterDateText = getEncounterDateFromExcelOrEnv();
  let appointmentTypeText = '';
  let appointmentDateText = '';
  await page.goto('https://service.emedpractice.com/', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  await page.waitForTimeout(5000);
  const { LoginPage } = require('./pages/LoginPage');
  const loginPage = new LoginPage(page);
  const content = page.frameLocator('iframe[name="contentframe"]');
  await loginPage.login();
  await page.waitForTimeout(2000);
  const searchInput = page.locator('#txtSearch');
  await searchInput.waitFor({ state: 'visible', timeout: 20000 });
  await searchInput.click();
  await searchInput.fill(recordIdValue, { delay: 10 });
  // Prefer selecting from autocomplete menu (avoids the UI replacing input with patient name)
  let clickedSuggestion = false;
  {
    const menu = page.locator('ul.ui-autocomplete.ui-front').first();
    await menu.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    if (await menu.isVisible().catch(() => false)) {
      const matchCell = menu.locator(`div.width60.textEllipsis[title="${recordIdValue}"]`).first();
      if (await matchCell.count()) {
        await matchCell.locator('xpath=ancestor::a[1]').click({ timeout: 5000 }).catch(async () => {
          await matchCell.click({ timeout: 5000, force: true }).catch(() => {});
        });
        clickedSuggestion = true;
      }
    }
  }
  if (!clickedSuggestion) {
    // Fallback: trigger search via Enter if no menu appeared
    await page.keyboard.press('Enter');
  }
  await page.waitForTimeout(5000);
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
await page.waitForTimeout(3000);
// Find matching appointment row by ENCOUNTER_DATE from Excel and check Filed status
{
  try {
    const encounterDateFromExcel = getEncounterDateFromExcelOrEnv();
    log(`Looking for appointment row with date: ${encounterDateFromExcel}`);
    
    // Get all appointment rows
    const appointmentRows = content.locator('xpath=//table[contains(@id, "gvAppointments")]/tbody/tr');
    const rowCount = await appointmentRows.count();
    log(`Found ${rowCount} appointment rows`);
    
    let matchingRowFound = false;
    let matchingRowIndex = -1;
    
    // Search for row with matching date
    for (let i = 1; i < rowCount; i++) { // Start from 1 to skip header
      try {
        const dateCell = appointmentRows.nth(i).locator('td').nth(3); // td[4] is date column (0-indexed)
        const rowDate = (await dateCell.textContent()).trim();
        
        log(`Row ${i} date: ${rowDate}`);
        
        // Check if dates match (flexible matching)
        if (rowDate.includes(encounterDateFromExcel) || encounterDateFromExcel.includes(rowDate)) {
          log(`Found matching row ${i} with date: ${rowDate}`);
          matchingRowIndex = i;
          matchingRowFound = true;
          
          // Capture data from matching row
          try {
            // Appointment Date (td[4])
            const dateCell = appointmentRows.nth(i).locator('td').nth(3);
            appointmentDateText = (await dateCell.textContent()).trim();
            log(`Captured appointmentDateText: ${appointmentDateText}`);
            
            // Provider (td[3])
            const providerCell = appointmentRows.nth(i).locator('td').nth(2);
            providerText = (await providerCell.textContent()).trim();
            log(`Captured providerText: ${providerText}`);
            
            // Appointment Type (td[7])
            const typeCell = appointmentRows.nth(i).locator('td').nth(6);
            appointmentTypeText = (await typeCell.textContent()).trim();
            log(`Captured appointmentTypeText: ${appointmentTypeText}`);
            
          } catch (e) {
            log(`Failed to capture data from matching row: ${e.message}`);
          }
          
          break;
    }
  } catch (e) {
        log(`Error checking row ${i}: ${e.message}`);
        continue;
      }
    }
    
    if (!matchingRowFound) {
      log(`No appointment row found matching date: ${encounterDateFromExcel}`);
      // Use first row as fallback
      matchingRowIndex = 1;
      log('Using first appointment row as fallback');
    }
    
    // Check Filed column (td[9]) for the matching/first row
    const filedCell = appointmentRows.nth(matchingRowIndex).locator('td').nth(8); // td[9] is 0-indexed as td[8]
    await filedCell.waitFor({ state: 'visible', timeout: 15000 });
    const filedText = (await filedCell.textContent()).trim().toLowerCase();
    log(`Filed column value for row ${matchingRowIndex}: ${filedText}`);
    
    if (filedText === 'no') {
      log('Filed is No — skipping encounter flow for this row.');
      writeResultForCurrentRecord('SKIPPED: Filed=No');
      return; // Early exit; batch runner will proceed to next row
    }
    
  } catch (e) {
    log(`Failed to process appointment rows by date: ${e.message}`);
    // Fallback to original logic
    try {
      let filedCell = content.locator('xpath=//*[@id="_ctl0_ContentPlaceHolder1_gvAppointments"]/tbody/tr[1]/td[9]').first();
      if (!(await filedCell.count().catch(() => 0))) {
        filedCell = content.locator('xpath=//table[contains(@id, "gvAppointments")]/tbody/tr[1]/td[9]').first();
      }
      await filedCell.waitFor({ state: 'visible', timeout: 15000 });
      const filedText = (await filedCell.textContent()).trim().toLowerCase();
      log(`Filed column value (fallback): ${filedText}`);
      if (filedText === 'no') {
        log('Filed is No — skipping encounter flow for this row.');
        writeResultForCurrentRecord('SKIPPED: Filed=No');
        return;
      }
    } catch (fallbackError) {
      log(`Fallback Filed check also failed: ${fallbackError.message}`);
    }
  }
}
// After opening Appointments, read the Appointment Type from the first data row (td[7] is "Office Visit")
// {
//   try {
//     // Prefer exact grid id; target first tbody row, 7th cell
//     let cell = content.locator('xpath=//*[@id="_ctl0_ContentPlaceHolder1_gvAppointments"]/tbody/tr[1]/td[7]').first();
//     if (!(await cell.count().catch(() => 0))) {
//       // Fallback: any grid whose id contains gvAppointments
//       cell = content.locator('xpath=//table[contains(@id, "gvAppointments")]/tbody/tr[1]/td[7]').first();
//     }
//     await cell.waitFor({ state: 'visible', timeout: 15000 });
//     const text = (await cell.textContent()).trim();
//     if (text) {
//       appointmentTypeText = text;
//       log(`Appointment Type detected: ${appointmentTypeText}`);
//     } else {
//       log('Appointment Type cell was empty');
//     }
//   } catch (e) {
//     log(`Failed to read Appointment Type: ${e.message}`);
//   }
// }
// // Also read Appointment Date from the first data row (td[4])
// {
//   try {
//     let dateCell = content.locator('xpath=//*[@id="_ctl0_ContentPlaceHolder1_gvAppointments"]/tbody/tr[1]/td[4]').first();
//     if (!(await dateCell.count().catch(() => 0))) {
//       dateCell = content.locator('xpath=//table[contains(@id, "gvAppointments")]/tbody/tr[1]/td[4]').first();
//     }
//     await dateCell.waitFor({ state: 'visible', timeout: 15000 });
//     const raw = (await dateCell.textContent()).trim();
//     if (raw) {
//       appointmentDateText = raw;
//       log(`Appointment Date detected: ${appointmentDateText}`);
//     } else {
//       log('Appointment Date cell was empty');
//     }
//   } catch (e) {
//     log(`Failed to read Appointment Date: ${e.message}`);
//   }
// }

// // Read Physician/Scheduler Name from the first data row (td[3]) to use as provider
// {
//   try {
//     let providerCell = content.locator('xpath=//*[@id="_ctl0_ContentPlaceHolder1_gvAppointments"]/tbody/tr[1]/td[3]').first();
//     if (!(await providerCell.count().catch(() => 0))) {
//       providerCell = content.locator('xpath=//table[contains(@id, "gvAppointments")]/tbody/tr[1]/td[3]').first();
//     }
//     await providerCell.waitFor({ state: 'visible', timeout: 15000 });
//     const text = (await providerCell.textContent()).trim();
//     if (text) {
//       providerText = text;
//       log(`Provider detected from grid: ${providerText}`);
//     } else {
//       log('Provider cell was empty');
//     }
//   } catch (e) {
//     log(`Failed to read Provider from grid: ${e.message}`);
//   }
// }

// // Click ClinicalSummary link inside contentframe using role locator
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
        // Look for the specific provider option from grid with flexible comma/space matching
        const providerRegex = buildFlexibleProviderRegex(providerText);
        const options = frame.locator('.chosen-results li');
        await options.first().waitFor({ state: 'visible', timeout: 10000 });
        const count = await options.count();
        let clickedProvider = false;
        for (let i = 0; i < count; i++) {
          const item = options.nth(i);
          const txt = (await item.textContent()).trim();
          if (providerRegex.test(txt)) {
            log(`Selecting provider match: ${txt}`);
            await item.click();
            clickedProvider = true;
            break;
          }
        }
        if (!clickedProvider) {
          // Fallback: try exact contains with and without comma, plus ARIEL RAMIREZ NAVARRO conversion
          const alt1 = frame.locator('.chosen-results li', { hasText: providerText }).first();
          const alt2 = frame.locator('.chosen-results li', { hasText: providerText.replace(/\s+APRN/i, ', APRN') }).first();
          const alt3 = frame.locator('.chosen-results li', { hasText: providerText.replace(/ARIEL RAMIREZ NAVARRO M\.D/i, 'ARIEL RAMIREZ NAVARRO MD') }).first();
          if (await alt1.count()) { await alt1.click().catch(() => {}); }
          else if (await alt2.count()) { await alt2.click().catch(() => {}); }
          else if (await alt3.count()) { await alt3.click().catch(() => {}); }
          else throw new Error(`Provider option not found for: ${providerText}`);
        }
        // After selecting provider, wait and fill the date field
        await page.waitForTimeout(1000);
        try {
          const dateInput = frame.locator('#txtDate').first();
          await dateInput.waitFor({ state: 'visible', timeout: 10000 });
          await dateInput.click({ timeout: 5000 }).catch(() => {});
          await dateInput.fill('');
          const dateSource = appointmentDateText || encounterDateText;
          const formattedDate = formatEncounterDateForInput(dateSource);
          await dateInput.fill(formattedDate, { delay: 10 });
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

// Fill Notes textarea if present before inserting
{
  log('Filling notes textarea if available...');
  let filledNotes = false;
  try {
    const frames = page.frames();
    for (const frame of frames) {
      try {
        const notes = frame.locator('#txtNotes').first();
        if (await notes.count()) {
          await notes.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
          await notes.fill('QHS').catch(() => {});
          filledNotes = true;
          break;
        }
      } catch {}
    }
  } catch {}
  if (!filledNotes) {
    const notesTop = page.locator('#txtNotes').first();
    if (await notesTop.count()) {
      await notesTop.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
      await notesTop.fill('QHS').catch(() => {});
    }
  }
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

  // Convert appointmentDateText from MM-DD-YYYY to MM/DD/YYYY format for XPath
  const formattedDateForXPath = appointmentDateText.replace(/-/g, '/');
  log(`Converting date for fallback XPath: ${appointmentDateText} -> ${formattedDateForXPath}`);

  const xpaths = [
    // First try the specific XPath with the formatted date
    `//table[@id="tblEncounter"]//tr[td[3]/a[contains(text(), "${formattedDateForXPath}")]]//a[contains(text(), "Work on this")]`,
    
    // Then try generic "Work on this" buttons as fallback
    // '//a[normalize-space(.)="Work on this"]',
    // '//a[contains(normalize-space(.), "Work on this")]',
    // '//*[@role="link" and contains(normalize-space(.), "Work on this")]'
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
        const loc = f.locator(`xpath=//table[@id="tblEncounter"]//tr[td[3]/a[contains(text(), "${formattedDateForXPath}")]]//a[contains(text(), "Work on this")]`);
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
await snomed.fill(appointmentTypeText);
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
const radioSelectors = [
  '#rbtnRenderType_1',
  'input[type="radio"][name="rbtnRenderType"][value="P"]'
];

let checked = false;

// First check if radio button is already selected
log('Checking if radio button is already selected...');

// Check in top page first
for (const sel of radioSelectors) {
  const r = page.locator(sel).first();
  if (await r.count()) {
    const isAlreadyChecked = await r.isChecked().catch(() => false);
    if (isAlreadyChecked) {
      log(`Radio button ${sel} is already checked - skipping selection`);
      checked = true;
      break;
    }
  }
}

// Check in iframes if not found/checked in top page
if (!checked) {
  for (const f of page.frames()) {
    for (const sel of radioSelectors) {
      const r = f.locator(sel).first();
      if (!(await r.count())) continue;
      const isAlreadyChecked = await r.isChecked().catch(() => false);
      if (isAlreadyChecked) {
        log(`Radio button ${sel} is already checked in iframe - skipping selection`);
        checked = true;
        break;
      }
    }
    if (checked) break;
  }
}

// Only proceed with selection and OK button if not already checked
if (!checked) {
  log('Radio button not checked - proceeding with selection...');
  
  // Try in top page first
  for (const sel of radioSelectors) {
    const r = page.locator(sel).first();
    if (await r.count()) {
      await r.waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});
      try { await r.check({ timeout: 3000 }); checked = true; log(`Successfully checked radio ${sel}`); break; } catch {}
      try { await r.click({ timeout: 3000, force: true }); checked = true; log(`Successfully clicked radio ${sel}`); break; } catch {}
    }
  }

  // Fallback: search in iframes
  if (!checked) {
    for (const f of page.frames()) {
      for (const sel of radioSelectors) {
        const r = f.locator(sel).first();
        if (!(await r.count())) continue;
        await r.waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});
        try { await r.check({ timeout: 3000 }); checked = true; log(`Successfully checked radio ${sel} in iframe`); break; } catch {}
        try { await r.click({ timeout: 3000, force: true }); checked = true; log(`Successfully clicked radio ${sel} in iframe`); break; } catch {}
      }
      if (checked) break;
    }
  }
  
  if (!checked) throw new Error('Radio rbtnRenderType_1 not found/clickable');
  
  await page.waitForTimeout(3000);
  
  // Click OK button (id=btnParagraphOk) - only if we just selected the radio button
  log('Radio button was just selected - clicking OK button...');
  const okSelectors = [
    '#btnParagraphOk',
    'input[type="button"][id="btnParagraphOk"][value="OK"]'
  ];

  // try top-level first
  let okClicked = false;
  for (const sel of okSelectors) {
    const ok = page.locator(sel).first();
    if (await ok.count()) {
      await ok.waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});
      await ok.scrollIntoViewIfNeeded().catch(() => {});
      try { await ok.click({ timeout: 3000 }); okClicked = true; break; } catch {}
      try { await ok.click({ timeout: 3000, force: true }); okClicked = true; break; } catch {}
    }
  }

  // fallback: search frames
  if (!okClicked) {
    for (const f of page.frames()) {
      for (const sel of okSelectors) {
        const ok = f.locator(sel).first();
        if (!(await ok.count())) continue;
        await ok.waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});
        await ok.scrollIntoViewIfNeeded().catch(() => {});
        try { await ok.click({ timeout: 3000 }); okClicked = true; break; } catch {}
        try { await ok.click({ timeout: 3000, force: true }); okClicked = true; break; } catch {}
      }
      if (okClicked) break;
    }
  }

  if (!okClicked) throw new Error('OK button (btnParagraphOk) not found/clickable');
  await page.waitForTimeout(5000);
  
} else {
  log('Radio button was already checked - skipping radio selection and OK button, going directly to plan text filling');
}
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

// After closing Plan, wait 3s and click the Demos tab (Patient Demographic Details)
await page.waitForTimeout(3000);
{
  const demosSelectors = [
    'li[title="Patient Demographic Details"]',
    'xpath=//li[@title="Patient Demographic Details" or contains(@onclick, "showPatientDemos")]//a',
    'xpath=//img[contains(@src, "demos.png")]/ancestor::li[1]'
  ];
  let demosClicked = false;
  // Try top-level first
  for (const sel of demosSelectors) {
    const loc = page.locator(sel).first();
    if (!(await loc.count().catch(() => 0))) continue;
    await loc.scrollIntoViewIfNeeded().catch(() => {});
    try { await loc.click({ timeout: 3000 }); demosClicked = true; break; } catch {}
    try { await loc.click({ timeout: 3000, force: true }); demosClicked = true; break; } catch {}
  }
  // Fallback: search in frames
  if (!demosClicked) {
    for (const f of page.frames()) {
      for (const sel of demosSelectors) {
        const loc = f.locator(sel).first();
        if (!(await loc.count().catch(() => 0))) continue;
        await loc.scrollIntoViewIfNeeded().catch(() => {});
        try { await loc.click({ timeout: 3000 }); demosClicked = true; break; } catch {}
        try { await loc.click({ timeout: 3000, force: true }); demosClicked = true; break; } catch {}
      }
      if (demosClicked) break;
    }
  }
}

// After Demos, click Bills tab
await page.waitForTimeout(3000);
{
  const billsXPath = '//*[contains(@class, "ui-tab-Txt")][normalize-space(.)="Bills"]';
  let billsClicked = false;
  // Try top-level first
  {
    const txt = page.locator(`xpath=${billsXPath}`).first();
    const count = await txt.count().catch(() => 0);
    if (count) {
      const anchor = txt.locator('xpath=ancestor::a[1]').first();
      try { if (await anchor.isVisible().catch(() => false)) { await anchor.click({ timeout: 3000 }); billsClicked = true; } } catch {}
      if (!billsClicked) {
        try { await txt.click({ timeout: 3000 }); billsClicked = true; } catch {}
        if (!billsClicked) { try { await txt.click({ timeout: 3000, force: true }); billsClicked = true; } catch {} }
      }
    }
  }
  // Fallback: search in frames
  if (!billsClicked) {
    for (const f of page.frames()) {
      const txt = f.locator(`xpath=${billsXPath}`).first();
      const count = await txt.count().catch(() => 0);
      if (!count) continue;
      const anchor = txt.locator('xpath=ancestor::a[1]').first();
      try { if (await anchor.isVisible().catch(() => false)) { await anchor.click({ timeout: 3000 }); billsClicked = true; } } catch {}
      if (!billsClicked) {
        try { await txt.click({ timeout: 3000 }); billsClicked = true; } catch {}
        if (!billsClicked) { try { await txt.click({ timeout: 3000, force: true }); billsClicked = true; } catch {} }
      }
      if (billsClicked) break;
    }
  }
}

// Click Create Bill button
await page.waitForTimeout(2000);
{
  const createSel = '#btn_CreateBill';
  let clickedCreate = false;
  // Try top-level first
  {
    const b = page.locator(createSel).first();
    if (await b.count().catch(() => 0)) {
      await b.scrollIntoViewIfNeeded().catch(() => {});
      try { await b.click({ timeout: 3000 }); clickedCreate = true; } catch {}
      if (!clickedCreate) { try { await b.click({ timeout: 3000, force: true }); clickedCreate = true; } catch {} }
    }
  }
  // Fallback: search frames
  if (!clickedCreate) {
    for (const f of page.frames()) {
      const b = f.locator(createSel).first();
      if (!(await b.count().catch(() => 0))) continue;
      await b.scrollIntoViewIfNeeded().catch(() => {});
      try { await b.click({ timeout: 3000 }); clickedCreate = true; break; } catch {}
      try { await b.click({ timeout: 3000, force: true }); clickedCreate = true; break; } catch {}
    }
  }
}
await page.waitForTimeout(5000);

// Wait for the UI to load and fill the service date field
{
  try {
    // Wait for any date input fields to appear
    await page.waitForTimeout(2000);
    
    if (appointmentDateText) {
      // Try multiple selectors for service FROM date with comprehensive iframe and scroll handling
      let serviceFromFilled = false;
      const fromSelectors = [
        'input[name="_ctl0:ContentPlaceHolder1:gvAddedCodes:_ctl2:txtService_From"]',
        'input[id="_ctl0_ContentPlaceHolder1_gvAddedCodes__ctl2_txtService_From"]',
        'input[id*="txtService_From"]',
        'input[name*="txtService_From"]',
        '.fromdate',
        '.textbox.fromdate',
        '.textbox.fromdate.ui-mask.hasDatepicker'
      ];
      
      // First try in main page
      for (const selector of fromSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.count() > 0) {
            await element.waitFor({ state: 'visible', timeout: 3000 });
            // Scroll to the element if needed
            await element.scrollIntoViewIfNeeded();
            await page.waitForTimeout(500); // Wait for scroll to complete
            await element.fill(appointmentDateText);
            
            // Verify that the exact date was filled
            await page.waitForTimeout(500); // Wait for value to be set
            const filledValue = await element.inputValue();
            if (filledValue === appointmentDateText) {
              log(`Filled service FROM date with main page selector "${selector}": ${appointmentDateText} ✓ VERIFIED`);
              console.log(`[DATE FILL] Service FROM field filled with date: ${appointmentDateText} ✓ VERIFIED`);
              serviceFromFilled = true;
              break;
            } else {
              log(`Date verification failed for selector "${selector}". Expected: ${appointmentDateText}, Got: ${filledValue}`);
              continue; // Try next selector
            }
          }
        } catch (e) {
          continue;
        }
      }
      
      // If not found in main page, try in contentframe iframe
      if (!serviceFromFilled) {
        try {
          const content = page.frameLocator('iframe[name="contentframe"]');
          for (const selector of fromSelectors) {
            try {
              const element = content.locator(selector).first();
              if (await element.count() > 0) {
                await element.waitFor({ state: 'visible', timeout: 3000 });
                // Scroll to the element if needed
                await element.scrollIntoViewIfNeeded();
                await page.waitForTimeout(500); // Wait for scroll to complete
                await element.fill(appointmentDateText);
                
                // Verify that the exact date was filled
                await page.waitForTimeout(500); // Wait for value to be set
                const filledValue = await element.inputValue();
                if (filledValue === appointmentDateText) {
                  log(`Filled service FROM date with iframe selector "${selector}": ${appointmentDateText} ✓ VERIFIED`);
                  console.log(`[DATE FILL] Service FROM field filled with date: ${appointmentDateText} ✓ VERIFIED`);
                  serviceFromFilled = true;
                  break;
                } else {
                  log(`Date verification failed for iframe selector "${selector}". Expected: ${appointmentDateText}, Got: ${filledValue}`);
                  continue; // Try next selector
                }
              }
            } catch (e) {
              continue;
            }
          }
        } catch (e) {
          log(`Failed to access contentframe for service FROM date: ${e.message}`);
        }
      }
      
      // If still not found, try all frames
      if (!serviceFromFilled) {
        const frames = page.frames();
        for (const frame of frames) {
          for (const selector of fromSelectors) {
            try {
              const element = frame.locator(selector).first();
              if (await element.count() > 0) {
                await element.waitFor({ state: 'visible', timeout: 3000 });
                // Scroll to the element if needed
                await element.scrollIntoViewIfNeeded();
                await page.waitForTimeout(500); // Wait for scroll to complete
                await element.fill(appointmentDateText);
                
                // Verify that the exact date was filled
                await page.waitForTimeout(500); // Wait for value to be set
                const filledValue = await element.inputValue();
                if (filledValue === appointmentDateText) {
                  log(`Filled service FROM date with frame selector "${selector}": ${appointmentDateText} ✓ VERIFIED`);
                  console.log(`[DATE FILL] Service FROM field filled with date: ${appointmentDateText} ✓ VERIFIED`);
                  serviceFromFilled = true;
                  break;
                } else {
                  log(`Date verification failed for frame selector "${selector}". Expected: ${appointmentDateText}, Got: ${filledValue}`);
                  continue; // Try next selector
                }
              }
            } catch (e) {
              continue;
            }
          }
          if (serviceFromFilled) break;
        }
      }
      
      // Try multiple selectors for service TO date with comprehensive iframe and scroll handling
      let serviceToFilled = false;
      const toSelectors = [
        'input[name="_ctl0:ContentPlaceHolder1:gvAddedCodes:_ctl2:txtService_To"]',
        'input[id="_ctl0_ContentPlaceHolder1_gvAddedCodes__ctl2_txtService_To"]',
        'input[id*="txtService_To"]',
        'input[name*="txtService_To"]',
        '.todate',
        '.textbox.todate',
        '.textbox.todate.ui-mask.hasDatepicker'
      ];
      
      // First try in main page
      for (const selector of toSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.count() > 0) {
            await element.waitFor({ state: 'visible', timeout: 3000 });
            // Scroll to the element if needed
            await element.scrollIntoViewIfNeeded();
            await page.waitForTimeout(500); // Wait for scroll to complete
            await element.fill(appointmentDateText);
            
            // Verify that the exact date was filled
            await page.waitForTimeout(500); // Wait for value to be set
            const filledValue = await element.inputValue();
            if (filledValue === appointmentDateText) {
              log(`Filled service TO date with main page selector "${selector}": ${appointmentDateText} ✓ VERIFIED`);
              console.log(`[DATE FILL] Service TO field filled with date: ${appointmentDateText} ✓ VERIFIED`);
              serviceToFilled = true;
              break;
            } else {
              log(`Date verification failed for TO selector "${selector}". Expected: ${appointmentDateText}, Got: ${filledValue}`);
              continue; // Try next selector
            }
          }
        } catch (e) {
          continue;
        }
      }
      
      // If not found in main page, try in contentframe iframe
      if (!serviceToFilled) {
        try {
          const content = page.frameLocator('iframe[name="contentframe"]');
          for (const selector of toSelectors) {
            try {
              const element = content.locator(selector).first();
              if (await element.count() > 0) {
                await element.waitFor({ state: 'visible', timeout: 3000 });
                // Scroll to the element if needed
                await element.scrollIntoViewIfNeeded();
                await page.waitForTimeout(500); // Wait for scroll to complete
                await element.fill(appointmentDateText);
                
                // Verify that the exact date was filled
                await page.waitForTimeout(500); // Wait for value to be set
                const filledValue = await element.inputValue();
                if (filledValue === appointmentDateText) {
                  log(`Filled service TO date with iframe selector "${selector}": ${appointmentDateText} ✓ VERIFIED`);
                  console.log(`[DATE FILL] Service TO field filled with date: ${appointmentDateText} ✓ VERIFIED`);
                  serviceToFilled = true;
                  break;
                } else {
                  log(`Date verification failed for TO iframe selector "${selector}". Expected: ${appointmentDateText}, Got: ${filledValue}`);
                  continue; // Try next selector
                }
              }
            } catch (e) {
              continue;
            }
          }
        } catch (e) {
          log(`Failed to access contentframe for service TO date: ${e.message}`);
        }
      }
      
      // If still not found, try all frames
      if (!serviceToFilled) {
        const frames = page.frames();
        for (const frame of frames) {
          for (const selector of toSelectors) {
            try {
              const element = frame.locator(selector).first();
              if (await element.count() > 0) {
                await element.waitFor({ state: 'visible', timeout: 3000 });
                // Scroll to the element if needed
                await element.scrollIntoViewIfNeeded();
                await page.waitForTimeout(500); // Wait for scroll to complete
                await element.fill(appointmentDateText);
                
                // Verify that the exact date was filled
                await page.waitForTimeout(500); // Wait for value to be set
                const filledValue = await element.inputValue();
                if (filledValue === appointmentDateText) {
                  log(`Filled service TO date with frame selector "${selector}": ${appointmentDateText} ✓ VERIFIED`);
                  console.log(`[DATE FILL] Service TO field filled with date: ${appointmentDateText} ✓ VERIFIED`);
                  serviceToFilled = true;
                  break;
                } else {
                  log(`Date verification failed for TO frame selector "${selector}". Expected: ${appointmentDateText}, Got: ${filledValue}`);
                  continue; // Try next selector
                }
              }
            } catch (e) {
              continue;
            }
          }
          if (serviceToFilled) break;
        }
      }
      
      if (!serviceFromFilled && !serviceToFilled) {
        log('Could not find any service date fields to fill');
      }
    } else {
      log('No appointment date was captured earlier, skipping date fill');
    }
    
    // Wait a moment for the field to be updated
    await page.waitForTimeout(1000);
    
  } catch (error) {
    log(`Failed to fill service date field: ${error.message}`);
  }
}

// Select provider from dropdown after filling dates
{
  try {
    if (providerText && providerText.trim() !== '') {
      log(`Selecting provider: ${providerText}`);
      console.log(`[PROVIDER SELECT] Looking for: ${providerText}`);
      
      await page.waitForTimeout(2000);
      let providerSelected = false;
      const frames = page.frames();
      
      // First try to find the specific encounter provider dropdown - enhanced selectors
      const encounterDropdownSelectors = [
        // Exact ID from the HTML structure
        '#_ctl0_ContentPlaceHolder1_ddlEncounterProvider_chosen',
        
        // Chosen container variations
        '.chosen-container[id="_ctl0_ContentPlaceHolder1_ddlEncounterProvider_chosen"]',
        '.chosen-container[id*="ddlEncounterProvider_chosen"]',
        
        // Chosen single trigger (the clickable part)
        '#_ctl0_ContentPlaceHolder1_ddlEncounterProvider_chosen .chosen-single',
        '#_ctl0_ContentPlaceHolder1_ddlEncounterProvider_chosen a.chosen-single',
        
        // Alternative approaches
        'div[id="_ctl0_ContentPlaceHolder1_ddlEncounterProvider_chosen"]',
        'div[id*="ddlEncounterProvider_chosen"] .chosen-single',
        
        // Fallback to the original select (though it's hidden)
        'select[name="_ctl0:ContentPlaceHolder1:ddlEncounterProvider"]',
        'select[id="_ctl0_ContentPlaceHolder1_ddlEncounterProvider"]'
      ];
      
      for (const frame of frames) {
        try {
          log(`Checking frame for encounter provider dropdown: ${frame.url()}`);
          
          // Try specific encounter provider dropdown first
          for (const selector of encounterDropdownSelectors) {
            try {
              const dropdown = frame.locator(selector).first();
              if (await dropdown.count() > 0) {
                const isVisible = await dropdown.isVisible().catch(() => false);
                if (isVisible) {
                  log(`Found encounter provider dropdown, clicking...`);
                  await dropdown.scrollIntoViewIfNeeded().catch(() => {});
                  await dropdown.click();
                  await page.waitForTimeout(1000);
                  
                  // Look for provider options with flexible matching - specific to this dropdown
                  const providerRegex = buildFlexibleProviderRegex(providerText);
                  
                  // Try multiple selectors for the options list
                  const optionSelectors = [
                    '#_ctl0_ContentPlaceHolder1_ddlEncounterProvider_chosen .chosen-results li.active-result',
                    '.chosen-container[id*="ddlEncounterProvider_chosen"] .chosen-results li.active-result',
                    '.chosen-results li.active-result'
                  ];
                  
                  let options = null;
                  let optionCount = 0;
                  
                  for (const optSelector of optionSelectors) {
                    options = frame.locator(optSelector);
                    optionCount = await options.count();
                    if (optionCount > 0) {
                      log(`Found ${optionCount} options using selector: ${optSelector}`);
                      break;
                    }
                  }
                  
                  if (optionCount === 0) {
                    log('No options found in dropdown, trying to click again...');
                    await dropdown.click();
                    await page.waitForTimeout(1000);
                    
                    // Try again after second click
                    for (const optSelector of optionSelectors) {
                      options = frame.locator(optSelector);
                      optionCount = await options.count();
                      if (optionCount > 0) {
                        log(`Found ${optionCount} options after second click using: ${optSelector}`);
                        break;
                      }
                    }
                  }
                  
                  for (let j = 0; j < optionCount; j++) {
                    const item = options.nth(j);
                    const txt = (await item.textContent()).trim();
                    
                    // Skip the "--Select--" option
                    if (txt === '--Select--') continue;
                    
                    if (providerRegex.test(txt)) {
                      log(`Selecting provider match: ${txt}`);
                      console.log(`[PROVIDER SELECT] Found and selecting: ${txt}`);
                      await item.click();
                      providerSelected = true;
                      break;
                    }
                  }
                  
                  // Fallback: try exact text matching
                  if (!providerSelected) {
                    const exactOption = frame.locator('.chosen-results li.active-result', { hasText: providerText }).first();
                    const arielOption = frame.locator('.chosen-results li.active-result', { hasText: providerText.replace(/ARIEL RAMIREZ NAVARRO M\.D/i, 'ARIEL RAMIREZ NAVARRO MD') }).first();
                    
                    if (await exactOption.count()) {
                      await exactOption.click();
                      log(`Selected provider with exact match: ${providerText}`);
                      console.log(`[PROVIDER SELECT] Selected with exact match: ${providerText}`);
                      providerSelected = true;
                    } else if (await arielOption.count()) {
                      await arielOption.click();
                      log(`Selected ARIEL RAMIREZ NAVARRO with MD conversion`);
                      console.log(`[PROVIDER SELECT] Selected ARIEL RAMIREZ NAVARRO with MD conversion`);
                      providerSelected = true;
                    }
                  }
                  
                  if (providerSelected) break;
                }
              }
            } catch (e) {
              continue;
            }
          }
          
          // If specific dropdown not found, fallback to generic chosen containers
          if (!providerSelected) {
            const dropdowns = frame.locator('.chosen-container');
            const count = await dropdowns.count();
            
            for (let i = 0; i < count; i++) {
              const dropdown = dropdowns.nth(i);
              const isVisible = await dropdown.isVisible().catch(() => false);
              
              if (isVisible) {
                log(`Trying generic chosen dropdown ${i + 1}...`);
                await dropdown.click();
                await page.waitForTimeout(1000);
                
                const options = frame.locator('.chosen-results li.active-result');
                await options.first().waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
                const optionCount = await options.count();
                
                for (let j = 0; j < optionCount; j++) {
                  const item = options.nth(j);
                  const txt = (await item.textContent()).trim();
                  
                  if (txt === '--Select--') continue;
                  
                  if (buildFlexibleProviderRegex(providerText).test(txt)) {
                    log(`Selecting provider from generic dropdown: ${txt}`);
                    console.log(`[PROVIDER SELECT] Selected from generic dropdown: ${txt}`);
                    await item.click();
                    providerSelected = true;
                    break;
                  }
                }
                
                if (providerSelected) break;
              }
            }
          }
          
          if (providerSelected) break;
        } catch (e) {
          log(`Frame check failed: ${e.message}`);
        }
      }
      
      if (!providerSelected) {
        log(`Provider not selected: ${providerText}`);
        console.log(`[PROVIDER SELECT] Failed to select: ${providerText}`);
      }
    } else {
      log('No provider text available');
      console.log(`[PROVIDER SELECT] No provider text captured`);
    }
    
  } catch (error) {
    log(`Provider selection error: ${error.message}`);
    console.log(`[PROVIDER SELECT] Error: ${error.message}`);
  }
}
await page.waitForTimeout(5000); // Increased wait time for form to be ready

// Add CPT codes one by one in different rows: 96136, 96137, 99401
{
  const cptCodes = ['96136', '96137', '99401'];
  
  // Define selectors for each row - _ctl2, _ctl3, _ctl4 for rows 1, 2, 3
  const cptRowSelectors = [
    // Row 1 (_ctl2)
    [
      'input[name="_ctl0:ContentPlaceHolder1:gvAddedCodes:_ctl2:txtCPTCode"]',
      'input[id="_ctl0_ContentPlaceHolder1_gvAddedCodes__ctl2_txtCPTCode"]',
      'input[id*="_ctl2_txtCPTCode"]',
      'input[name*="_ctl2:txtCPTCode"]'
    ],
    // Row 2 (_ctl3)
    [
      'input[name="_ctl0:ContentPlaceHolder1:gvAddedCodes:_ctl3:txtCPTCode"]',
      'input[id="_ctl0_ContentPlaceHolder1_gvAddedCodes__ctl3_txtCPTCode"]',
      'input[id*="_ctl3_txtCPTCode"]',
      'input[name*="_ctl3:txtCPTCode"]'
    ],
    // Row 3 (_ctl4)
    [
      'input[name="_ctl0:ContentPlaceHolder1:gvAddedCodes:_ctl4:txtCPTCode"]',
      'input[id="_ctl0_ContentPlaceHolder1_gvAddedCodes__ctl4_txtCPTCode"]',
      'input[id*="_ctl4_txtCPTCode"]',
      'input[name*="_ctl4:txtCPTCode"]'
    ]
  ];
  
  for (let i = 0; i < cptCodes.length; i++) {
    const cptCode = cptCodes[i];
    const rowSelectors = cptRowSelectors[i]; // Get selectors for this specific row
    let cptFilled = false;
    
    log(`Adding CPT code ${i + 1}/3: ${cptCode} in row ${i + 1}`);
    
    // Try in main page first
    for (const selector of rowSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          await element.waitFor({ state: 'visible', timeout: 5000 });
          await element.scrollIntoViewIfNeeded();
          await page.waitForTimeout(500);
          
          // Clear field and fill with CPT code
          await element.clear();
          await element.fill(cptCode);
          await page.waitForTimeout(1000); // Wait for dropdown to appear
          
          // Look for and click on the dropdown option - target table row structure
          const dropdownSelectors = [
            // Target table rows containing CPT codes
            'tr td div.width60',
            'tr td .width60',
            '.ui-autocomplete tr',
            '.ui-autocomplete li.ui-menu-item',
            '.ui-autocomplete .ui-menu-item',
            '.ui-menu .ui-menu-item',
            '.ui-autocomplete-menu li',
            '.autocomplete-suggestions div',
            '.autocomplete-suggestions tr'
          ];
          
          let dropdownClicked = false;
          for (const dropdownSelector of dropdownSelectors) {
            try {
              const dropdownOptions = page.locator(dropdownSelector);
              const optionCount = await dropdownOptions.count();
              
              if (optionCount > 0) {
                log(`Found ${optionCount} dropdown options for CPT ${cptCode}`);
                
                // Look for the option that contains our CPT code (skip header rows)
                for (let j = 0; j < optionCount; j++) {
                  const option = dropdownOptions.nth(j);
                  const optionText = await option.textContent();
                  
                  if (optionText && optionText.includes(cptCode)) {
                    // Check if this is a table row structure (div.width60 containing CPT)
                    if (dropdownSelector.includes('width60') || dropdownSelector.includes('tr')) {
                      // For table row structure, look for exact CPT match in the div
                      const cptDiv = option.locator('div.width60, .width60').first();
                      if (await cptDiv.count() > 0) {
                        const cptDivText = await cptDiv.textContent();
                        if (cptDivText && cptDivText.trim() === cptCode) {
                          // Skip first occurrence (likely header), click on data row
                          if (j === 0) {
                            log(`Skipping first row (header) for CPT: ${cptCode}, looking for data row`);
                            continue;
                          }
                          log(`Clicking table data row ${j} for CPT: ${cptCode}`);
                          await option.scrollIntoViewIfNeeded().catch(() => {});
                          await page.waitForTimeout(300);
                          await option.click();
                          dropdownClicked = true;
                          break;
                        }
                      }
                    } else {
                      // For regular dropdown options, ensure CPT code is at the start
                      if (optionText.trim().startsWith(cptCode)) {
                        log(`Clicking dropdown option: ${optionText.trim()}`);
                        await option.scrollIntoViewIfNeeded().catch(() => {});
                        await page.waitForTimeout(300);
                        await option.click();
                        dropdownClicked = true;
                        break;
                      } else {
                        log(`Skipping non-matching option: ${optionText.trim()}`);
                      }
                    }
                  }
                }
                
                if (dropdownClicked) break;
              }
            } catch (e) {
              continue;
            }
          }
          
          if (!dropdownClicked) {
            log(`No dropdown found or clicked for CPT ${cptCode}, continuing...`);
          }
          
          // Wait after dropdown selection
          await page.waitForTimeout(500);
          
          // Verify the CPT code was filled correctly
          const filledValue = await element.inputValue();
          if (filledValue === cptCode) {
            log(`CPT code ${cptCode} filled with main page selector "${selector}" ✓ VERIFIED`);
            console.log(`[CPT FILL] CPT code ${cptCode} filled successfully ✓ VERIFIED`);
            cptFilled = true;
            break;
          } else {
            log(`CPT verification failed for selector "${selector}". Expected: ${cptCode}, Got: ${filledValue}`);
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    // If not found in main page, try in contentframe iframe
    if (!cptFilled) {
      try {
        const content = page.frameLocator('iframe[name="contentframe"]');
        for (const selector of rowSelectors) {
          try {
            const element = content.locator(selector).first();
            if (await element.count() > 0) {
              await element.waitFor({ state: 'visible', timeout: 5000 });
              await element.scrollIntoViewIfNeeded();
              await page.waitForTimeout(500);
              
              // Clear field and fill with CPT code
              await element.clear();
              await element.fill(cptCode);
              await page.waitForTimeout(1000); // Wait for dropdown to appear
              
              // Look for and click on the dropdown option in iframe - target table row structure
              const dropdownSelectors = [
                // Target table rows containing CPT codes
                'tr td div.width60',
                'tr td .width60',
                '.ui-autocomplete tr',
                '.ui-autocomplete li.ui-menu-item',
                '.ui-autocomplete .ui-menu-item',
                '.ui-menu .ui-menu-item',
                '.ui-autocomplete-menu li',
                '.autocomplete-suggestions div',
                '.autocomplete-suggestions tr'
              ];
              
              let dropdownClicked = false;
              for (const dropdownSelector of dropdownSelectors) {
                try {
                  const dropdownOptions = content.locator(dropdownSelector);
                  const optionCount = await dropdownOptions.count();
                  
                  if (optionCount > 0) {
                    log(`Found ${optionCount} iframe dropdown options for CPT ${cptCode}`);
                    
                    // Look for the option that contains our CPT code (skip header rows)
                    for (let j = 0; j < optionCount; j++) {
                      const option = dropdownOptions.nth(j);
                      const optionText = await option.textContent();
                      
                      if (optionText && optionText.includes(cptCode)) {
                        // Check if this is a table row structure (div.width60 containing CPT)
                        if (dropdownSelector.includes('width60') || dropdownSelector.includes('tr')) {
                          // For table row structure, look for exact CPT match in the div
                          const cptDiv = option.locator('div.width60, .width60').first();
                          if (await cptDiv.count() > 0) {
                            const cptDivText = await cptDiv.textContent();
                            if (cptDivText && cptDivText.trim() === cptCode) {
                              // Skip first occurrence (likely header), click on data row
                              if (j === 0) {
                                log(`Skipping first iframe row (header) for CPT: ${cptCode}, looking for data row`);
                                continue;
                              }
                              log(`Clicking iframe table data row ${j} for CPT: ${cptCode}`);
                              await option.scrollIntoViewIfNeeded().catch(() => {});
                              await page.waitForTimeout(300);
                              await option.click();
                              dropdownClicked = true;
                              break;
                            }
                          }
                        } else {
                          // For regular dropdown options, ensure CPT code is at the start
                          if (optionText.trim().startsWith(cptCode)) {
                            log(`Clicking iframe dropdown option: ${optionText.trim()}`);
                            await option.scrollIntoViewIfNeeded().catch(() => {});
                            await page.waitForTimeout(300);
                            await option.click();
                            dropdownClicked = true;
                            break;
                          } else {
                            log(`Skipping non-matching iframe option: ${optionText.trim()}`);
                          }
                        }
                      }
                    }
                    
                    if (dropdownClicked) break;
                  }
                } catch (e) {
                  continue;
                }
              }
              
              if (!dropdownClicked) {
                log(`No iframe dropdown found or clicked for CPT ${cptCode}, continuing...`);
              }
              
              // Wait after dropdown selection
              await page.waitForTimeout(500);
              
              // Verify the CPT code was filled correctly
              const filledValue = await element.inputValue();
              if (filledValue === cptCode) {
                log(`CPT code ${cptCode} filled with iframe selector "${selector}" ✓ VERIFIED`);
                console.log(`[CPT FILL] CPT code ${cptCode} filled successfully ✓ VERIFIED`);
                cptFilled = true;
                break;
              } else {
                log(`CPT verification failed for iframe selector "${selector}". Expected: ${cptCode}, Got: ${filledValue}`);
              }
            }
          } catch (e) {
            continue;
          }
        }
      } catch (e) {
        log(`Failed to access contentframe for CPT code: ${e.message}`);
      }
    }
    
    // If still not found, try all frames
    if (!cptFilled) {
      const frames = page.frames();
      for (const frame of frames) {
        for (const selector of rowSelectors) {
          try {
            const element = frame.locator(selector).first();
            if (await element.count() > 0) {
              await element.waitFor({ state: 'visible', timeout: 5000 });
              await element.scrollIntoViewIfNeeded();
              await page.waitForTimeout(500);
              
              // Clear field and fill with CPT code
              await element.clear();
              await element.fill(cptCode);
              await page.waitForTimeout(1000); // Wait for dropdown to appear
              
              // Look for and click on the dropdown option in frame - target table row structure
              const dropdownSelectors = [
                // Target table rows containing CPT codes
                'tr td div.width60',
                'tr td .width60',
                '.ui-autocomplete tr',
                '.ui-autocomplete li.ui-menu-item',
                '.ui-autocomplete .ui-menu-item',
                '.ui-menu .ui-menu-item',
                '.ui-autocomplete-menu li',
                '.autocomplete-suggestions div',
                '.autocomplete-suggestions tr'
              ];
              
              let dropdownClicked = false;
              for (const dropdownSelector of dropdownSelectors) {
                try {
                  const dropdownOptions = frame.locator(dropdownSelector);
                  const optionCount = await dropdownOptions.count();
                  
                  if (optionCount > 0) {
                    log(`Found ${optionCount} frame dropdown options for CPT ${cptCode}`);
                    
                    // Look for the option that contains our CPT code (skip header rows)
                    for (let j = 0; j < optionCount; j++) {
                      const option = dropdownOptions.nth(j);
                      const optionText = await option.textContent();
                      
                      if (optionText && optionText.includes(cptCode)) {
                        // Check if this is a table row structure (div.width60 containing CPT)
                        if (dropdownSelector.includes('width60') || dropdownSelector.includes('tr')) {
                          // For table row structure, look for exact CPT match in the div
                          const cptDiv = option.locator('div.width60, .width60').first();
                          if (await cptDiv.count() > 0) {
                            const cptDivText = await cptDiv.textContent();
                            if (cptDivText && cptDivText.trim() === cptCode) {
                              // Skip first occurrence (likely header), click on data row
                              if (j === 0) {
                                log(`Skipping first frame row (header) for CPT: ${cptCode}, looking for data row`);
                                continue;
                              }
                              log(`Clicking frame table data row ${j} for CPT: ${cptCode}`);
                              await option.scrollIntoViewIfNeeded().catch(() => {});
                              await page.waitForTimeout(300);
                              await option.click();
                              dropdownClicked = true;
                              break;
                            }
                          }
                        } else {
                          // For regular dropdown options, ensure CPT code is at the start
                          if (optionText.trim().startsWith(cptCode)) {
                            log(`Clicking frame dropdown option: ${optionText.trim()}`);
                            await option.scrollIntoViewIfNeeded().catch(() => {});
                            await page.waitForTimeout(300);
                            await option.click();
                            dropdownClicked = true;
                            break;
                          } else {
                            log(`Skipping non-matching frame option: ${optionText.trim()}`);
                          }
                        }
                      }
                    }
                    
                    if (dropdownClicked) break;
                  }
                } catch (e) {
                  continue;
                }
              }
              
              if (!dropdownClicked) {
                log(`No frame dropdown found or clicked for CPT ${cptCode}, continuing...`);
              }
              
              // Wait after dropdown selection
              await page.waitForTimeout(500);
              
              // Verify the CPT code was filled correctly
              const filledValue = await element.inputValue();
              if (filledValue === cptCode) {
                log(`CPT code ${cptCode} filled with frame selector "${selector}" ✓ VERIFIED`);
                console.log(`[CPT FILL] CPT code ${cptCode} filled successfully ✓ VERIFIED`);
                cptFilled = true;
                break;
              } else {
                log(`CPT verification failed for frame selector "${selector}". Expected: ${cptCode}, Got: ${filledValue}`);
              }
            }
          } catch (e) {
            continue;
          }
        }
        if (cptFilled) break;
      }
    }
    
    if (!cptFilled) {
      log(`Failed to fill CPT code: ${cptCode}`);
      console.log(`[CPT FILL] Failed to fill CPT code: ${cptCode}`);
    }
    
    // Wait between CPT code entries (each goes to a different row)
    await page.waitForTimeout(1000);
    
    log(`Completed CPT code ${cptCode} in row ${i + 1}`);
  }
  
  log(`Completed adding all CPT codes: ${cptCodes.join(', ')}`);
  console.log(`[CPT FILL] Completed adding all CPT codes: ${cptCodes.join(', ')}`);
}


{
  let claimClicked = false;
  const claimSelectors = [
    'input[name="_ctl0:ContentPlaceHolder1:btnClaim"]',
    'input[id*="btnClaim"]',
    'input[value="Claim"]',
    '#_ctl0_ContentPlaceHolder1_btnClaim'
  ];
  
  for (const selector of claimSelectors) {
    try {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        await element.waitFor({ state: 'visible', timeout: 5000 });
        await element.scrollIntoViewIfNeeded();
        await element.click();
        log(`Clicked Claim button with selector "${selector}"`);
        claimClicked = true;
        break;
      }
    } catch (e) {
      continue;
    }
  }
  
  if (!claimClicked) {
    log('Could not find Claim button to click');
  } else {
await page.waitForTimeout(3000);
  }
}


});