import { loadExpenses, loadSettlements, saveExpenses } from "./storage.js";
import { fetchRemoteExpenses, isRemoteEnabled, postRemoteExpense } from "./remote.js";

let expenses = loadExpenses();

export function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

export function myShare(e) {
  const share = computeRawShare(e);
  // income offsets the total instead of adding to it — flipping the sign here
  // means every existing sum (grand total, day/month/country totals, ...)
  // already nets it out correctly without special-casing income anywhere else
  return e.isIncome ? -share : share;
}

function computeRawShare(e) {
  if (!e.isGroup) return e.amountILS;
  if (e.participants?.length) {
    if (typeof e.participants[0] === "object") {
      return e.participants.find((p) => p.name === "me")?.amount ?? 0;
    }
    // legacy: plain names, equal split
    if (!e.participants.includes("me")) return 0;
    return e.amountILS / e.participants.length;
  }
  // legacy fallback for group expenses recorded before named participants existed
  return e.groupSize > 1 ? e.amountILS / e.groupSize : e.amountILS;
}

// expenses marked excludeFromTotal still show up in the list, they just don't
// count toward any aggregate (grand total, day/month/country totals, etc.)
function countsTowardTotal(e) {
  return !e.excludeFromTotal;
}

export function getExpenses() {
  return [...expenses].sort((a, b) => (b.date + b.createdAt).localeCompare(a.date + a.createdAt));
}

export function getExpenseById(id) {
  return expenses.find((e) => e.id === id);
}

export function getExpensesGroupedByDay(filterFn) {
  const sorted = getExpenses().filter(filterFn ?? (() => true));
  const days = new Map();
  for (const e of sorted) {
    if (!days.has(e.date)) days.set(e.date, []);
    days.get(e.date).push(e);
  }
  return [...days.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, items]) => ({
      date,
      items,
      total: items.filter(countsTowardTotal).reduce((sum, e) => sum + myShare(e), 0),
    }));
}

export async function syncFromRemote() {
  if (!isRemoteEnabled()) return;
  const remoteExpenses = await fetchRemoteExpenses();
  const byId = new Map(expenses.map((e) => [e.id, e]));
  for (const e of remoteExpenses) byId.set(e.id, e);
  expenses = [...byId.values()];
  saveExpenses(expenses);
}

export async function addExpense(input) {
  const expense = {
    id: crypto.randomUUID(),
    date: input.date,
    location: input.location?.trim() ?? "",
    country: input.country,
    category: input.category,
    note: input.note?.trim() ?? "",
    amountLocal: round2(input.amountLocal),
    currencyLocal: input.currencyLocal?.trim().toUpperCase() ?? "",
    amountILS: round2(input.amountILS),
    isGroup: Boolean(input.isGroup),
    paidBy: input.isGroup ? input.paidBy || "me" : "me",
    participants: input.isGroup ? input.participants ?? [] : [],
    excludeFromTotal: Boolean(input.excludeFromTotal),
    isIncome: Boolean(input.isIncome),
    photo: input.photo ?? null,
    createdAt: Date.now(),
  };
  expenses.push(expense);
  saveExpenses(expenses);
  if (isRemoteEnabled()) await postRemoteExpense(expense);
  return expense;
}

// renames a participant/payer across every expense that references them by name
export function renameParticipant(oldName, newName) {
  expenses = expenses.map((e) => {
    if (!e.isGroup) return e;
    const paidBy = e.paidBy === oldName ? newName : e.paidBy;
    let participants = e.participants;
    if (participants?.length) {
      participants =
        typeof participants[0] === "object"
          ? participants.map((p) => (p.name === oldName ? { ...p, name: newName } : p))
          : participants.map((n) => (n === oldName ? newName : n));
    }
    return { ...e, paidBy, participants };
  });
  saveExpenses(expenses);
}

export function deleteExpense(id) {
  expenses = expenses.filter((e) => e.id !== id);
  saveExpenses(expenses);
}

// Photos are stored locally only (base64 in localStorage) and never synced to
// the remote Google Sheet — an image per row would bloat it far past reason.
export function updateExpense(id, patch) {
  expenses = expenses.map((e) => (e.id === id ? { ...e, ...patch } : e));
  saveExpenses(expenses);
}

export function getGrandTotal() {
  return expenses.filter(countsTowardTotal).reduce((sum, e) => sum + myShare(e), 0);
}

export function getTotalToday() {
  const today = new Date().toISOString().slice(0, 10);
  return expenses
    .filter((e) => e.date === today && countsTowardTotal(e))
    .reduce((sum, e) => sum + myShare(e), 0);
}

export function getTotalForRange(fromDate, toDate) {
  return expenses
    .filter((e) => e.date >= fromDate && e.date <= toDate && countsTowardTotal(e))
    .reduce((sum, e) => sum + myShare(e), 0);
}

// spending pace within a single country, based on the span between its first
// and last recorded expense (a proxy for "how long you were there")
export function getCountryPace(countryCode) {
  const items = expenses.filter((e) => e.country === countryCode && countsTowardTotal(e));
  if (!items.length) return null;

  const dates = items.map((e) => e.date).sort();
  const first = dates[0];
  const last = dates[dates.length - 1];
  const days = Math.max(1, Math.round((new Date(last) - new Date(first)) / 86400000) + 1);
  const total = items.reduce((sum, e) => sum + myShare(e), 0);
  const dailyAvg = total / days;

  return { days, total, dailyAvg, monthlyAvg: dailyAvg * 30, first, last };
}

export function getTotalsByCountry() {
  const totals = {};
  for (const e of expenses.filter(countsTowardTotal)) {
    totals[e.country] = (totals[e.country] ?? 0) + myShare(e);
  }
  return Object.entries(totals).sort((a, b) => b[1] - a[1]);
}

export function getTotalsByMonth() {
  const totals = {};
  for (const e of expenses.filter(countsTowardTotal)) {
    const month = e.date.slice(0, 7); // YYYY-MM
    totals[month] = (totals[month] ?? 0) + myShare(e);
  }
  return Object.entries(totals).sort((a, b) => b[0].localeCompare(a[0]));
}

// net balance per person: positive = others owe them, negative = they owe others.
// Includes manual settlements ("mark as settled") on top of what expenses imply.
export function getFriendBalances() {
  const balances = {};
  for (const e of expenses) {
    if (!e.isGroup || !e.participants?.length) continue;
    const payer = e.paidBy || "me";
    balances[payer] = (balances[payer] ?? 0) + e.amountILS;

    if (typeof e.participants[0] === "object") {
      for (const p of e.participants) balances[p.name] = (balances[p.name] ?? 0) - p.amount;
    } else {
      const share = e.amountILS / e.participants.length;
      for (const name of e.participants) balances[name] = (balances[name] ?? 0) - share;
    }
  }

  for (const s of loadSettlements()) {
    balances[s.from] = (balances[s.from] ?? 0) + s.amount;
    balances[s.to] = (balances[s.to] ?? 0) - s.amount;
  }

  return balances;
}

// greedy debt simplification: minimal transfer list that settles all balances
export function simplifyDebts(balances) {
  const creditors = [];
  const debtors = [];
  for (const [name, amount] of Object.entries(balances)) {
    const rounded = round2(amount);
    if (rounded > 0.01) creditors.push({ name, amount: rounded });
    else if (rounded < -0.01) debtors.push({ name, amount: -rounded });
  }
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transfers = [];
  let ci = 0;
  let di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const c = creditors[ci];
    const d = debtors[di];
    const amount = round2(Math.min(c.amount, d.amount));
    if (amount > 0) transfers.push({ from: d.name, to: c.name, amount });
    c.amount = round2(c.amount - amount);
    d.amount = round2(d.amount - amount);
    if (c.amount <= 0.01) ci++;
    if (d.amount <= 0.01) di++;
  }
  return transfers;
}
