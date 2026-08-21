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
  if (mode === "amount") {
    return names.map((name) => ({ name, amount: round2(customAmounts[name] ?? total / names.length) }));
  }
  if (mode === "percent") {
    return names.map((name) => {
      const pct = customPercents[name] ?? 100 / names.length;
      return { name, amount: round2((pct / 100) * total) };
    });
  }
  return names.map((name) => ({ name, amount: round2(total / names.length) }));
}
