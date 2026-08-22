import { loadFriends } from "./storage.js";

export function personLabel(name) {
  return name === "me" ? "אני" : name;
}

export function getPeopleList(groupId) {
  const friends = loadFriends();
  const scoped = groupId ? friends.filter((f) => f.groupId === groupId) : friends;
  return ["me", ...scoped.map((f) => f.name)];
}

const AVATAR_COLORS = ["#007aff", "#34c759", "#ff9500", "#ff3b30", "#af52de", "#5856d6", "#00c7be", "#ff2d55"];

export function avatarColor(name) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function avatarHtml(name) {
  const label = personLabel(name);
  const parts = label.trim().split(/\s+/).filter(Boolean);
  const initials = parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0]?.[0] || "?";
  return `<span class="avatar" style="background:${avatarColor(name)}">${initials}</span>`;
}

function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

// names: string[], mode: 'equal'|'amount'|'percent', total: ILS amount
// customAmounts/customPercents: { [name]: number } — only entries the user actually edited
export function resolveParticipants(names, mode, total, customAmounts = {}, customPercents = {}) {
  if (!names.length) return [];
  let amounts;
  if (mode === "amount") {
    amounts = names.map((name) => round2(customAmounts[name] ?? total / names.length));
  } else if (mode === "percent") {
    amounts = names.map((name) => round2(((customPercents[name] ?? 100 / names.length) / 100) * total));
  } else {
    amounts = names.map(() => round2(total / names.length));
  }

  // free-form custom splits can drift from the actual total (a percent split
  // that doesn't quite reach 100%, a typo, plain rounding on an equal split
  // that doesn't divide evenly) — force the last participant to absorb the
  // difference so the saved amounts always sum to exactly `total`. Without
  // this, one off-total expense silently breaks every balance downstream
  // (getGroupBalances stops summing to zero, which makes simplifyDebts drop
  // people from "קיזוז חכם" entirely instead of just rounding oddly).
  const diff = round2(total - amounts.reduce((a, b) => a + b, 0));
  if (Math.abs(diff) > 0.001) {
    amounts[amounts.length - 1] = round2(amounts[amounts.length - 1] + diff);
  }

  return names.map((name, i) => ({ name, amount: amounts[i] }));
}
