// Paste this entire file into the Apps Script editor attached to your
// Google Sheet (Extensions > Apps Script in the sheet menu), then save
// and deploy as a Web App (see deployment steps in chat).

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "Name", "Contact", "Attending", "Guests", "Note"]);
  }
  const p = e.parameter;
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
