export const COUNTRY_CURRENCY = {
  IL: "ILS", TH: "THB", VN: "VND", ID: "IDR", IN: "INR", NP: "NPR", LK: "LKR",
  JP: "JPY", KR: "KRW", CN: "CNY", PH: "PHP", MY: "MYR", SG: "SGD", KH: "KHR",
  LA: "LAK", MM: "MMK", GE: "GEL", AM: "AMD", AZ: "AZN", TR: "TRY",
  GR: "EUR", IT: "EUR", ES: "EUR", PT: "EUR", FR: "EUR", DE: "EUR", NL: "EUR",
  BE: "EUR", CH: "CHF", AT: "EUR", CZ: "CZK", HU: "HUF", HR: "EUR", SI: "EUR",
  RS: "RSD", AL: "ALL", ME: "EUR", BA: "BAM", MK: "MKD", BG: "BGN", RO: "RON",
  PL: "PLN", GB: "GBP", IE: "EUR", IS: "ISK", MA: "MAD", EG: "EGP", JO: "JOD",
  AE: "AED", QA: "QAR", ZA: "ZAR", TZ: "TZS", KE: "KES", US: "USD", CA: "CAD",
  MX: "MXN", PE: "PEN", BO: "BOB", AR: "ARS", CL: "CLP", BR: "BRL", CO: "COP",
  CR: "CRC", AU: "AUD", NZ: "NZD",
};

export const CURRENCIES = [
  { code: "ILS", symbol: "₪", name: "שקל חדש" },
  { code: "USD", symbol: "$", name: "דולר אמריקאי" },
  { code: "EUR", symbol: "€", name: "יורו" },
  { code: "GBP", symbol: "£", name: "פאונד בריטי" },
  { code: "JPY", symbol: "¥", name: "יין יפני" },
  { code: "THB", symbol: "฿", name: "בהט תאילנדי" },
  { code: "VND", symbol: "₫", name: "דונג וייטנאמי" },
  { code: "IDR", symbol: "Rp", name: "רופיה אינדונזית" },
  { code: "INR", symbol: "₹", name: "רופי הודי" },
  { code: "NPR", symbol: "₨", name: "רופי נפאלי" },
  { code: "LKR", symbol: "₨", name: "רופי סרילנקי" },
  { code: "KRW", symbol: "₩", name: "וון דרום קוריאני" },
  { code: "CNY", symbol: "¥", name: "יואן סיני" },
  { code: "PHP", symbol: "₱", name: "פזו פיליפיני" },
  { code: "MYR", symbol: "RM", name: "רינגיט מלזי" },
  { code: "SGD", symbol: "S$", name: "דולר סינגפורי" },
  { code: "KHR", symbol: "៛", name: "ריאל קמבודי" },
  { code: "LAK", symbol: "₭", name: "קיפ לאוסי" },
  { code: "MMK", symbol: "K", name: "קיאט מיאנמרי" },
  { code: "GEL", symbol: "₾", name: "לארי גאורגי" },
  { code: "AMD", symbol: "֏", name: "דראם ארמני" },
  { code: "AZN", symbol: "₼", name: "מאנאט אזרבייג'ני" },
  { code: "TRY", symbol: "₺", name: "לירה טורקית" },
  { code: "CHF", symbol: "CHF", name: "פרנק שוויצרי" },
  { code: "CZK", symbol: "Kč", name: "כתר צ'כי" },
  { code: "HUF", symbol: "Ft", name: "פורינט הונגרי" },
  { code: "RSD", symbol: "дин", name: "דינר סרבי" },
  { code: "ALL", symbol: "L", name: "לק אלבני" },
  { code: "BAM", symbol: "KM", name: "מרקה בוסנית" },
  { code: "MKD", symbol: "ден", name: "דינר מקדוני" },
  { code: "BGN", symbol: "лв", name: "לב בולגרי" },
  { code: "RON", symbol: "lei", name: "ליי רומני" },
  { code: "PLN", symbol: "zł", name: "זלוטי פולני" },
  { code: "ISK", symbol: "kr", name: "קרונה איסלנדית" },
  { code: "MAD", symbol: "د.م.", name: "דירהם מרוקאי" },
  { code: "EGP", symbol: "E£", name: "פאונד מצרי" },
  { code: "JOD", symbol: "د.ا", name: "דינר ירדני" },
  { code: "AED", symbol: "د.إ", name: "דירהם אמירותי" },
  { code: "QAR", symbol: "ر.ق", name: "ריאל קטארי" },
  { code: "ZAR", symbol: "R", name: "ראנד דרום אפריקאי" },
  { code: "TZS", symbol: "TSh", name: "שילינג טנזני" },
  { code: "KES", symbol: "KSh", name: "שילינג קנייתי" },
  { code: "CAD", symbol: "C$", name: "דולר קנדי" },
  { code: "MXN", symbol: "$", name: "פזו מקסיקני" },
  { code: "PEN", symbol: "S/", name: "סול פרואני" },
  { code: "BOB", symbol: "Bs", name: "בוליביאנו" },
  { code: "ARS", symbol: "$", name: "פזו ארגנטינאי" },
  { code: "CLP", symbol: "$", name: "פזו צ'יליאני" },
  { code: "BRL", symbol: "R$", name: "ריאל ברזילאי" },
  { code: "COP", symbol: "$", name: "פזו קולומביאני" },
  { code: "CRC", symbol: "₡", name: "קולון קוסטהריקני" },
  { code: "AUD", symbol: "A$", name: "דולר אוסטרלי" },
  { code: "NZD", symbol: "NZ$", name: "דולר ניו זילנדי" },
];

const CURRENCY_BY_CODE = new Map(CURRENCIES.map((c) => [c.code, c]));

export function getCurrency(code) {
  return CURRENCY_BY_CODE.get(code) ?? { code, symbol: code, name: code };
}

const CACHE_KEY = "fx-rate-cache";

function loadCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) ?? {};
  } catch {
    return {};
  }
}

function saveCache(cache) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

export async function getRateToILS(currency) {
  if (currency === "ILS") return 1;

  const cache = loadCache();
  const today = new Date().toISOString().slice(0, 10);
  const cached = cache[currency];
  if (cached && cached.date === today) return cached.rate;

  const res = await fetch(`https://open.er-api.com/v6/latest/${currency}`);
  if (!res.ok) throw new Error(`exchange rate fetch failed: ${res.status}`);
  const data = await res.json();
  const rate = data.rates?.ILS;
  if (!rate) throw new Error(`no ILS rate for ${currency}`);

  cache[currency] = { rate, date: today };
  saveCache(cache);
  return rate;
}
