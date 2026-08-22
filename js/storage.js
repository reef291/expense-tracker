const STORAGE_KEY = "trip-expenses";

export function loadExpenses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveExpenses(expenses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

const FRIENDS_KEY = "trip-friends";

// each friend is { name, groupId }; groupId null/undefined = not in any group.
// older data stored friends as plain name strings — normalize those on load.
export function loadFriends() {
  try {
    const raw = JSON.parse(localStorage.getItem(FRIENDS_KEY)) ?? [];
    return raw.map((f) => (typeof f === "string" ? { name: f, groupId: null } : f));
  } catch {
    return [];
  }
}

export function saveFriends(friends) {
  localStorage.setItem(FRIENDS_KEY, JSON.stringify(friends));
}

const GROUPS_KEY = "trip-groups";

export function loadGroups() {
  try {
    return JSON.parse(localStorage.getItem(GROUPS_KEY)) ?? [];
  } catch {
    return [];
  }
}

export function saveGroups(groups) {
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
}

const SETTLEMENTS_KEY = "trip-settlements";

export function loadSettlements() {
  try {
    return JSON.parse(localStorage.getItem(SETTLEMENTS_KEY)) ?? [];
  } catch {
    return [];
  }
}

export function saveSettlements(settlements) {
  localStorage.setItem(SETTLEMENTS_KEY, JSON.stringify(settlements));
}

const GROUP_NAME_KEY = "trip-group-name";

export function loadGroupName() {
  return localStorage.getItem(GROUP_NAME_KEY) ?? "";
}

export function saveGroupName(name) {
  localStorage.setItem(GROUP_NAME_KEY, name);
}

const LAST_CONTEXT_KEY = "last-location-context";

export function loadLastContext() {
  try {
    return JSON.parse(localStorage.getItem(LAST_CONTEXT_KEY));
  } catch {
    return null;
  }
}

export function saveLastContext(context) {
  localStorage.setItem(LAST_CONTEXT_KEY, JSON.stringify(context));
}

const TRIP_DATES_KEY = "trip-dates";

export function loadTripDates() {
  try {
    return JSON.parse(localStorage.getItem(TRIP_DATES_KEY));
  } catch {
    return null;
  }
}

export function saveTripDates(dates) {
  localStorage.setItem(TRIP_DATES_KEY, JSON.stringify(dates));
}

const TRIP_BUDGET_KEY = "trip-budget";

export function loadTripBudget() {
  const raw = localStorage.getItem(TRIP_BUDGET_KEY);
  return raw ? Number(raw) : null;
}

export function saveTripBudget(amountILS) {
  localStorage.setItem(TRIP_BUDGET_KEY, String(amountILS));
}

const DISPLAY_CURRENCY_KEY = "display-currency";

export function loadDisplayCurrency() {
  return localStorage.getItem(DISPLAY_CURRENCY_KEY) || "ILS";
}

export function saveDisplayCurrency(code) {
  localStorage.setItem(DISPLAY_CURRENCY_KEY, code);
}

const SECTION_ORDER_KEY = "settle-section-order";

export function loadSettleSectionOrder() {
  try {
    const order = JSON.parse(localStorage.getItem(SECTION_ORDER_KEY));
    return Array.isArray(order) && order.length === 2 ? order : ["groups", "friends"];
  } catch {
    return ["groups", "friends"];
  }
}

export function saveSettleSectionOrder(order) {
  localStorage.setItem(SECTION_ORDER_KEY, JSON.stringify(order));
}
