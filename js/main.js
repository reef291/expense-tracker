import { CATEGORIES, getCategory } from "./categories.js";
import { COUNTRY_CURRENCY, CURRENCIES, getCurrency, getRateToILS } from "./currency.js";
import { getCountry } from "./countries.js";
import { detectLocation } from "./geo.js";
import { fileToCompressedDataUrl } from "./photo.js";
import {
  addExpense,
  deleteExpense,
  getCountryPace,
  getExpenseById,
  getExpenses,
  getExpensesGroupedByDay,
  getFriendBalances,
  getGrandTotal,
  getTotalForRange,
  getTotalToday,
  getTotalsByCountry,
  getTotalsByMonth,
  myShare,
  round2,
  simplifyDebts,
  syncFromRemote,
  updateExpense,
} from "./expenses.js";
import { fetchRemoteGroupMembers, isRemoteEnabled, joinRemoteGroup } from "./remote.js";
import { setApiUrlOverride } from "./config.js";
import { exportExpensesToCsv, exportExpensesToXlsx } from "./export.js";
import {
  loadFriends,
  loadGroupName,
  loadGroups,
  loadLastContext,
  loadLastSplit,
  loadSettlements,
  loadTripDates,
  saveFriends,
  saveGroupName,
  saveGroups,
  saveLastContext,
  saveLastSplit,
  saveSettlements,
  saveTripDates,
} from "./storage.js";
import { avatarHtml, getPeopleList, personLabel, resolveParticipants } from "./split.js";

// ---------- elements ----------

const screens = document.querySelectorAll(".screen");

const amountHomeBtn = document.getElementById("amount-home-btn");
const amountInput = document.getElementById("amount-input");
const amountSymbol = document.getElementById("amount-symbol");
const amountContinue = document.getElementById("amount-continue");
const currencyChip = document.getElementById("currency-chip");
const currencyChipText = document.getElementById("currency-chip-text");
const locationText = document.getElementById("location-text");

const categoryBackBtn = document.getElementById("category-back-btn");
const categoryGrid = document.getElementById("category-grid");

const detailsBackBtn = document.getElementById("details-back-btn");
const noteInput = document.getElementById("note-input");
const isGroupInput = document.getElementById("is-group");
const splitField = document.getElementById("split-field");
const paidByChipsEl = document.getElementById("paid-by-chips");
const participantsChipsEl = document.getElementById("participants-chips");
const splitModeChipsEl = document.getElementById("split-mode-chips");
const splitAmountsEl = document.getElementById("split-amounts");
const detailsDone = document.getElementById("details-done");
const detailsDateInput = document.getElementById("details-date-input");
const excludeInput = document.getElementById("exclude-input");
const detailsPhotoInput = document.getElementById("details-photo-input");
const detailsAddPhotoBtn = document.getElementById("details-add-photo-btn");
const detailsPhotoPreview = document.getElementById("details-photo-preview");

const expenseBackBtn = document.getElementById("expense-back-btn");
const expenseDetailBody = document.getElementById("expense-detail-body");
const expensePhotoInput = document.getElementById("expense-photo-input");

const filterBackBtn = document.getElementById("filter-back-btn");
const filterTitle = document.getElementById("filter-title");
const filterTotal = document.getElementById("filter-total");
const filterCountryPace = document.getElementById("filter-country-pace");
const filterDaysList = document.getElementById("filter-days-list");
const filterEmptyState = document.getElementById("filter-empty-state");

const homeAddBtn = document.getElementById("home-add-btn");
const toastEl = document.getElementById("toast");
const daysList = document.getElementById("days-list");
const emptyState = document.getElementById("empty-state");
const expenseCount = document.getElementById("expense-count");
const totalAmountEl = document.getElementById("total-amount");
const refreshBtn = document.getElementById("refresh-btn");

const tabButtons = document.querySelectorAll(".tab-btn");
const tabList = document.getElementById("tab-list");
const tabSummary = document.getElementById("tab-summary");
const tabSettle = document.getElementById("tab-settle");
const appTitleBtn = document.getElementById("app-title-btn");
const groupsListEl = document.getElementById("groups-list");
const groupScreenBackBtn = document.getElementById("group-screen-back-btn");
const groupScreenTitle = document.getElementById("group-screen-title");
const groupScreenMembers = document.getElementById("group-screen-members");
const groupScreenEmpty = document.getElementById("group-screen-empty");
const addFriendGroupSelect = document.getElementById("add-friend-group-select");
const newGroupNameInput = document.getElementById("new-group-name-input");
const friendsChipsEl = document.getElementById("friends-chips");
const addFriendInput = document.getElementById("add-friend-input");
const addFriendBtn = document.getElementById("add-friend-btn");
const settleTransfersEl = document.getElementById("settle-transfers");
const settleBalancesEl = document.getElementById("settle-balances");
const statToday = document.getElementById("stat-today");
const paceCard = document.getElementById("pace-card");
const paceTotal = document.getElementById("pace-total");
const paceStats = document.getElementById("pace-stats");
const paceDatesToggle = document.getElementById("pace-dates-toggle");
const paceDatesForm = document.getElementById("pace-dates-form");
const paceDatesSave = document.getElementById("pace-dates-save");
const tripStartInput = document.getElementById("trip-start-input");
const tripEndInput = document.getElementById("trip-end-input");
const monthStatBtn = document.getElementById("month-stat-btn");
const monthStatLabel = document.getElementById("month-stat-label");
const monthStatValue = document.getElementById("month-stat-value");
const countryStatBtn = document.getElementById("country-stat-btn");
const countryStatLabel = document.getElementById("country-stat-label");
const countryStatValue = document.getElementById("country-stat-value");
const rangeFrom = document.getElementById("range-from");
const rangeTo = document.getElementById("range-to");
const rangeResult = document.getElementById("range-result");
const exportCsvBtn = document.getElementById("export-csv-btn");

const sheetBackdrop = document.getElementById("currency-sheet-backdrop");
const sheetTitle = document.getElementById("sheet-title");
const currencySearch = document.getElementById("currency-search");
const currencyListEl = document.getElementById("currency-list");

const MONTH_NAMES = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

// detected location context: { countryCode, location, currency, rate }
let context = loadLastContext() ?? { countryCode: "IL", location: "", currency: "ILS", rate: 1 };

// currency selected for the expense currently being entered (defaults to context, can be overridden)
let selected = { code: context.currency, rate: context.rate };

// in-progress expense
let draft = { category: null, photo: null };

// expense detail / filter drill-down state
let currentExpenseId = null;
let previousScreen = "home";
let currentFilter = null; // { type: 'country'|'month', value }
let editingExpenseId = null; // set when the category screen is opened to edit an existing expense

// ---------- helpers ----------

function formatNumber(n) {
  return (n ?? 0).toLocaleString("he-IL", { maximumFractionDigits: 2 });
}

let toastTimer = null;
function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2000);
}

function formatDay(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const weekday = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"][d.getDay()];
  return `יום ${weekday}, ${d.getDate()} ב${MONTH_NAMES[d.getMonth()]}`;
}

function formatMonth(monthStr) {
  const [year, month] = monthStr.split("-");
  return `${MONTH_NAMES[Number(month) - 1]} ${year}`;
}

function showScreen(name) {
  screens.forEach((el) => el.classList.toggle("active", el.id === `screen-${name}`));
  homeAddBtn.classList.toggle("visible", name === "home");
}

// ---------- location + currency detection ----------

function applySelectedCurrency() {
  const c = getCurrency(selected.code);
  amountSymbol.textContent = c.symbol;
  currencyChipText.textContent = `${c.symbol} ${c.code}`;
}

async function setSelectedCurrency(code) {
  if (code === context.currency) {
    selected = { code, rate: context.rate };
  } else {
    currencyChipText.textContent = "טוען…";
    try {
      const rate = await getRateToILS(code);
      selected = { code, rate };
    } catch {
      selected = { code, rate: 1 };
    }
  }
  applySelectedCurrency();
}

async function refreshLocation() {
  locationText.textContent = "📍 מזהה מיקום…";
  try {
    const { countryCode, location } = await detectLocation();
    const currency = COUNTRY_CURRENCY[countryCode] ?? "USD";
    const rate = await getRateToILS(currency);
    context = { countryCode, location, currency, rate };
    saveLastContext(context);
  } catch {
    // keep last known / default context
  }
  const country = getCountry(context.countryCode);
  locationText.textContent = `📍 ${context.location ? context.location + ", " : ""}${country.name}`;
  selected = { code: context.currency, rate: context.rate };
  applySelectedCurrency();
}

// ---------- currency sheet ----------

function renderCurrencyList(filter = "") {
  const q = filter.trim().toLowerCase();
  const items = CURRENCIES.filter(
    (c) => !q || c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
  );
  currencyListEl.innerHTML = items
    .map(
      (c) => `
      <button type="button" class="currency-row" data-code="${c.code}">
        <span class="cur-symbol">${c.symbol}</span>
        <span class="cur-name">${c.name}</span>
        <span class="cur-code">${c.code}</span>
      </button>`
    )
    .join("");
}

// "draft" = picking currency for the expense being added; "detail" = editing an existing one
let currencySheetTarget = "draft";
// what the shared bottom sheet is currently showing: "currency" | "month" | "country"
let sheetMode = "currency";

function openCurrencySheet(target = "draft") {
  sheetMode = "currency";
  currencySheetTarget = target;
  sheetTitle.hidden = true;
  currencySearch.hidden = false;
  currencySearch.value = "";
  renderCurrencyList();
  sheetBackdrop.classList.add("open");
  setTimeout(() => currencySearch.focus(), 300);
}

function openMonthCountryPicker(mode) {
  sheetMode = mode;
  currencySearch.hidden = true;
  sheetTitle.hidden = false;
  sheetTitle.textContent = mode === "month" ? "בחר חודש" : "בחר מדינה";
  renderPickerList(mode);
  sheetBackdrop.classList.add("open");
}

const EXPORT_FORMATS = [
  { id: "xlsx", label: "Excel (.xlsx)", hint: "כותרות מודגשות, תאריכים אמיתיים — מומלץ" },
  { id: "csv", label: "CSV", hint: "טבלה פשוטה — נפתחת ב-Numbers, Google Sheets ובכל אפליקציה אחרת" },
];

function openExportPicker() {
  sheetMode = "export";
  currencySearch.hidden = true;
  sheetTitle.hidden = false;
  sheetTitle.textContent = "ייצוא טבלה — לאיזה פורמט?";
  currencyListEl.innerHTML = EXPORT_FORMATS.map(
    (f) => `
      <button type="button" class="picker-row export-format-row" data-key="${f.id}">
        <span class="export-format-label">${f.label}</span>
        <span class="export-format-hint">${f.hint}</span>
      </button>`
  ).join("");
  sheetBackdrop.classList.add("open");
}

function closeCurrencySheet() {
  sheetBackdrop.classList.remove("open");
}

// ---------- amount screen ----------

function resetPhotoField() {
  draft.photo = null;
  detailsPhotoInput.value = "";
  detailsPhotoPreview.hidden = true;
  detailsAddPhotoBtn.hidden = false;
  detailsAddPhotoBtn.textContent = "📷 הוסף תמונה";
}

function startNewExpense() {
  draft = { category: null, photo: null };
  amountInput.value = "";
  amountContinue.disabled = true;
  selected = { code: context.currency, rate: context.rate };
  applySelectedCurrency();
  showScreen("amount");
  setTimeout(() => amountInput.focus(), 300);
}

function handleAmountInput() {
  const value = amountInput.value.replace(",", ".");
  amountContinue.disabled = !(Number(value) > 0);
}

function handleAmountContinue() {
  const amountLocal = Number(amountInput.value.replace(",", "."));
  if (!(amountLocal > 0)) return;
  draft.amountLocal = amountLocal;
  draft.currency = selected.code;
  draft.rate = selected.rate;
  showScreen("category");
}

// ---------- category screen ----------

function initCategoryGrid() {
  categoryGrid.innerHTML = CATEGORIES.map(
    (c) => `
    <button type="button" class="cat-tile${c.id === "other" ? " cat-tile-wide" : ""}" data-id="${c.id}">
      <span class="cat-icon">${c.icon}</span>
      <span class="cat-label">${c.label}</span>
    </button>`
  ).join("");

  categoryGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".cat-tile");
    if (!btn) return;

    if (editingExpenseId) {
      const id = editingExpenseId;
      editingExpenseId = null;
      updateExpense(id, { category: btn.dataset.id });
      render();
      openExpenseDetail(id, previousScreen);
      return;
    }

    draft.category = btn.dataset.id;
    draft.paidBy = "me";
    draft.participants = ["me"];
    noteInput.value = "";
    isGroupInput.checked = false;
    splitField.hidden = true;
    excludeInput.checked = false;
    detailsDateInput.value = new Date().toISOString().slice(0, 10);
    resetPhotoField();
    showScreen("details");
    setTimeout(() => noteInput.focus(), 300);
  });
}

// ---------- people / split chips (shared by add-flow and detail-edit) ----------

function addFriend(name, groupId = null) {
  const friends = loadFriends();
  if (name === "me" || friends.some((f) => f.name === name)) return;
  friends.push({ name, groupId });
  saveFriends(friends);
}

function renderPaidByChips(container, selected, onChange) {
  container.innerHTML = getPeopleList()
    .map((name) => `<button type="button" class="chip ${name === selected ? "selected" : ""}" data-name="${name}">${personLabel(name)}</button>`)
    .join("");
  container.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      onChange(chip.dataset.name);
      renderPaidByChips(container, chip.dataset.name, onChange);
    });
  });
}

function renderParticipantsChips(container, selected, onToggle) {
  const addId = `${container.id}-add`;
  container.innerHTML =
    getPeopleList()
      .map((name) => `<button type="button" class="chip ${selected.includes(name) ? "selected" : ""}" data-name="${name}">${personLabel(name)}</button>`)
      .join("") + `<button type="button" class="chip add-chip" id="${addId}">+ הוסף</button>`;

  container.querySelectorAll(".chip:not(.add-chip)").forEach((chip) => {
    chip.addEventListener("click", () => {
      const name = chip.dataset.name;
      const next = selected.includes(name) ? selected.filter((n) => n !== name) : [...selected, name];
      onToggle(next);
      renderParticipantsChips(container, next, onToggle);
    });
  });

  document.getElementById(addId).addEventListener("click", () => {
    const name = prompt("שם המטייל?")?.trim();
    if (!name) return;
    addFriend(name);
    renderParticipantsChips(container, selected, onToggle);
    if (container === participantsChipsEl) {
      renderPaidByChips(paidByChipsEl, draft.paidBy, (n) => (draft.paidBy = n));
    }
  });
}

function renderSplitModeChips(container, selected, onChange) {
  const modes = [
    ["equal", "שווה"],
    ["amount", "סכום"],
    ["percent", "אחוז"],
  ];
  container.innerHTML = modes
    .map(([id, label]) => `<button type="button" class="chip ${id === selected ? "selected" : ""}" data-mode="${id}">${label}</button>`)
    .join("");
  container.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      onChange(chip.dataset.mode);
      renderSplitModeChips(container, chip.dataset.mode, onChange);
    });
  });
}

function computeSplitSum(names, mode, customAmounts, customPercents, total) {
  const isPercent = mode === "percent";
  return names.reduce((sum, name) => {
    const v = isPercent ? customPercents[name] ?? 100 / names.length : customAmounts[name] ?? total / names.length;
    return sum + v;
  }, 0);
}

function renderSplitAmounts(container, state, onInputChange) {
  const { names, mode, total, customAmounts, customPercents } = state;
  if (mode === "equal" || !names.length) {
    container.innerHTML = "";
    return;
  }
  const isPercent = mode === "percent";

  container.innerHTML = `
    <div class="split-amount-rows">
      ${names
        .map((name) => {
          const val = round2(isPercent ? customPercents[name] ?? 100 / names.length : customAmounts[name] ?? total / names.length);
          return `
        <div class="split-amount-row">
          <span>${personLabel(name)}</span>
          <div class="split-amount-input-wrap">
            <input type="number" step="0.01" min="0" class="split-amount-input" data-name="${name}" value="${val}" />
            <span>${isPercent ? "%" : "₪"}</span>
          </div>
        </div>`;
        })
        .join("")}
    </div>
    <p class="split-amount-hint" id="${container.id}-hint"></p>
  `;

  const updateHint = () => {
    const sum = round2(computeSplitSum(names, mode, customAmounts, customPercents, total));
    const target = isPercent ? 100 : total;
    const hint = document.getElementById(`${container.id}-hint`);
    hint.textContent = isPercent ? `סה"כ: ${sum}%` : `סה"כ: ${formatNumber(sum)} מתוך ${formatNumber(total)} ₪`;
    hint.classList.toggle("warn", Math.abs(sum - target) > 0.5);
  };
  updateHint();

  container.querySelectorAll(".split-amount-input").forEach((input) => {
    input.addEventListener("input", () => {
      const val = Number(input.value) || 0;
      if (isPercent) customPercents[input.dataset.name] = val;
      else customAmounts[input.dataset.name] = val;

      // with exactly 2 people on a percentage split, fill in the other person's
      // share automatically — no reason to make them type the complement
      if (isPercent && names.length === 2) {
        const otherName = names.find((n) => n !== input.dataset.name);
        const complement = round2(Math.max(0, Math.min(100, 100 - val)));
        customPercents[otherName] = complement;
        const otherInput = container.querySelector(`.split-amount-input[data-name="${otherName}"]`);
        if (otherInput) otherInput.value = complement;
      }

      onInputChange();
      updateHint();
    });
  });
}

// ---------- details screen (add flow) ----------

function refreshSplitAmounts() {
  renderSplitAmounts(
    splitAmountsEl,
    {
      names: draft.participants,
      mode: draft.splitMode,
      total: draft.amountLocal * draft.rate,
      customAmounts: draft.customAmounts,
      customPercents: draft.customPercents,
    },
    () => {}
  );
}

isGroupInput.addEventListener("change", () => {
  splitField.hidden = !isGroupInput.checked;
  if (!isGroupInput.checked) return;
  const last = loadLastSplit();
  draft.paidBy = last.paidBy || "me";
  draft.participants = last.participants?.length ? last.participants : ["me"];
  draft.splitMode = "equal";
  draft.customAmounts = {};
  draft.customPercents = {};
  renderPaidByChips(paidByChipsEl, draft.paidBy, (name) => (draft.paidBy = name));
  renderParticipantsChips(participantsChipsEl, draft.participants, (list) => {
    draft.participants = list;
    refreshSplitAmounts();
  });
  renderSplitModeChips(splitModeChipsEl, draft.splitMode, (mode) => {
    draft.splitMode = mode;
    refreshSplitAmounts();
  });
  refreshSplitAmounts();
});

detailsAddPhotoBtn.addEventListener("click", () => detailsPhotoInput.click());
detailsPhotoPreview.addEventListener("click", () => detailsPhotoInput.click());
detailsPhotoInput.addEventListener("change", async () => {
  const file = detailsPhotoInput.files[0];
  if (!file) return;
  draft.photo = await fileToCompressedDataUrl(file);
  detailsPhotoPreview.src = draft.photo;
  detailsPhotoPreview.hidden = false;
  detailsAddPhotoBtn.textContent = "📷 החלף תמונה";
});

async function handleDetailsDone() {
  const isGroup = isGroupInput.checked;
  if (isGroup) saveLastSplit({ paidBy: draft.paidBy, participants: draft.participants });

  const amountILS = round2(draft.amountLocal * draft.rate);
  const participants = isGroup
    ? resolveParticipants(draft.participants, draft.splitMode, amountILS, draft.customAmounts, draft.customPercents)
    : [];

  await addExpense({
    date: detailsDateInput.value || new Date().toISOString().slice(0, 10),
    location: context.location,
    country: context.countryCode,
    category: draft.category,
    note: noteInput.value,
    amountLocal: draft.amountLocal,
    currencyLocal: draft.currency,
    amountILS,
    isGroup,
    paidBy: draft.paidBy,
    participants,
    excludeFromTotal: excludeInput.checked,
    photo: draft.photo,
  });

  render();
  showScreen("home");
}

// ---------- shared: expense row rendering + swipe-to-delete ----------

function expenseItemHtml(e) {
  const cat = getCategory(e.category);
  const country = getCountry(e.country);
  const participantCount = e.participants?.length || e.groupSize || 0;
  const paidBy = e.paidBy || "me";
  const paidVerb = paidBy === "me" ? "שילמתי" : "שילם/ה";
  const groupLine = e.isGroup
    ? `<span class="expense-group">${personLabel(paidBy)} ${paidVerb} על ${participantCount} אנשים, העלות שלך: ${formatNumber(myShare(e))} ₪ (מתוך ${formatNumber(e.amountILS)} ₪ בסה"כ)</span>`
    : "";
  const excludedBadge = e.excludeFromTotal ? `<span class="excluded-badge">לא נכלל בסה"כ</span>` : "";
  return `
    <li class="expense-row-wrap">
      <div class="delete-backdrop"><span>🗑️</span></div>
      <div class="expense-item" data-id="${e.id}">
        <span class="expense-icon">${cat.icon}</span>
        <span class="expense-info">
          <span class="expense-note">${e.note || cat.label}</span>
          <span class="expense-meta-row">
            <span class="expense-meta">${cat.label} · ${e.location ? e.location + " · " : ""}${country.name}</span>
            <span class="expense-amount">
              <span class="amount-ils">${formatNumber(myShare(e))}₪</span>
              ${e.currencyLocal !== "ILS" ? `<span class="amount-local">${formatNumber(e.amountLocal)} ${e.currencyLocal}</span>` : ""}
            </span>
          </span>
          ${groupLine}
          ${excludedBadge}
        </span>
      </div>
    </li>
  `;
}

function daysListHtml(days) {
  return days
    .map(
      (day) => `
        <div class="day-group">
          <div class="day-header">
            <span>${formatDay(day.date)}</span>
            <span>${formatNumber(day.total)} ₪</span>
          </div>
          <ul class="expenses-list">${day.items.map(expenseItemHtml).join("")}</ul>
        </div>
      `
    )
    .join("");
}

function attachSwipeHandlers(container, { onOpen, onDelete }) {
  container.querySelectorAll(".expense-item").forEach((itemEl) => {
    let startX = 0;
    let dx = 0;
    let dragging = false;
    let moved = false;

    itemEl.addEventListener("pointerdown", (e) => {
      startX = e.clientX;
      dx = 0;
      dragging = true;
      moved = false;
      itemEl.style.transition = "none";
      itemEl.setPointerCapture(e.pointerId);
    });

    itemEl.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      dx = e.clientX - startX;
      if (Math.abs(dx) > 6) moved = true;
      if (dx > 0) itemEl.style.transform = `translateX(${dx}px)`;
    });

    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      itemEl.style.transition = "transform 0.25s ease, opacity 0.25s ease";
      if (dx > 90) {
        itemEl.style.transform = "translateX(120%)";
        itemEl.style.opacity = "0";
        setTimeout(() => onDelete(itemEl.dataset.id), 220);
      } else {
        itemEl.style.transform = "translateX(0)";
      }
      dx = 0;
    };

    itemEl.addEventListener("pointerup", endDrag);
    itemEl.addEventListener("pointercancel", endDrag);

    itemEl.addEventListener("click", () => {
      if (moved) return;
      onOpen(itemEl.dataset.id);
    });
  });
}

function afterDelete() {
  render();
  if (currentFilter) openFilterScreen(currentFilter.type, currentFilter.value, { keepScroll: true });
}

// ---------- home screen ----------

function renderList() {
  const days = getExpensesGroupedByDay();
  daysList.innerHTML = daysListHtml(days);
  attachSwipeHandlers(daysList, {
    onOpen: (id) => openExpenseDetail(id, "home"),
    onDelete: (id) => {
      deleteExpense(id);
      afterDelete();
    },
  });

  const totalCount = days.reduce((sum, d) => sum + d.items.length, 0);
  emptyState.style.display = totalCount ? "none" : "block";
  expenseCount.textContent = totalCount ? `${totalCount} רשומות` : "";
}

function renderPace() {
  const total = getGrandTotal();
  paceTotal.textContent = `${formatNumber(total)} ₪`;

  const trip = loadTripDates();
  paceDatesToggle.textContent = trip?.start && trip?.end ? "📅 עריכת תאריכי טיול" : "📅 הגדרת תאריכי טיול";

  if (!trip?.start || !trip?.end) {
    paceStats.innerHTML = `<p class="pace-hint">הגדר תאריכי טיול כדי לראות קצב הוצאות וימי טיול</p>`;
    return;
  }

  const start = new Date(trip.start + "T00:00:00");
  const end = new Date(trip.end + "T00:00:00");
  const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00");

  const totalDays = Math.max(1, Math.round((end - start) / 86400000) + 1);
  const elapsedDays = Math.min(
    totalDays,
    Math.max(1, Math.round((Math.min(today, end) - start) / 86400000) + 1)
  );
  const dailyAvg = total / elapsedDays;
  const projected = dailyAvg * totalDays;

  paceStats.innerHTML = `
    <div class="pace-stat"><span>📅</span><span>${elapsedDays} מתוך ${totalDays} ימים</span></div>
    <div class="pace-stat"><span>📊</span><span>ממוצע: ${formatNumber(dailyAvg)} ₪ ליום</span></div>
    <div class="pace-stat"><span>🔮</span><span>בקצב הנוכחי תסיים ב-${formatNumber(projected)} ₪</span></div>
  `;
}

function renderSummary() {
  statToday.textContent = `${formatNumber(getTotalToday())} ₪`;
  renderPace();

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthTotals = Object.fromEntries(getTotalsByMonth());
  monthStatLabel.textContent = formatMonth(currentMonth);
  monthStatValue.textContent = `${formatNumber(monthTotals[currentMonth] ?? 0)} ₪`;

  const countryTotals = Object.fromEntries(getTotalsByCountry());
  const currentCountry = getCountry(context.countryCode);
  countryStatLabel.textContent = currentCountry.name;
  countryStatValue.textContent = `${formatNumber(countryTotals[context.countryCode] ?? 0)} ₪`;
}

function renderPickerList(mode) {
  const entries = mode === "month" ? getTotalsByMonth() : getTotalsByCountry();
  currencyListEl.innerHTML =
    entries
      .map(([key, amount]) => {
        const label = mode === "month" ? formatMonth(key) : getCountry(key).name;
        return `<button type="button" class="picker-row" data-key="${key}"><span>${label}</span><span class="picker-value">${formatNumber(amount)} ₪</span></button>`;
      })
      .join("") || `<p class="empty-state">אין נתונים עדיין</p>`;
}

function renderRange() {
  if (!rangeFrom.value || !rangeTo.value) {
    rangeResult.textContent = "";
    return;
  }
  const total = getTotalForRange(rangeFrom.value, rangeTo.value);
  rangeResult.textContent = `${formatNumber(total)} ₪`;
}

// ---------- settle-up (friends) tab ----------

function removeFriend(name) {
  const balance = getFriendBalances()[name] ?? 0;
  if (Math.abs(balance) > 0.01) {
    const owes = balance < 0 ? `${personLabel(name)} חייב/ת ${formatNumber(-balance)} ₪` : `מגיע ל${personLabel(name)} ${formatNumber(balance)} ₪`;
    if (!confirm(`יש חוב פתוח: ${owes}. להסיר בכל זאת?`)) return;
  }
  saveFriends(loadFriends().filter((f) => f.name !== name));
  renderFriendsTab();
}

function addGroup(name) {
  const groups = loadGroups();
  if (!name || groups.some((g) => g.name === name)) return;
  groups.push({ id: crypto.randomUUID(), name });
  saveGroups(groups);
}

function removeGroup(id) {
  saveGroups(loadGroups().filter((g) => g.id !== id));
  // members of a removed group become individuals again, not deleted
  saveFriends(loadFriends().map((f) => (f.groupId === id ? { ...f, groupId: null } : f)));
  renderFriendsTab();
}

function buildInviteLink(groupId, groupName) {
  const url = new URL(location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("join", groupId);
  url.searchParams.set("name", groupName);
  if (isRemoteEnabled()) url.searchParams.set("api", getApiUrl());
  return url.toString();
}

function copyInviteLink(groupId, groupName) {
  const link = buildInviteLink(groupId, groupName);
  navigator.clipboard
    ?.writeText(link)
    .then(() => showToast("קישור הועתק"))
    .catch(() => {
      // clipboard blocked/unavailable — fall back to showing the link directly
      const note = isRemoteEnabled()
        ? "קישור ההזמנה:"
        : "קישור ההזמנה. שים לב: הוא יעבוד רק אחרי שתארח את העמוד אונליין — כרגע הוא רץ מקומית בלבד:";
      prompt(note, link);
    });
}

// my net position vs. this group's members specifically, derived from the
// already-simplified transfer graph (so it accounts for the whole trip's debts,
// not just expenses tagged to this group — there's no such tag).
function getMyGroupBalance(groupId) {
  const memberNames = new Set(loadFriends().filter((f) => f.groupId === groupId).map((f) => f.name));
  const transfers = simplifyDebts(getFriendBalances());
  let net = 0;
  for (const t of transfers) {
    if (t.from === "me" && memberNames.has(t.to)) net -= t.amount;
    if (t.to === "me" && memberNames.has(t.from)) net += t.amount;
  }
  return round2(net);
}

function renderGroupsList() {
  const groups = loadGroups();
  const friends = loadFriends();

  groupsListEl.innerHTML = groups.length
    ? groups
        .map((g) => {
          const count = friends.filter((f) => f.groupId === g.id).length;
          const myBalance = getMyGroupBalance(g.id);
          const isZero = Math.abs(myBalance) <= 0.01;
          const cls = isZero ? "balance-zero" : myBalance > 0 ? "balance-positive" : "balance-negative";
          const balanceText = isZero ? "מאופס ₪0" : `${myBalance > 0 ? "+" : ""}${formatNumber(myBalance)} ₪`;
          return `
          <div class="group-list-row">
            <button type="button" class="group-name-btn" data-id="${g.id}">
              <span class="group-name-text">
                <span class="group-name-main">${g.name}</span>
                <span class="group-name-meta">${count} משתתפים · <span class="${cls}">${balanceText}</span></span>
              </span>
              <span class="group-name-chevron">‹</span>
            </button>
            <span class="group-list-actions">
              <button type="button" class="invite-link-btn" data-id="${g.id}" data-name="${g.name}" aria-label="קישור הזמנה">🔗</button>
              <button type="button" data-id="${g.id}" aria-label="הסר קבוצה">✕</button>
            </span>
          </div>`;
        })
        .join("")
    : `<p class="settle-empty">אין קבוצות עדיין</p>`;

  groupsListEl.querySelectorAll(".group-name-btn").forEach((btn) => {
    btn.addEventListener("click", () => openGroupScreen(btn.dataset.id));
  });
  groupsListEl.querySelectorAll(".invite-link-btn").forEach((btn) => {
    btn.addEventListener("click", () => copyInviteLink(btn.dataset.id, btn.dataset.name));
  });
  groupsListEl.querySelectorAll("button[aria-label='הסר קבוצה']").forEach((btn) => {
    btn.addEventListener("click", () => removeGroup(btn.dataset.id));
  });

  addFriendGroupSelect.innerHTML =
    `<option value="">ללא קבוצה</option>` +
    groups.map((g) => `<option value="${g.id}">${g.name}</option>`).join("") +
    `<option value="__new__">➕ קבוצה חדשה…</option>`;
}

function openGroupScreen(groupId) {
  const group = loadGroups().find((g) => g.id === groupId);
  if (!group) return;

  const members = loadFriends().filter((f) => f.groupId === groupId);
  const balances = getFriendBalances();

  groupScreenTitle.textContent = group.name;
  groupScreenMembers.innerHTML = members.map((f) => balanceRowHtml(f.name, balances)).join("");
  groupScreenEmpty.hidden = members.length > 0;

  showScreen("group");
}

function renderAppTitle() {
  const tripName = loadGroupName();
  appTitleBtn.textContent = tripName ? `הוצאות הטיול · ${tripName}` : "הוצאות הטיול";
}

function renderFriendsTab() {
  renderAppTitle();
  renderGroupsList();

  const groups = loadGroups();
  const friends = loadFriends();

  const friendChipHtml = (f) => `
        <span class="friend-chip">
          ${avatarHtml(f.name)}
          ${f.name}
          <button type="button" data-name="${f.name}" aria-label="הסר">✕</button>
        </span>`;

  let html = "";
  for (const g of groups) {
    const members = friends.filter((f) => f.groupId === g.id);
    if (!members.length) continue;
    html += `<div class="friends-group-heading">${g.name}</div>` + members.map(friendChipHtml).join("");
  }
  const ungrouped = friends.filter((f) => !f.groupId);
  if (ungrouped.length) {
    if (groups.length) html += `<div class="friends-group-heading">ללא קבוצה</div>`;
    html += ungrouped.map(friendChipHtml).join("");
  }

  friendsChipsEl.innerHTML = html || `<p class="settle-empty">עדיין לא הוספת מטיילים</p>`;

  friendsChipsEl.querySelectorAll("button[data-name]").forEach((btn) => {
    btn.addEventListener("click", () => removeFriend(btn.dataset.name));
  });

  renderSettle();
}

function markSettled(from, to, amount) {
  const settlements = loadSettlements();
  settlements.push({ from, to, amount, date: new Date().toISOString().slice(0, 10) });
  saveSettlements(settlements);
  renderSettle();
}

function copyAmount(amount) {
  navigator.clipboard
    ?.writeText(String(amount))
    .then(() => showToast("הסכום הועתק"))
    .catch(() => {});
}

function balanceRowHtml(name, balances) {
  const amount = round2(balances[name] ?? 0);
  const isZero = Math.abs(amount) <= 0.01;
  const cls = isZero ? "balance-zero" : amount > 0 ? "balance-positive" : "balance-negative";
  const text = isZero ? "מאופס ₪0" : `${amount > 0 ? "+" : ""}${formatNumber(amount)} ₪`;
  return `
        <div class="transfer-row balance-row">
          <span class="who">${avatarHtml(name)} ${personLabel(name)}</span>
          <span class="${cls}">${text}</span>
        </div>`;
}

function renderSettle() {
  const balances = getFriendBalances();
  const transfers = simplifyDebts(balances);

  settleTransfersEl.innerHTML = transfers.length
    ? transfers
        .map(
          (t, i) => `
        <div class="transfer-row">
          <div class="transfer-main">
            <div class="transfer-people">
              <span class="who">${avatarHtml(t.from)} ${personLabel(t.from)}</span>
              <span class="transfer-arrow">חייב ל</span>
              <span class="who">${avatarHtml(t.to)} ${personLabel(t.to)}</span>
            </div>
            <span class="transfer-amount">${formatNumber(t.amount)} ₪</span>
          </div>
          <div class="transfer-actions">
            <button type="button" class="settle-btn" data-i="${i}">✓ קוזז</button>
            <button type="button" class="quickpay-btn" data-amount="${t.amount}">📋 העתקת הסכום</button>
          </div>
        </div>`
        )
        .join("")
    : `<p class="settle-empty">הכל מסודר 🎉</p>`;

  settleTransfersEl.querySelectorAll(".settle-btn").forEach((btn) => {
    const t = transfers[Number(btn.dataset.i)];
    btn.addEventListener("click", () => markSettled(t.from, t.to, t.amount));
  });
  settleTransfersEl.querySelectorAll(".quickpay-btn").forEach((btn) => {
    btn.addEventListener("click", () => copyAmount(btn.dataset.amount));
  });

  const groups = loadGroups();
  const friends = loadFriends();

  let html = balanceRowHtml("me", balances);
  for (const g of groups) {
    const members = friends.filter((f) => f.groupId === g.id);
    if (!members.length) continue;
    html += `<div class="balance-section-heading">${g.name}</div>` + members.map((f) => balanceRowHtml(f.name, balances)).join("");
  }
  const ungrouped = friends.filter((f) => !f.groupId);
  if (ungrouped.length) {
    html += `<div class="balance-section-heading">אנשים בודדים</div>` + ungrouped.map((f) => balanceRowHtml(f.name, balances)).join("");
  }

  settleBalancesEl.innerHTML = html;
}

function handleAddFriend() {
  const name = addFriendInput.value.trim();
  if (!name || name === "me") return;

  let groupId = addFriendGroupSelect.value || null;
  if (groupId === "__new__") {
    const groupName = newGroupNameInput.value.trim();
    if (!groupName) {
      newGroupNameInput.focus();
      return;
    }
    addGroup(groupName);
    groupId = loadGroups().find((g) => g.name === groupName)?.id ?? null;
  }

  addFriend(name, groupId);
  addFriendInput.value = "";
  newGroupNameInput.value = "";
  newGroupNameInput.hidden = true;
  renderFriendsTab();
}

function render() {
  renderList();
  renderSummary();
  renderRange();
  renderFriendsTab();
  totalAmountEl.textContent = `${formatNumber(getGrandTotal())} ₪`;
}

function handleTabClick(e) {
  const tab = e.target.dataset.tab;
  if (!tab) return;
  tabButtons.forEach((b) => b.classList.toggle("selected", b === e.target));
  tabList.hidden = tab !== "list";
  tabSummary.hidden = tab !== "summary";
  tabSettle.hidden = tab !== "settle";
}

async function syncGroupMembersFromRemote() {
  if (!isRemoteEnabled()) return;
  try {
    const members = await fetchRemoteGroupMembers();
    const groups = loadGroups();
    const friends = loadFriends();
    let groupsChanged = false;
    let friendsChanged = false;

    for (const m of members) {
      if (!m.groupId || !m.memberName || m.memberName === "me") continue;
      if (!groups.some((g) => g.id === m.groupId)) {
        groups.push({ id: m.groupId, name: m.groupName || "קבוצה" });
        groupsChanged = true;
      }
      if (!friends.some((f) => f.name === m.memberName)) {
        friends.push({ name: m.memberName, groupId: m.groupId });
        friendsChanged = true;
      }
    }
    if (groupsChanged) saveGroups(groups);
    if (friendsChanged) saveFriends(friends);
  } catch {
    // best-effort — a failed group sync shouldn't block the rest of the app
  }
}

async function handleRefresh() {
  refreshBtn.classList.add("spinning");
  try {
    await syncFromRemote();
    await syncGroupMembersFromRemote();
    render();
  } finally {
    refreshBtn.classList.remove("spinning");
  }
}

// ---------- expense detail screen ----------

function openExpenseDetail(id, cameFrom) {
  const e = getExpenseById(id);
  if (!e) return;
  currentExpenseId = id;
  previousScreen = cameFrom;

  const cat = getCategory(e.category);
  const country = getCountry(e.country);

  expenseDetailBody.innerHTML = `
    <div class="detail-hero">
      <span class="detail-icon">${cat.icon}</span>
      <div class="detail-amount-row">
        <input type="number" step="0.01" min="0" class="detail-amount-input" id="detail-amount-input" value="${round2(e.amountILS)}" />
        <span class="detail-amount-symbol">₪</span>
      </div>
      <button type="button" class="detail-currency-chip" id="detail-currency-btn">
        ${formatNumber(e.amountLocal)} ${getCurrency(e.currencyLocal).symbol} ${e.currencyLocal} ‹
      </button>
    </div>

    <div class="detail-rows">
      <div class="detail-row">
        <span>תאריך</span>
        <input type="date" id="detail-date-input" value="${e.date}" lang="he" />
      </div>
      <div class="detail-row">
        <span>מדינה</span>
        <span>${country.flag} ${country.name}</span>
      </div>
      <button type="button" class="detail-row detail-row-btn" id="detail-category-row">
        <span>קטגוריה</span>
        <span>${cat.icon} ${cat.label} ‹</span>
      </button>
      <div class="detail-row">
        <span>מיקום</span>
        <input type="text" id="detail-location-input" value="${e.location}" placeholder="מיקום" />
      </div>
      <div class="detail-row">
        <span>פירוט</span>
        <input type="text" id="detail-note-input" value="${e.note}" placeholder="פירוט" />
      </div>
      <div class="detail-row">
        <span>קניה קבוצתית</span>
        <input type="checkbox" id="detail-group-toggle" ${e.isGroup ? "checked" : ""} />
      </div>
      <div class="detail-row">
        <span>נכלל בסה"כ</span>
        <input type="checkbox" id="detail-include-toggle" ${e.excludeFromTotal ? "" : "checked"} />
      </div>
    </div>

    ${e.isGroup
      ? `<div class="split-field">
          <div class="split-block">
            <span class="split-label">מי שילם?</span>
            <div class="chips-row" id="detail-paid-by-chips"></div>
          </div>
          <div class="split-block">
            <span class="split-label">מי משתתף?</span>
            <div class="chips-row" id="detail-participants-chips"></div>
          </div>
        </div>`
      : ""}

    ${e.photo
      ? `<img class="detail-photo" id="expense-photo-preview" src="${e.photo}" alt="תמונה מצורפת" />`
      : `<button type="button" class="add-photo-btn" id="expense-add-photo-btn">📷 הוסף תמונה</button>`}

    <button type="button" class="destructive-btn" id="expense-delete-btn">מחק הוצאה</button>
  `;

  const amountInputEl = document.getElementById("detail-amount-input");
  resizeAmountInput(amountInputEl);
  amountInputEl.addEventListener("input", () => resizeAmountInput(amountInputEl));

  if (e.isGroup) {
    const paidByEl = document.getElementById("detail-paid-by-chips");
    const participantsEl = document.getElementById("detail-participants-chips");
    const currentNames = (e.participants ?? []).map((p) => (typeof p === "object" ? p.name : p));
    renderPaidByChips(paidByEl, e.paidBy || "me", (name) => {
      updateExpense(id, { paidBy: name });
      render();
    });
    renderParticipantsChips(participantsEl, currentNames, (names) => {
      // editing the split from the detail screen always resolves to an equal split;
      // custom amount/percent splits are only set up at creation time
      updateExpense(id, { participants: resolveParticipants(names, "equal", e.amountILS) });
      render();
    });
  }

  showScreen("expense");
}

function resizeAmountInput(el) {
  el.style.width = `${Math.max(1.5, el.value.length)}ch`;
}

expenseDetailBody.addEventListener("click", (e) => {
  if (e.target.closest("#expense-add-photo-btn") || e.target.closest("#expense-photo-preview")) {
    expensePhotoInput.click();
  }
  if (e.target.closest("#detail-category-row")) {
    editingExpenseId = currentExpenseId;
    showScreen("category");
  }
  if (e.target.closest("#detail-currency-btn")) {
    openCurrencySheet("detail");
  }
  if (e.target.closest("#expense-delete-btn")) {
    if (!confirm("למחוק את ההוצאה?")) return;
    deleteExpense(currentExpenseId);
    afterDelete();
    showScreen(previousScreen);
  }
});

expenseDetailBody.addEventListener("change", (e) => {
  const id = currentExpenseId;
  if (!id) return;

  if (e.target.id === "detail-date-input") {
    updateExpense(id, { date: e.target.value });
  } else if (e.target.id === "detail-location-input") {
    updateExpense(id, { location: e.target.value.trim() });
  } else if (e.target.id === "detail-note-input") {
    updateExpense(id, { note: e.target.value.trim() });
  } else if (e.target.id === "detail-amount-input") {
    updateExpense(id, { amountILS: round2(e.target.value) });
  } else if (e.target.id === "detail-group-toggle") {
    const isGroup = e.target.checked;
    const patch = { isGroup };
    const current = getExpenseById(id);
    if (isGroup && !current.participants?.length) {
      const last = loadLastSplit();
      const names = last.participants?.length ? last.participants : ["me"];
      patch.paidBy = last.paidBy || "me";
      patch.participants = resolveParticipants(names, "equal", current.amountILS);
    }
    updateExpense(id, patch);
    render();
    openExpenseDetail(id, previousScreen);
    return;
  } else if (e.target.id === "detail-include-toggle") {
    updateExpense(id, { excludeFromTotal: !e.target.checked });
  } else {
    return;
  }
  render();
});

expensePhotoInput.addEventListener("change", async () => {
  const file = expensePhotoInput.files[0];
  if (!file || !currentExpenseId) return;
  const dataUrl = await fileToCompressedDataUrl(file);
  updateExpense(currentExpenseId, { photo: dataUrl });
  expensePhotoInput.value = "";
  openExpenseDetail(currentExpenseId, previousScreen);
});

// ---------- filter (drill-down) screen ----------

function openFilterScreen(type, value) {
  currentFilter = { type, value };
  const filterFn = type === "country" ? (e) => e.country === value : (e) => e.date.slice(0, 7) === value;
  const days = getExpensesGroupedByDay(filterFn);

  filterTitle.textContent = type === "country" ? getCountry(value).name : formatMonth(value);
  const total = days.reduce((sum, d) => sum + d.total, 0);
  filterTotal.textContent = `${formatNumber(total)} ₪`;

  if (type === "country") {
    const pace = getCountryPace(value);
    filterCountryPace.innerHTML = pace
      ? `
        <div class="pace-stat"><span>📅</span><span>${pace.days} ימים במדינה</span></div>
        <div class="pace-stat"><span>📊</span><span>ממוצע יומי: ${formatNumber(pace.dailyAvg)} ₪</span></div>
        <div class="pace-stat"><span>📆</span><span>ממוצע חודשי: ${formatNumber(pace.monthlyAvg)} ₪</span></div>
      `
      : "";
  } else {
    filterCountryPace.innerHTML = "";
  }

  filterDaysList.innerHTML = daysListHtml(days);
  attachSwipeHandlers(filterDaysList, {
    onOpen: (id) => openExpenseDetail(id, "filter"),
    onDelete: (id) => {
      deleteExpense(id);
      afterDelete();
    },
  });

  filterEmptyState.hidden = days.length > 0;
  showScreen("filter");
}

// ---------- wire up ----------

initCategoryGrid();
applySelectedCurrency();

amountInput.addEventListener("input", handleAmountInput);
amountInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !amountContinue.disabled) handleAmountContinue();
});
amountContinue.addEventListener("click", handleAmountContinue);
amountHomeBtn.addEventListener("click", () => {
  render();
  showScreen("home");
});

categoryBackBtn.addEventListener("click", () => {
  if (editingExpenseId) {
    const id = editingExpenseId;
    editingExpenseId = null;
    openExpenseDetail(id, previousScreen);
    return;
  }
  showScreen("amount");
});
detailsBackBtn.addEventListener("click", () => showScreen("category"));
detailsDone.addEventListener("click", handleDetailsDone);

expenseBackBtn.addEventListener("click", () => showScreen(previousScreen));
filterBackBtn.addEventListener("click", () => {
  currentFilter = null;
  showScreen("home");
});
groupScreenBackBtn.addEventListener("click", () => showScreen("home"));
filterTitle.addEventListener("click", () => {
  if (!currentFilter) return;
  const { type, value } = currentFilter;
  const options = (type === "country" ? getTotalsByCountry() : getTotalsByMonth()).map(([key]) => key);
  if (options.length < 2) return;
  const nextIndex = (options.indexOf(value) + 1) % options.length;
  openFilterScreen(type, options[nextIndex]);
});

homeAddBtn.addEventListener("click", startNewExpense);
refreshBtn.addEventListener("click", handleRefresh);
document.querySelector(".tabs").addEventListener("click", handleTabClick);
monthStatBtn.addEventListener("click", () => openMonthCountryPicker("month"));
countryStatBtn.addEventListener("click", () => openMonthCountryPicker("country"));
rangeFrom.addEventListener("change", renderRange);
rangeTo.addEventListener("change", renderRange);
exportCsvBtn.addEventListener("click", openExportPicker);

addFriendBtn.addEventListener("click", handleAddFriend);
addFriendInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleAddFriend();
});
addFriendGroupSelect.addEventListener("change", () => {
  newGroupNameInput.hidden = addFriendGroupSelect.value !== "__new__";
  if (!newGroupNameInput.hidden) newGroupNameInput.focus();
});
newGroupNameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleAddFriend();
});

appTitleBtn.addEventListener("click", () => {
  const name = prompt("שם הטיול:", loadGroupName())?.trim();
  if (name === undefined) return;
  saveGroupName(name);
  renderAppTitle();
});

paceDatesToggle.addEventListener("click", () => {
  const trip = loadTripDates();
  tripStartInput.value = trip?.start ?? "";
  tripEndInput.value = trip?.end ?? "";
  paceDatesForm.hidden = !paceDatesForm.hidden;
});
paceDatesSave.addEventListener("click", () => {
  if (!tripStartInput.value || !tripEndInput.value) return;
  saveTripDates({ start: tripStartInput.value, end: tripEndInput.value });
  paceDatesForm.hidden = true;
  renderPace();
});

currencyChip.addEventListener("click", () => openCurrencySheet("draft"));
sheetBackdrop.addEventListener("click", (e) => {
  if (e.target === sheetBackdrop) closeCurrencySheet();
});
currencySearch.addEventListener("input", () => renderCurrencyList(currencySearch.value));
currencyListEl.addEventListener("click", async (e) => {
  if (sheetMode === "export") {
    const row = e.target.closest(".picker-row");
    if (!row) return;
    closeCurrencySheet();
    const expenses = getExpenses();
    if (row.dataset.key === "xlsx") exportExpensesToXlsx(expenses);
    else exportExpensesToCsv(expenses);
    return;
  }

  if (sheetMode === "month" || sheetMode === "country") {
    const row = e.target.closest(".picker-row");
    if (!row) return;
    const key = row.dataset.key;
    closeCurrencySheet();
    openFilterScreen(sheetMode, key);
    return;
  }

  const row = e.target.closest(".currency-row");
  if (!row) return;
  const code = row.dataset.code;
  closeCurrencySheet();

  if (currencySheetTarget === "detail" && currentExpenseId) {
    const id = currentExpenseId;
    const exp = getExpenseById(id);
    let rate = 1;
    try {
      rate = code === "ILS" ? 1 : await getRateToILS(code);
    } catch {
      rate = exp.amountLocal ? exp.amountILS / exp.amountLocal : 1;
    }
    updateExpense(id, { currencyLocal: code, amountILS: round2(exp.amountLocal * rate) });
    render();
    openExpenseDetail(id, previousScreen);
    return;
  }

  setSelectedCurrency(code);
});

refreshBtn.style.display = isRemoteEnabled() ? "" : "none";

async function handleJoinFromUrl() {
  const params = new URLSearchParams(location.search);
  const groupId = params.get("join");
  if (!groupId) return false;

  const groupName = params.get("name") || "קבוצה";
  const apiParam = params.get("api");
  if (apiParam) setApiUrlOverride(apiParam);

  // strip the join params so refreshing the page doesn't re-trigger this
  const clean = new URL(location.href);
  clean.search = "";
  history.replaceState({}, "", clean.toString());

  try {
    const myName = prompt(`הצטרפות לקבוצה "${groupName}" — מה השם שלך?`)?.trim();
    if (!myName) return true;

    const groups = loadGroups();
    if (!groups.some((g) => g.id === groupId)) {
      groups.push({ id: groupId, name: groupName });
      saveGroups(groups);
    }

    if (isRemoteEnabled()) {
      refreshBtn.style.display = "";
      await joinRemoteGroup(groupId, groupName, myName);
      await syncGroupMembersFromRemote();
    }

    render();
    alert(`הצטרפת לקבוצה "${groupName}"!`);
  } catch {
    // a blocked/unsupported dialog shouldn't leave the app stuck with no screen shown
  }
  return true;
}

render();
handleJoinFromUrl()
  .then((joined) => showScreen(joined ? "home" : "amount"))
  .catch(() => showScreen("amount"));
refreshLocation();
if (isRemoteEnabled()) handleRefresh();
