import { getApiUrl } from "./config.js";

export function isRemoteEnabled() {
  return Boolean(getApiUrl());
}

export async function fetchRemoteExpenses() {
  if (!isRemoteEnabled()) return [];
  const res = await fetch(getApiUrl());
  if (!res.ok) throw new Error(`fetchRemoteExpenses failed: ${res.status}`);
  const { expenses } = await res.json();
  // Sheet cells can't hold arrays — participants comes back as a JSON string.
  return expenses.map((e) => {
    let participants = [];
    if (typeof e.participants === "string" && e.participants) {
      try {
        participants = JSON.parse(e.participants);
      } catch {
        participants = []; // stray data from before this format existed
      }
    }
    return { ...e, participants };
  });
}

export async function postRemoteExpense(expense) {
  if (!isRemoteEnabled()) return;
  // Photos are local-only — never send base64 images to the shared Google Sheet.
  const { photo, ...rest } = expense;
  const payload = { ...rest, participants: JSON.stringify(expense.participants ?? []) };
  // Apps Script web apps don't support real CORS preflight, so this must be a
  // "simple request": POST + text/plain body (matches the Shortcut's request too).
  await fetch(getApiUrl(), {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });
}

export async function deleteRemoteExpense(id) {
  if (!isRemoteEnabled()) return;
  await fetch(getApiUrl(), {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action: "delete", id }),
  });
}

// group invite links only actually work once this page is hosted somewhere
// reachable by the person clicking the link — not on localhost.
export async function fetchRemoteGroupMembers() {
  if (!isRemoteEnabled()) return [];
  const res = await fetch(`${getApiUrl()}?type=groups`);
  if (!res.ok) throw new Error(`fetchRemoteGroupMembers failed: ${res.status}`);
  const { members } = await res.json();
  return members;
}

export async function joinRemoteGroup(groupId, groupName, memberName) {
  if (!isRemoteEnabled()) return;
  await fetch(getApiUrl(), {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action: "join", groupId, groupName, memberName }),
  });
}
