import { CATEGORIES, getCategory } from "./categories.js";
import { COUNTRY_CURRENCY, CURRENCIES, getCurrency, getRateToILS } from "./currency.js";
import { COUNTRIES, getCountry } from "./countries.js";
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
  renameParticipant,
  round2,
  simplifyDebts,
  syncFromRemote,
  updateExpense,
} from "./expenses.js";
import { fetchRemoteGroupMembers, isRemoteEnabled, joinRemoteGroup } from "./remote.js";
import { setApiUrlOverride } from "./config.js";
import { exportExpensesToCsv, exportExpensesToXlsx } from "./export.js";
import {
  loadDisplayCurrency,
  loadFriends,
  loadGroupName,
  loadGroups,
  loadLastContext,
  loadLastSplit,
  loadSettlements,
  loadTripBudget,
  loadTripDates,
  saveDisplayCurrency,
  saveFriends,
  saveGroupName,
  saveGroups,
  saveLastContext,
  saveLastSplit,
  saveSettlements,
  saveTripBudget,
  saveTripDates,
} from "./storage.js";
import { avatarColor, avatarHtml, getPeopleList, personLabel, resolveParticipants } from "./split.js";

// ---------- elements ----------

const screens = document.querySelectorAll(".screen");

const amountHomeBtn = document.getElementById("amount-home-btn");
const amountInput = document.getElementById("amount-input");
const amountSymbol = document.getElementById("amount-symbol");
const amountDisplay = document.getElementById("amount-display");
const entryTypeToggle = document.getElementById("entry-type-toggle");
const amountContinue = document.getElementById("amount-continue");
const currencyChip = document.getElementById("currency-chip");
const currencyChipText = document.getElementById("currency-chip-text");
const locationText = document.getElementById("location-text");

const categoryBackBtn = document.getElementById("category-back-btn");
const categoryCloseBtn = document.getElementById("category-close-btn");
const categoryGrid = document.getElementById("category-grid");

const detailsBackBtn = document.getElementById("details-back-btn");
const detailsCloseBtn = document.getElementById("details-close-btn");
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
const photoLightbox = document.getElementById("photo-lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxClose = document.getElementById("lightbox-close");
const lightboxReplaceBtn = document.getElementById("lightbox-replace-btn");

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
const totalAmountEl = document.getElementById("total-amount");
const totalBadgeBtn = document.getElementById("total-badge-btn");
const amountScreenTotal = document.getElementById("amount-screen-total");
const refreshBtn = document.getElementById("refresh-btn");

const tabButtons = document.querySelectorAll(".tab-btn");
const tabList = document.getElementById("tab-list");
const tabSummary = document.getElementById("tab-summary");
const tabSettle = document.getElementById("tab-settle");
const appTitleBtn = document.getElementById("app-title-btn");
const appTitleInput = document.getElementById("app-title-input");
const groupsListEl = document.getElementById("groups-list");
const groupsCountEl = document.getElementById("groups-count");
const friendsCountEl = document.getElementById("friends-count");
const groupScreenBackBtn = document.getElementById("group-screen-back-btn");
const groupScreenTitle = document.getElementById("group-screen-title");
const groupScreenMembers = document.getElementById("group-screen-members");
const groupScreenEmpty = document.getElementById("group-screen-empty");
const groupScreenActivityBlock = document.getElementById("group-screen-activity-block");
const groupScreenActivity = document.getElementById("group-screen-activity");
const groupScreenAddExisting = document.getElementById("group-screen-add-existing");
const groupScreenAddExistingChips = document.getElementById("group-screen-add-existing-chips");
const personScreenBackBtn = document.getElementById("person-screen-back-btn");
const personScreenTitle = document.getElementById("person-screen-title");
const personScreenTitleInput = document.getElementById("person-screen-title-input");
const personScreenBalanceValue = document.getElementById("person-screen-balance-value");
const personScreenSettleWrap = document.getElementById("person-screen-settle-wrap");
const personScreenExpenses = document.getElementById("person-screen-expenses");
const personScreenExpensesEmpty = document.getElementById("person-screen-expenses-empty");
const personScreenActivityBlock = document.getElementById("person-screen-activity-block");
const personScreenActivity = document.getElementById("person-screen-activity");
const groupPhotoWrap = document.getElementById("group-photo-wrap");
const groupPhotoBtn = document.getElementById("group-photo-btn");
const groupPhotoInput = document.getElementById("group-photo-input");
const addFriendGroupSelect = document.getElementById("add-friend-group-select");
const addGroupInput = document.getElementById("add-group-input");
const addGroupBtn = document.getElementById("add-group-btn");
const friendsListEl = document.getElementById("friends-list");
const friendsEmptyEl = document.getElementById("friends-empty");
const addFriendInput = document.getElementById("add-friend-input");
const addFriendBtn = document.getElementById("add-friend-btn");
const settleOweTotal = document.getElementById("settle-owe-total");
const settleOwedTotal = document.getElementById("settle-owed-total");
const statToday = document.getElementById("stat-today");
const funFactEl = document.getElementById("fun-fact");
const paceCard = document.getElementById("pace-card");
const paceTotal = document.getElementById("pace-total");
const paceStats = document.getElementById("pace-stats");
const paceDatesToggle = document.getElementById("pace-dates-toggle");
const paceDatesForm = document.getElementById("pace-dates-form");
const paceDatesSave = document.getElementById("pace-dates-save");
const tripStartInput = document.getElementById("trip-start-input");
const tripEndInput = document.getElementById("trip-end-input");
const paceBudgetLine = document.getElementById("pace-budget-line");
const paceBudgetToggle = document.getElementById("pace-budget-toggle");
const paceBudgetForm = document.getElementById("pace-budget-form");
const paceBudgetSave = document.getElementById("pace-budget-save");
const tripBudgetInput = document.getElementById("trip-budget-input");
const monthStatBtn = document.getElementById("month-stat-btn");
const monthStatLabel = document.getElementById("month-stat-label");
const monthStatValue = document.getElementById("month-stat-value");
const countryStatBtn = document.getElementById("country-stat-btn");
const countryStatLabel = document.getElementById("country-stat-label");
const countryStatValue = document.getElementById("country-stat-value");
const rangeFrom = document.getElementById("range-from");
const rangeTo = document.getElementById("range-to");
const rangeFromDisplay = document.getElementById("range-from-display");
const rangeToDisplay = document.getElementById("range-to-display");
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

// the currency every total/balance in the app is displayed in — every amount
// is still stored and computed in ILS internally, this only affects display
let displayCurrency = loadDisplayCurrency();
let displayRate = 1; // ILS per 1 unit of displayCurrency; 1 when displayCurrency is ILS

async function setDisplayCurrency(code) {
  displayCurrency = code;
  displayRate = code === "ILS" ? 1 : await getRateToILS(code);
  saveDisplayCurrency(code);
  render();
}

// the one place every ILS amount in the UI should be formatted through, so
// switching the display currency actually updates everything at once
function formatILS(amountILS) {
  const amount = displayCurrency === "ILS" ? amountILS : (amountILS ?? 0) / displayRate;
  return `${formatNumber(amount)} ${getCurrency(displayCurrency).symbol}`;
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
  currencySearch.placeholder = "חפש מטבע…";
  renderCurrencyList();
  sheetBackdrop.classList.add("open");
  setTimeout(() => currencySearch.focus(), 300);
}

function openDisplayCurrencyPicker() {
  sheetMode = "display-currency";
  sheetTitle.hidden = false;
  sheetTitle.textContent = "הצגת כל הסכומים במטבע…";
  currencySearch.hidden = false;
  currencySearch.value = "";
  currencySearch.placeholder = "חפש מטבע…";
  renderCurrencyList();
  sheetBackdrop.classList.add("open");
  setTimeout(() => currencySearch.focus(), 300);
}

let countryEditOnSelect = null;

function renderCountryEditList(query) {
  const q = query.trim().toLowerCase();
  const list = COUNTRIES.filter((c) => !q || c.name.toLowerCase().includes(q));
  currencyListEl.innerHTML = list
    .map((c) => `<button type="button" class="picker-row country-edit-row" data-code="${c.code}">${c.flag} ${c.name}</button>`)
    .join("");
}

function openCountryEditPicker(onSelect) {
  sheetMode = "edit-country";
  countryEditOnSelect = onSelect;
  sheetTitle.hidden = false;
  sheetTitle.textContent = "בחר מדינה";
  currencySearch.hidden = false;
  currencySearch.value = "";
  currencySearch.placeholder = "חפש מדינה…";
  renderCountryEditList("");
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

let joinNameResolve = null;

function openJoinNamePicker(groupName, existingNames) {
  return new Promise((resolve) => {
    joinNameResolve = resolve;
    sheetMode = "join";
    sheetTitle.hidden = false;
    sheetTitle.textContent = `הצטרפות לקבוצה "${groupName}" — מה השם שלך?`;
    currencySearch.hidden = false;
    currencySearch.value = "";
    currencySearch.placeholder = "הקלד שם ולחץ Enter…";
    currencyListEl.innerHTML = existingNames.length
      ? existingNames.map((n) => `<button type="button" class="picker-row join-name-row" data-name="${n}">${avatarHtml(n)} ${n}</button>`).join("")
      : `<p class="settle-empty">עדיין אין משתתפים רשומים בקבוצה — הקלד את השם שלך למטה</p>`;
    sheetBackdrop.classList.add("open");
    setTimeout(() => currencySearch.focus(), 300);
  });
}

function resolveJoinName(name) {
  const resolve = joinNameResolve;
  joinNameResolve = null;
  closeCurrencySheet();
  resolve?.(name);
}

function closeCurrencySheet() {
  sheetBackdrop.classList.remove("open");
  if (joinNameResolve) {
    const resolve = joinNameResolve;
    joinNameResolve = null;
    resolve(null);
  }
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
  draft = { category: null, photo: null, isIncome: false };
  amountInput.value = "";
  amountContinue.disabled = true;
  selected = { code: context.currency, rate: context.rate };
  applySelectedCurrency();
  entryTypeToggle.querySelectorAll(".entry-type-btn").forEach((b) => b.classList.toggle("selected", b.dataset.type === "expense"));
  amountDisplay.classList.remove("income");
  showScreen("amount");
  setTimeout(() => amountInput.focus(), 300);
}

entryTypeToggle.addEventListener("click", (e) => {
  const btn = e.target.closest(".entry-type-btn");
  if (!btn) return;
  draft.isIncome = btn.dataset.type === "income";
  entryTypeToggle.querySelectorAll(".entry-type-btn").forEach((b) => b.classList.toggle("selected", b === btn));
  amountDisplay.classList.toggle("income", draft.isIncome);
});

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
  // who paid defaults to "me" every time — only the participant list is worth
  // remembering from last time, paying is the less common case and shouldn't stick
  draft.paidBy = "me";
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
  // the split panel just expanded below the fold — follow it all the way down
  // so the "הוספה" button past it stays reachable without a manual scroll
  // (scrolling splitField itself into view isn't enough: the button comes after it).
  // double rAF: wait a full extra frame so layout has actually settled before
  // measuring scrollHeight, and overshoot the target — scrollTo clamps to the
  // real max automatically, so this is safe and guarantees reaching the bottom.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const screen = document.getElementById("screen-details");
      screen.scrollTo({ top: screen.scrollHeight + 400, behavior: "smooth" });
    });
  });
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
    isIncome: Boolean(draft.isIncome),
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
    ? `<span class="expense-group">${personLabel(paidBy)} ${paidVerb} על ${participantCount} · העלות שלך ${formatILS(myShare(e))}</span>`
    : "";
  const excludedBadge = e.excludeFromTotal ? `<span class="excluded-badge">לא נכלל בסה"כ</span>` : "";
  // tag an expense someone else paid (I'm just a participant) with their color,
  // so it's visually clear at a glance whose expense this originally was
  const taggedStyle = e.isGroup && paidBy !== "me" ? ` style="border-inline-start-color:${avatarColor(paidBy)}"` : "";
  const taggedClass = e.isGroup && paidBy !== "me" ? " expense-item-tagged" : "";
  const incomeClass = e.isIncome ? " expense-item-income" : "";
  const amountText = e.isIncome ? `+${formatILS(-myShare(e))}` : formatILS(myShare(e));
  return `
    <li class="expense-row-wrap">
      <div class="delete-backdrop"><span>🗑️</span></div>
      <div class="expense-item${taggedClass}${incomeClass}" data-id="${e.id}"${taggedStyle}>
        <span class="expense-icon">${cat.icon}</span>
        <span class="expense-info">
          <span class="expense-note">${e.note || cat.label}</span>
          <span class="expense-meta-row">
            <span class="expense-meta">${cat.label} · ${e.location ? e.location + " · " : ""}${country.name}</span>
            <span class="expense-amount">
              <span class="amount-ils">${amountText}</span>
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
            <span>${formatILS(day.total)}</span>
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
}

function renderPace() {
  const total = getGrandTotal();
  paceTotal.textContent = formatILS(total);

  const trip = loadTripDates();
  paceDatesToggle.textContent = trip?.start && trip?.end ? "📅 עריכת תאריכי טיול" : "📅 הגדרת תאריכי טיול";

  const budget = loadTripBudget();
  paceBudgetToggle.textContent = budget ? "💰 עריכת תקציב טיול" : "💰 הגדרת תקציב טיול";

  if (!trip?.start || !trip?.end) {
    paceStats.innerHTML = `<p class="pace-hint">הגדר תאריכי טיול כדי לראות קצב הוצאות וימי טיול</p>`;
    statToday.classList.remove("stat-value-over", "stat-value-under");
    paceBudgetLine.hidden = true;
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

  statToday.classList.toggle("stat-value-over", getTotalToday() > dailyAvg);
  statToday.classList.toggle("stat-value-under", getTotalToday() <= dailyAvg);

  const countryPace = getCountryPace(context.countryCode);
  const countryLine = countryPace
    ? `<div class="pace-stat"><span>🌍</span><span>ב${getCountry(context.countryCode).name}: ${formatILS(countryPace.monthlyAvg)} לחודש</span></div>`
    : "";

  paceStats.innerHTML = `
    <div class="pace-stat"><span>📅</span><span>${elapsedDays} מתוך ${totalDays} ימים</span></div>
    <div class="pace-stat"><span>📊</span><span>ממוצע: ${formatILS(dailyAvg)} ליום</span></div>
    <div class="pace-stat"><span>🔮</span><span>בקצב הנוכחי תסיים ב-${formatILS(projected)}</span></div>
    ${countryLine}
  `;

  if (budget) {
    const diff = budget - projected;
    const isOver = diff < 0;
    paceBudgetLine.hidden = false;
    paceBudgetLine.className = `pace-budget-line ${isOver ? "balance-negative" : "balance-positive"}`;
    paceBudgetLine.textContent = isOver
      ? `⚠️ בקצב הזה תחרוג מהתקציב (${formatILS(budget)}) בכ-${formatILS(-diff)}`
      : `✅ בקצב טוב! צפוי שתישאר עם כ-${formatILS(diff)} מהתקציב (${formatILS(budget)})`;
  } else {
    paceBudgetLine.hidden = true;
  }
}

// small, honest "did you notice..." lines — built only from things we can
// count reliably (repeated note text first — that's the most concrete signal
// — then category frequency, then biggest expense), not guessed quantities/
// units we don't actually track. Returns every fact that applies, so the
// card can be tapped to cycle through them instead of only ever showing one.
function getFunFacts() {
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const recent = getExpenses().filter((e) => e.date >= weekAgo);
  if (!recent.length) return [];

  const facts = [];

  const noteCounts = {};
  for (const e of recent) {
    const key = e.note?.trim();
    if (key) noteCounts[key] = (noteCounts[key] ?? 0) + 1;
  }
  Object.entries(noteCounts)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .forEach(([note, count]) => facts.push(`🔎 השבוע קנית ${count} פעמים "${note}"`));

  const catCounts = {};
  for (const e of recent) catCounts[e.category] = (catCounts[e.category] ?? 0) + 1;
  const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];
  if (topCat && topCat[1] >= 2) {
    const cat = getCategory(topCat[0]);
    facts.push(`🔎 השבוע היו לך ${topCat[1]} הוצאות על ${cat.label} ${cat.icon}`);
  }

  const biggest = recent.reduce((max, e) => (e.amountILS > (max?.amountILS ?? 0) ? e : max), null);
  if (biggest) {
    facts.push(`🔎 ההוצאה הכי גדולה השבוע: ${formatILS(biggest.amountILS)} על ${biggest.note || getCategory(biggest.category).label}`);
  }

  return facts;
}

let funFacts = [];
let funFactIndex = 0;

function showFunFact() {
  const fact = funFacts[funFactIndex];
  funFactEl.textContent = fact ?? "";
  funFactEl.hidden = !fact;
  funFactEl.classList.toggle("tappable", funFacts.length > 1);
}

function renderSummary() {
  statToday.textContent = formatILS(getTotalToday());

  funFacts = getFunFacts();
  funFactIndex = 0;
  showFunFact();

  renderPace();

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthTotals = Object.fromEntries(getTotalsByMonth());
  monthStatLabel.textContent = formatMonth(currentMonth);
  monthStatValue.textContent = formatILS(monthTotals[currentMonth] ?? 0);

  const countryTotals = Object.fromEntries(getTotalsByCountry());
  const currentCountry = getCountry(context.countryCode);
  countryStatLabel.textContent = currentCountry.name;
  countryStatValue.textContent = formatILS(countryTotals[context.countryCode] ?? 0);
}

function renderPickerList(mode) {
  const entries = mode === "month" ? getTotalsByMonth() : getTotalsByCountry();
  currencyListEl.innerHTML =
    entries
      .map(([key, amount]) => {
        const label = mode === "month" ? formatMonth(key) : getCountry(key).name;
        return `<button type="button" class="picker-row" data-key="${key}"><span>${label}</span><span class="picker-value">${formatILS(amount)}</span></button>`;
      })
      .join("") || `<p class="empty-state">אין נתונים עדיין</p>`;
}

const MONTH_NAMES_EN = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatShortDate(dateStr) {
  const [, month, day] = dateStr.split("-").map(Number);
  return `${MONTH_NAMES_EN[month - 1]} ${day}`;
}

function renderRange() {
  // the real <input type="date"> is a fully invisible overlay (see .date-field-wrap
  // input in CSS) — these spans are the only thing actually shown, so they're
  // the only place a picked date needs to render, always in our own format
  rangeFromDisplay.textContent = rangeFrom.value ? formatShortDate(rangeFrom.value) : "מתאריך";
  rangeToDisplay.textContent = rangeTo.value ? formatShortDate(rangeTo.value) : "עד תאריך";

  if (!rangeFrom.value || !rangeTo.value) {
    rangeResult.textContent = "";
    return;
  }
  const total = getTotalForRange(rangeFrom.value, rangeTo.value);
  rangeResult.textContent = formatILS(total);
}

// ---------- settle-up (friends) tab ----------

function removeFriend(name) {
  const balance = getFriendBalances()[name] ?? 0;
  if (Math.abs(balance) > 0.01) {
    const owes = balance < 0 ? `${personLabel(name)} חייב/ת ${formatILS(-balance)}` : `מגיע ל${personLabel(name)} ${formatILS(balance)}`;
    if (!confirm(`יש חוב פתוח: ${owes}. להסיר בכל זאת?`)) return;
  }
  saveFriends(loadFriends().filter((f) => f.name !== name));
  renderFriendsTab();
}

function renameFriend(oldName, newName, afterRender = renderFriendsTab) {
  if (newName === "me" || getPeopleList().includes(newName)) {
    showToast("השם הזה כבר קיים");
    afterRender();
    return;
  }

  saveFriends(loadFriends().map((f) => (f.name === oldName ? { ...f, name: newName } : f)));
  saveSettlements(
    loadSettlements().map((s) => ({
      ...s,
      from: s.from === oldName ? newName : s.from,
      to: s.to === oldName ? newName : s.to,
    }))
  );
  renameParticipant(oldName, newName);
  render();
  afterRender();
}

// swaps a friend-row's name button for a text input in place, so renaming
// feels like editing a value rather than a jarring native prompt() popup.
// only safe on elements that get fully regenerated on re-render (like friend
// rows) — never on a persistent top-level element (see the app-title/person
// -title toggle-input pattern for those instead).
function beginRenameFriend(labelBtn, afterRender = renderFriendsTab) {
  const oldName = labelBtn.dataset.name;
  const input = document.createElement("input");
  input.type = "text";
  input.className = "inline-rename-input";
  input.value = oldName;
  labelBtn.replaceWith(input);
  input.focus();
  input.select();

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") input.blur();
    if (e.key === "Escape") {
      input.value = oldName;
      input.blur();
    }
  });
  input.addEventListener("blur", () => {
    const newName = input.value.trim();
    if (newName && newName !== oldName) renameFriend(oldName, newName, afterRender);
    else afterRender();
  });
}

function addGroup(name) {
  const groups = loadGroups();
  if (!name || groups.some((g) => g.name === name)) return null;
  const group = { id: crypto.randomUUID(), name };
  groups.push(group);
  saveGroups(groups);
  return group;
}

function removeGroup(id) {
  saveGroups(loadGroups().filter((g) => g.id !== id));
  // members of a removed group become individuals again, not deleted
  saveFriends(loadFriends().map((f) => (f.groupId === id ? { ...f, groupId: null } : f)));
  renderFriendsTab();
}

function setGroupPhoto(groupId, photo) {
  saveGroups(loadGroups().map((g) => (g.id === groupId ? { ...g, photo } : g)));
  renderFriendsTab();
  openGroupScreen(groupId);
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

function copyInviteLink(groupId, groupName, message = "קישור הועתק") {
  const link = buildInviteLink(groupId, groupName);
  navigator.clipboard
    ?.writeText(link)
    .then(() => showToast(message))
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

// my net position vs. one specific person, same simplified-graph logic as getMyGroupBalance
function getMyBalanceWith(name) {
  const transfers = simplifyDebts(getFriendBalances());
  let net = 0;
  for (const t of transfers) {
    if (t.from === "me" && t.to === name) net -= t.amount;
    if (t.to === "me" && t.from === name) net += t.amount;
  }
  return round2(net);
}

// a person can show "מסודר" (no direct debt with me) while still owing/being owed
// money elsewhere in the group (their debt got routed through someone else in the
// simplification) — tell those two "zero" cases apart so a real debt is never silent
function describeBalanceWith(name) {
  const amount = getMyBalanceWith(name);
  const isZero = Math.abs(amount) <= 0.01;
  const hasOtherDebt = isZero && Math.abs(round2(getFriendBalances()[name] ?? 0)) > 0.01;
  const cls = isZero ? "balance-zero" : amount > 0 ? "balance-positive" : "balance-negative";
  const text = isZero
    ? hasOtherDebt
      ? "אין חוב ישיר איתך"
      : "מסודר"
    : amount > 0
      ? `חייב/ת לך ${formatILS(amount)}`
      : `אתה חייב ${formatILS(-amount)}`;
  return { amount, cls, text };
}

function groupAvatarHtml(group, big = false) {
  const cls = big ? "group-avatar group-avatar-lg" : "group-avatar";
  if (group.photo) return `<img class="${cls}" src="${group.photo}" alt="" />`;
  const initial = group.name.trim()[0] || "?";
  return `<span class="${cls} group-avatar-initial" style="background:${avatarColor(group.name)}">${initial}</span>`;
}

function renderGroupsList() {
  const groups = loadGroups();
  const friends = loadFriends();
  groupsCountEl.textContent = groups.length ? `· ${groups.length}` : "";

  groupsListEl.innerHTML = groups.length
    ? groups
        .map((g) => {
          const count = friends.filter((f) => f.groupId === g.id).length;
          const myBalance = getMyGroupBalance(g.id);
          const isZero = Math.abs(myBalance) <= 0.01;
          const cls = isZero ? "balance-zero" : myBalance > 0 ? "balance-positive" : "balance-negative";
          const balanceText = isZero ? `מאופס ${formatILS(0)}` : `${myBalance > 0 ? "+" : ""}${formatILS(myBalance)}`;
          return `
          <div class="group-list-row">
            ${groupAvatarHtml(g)}
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
    : `<p class="section-empty-hint">אין קבוצות עדיין</p>`;

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
    `<option value="">ללא קבוצה</option>` + groups.map((g) => `<option value="${g.id}">${g.name}</option>`).join("");
}

function addExistingFriendToGroup(name, groupId) {
  saveFriends(loadFriends().map((f) => (f.name === name ? { ...f, groupId } : f)));
  renderFriendsTab();
  openGroupScreen(groupId);
}

// shared transfer-row renderer: used by the group screen's "charges" list
function transferRowHtml(t, i) {
  return `
        <div class="transfer-row">
          <div class="transfer-main">
            <div class="transfer-people">
              <span class="who">${avatarHtml(t.from)} ${personLabel(t.from)}</span>
              <span class="transfer-arrow">חייב ל</span>
              <span class="who">${avatarHtml(t.to)} ${personLabel(t.to)}</span>
            </div>
            <span class="transfer-amount">${formatILS(t.amount)}</span>
          </div>
          <div class="transfer-actions">
            <button type="button" class="settle-btn" data-i="${i}">לקזז</button>
            <button type="button" class="quickpay-btn" data-amount="${t.amount}">📋 העתקת הסכום</button>
          </div>
        </div>`;
}

// flashes the button to its "done" state before the actual data mutation +
// re-render happens, so settling reads as an action-then-confirmation, not an instant swap
function playSettleAnimation(btn, onDone) {
  btn.disabled = true;
  btn.classList.add("settled");
  btn.textContent = "✓ קוזז";
  setTimeout(onDone, 550);
}

function renderTransferRows(container, transfers, onSettled) {
  container.innerHTML = transfers.map(transferRowHtml).join("");
  container.querySelectorAll(".settle-btn").forEach((btn) => {
    const t = transfers[Number(btn.dataset.i)];
    btn.addEventListener("click", () => {
      playSettleAnimation(btn, () => {
        markSettled(t.from, t.to, t.amount);
        onSettled();
      });
    });
  });
  container.querySelectorAll(".quickpay-btn").forEach((btn) => {
    btn.addEventListener("click", () => copyAmount(btn.dataset.amount));
  });
}

function formatActivityDate(iso) {
  const d = new Date(iso);
  const time = d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  let label;
  if (days <= 0) label = "היום";
  else if (days === 1) label = "אתמול";
  else if (days < 7) label = `לפני ${days} ימים`;
  else label = `${d.getDate()} ב${MONTH_NAMES[d.getMonth()]}`;
  return `${label}, ${time}`;
}

// phrases a settlement in natural Hebrew: first-person when "me" is involved
// ("אני קיזזתי עם X" / "X קיזז/ה איתי"), third-person "עם" otherwise
function settlementLine(s) {
  if (s.from === "me") return `אני קיזזתי עם ${personLabel(s.to)}`;
  const withWhom = s.to === "me" ? "איתי" : `עם ${personLabel(s.to)}`;
  return `${personLabel(s.from)} קיזז/ה ${withWhom}`;
}

function groupActivityRows(memberNames) {
  return loadSettlements()
    .filter((s) => memberNames.has(s.from) || memberNames.has(s.to))
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .map(
      (s) => `
        <div class="activity-row">
          <span class="who">✓ ${settlementLine(s)}</span>
          <span class="activity-meta">${formatILS(s.amount)} · ${formatActivityDate(s.date)}</span>
        </div>`
    )
    .join("");
}

function openGroupScreen(groupId) {
  const group = loadGroups().find((g) => g.id === groupId);
  if (!group) return;

  const friends = loadFriends();
  const memberNames = new Set(friends.filter((f) => f.groupId === groupId).map((f) => f.name));
  const transfers = simplifyDebts(getFriendBalances()).filter((t) => memberNames.has(t.from) || memberNames.has(t.to));

  groupScreenTitle.textContent = group.name;
  groupPhotoBtn.dataset.groupId = groupId;
  groupPhotoBtn.innerHTML = group.photo ? `<img src="${group.photo}" alt="" />` : `<span>${group.name.trim()[0] || "?"}</span>`;
  groupPhotoBtn.style.background = group.photo ? "none" : avatarColor(group.name);

  renderTransferRows(groupScreenMembers, transfers, () => openGroupScreen(groupId));
  if (memberNames.size === 0) {
    groupScreenEmpty.textContent = "אין מטיילים בקבוצה הזו עדיין";
    groupScreenEmpty.hidden = false;
  } else if (transfers.length === 0) {
    groupScreenEmpty.textContent = "הכל מסודר בקבוצה הזו 🎉";
    groupScreenEmpty.hidden = false;
  } else {
    groupScreenEmpty.hidden = true;
  }

  const activityHtml = groupActivityRows(memberNames);
  groupScreenActivityBlock.hidden = !activityHtml;
  groupScreenActivity.innerHTML = activityHtml;

  const ungrouped = friends.filter((f) => !f.groupId);
  groupScreenAddExisting.hidden = ungrouped.length === 0;
  groupScreenAddExistingChips.innerHTML = ungrouped
    .map((f) => `<button type="button" class="chip" data-name="${f.name}">${personLabel(f.name)}</button>`)
    .join("");
  groupScreenAddExistingChips.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => addExistingFriendToGroup(chip.dataset.name, groupId));
  });

  showScreen("group");
}

function expenseInvolves(e, name) {
  const names = new Set((e.participants ?? []).map((p) => (typeof p === "object" ? p.name : p)));
  names.add(e.paidBy || "me");
  return names.has("me") && names.has(name);
}

function personExpenseRowHtml(e) {
  const cat = getCategory(e.category);
  return `
        <div class="activity-row">
          <span class="who">${cat.icon} ${e.note || cat.label}</span>
          <span class="activity-meta">${formatILS(myShare(e))} · ${formatDay(e.date)}</span>
        </div>`;
}

function personActivityRows(name) {
  const settlementEvents = loadSettlements()
    .filter((s) => (s.from === "me" && s.to === name) || (s.from === name && s.to === "me"))
    .map((s) => ({
      date: s.date,
      html: `<span class="who">✓ ${settlementLine(s)}</span><span class="activity-meta">${formatILS(s.amount)} · ${formatActivityDate(s.date)}</span>`,
    }));

  // being tagged in someone else's expense is its own kind of activity, not
  // just a line item under "shared expenses" — it should read like an event
  const taggedEvents = getExpenses()
    .filter((e) => e.isGroup && e.paidBy === name && expenseInvolves(e, name))
    .map((e) => {
      const iso = e.createdAt ? new Date(e.createdAt).toISOString() : e.date;
      return {
        date: iso,
        html: `<span class="who">🧾 ${personLabel(name)} שם עליך הוצאה: ${e.note || getCategory(e.category).label}</span><span class="activity-meta">${formatILS(
          myShare(e)
        )} · ${formatActivityDate(iso)}</span>`,
      };
    });

  return [...settlementEvents, ...taggedEvents]
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .map((item) => `<div class="activity-row">${item.html}</div>`)
    .join("");
}

function openPersonScreen(name) {
  personScreenTitle.textContent = name;
  personScreenTitle.dataset.name = name;

  const { amount, cls, text } = describeBalanceWith(name);
  const isZero = Math.abs(amount) <= 0.01;
  personScreenBalanceValue.textContent = text;
  personScreenBalanceValue.className = `settle-summary-value ${cls}`;

  personScreenSettleWrap.innerHTML = isZero
    ? ""
    : `<button type="button" class="friend-row-settle person-screen-settle" data-from="${amount > 0 ? name : "me"}" data-to="${
        amount > 0 ? "me" : name
      }" data-amount="${Math.abs(amount)}">לקזז</button>`;
  const settleBtn = personScreenSettleWrap.querySelector(".person-screen-settle");
  if (settleBtn) {
    settleBtn.addEventListener("click", () => {
      playSettleAnimation(settleBtn, () => {
        markSettled(settleBtn.dataset.from, settleBtn.dataset.to, Number(settleBtn.dataset.amount));
        openPersonScreen(name);
      });
    });
  }

  const sharedExpenses = getExpenses().filter((e) => e.isGroup && expenseInvolves(e, name));
  personScreenExpenses.innerHTML = sharedExpenses.map(personExpenseRowHtml).join("");
  personScreenExpensesEmpty.hidden = sharedExpenses.length > 0;

  const activityHtml = personActivityRows(name);
  personScreenActivityBlock.hidden = !activityHtml;
  personScreenActivity.innerHTML = activityHtml;

  showScreen("person");
}

function renderAppTitle() {
  const tripName = loadGroupName();
  appTitleBtn.textContent = tripName ? `הוצאות הטיול · ${tripName}` : "הוצאות הטיול";
}

function friendRowHtml(name) {
  const { amount, cls, text } = describeBalanceWith(name);
  const isZero = Math.abs(amount) <= 0.01;
  const settleBtn = isZero
    ? ""
    : `<button type="button" class="friend-row-settle" data-from="${amount > 0 ? name : "me"}" data-to="${
        amount > 0 ? "me" : name
      }" data-amount="${Math.abs(amount)}">לקזז</button>`;
  return `
        <div class="friend-row">
          <button type="button" class="friend-row-avatar" data-name="${name}" aria-label="הצג חיובים עם ${name}">${avatarHtml(name)}</button>
          <span class="friend-row-text">
            <button type="button" class="friend-row-label" data-name="${name}" aria-label="שינוי שם">${name}</button>
            <span class="friend-row-balance ${cls}">${text}</span>
          </span>
          ${settleBtn}
          <button type="button" class="friend-row-remove" data-name="${name}" aria-label="הסר">✕</button>
        </div>`;
}

function renderSettleSummary() {
  const friends = loadFriends();
  let oweTotal = 0;
  let owedTotal = 0;
  for (const f of friends) {
    const amount = getMyBalanceWith(f.name);
    if (amount > 0) owedTotal += amount;
    else oweTotal += -amount;
  }
  settleOweTotal.textContent = formatILS(round2(oweTotal));
  settleOwedTotal.textContent = formatILS(round2(owedTotal));
}

function renderFriendsTab() {
  renderAppTitle();
  renderGroupsList();
  renderSettleSummary();

  const friends = loadFriends();
  friendsCountEl.textContent = friends.length ? `· ${friends.length}` : "";
  friendsListEl.innerHTML = friends.map((f) => friendRowHtml(f.name)).join("");
  friendsEmptyEl.hidden = friends.length > 0;

  friendsListEl.querySelectorAll(".friend-row-avatar").forEach((btn) => {
    btn.addEventListener("click", () => openPersonScreen(btn.dataset.name));
  });
  friendsListEl.querySelectorAll(".friend-row-label").forEach((btn) => {
    btn.addEventListener("click", () => beginRenameFriend(btn));
  });
  friendsListEl.querySelectorAll(".friend-row-remove").forEach((btn) => {
    btn.addEventListener("click", () => removeFriend(btn.dataset.name));
  });
  friendsListEl.querySelectorAll(".friend-row-settle").forEach((btn) => {
    btn.addEventListener("click", () => {
      playSettleAnimation(btn, () => {
        markSettled(btn.dataset.from, btn.dataset.to, Number(btn.dataset.amount));
        renderFriendsTab();
      });
    });
  });
}

function markSettled(from, to, amount) {
  const settlements = loadSettlements();
  settlements.push({ from, to, amount, date: new Date().toISOString() });
  saveSettlements(settlements);
}

function copyAmount(amount) {
  navigator.clipboard
    ?.writeText(String(amount))
    .then(() => showToast("הסכום הועתק"))
    .catch(() => {});
}

function handleAddFriend() {
  const name = addFriendInput.value.trim();
  if (!name || name === "me") return;
  addFriend(name, addFriendGroupSelect.value || null);
  addFriendInput.value = "";
  renderFriendsTab();
}

function render() {
  renderList();
  renderSummary();
  renderRange();
  renderFriendsTab();
  const totalText = formatILS(getGrandTotal());
  totalAmountEl.textContent = totalText;
  amountScreenTotal.textContent = totalText;
}

const TAB_ORDER = ["list", "summary", "settle"];

function switchTab(tab) {
  if (!TAB_ORDER.includes(tab)) return;
  tabButtons.forEach((b) => b.classList.toggle("selected", b.dataset.tab === tab));
  tabList.hidden = tab !== "list";
  tabSummary.hidden = tab !== "summary";
  tabSettle.hidden = tab !== "settle";
}

function handleTabClick(e) {
  const tab = e.target.dataset.tab;
  if (!tab) return;
  switchTab(tab);
}

// swiping the background (not a list row, which has its own delete-swipe)
// moves between the three tabs — הוצאות ‹→› תובנות ‹→› קיזוזים
function attachTabSwipe(container) {
  let startX = null;
  let startY = null;
  let eligible = false;

  container.addEventListener("pointerdown", (e) => {
    eligible = !e.target.closest(".expense-row-wrap, button, input, select, a");
    startX = e.clientX;
    startY = e.clientY;
  });

  container.addEventListener("pointerup", (e) => {
    if (!eligible || startX === null) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    startX = null;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;

    const current = document.querySelector(".tab-btn.selected")?.dataset.tab;
    const idx = TAB_ORDER.indexOf(current);
    if (idx === -1) return;
    // RTL reading order: a leftward swipe (dx < 0) advances to the next tab
    const nextIdx = dx < 0 ? idx + 1 : idx - 1;
    if (nextIdx >= 0 && nextIdx < TAB_ORDER.length) switchTab(TAB_ORDER[nextIdx]);
  });
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
      <button type="button" class="detail-row detail-row-btn" id="detail-country-row">
        <span>מדינה</span>
        <span>${country.flag} ${country.name} ‹</span>
      </button>
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
  // +0.6ch buffer: bold digits render wider than the "0" glyph "ch" is measured
  // against, so a tight fit clips the last character.
  el.style.width = `${Math.max(1.5, el.value.length + 0.6)}ch`;
}

expenseDetailBody.addEventListener("click", (e) => {
  if (e.target.closest("#expense-add-photo-btn")) {
    expensePhotoInput.click();
  }
  if (e.target.closest("#expense-photo-preview")) {
    lightboxImg.src = e.target.closest("#expense-photo-preview").src;
    photoLightbox.hidden = false;
  }
  if (e.target.closest("#detail-category-row")) {
    editingExpenseId = currentExpenseId;
    showScreen("category");
  }
  if (e.target.closest("#detail-country-row")) {
    const id = currentExpenseId;
    openCountryEditPicker((code) => {
      updateExpense(id, { country: code });
      render();
      openExpenseDetail(id, previousScreen);
    });
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

lightboxClose.addEventListener("click", () => (photoLightbox.hidden = true));
photoLightbox.addEventListener("click", (e) => {
  if (e.target === photoLightbox) photoLightbox.hidden = true;
});
lightboxReplaceBtn.addEventListener("click", () => {
  photoLightbox.hidden = true;
  expensePhotoInput.click();
});

// ---------- filter (drill-down) screen ----------

function openFilterScreen(type, value) {
  currentFilter = { type, value };
  const filterFn = type === "country" ? (e) => e.country === value : (e) => e.date.slice(0, 7) === value;
  const days = getExpensesGroupedByDay(filterFn);

  filterTitle.textContent = type === "country" ? getCountry(value).name : formatMonth(value);
  const total = days.reduce((sum, d) => sum + d.total, 0);
  filterTotal.textContent = formatILS(total);

  if (type === "country") {
    const pace = getCountryPace(value);
    filterCountryPace.innerHTML = pace
      ? `
        <div class="pace-stat"><span>📅</span><span>${pace.days} ימים במדינה</span></div>
        <div class="pace-stat"><span>📊</span><span>ממוצע יומי: ${formatILS(pace.dailyAvg)}</span></div>
        <div class="pace-stat"><span>📆</span><span>ממוצע חודשי: ${formatILS(pace.monthlyAvg)}</span></div>
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
categoryCloseBtn.addEventListener("click", () => {
  editingExpenseId = null;
  showScreen("home");
});
detailsBackBtn.addEventListener("click", () => showScreen("category"));
detailsCloseBtn.addEventListener("click", () => showScreen("home"));
detailsDone.addEventListener("click", handleDetailsDone);

expenseBackBtn.addEventListener("click", () => showScreen(previousScreen));
filterBackBtn.addEventListener("click", () => {
  currentFilter = null;
  showScreen("home");
});
groupScreenBackBtn.addEventListener("click", () => showScreen("home"));

personScreenBackBtn.addEventListener("click", () => showScreen("home"));
personScreenTitle.addEventListener("click", () => {
  personScreenTitleInput.value = personScreenTitle.dataset.name;
  personScreenTitle.hidden = true;
  personScreenTitleInput.hidden = false;
  personScreenTitleInput.focus();
  personScreenTitleInput.select();
});
personScreenTitleInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") personScreenTitleInput.blur();
  if (e.key === "Escape") {
    personScreenTitleInput.value = personScreenTitle.dataset.name;
    personScreenTitleInput.blur();
  }
});
personScreenTitleInput.addEventListener("blur", () => {
  const oldName = personScreenTitle.dataset.name;
  const newName = personScreenTitleInput.value.trim();
  personScreenTitleInput.hidden = true;
  personScreenTitle.hidden = false;
  if (newName && newName !== oldName) renameFriend(oldName, newName, () => openPersonScreen(newName));
});
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
attachTabSwipe(document.getElementById("screen-home"));
monthStatBtn.addEventListener("click", () => openMonthCountryPicker("month"));
countryStatBtn.addEventListener("click", () => openMonthCountryPicker("country"));
rangeFrom.addEventListener("change", renderRange);
rangeTo.addEventListener("change", renderRange);
exportCsvBtn.addEventListener("click", openExportPicker);

addFriendBtn.addEventListener("click", handleAddFriend);
addFriendInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleAddFriend();
});
addGroupBtn.addEventListener("click", () => {
  const name = addGroupInput.value.trim();
  if (!name) return;
  const group = addGroup(name);
  addGroupInput.value = "";
  renderFriendsTab();
  if (!group) return;
  // straight into the new group's screen — its own "add existing people" chips
  // double as the "who do you want to add?" prompt, plus the invite link for anyone new
  openGroupScreen(group.id);
  copyInviteLink(group.id, group.name, "קישור לקבוצה הועתק");
});
addGroupInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addGroupBtn.click();
});

document.querySelectorAll(".summary-block-toggle").forEach((btn) => {
  const body = btn.nextElementSibling;
  btn.addEventListener("click", () => {
    const collapsed = body.classList.toggle("collapsed");
    btn.setAttribute("aria-expanded", String(!collapsed));
  });
});

groupPhotoWrap.addEventListener("click", () => groupPhotoInput.click());
groupPhotoInput.addEventListener("change", async () => {
  const file = groupPhotoInput.files[0];
  const groupId = groupPhotoBtn.dataset.groupId;
  groupPhotoInput.value = "";
  if (!file || !groupId) return;
  const photo = await fileToCompressedDataUrl(file, 400, 0.75);
  setGroupPhoto(groupId, photo);
});

appTitleBtn.addEventListener("click", () => {
  appTitleInput.value = loadGroupName();
  appTitleBtn.hidden = true;
  appTitleInput.hidden = false;
  appTitleInput.focus();
  appTitleInput.select();
});
appTitleInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") appTitleInput.blur();
  if (e.key === "Escape") {
    appTitleInput.value = loadGroupName();
    appTitleInput.blur();
  }
});
appTitleInput.addEventListener("blur", () => {
  saveGroupName(appTitleInput.value.trim());
  renderAppTitle();
  appTitleInput.hidden = true;
  appTitleBtn.hidden = false;
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

paceBudgetToggle.addEventListener("click", () => {
  tripBudgetInput.value = loadTripBudget() ?? "";
  paceBudgetForm.hidden = !paceBudgetForm.hidden;
});
paceBudgetSave.addEventListener("click", () => {
  const amount = Number(tripBudgetInput.value);
  if (!(amount > 0)) return;
  saveTripBudget(amount);
  paceBudgetForm.hidden = true;
  renderPace();
});

currencyChip.addEventListener("click", () => openCurrencySheet("draft"));
totalBadgeBtn.addEventListener("click", openDisplayCurrencyPicker);
funFactEl.addEventListener("click", () => {
  if (funFacts.length < 2) return;
  funFactIndex = (funFactIndex + 1) % funFacts.length;
  showFunFact();
});
sheetBackdrop.addEventListener("click", (e) => {
  if (e.target === sheetBackdrop) closeCurrencySheet();
});
currencySearch.addEventListener("input", () => {
  if (sheetMode === "currency" || sheetMode === "display-currency") renderCurrencyList(currencySearch.value);
  if (sheetMode === "edit-country") renderCountryEditList(currencySearch.value);
});
currencySearch.addEventListener("keydown", (e) => {
  if (sheetMode === "join" && e.key === "Enter") {
    const name = currencySearch.value.trim();
    if (name) resolveJoinName(name);
  }
});
currencyListEl.addEventListener("click", async (e) => {
  if (sheetMode === "display-currency") {
    const row = e.target.closest(".currency-row");
    if (!row) return;
    closeCurrencySheet();
    await setDisplayCurrency(row.dataset.code);
    return;
  }

  if (sheetMode === "edit-country") {
    const row = e.target.closest(".country-edit-row");
    if (!row) return;
    closeCurrencySheet();
    countryEditOnSelect?.(row.dataset.code);
    countryEditOnSelect = null;
    return;
  }

  if (sheetMode === "join") {
    const row = e.target.closest(".join-name-row");
    if (!row) return;
    resolveJoinName(row.dataset.name);
    return;
  }

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
    let existingNames = [];
    if (isRemoteEnabled()) {
      try {
        const members = await fetchRemoteGroupMembers();
        existingNames = [
          ...new Set(members.filter((m) => m.groupId === groupId && m.memberName && m.memberName !== "me").map((m) => m.memberName)),
        ];
      } catch {
        // best-effort — an unreachable API just means an empty picker, not a blocked join flow
      }
    }

    const myName = (await openJoinNamePicker(groupName, existingNames))?.trim();
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
    alert(`הצטרפת לקבוצה "${groupName}" בתור ${myName}! אפשר לשנות את השם בכל רגע מטאב "קיזוז".`);
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
if (displayCurrency !== "ILS") setDisplayCurrency(displayCurrency);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
