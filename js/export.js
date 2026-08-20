import { getCategory } from "./categories.js";
import { getCountry } from "./countries.js";

const HEADERS = [
  "תאריך", "פירוט", "קטגוריה", "סכום שהוזן", "סוג מטבע",
  "מחיר בשקלים", "קניה קבוצתית", "מספר אנשים בקבוצה", "נכלל בסה\"כ",
  "מדינה", "עיר/מחוז",
];

function buildRow(e) {
  const country = getCountry(e.country);
  return [
    e.date,
    e.note,
    getCategory(e.category).label,
    e.amountLocal,
    e.currencyLocal,
    e.amountILS,
    e.isGroup ? "כן" : "לא",
    e.isGroup ? e.participants?.length ?? "" : "",
    e.excludeFromTotal ? "לא נכלל" : "נכלל",
    country.name,
    e.location,
  ];
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function exportExpensesToXlsx(expenses) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("הוצאות", { views: [{ rightToLeft: true }] });

  sheet.addRow(HEADERS);
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: "center" };

  for (const e of expenses) {
    const row = buildRow(e);
    const [year, month, day] = e.date.split("-").map(Number);
    row[0] = new Date(year, month - 1, day);
    sheet.addRow(row);
  }

  sheet.getColumn(1).numFmt = "dd/mm/yyyy";
  sheet.getColumn(1).width = 12;
  sheet.getColumn(2).width = 22;
  sheet.getColumn(3).width = 12;
  sheet.getColumn(4).width = 12;
  sheet.getColumn(5).width = 10;
  sheet.getColumn(6).width = 14;
  sheet.getColumn(7).width = 14;
  sheet.getColumn(8).width = 16;
  sheet.getColumn(9).width = 12;
  sheet.getColumn(10).width = 12;
  sheet.getColumn(11).width = 16;

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  downloadBlob(blob, `הוצאות-טיול-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

function csvEscape(value) {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export function exportExpensesToCsv(expenses) {
  const rows = expenses.map(buildRow);
  const csv = [HEADERS, ...rows].map((row) => row.map(csvEscape).join(",")).join("\r\n");
  // Leading UTF-8 BOM so Excel/Numbers/Sheets render the Hebrew text correctly.
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `הוצאות-טיול-${new Date().toISOString().slice(0, 10)}.csv`);
}
