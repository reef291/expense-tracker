// לאחר פריסת ה-Apps Script (backend/AppsScript.gs), הדביקו כאן את ה-URL שמתקבל (מסתיים ב-/exec).
// אם משאירים ריק — האפליקציה עובדת רק על localStorage מקומי, בלי סנכרון.
const DEFAULT_API_URL = "";

// אנשים שמצטרפים דרך קישור הזמנה (?join=...) מקבלים את ה-URL הזה אוטומטית,
// כדי שהם יתחברו לאותו Google Sheet משותף בלי להעתיק אותו ידנית.
const OVERRIDE_KEY = "api-url-override";

export function getApiUrl() {
  return localStorage.getItem(OVERRIDE_KEY) || DEFAULT_API_URL;
}

export function setApiUrlOverride(url) {
  localStorage.setItem(OVERRIDE_KEY, url);
}
