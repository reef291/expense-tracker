/**
 * גיבוי/שרת קטן להוצאות טיול, על גבי Google Sheets.
 *
 * התקנה:
 * 1. פתחו script.google.com -> New project, מחקו את הקוד הקיים והדביקו את כל הקובץ הזה.
 * 2. צרו Google Sheet חדש והעתיקו את ה-ID שלו מהכתובת (החלק בין /d/ ל-/edit).
 * 3. הדביקו את ה-ID במקום SHEET_ID למטה.
 * 4. Deploy -> New deployment -> Web app.
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. העתיקו את ה-URL שמתקבל (מסתיים ב-/exec) ושימו אותו ב-js/config.js וב-Shortcut באייפון.
 */

const SHEET_ID = "PASTE_YOUR_GOOGLE_SHEET_ID_HERE";
const SHEET_NAME = "Expenses";
const GROUPS_SHEET_NAME = "Groups";

const HEADERS = [
  "id", "date", "location", "country", "category", "note",
  "amountLocal", "currencyLocal", "amountILS", "isGroup", "paidBy", "participants",
  "excludeFromTotal", "createdAt",
];

const GROUP_HEADERS = ["groupId", "groupName", "memberName", "joinedAt"];

function getSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
  }
  return sheet;
}

function getGroupsSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(GROUPS_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(GROUPS_SHEET_NAME);
    sheet.appendRow(GROUP_HEADERS);
  }
  return sheet;
}

function rowsToObjects_(sheet) {
  const rows = sheet.getDataRange().getValues();
  const [header, ...data] = rows;
  return data
    .filter((row) => row[0])
    .map((row) => {
      const obj = {};
      header.forEach((key, i) => (obj[key] = row[i]));
      return obj;
    });
}

function doGet(e) {
  if (e.parameter.type === "groups") {
    return jsonResponse_({ members: rowsToObjects_(getGroupsSheet_()) });
  }
  return jsonResponse_({ expenses: rowsToObjects_(getSheet_()) });
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);

  if (body.action === "join") {
    const sheet = getGroupsSheet_();
    sheet.appendRow([
      body.groupId || "",
      body.groupName || "",
      body.memberName || "",
      Date.now(),
    ]);
    return jsonResponse_({ ok: true });
  }

  if (body.action === "delete") {
    const sheet = getSheet_();
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === body.id) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    return jsonResponse_({ ok: true });
  }

  const sheet = getSheet_();
  const isGroup = Boolean(body.isGroup);

  const expense = {
    // use the id the app already generated, not a new one — otherwise this
    // row can never be matched again for a later delete, and re-syncing from
    // the sheet creates a duplicate instead of recognizing the same expense
    id: body.id || Utilities.getUuid(),
    date: body.date || new Date().toISOString().slice(0, 10),
    location: body.location || "",
    country: body.country || "IL",
    category: body.category || "other",
    note: body.note || "",
    // Number(x) || 0 guards against a missing/invalid amount ever landing as
    // NaN — Sheets stores a NaN number as the #NUM! error, which then reads
    // back as that literal string and shows up as "NaN" wherever the app
    // does math with it
    amountLocal: Number(body.amountLocal) || 0,
    currencyLocal: body.currencyLocal || "ILS",
    amountILS: Number(body.amountILS) || 0,
    isGroup: isGroup,
    paidBy: isGroup ? (body.paidBy || "me") : "me",
    participants: isGroup ? (body.participants || "") : "",
    excludeFromTotal: Boolean(body.excludeFromTotal),
    createdAt: Date.now(),
  };

  sheet.appendRow(HEADERS.map((key) => expense[key]));

  return jsonResponse_({ ok: true, expense });
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
