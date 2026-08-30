/**
 * Viraj Hurbada — profile site visitor logger
 * --------------------------------------------------------------
 * Deploy this as a Google Apps Script Web App. It receives a small
 * JSON payload from script.js on every page load and appends it as
 * a new row in this spreadsheet.
 *
 * Note: Apps Script web apps do NOT have access to the caller's IP
 * address directly (Google doesn't expose it, for privacy reasons).
 * That's why the IP is looked up in the browser first and sent here
 * as a normal field in the payload, rather than read off the request.
 *
 * SETUP
 * 1. Go to sheets.google.com and create a new blank spreadsheet.
 *    Rename it something like "Profile Site Visitors".
 * 2. In that sheet: Extensions > Apps Script.
 * 3. Delete any starter code and paste this whole file in.
 * 4. Click Deploy > New deployment.
 *      - Type: Web app
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 5. Click Deploy, authorise it when prompted, then copy the
 *    "Web app URL" it gives you.
 * 6. Paste that URL into VISITOR_LOG_ENDPOINT in script.js.
 *
 * Every visit will now show up as a new row in the "VisitorLog" tab.
 */

const SHEET_NAME = 'VisitorLog';

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, message: 'Visitor logger is ready. Use POST requests from the website.' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const sheet = getOrCreateSheet_();
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.ip || '',
      data.city || '',
      data.region || '',
      data.country || '',
      data.page || '',
      data.referrer || '',
      data.userAgent || '',
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'Timestamp', 'IP', 'City', 'Region', 'Country', 'Page', 'Referrer', 'User Agent',
    ]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}
