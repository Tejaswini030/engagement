// Paste this entire file into the Apps Script editor for your Google Sheet.
// IMPORTANT: After updating, you must re-deploy:
//   Deploy → Manage deployments → pencil/edit → Version: New version → Deploy
// (Keep the same Web app URL — only the version changes.)

function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const action = (e.parameter && e.parameter.action) || "rsvp";

  if (action === "track") {
    return logVisitor(ss, e.parameter);
  }
  return logRsvp(ss, e.parameter);
}

function logRsvp(ss, p) {
  const sheet = ss.getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "Name", "Contact", "Attending", "Guests", "Note"]);
  }
  sheet.appendRow([
    p.timestamp || new Date().toISOString(),
    p.name || "",
    p.contact || "",
    p.attending || "",
    p.guests || "",
    p.note || "",
  ]);
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function logVisitor(ss, p) {
  let sheet = ss.getSheetByName("Visitors");
  if (!sheet) {
    sheet = ss.insertSheet("Visitors");
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "IP", "City", "Region", "Country", "User Agent", "Referrer", "Page"]);
  }
  sheet.appendRow([
    p.timestamp || new Date().toISOString(),
    p.ip || "",
    p.city || "",
    p.region || "",
    p.country || "",
    p.ua || "",
    p.referrer || "",
    p.page || "",
  ]);
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
