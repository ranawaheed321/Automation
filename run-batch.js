#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const PROJECT_ROOT = __dirname;
const DEFAULT_FILE_CANDIDATES = [
  path.resolve(PROJECT_ROOT, 'tests/data/dynamicdata.xlsx'),
  path.resolve(PROJECT_ROOT, 'data/dynamicdata.xlsx')
];

function resolveDataFile() {
  const candidates = [];
  if (process.env.DATA_FILE) candidates.push(process.env.DATA_FILE);
  if (process.env.PATIENT_FILE) candidates.push(process.env.PATIENT_FILE);
  candidates.push(...DEFAULT_FILE_CANDIDATES);
  const filePath = candidates.find(p => { try { return fs.existsSync(p); } catch { return false; } });
  if (!filePath) throw new Error(`Data file not found. Tried: ${candidates.join(' | ')}`);
  return filePath;
}

function loadRowsAOA(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = process.env.DATA_SHEET || process.env.PATIENT_SHEET || workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error(`Sheet not found: ${sheetName}`);
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (!rows || rows.length < 2) throw new Error('No data rows found in sheet');
  return { workbook, sheetName, rows };
}

function buildHeaderMap(headerRow) {
  const map = {};
  headerRow.forEach((h, i) => {
    const key = String(h).trim().toLowerCase().replace(/[\s_-]+/g, '_');
    if (!key) return;
    map[key] = i;
  });
  return map;
}

function pick(row, idx) {
  return (idx != null && idx >= 0) ? String(row[idx] ?? '').trim() : '';
}

async function runRow(row, headerMap, filePath, sheetName, rowIndex) {
  const getIdx = (...names) => names.map(n => n.toLowerCase().replace(/[\s_-]+/g, '_')).map(n => headerMap[n]).find(i => i != null);
  const accountId = pick(row, getIdx('AccountID', 'PatientID', 'Account Id', 'Patient Id'));
  const provider = pick(row, getIdx('Provider', 'Provider Name', 'Doctor', 'Physician'));
  const encounterType = pick(row, getIdx('Encounter Type', 'EncounterType', 'Visit Type', 'Encounter'));
  const visitTemplateType = pick(row, getIdx('Visit Template Type', 'Visit Template', 'Template Type', 'VisitTemplateType'));
  const date = pick(row, getIdx('Date', 'Encounter Date', 'Visit Date'));
  const plan = pick(row, getIdx('Plan & Patient Communication', 'Plan', 'Plan Communication'));
  const hpi = pick(row, getIdx('HPI'));

  if (!accountId) {
    return 'SKIPPED';
  }

  console.log(`[batch] Row ${rowIndex}: starting for ID=${accountId}`);

  // Prepare env overrides for the test
  const env = { ...process.env };
  env.ACCOUNT_ID = accountId;
  if (provider) env.PROVIDER = provider; else delete env.PROVIDER;
  if (encounterType) env.ENCOUNTER_TYPE = encounterType; else delete env.ENCOUNTER_TYPE;
  if (visitTemplateType) env.VISIT_TEMPLATE_TYPE = visitTemplateType; else delete env.VISIT_TEMPLATE_TYPE;
  if (date) env.ENCOUNTER_DATE = date; else delete env.ENCOUNTER_DATE;
  if (plan) env.PLAN_COMMUNICATION = plan; else delete env.PLAN_COMMUNICATION;
  if (hpi) env.HPI_TEXT = hpi; else delete env.HPI_TEXT;
  env.DATA_FILE = filePath;
  env.DATA_SHEET = sheetName;

  const args = ['playwright', 'test', 'tests/visit.spec.js', '--config=playwright.config.js', '--project=chromium', '--headed'];
  const child = spawn('npx', args, { stdio: 'inherit', env });

  const exitCode = await new Promise(resolve => child.on('close', resolve));
  const status = exitCode === 0 ? 'PASS' : 'FAIL';
  console.log(`[batch] Row ${rowIndex}: finished with ${status}`);
  await writeResult(filePath, sheetName, rowIndex, status);
  return status;
}

async function writeResult(filePath, sheetName, rowIndex, status) {
  console.log(`[batch] Writing ${status} to row ${rowIndex}...`);
  try {
    const wb = XLSX.readFile(filePath);
    const sheet = wb.Sheets[sheetName];
    if (!sheet) throw new Error(`Sheet ${sheetName} not found`);
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    console.log(`[batch] Loaded ${rows.length} rows from Excel`);
    const header = rows[0] || [];
    console.log(`[batch] Header row:`, header);
    let colIndex = header.findIndex(h => {
      const normalized = String(h).trim().toLowerCase();
      return normalized === 'result' || normalized === 'status';
    });
    console.log(`[batch] Looking for Result column, found at index:`, colIndex);
    if (colIndex === -1) { 
      colIndex = header.length; 
      header[colIndex] = 'Result'; 
      rows[0] = header; 
      console.log(`[batch] Added Result column at index ${colIndex}`);
    } else {
      console.log(`[batch] Found existing Result column at index ${colIndex}`);
    }
    // Ensure row exists and has enough columns
    while (rows.length <= rowIndex) rows.push([]);
    while (rows[rowIndex].length <= colIndex) rows[rowIndex].push('');
    rows[rowIndex][colIndex] = status;
    console.log(`[batch] Set rows[${rowIndex}][${colIndex}] = ${status}`);
    const newSheet = XLSX.utils.aoa_to_sheet(rows);
    wb.Sheets[sheetName] = newSheet;
    XLSX.writeFile(wb, filePath);
    console.log(`[batch] Successfully wrote ${status} to Excel file`);
  } catch (e) {
    console.warn(`[batch] Failed to write result for row ${rowIndex}: ${e.message}`);
    console.warn(`[batch] Stack trace:`, e.stack);
  }
}

(async () => {
  try {
    const filePath = resolveDataFile();
    const { sheetName, rows } = loadRowsAOA(filePath);
    const headerMap = buildHeaderMap(rows[0]);
    let processedCount = 0;
    let skippedCount = 0;
    
    for (let i = 1; i < rows.length; i++) {
      const result = await runRow(rows[i], headerMap, filePath, sheetName, i);
      if (result === 'SKIPPED') {
        skippedCount++;
      } else {
        processedCount++;
      }
    }
    
    console.log(`[batch] Processing complete: ${processedCount} rows processed, ${skippedCount} rows skipped (no AccountID/PatientID)`);
    process.exit(0);
  } catch (e) {
    console.error(`[batch] Error: ${e.message}`);
    process.exit(1);
  }
})();


