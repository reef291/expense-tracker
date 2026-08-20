export const CATEGORIES = [
  { id: "food", label: "אוכל", icon: "🍔" },
  { id: "transport", label: "תחבורה", icon: "🚌" },
  { id: "lodging", label: "לינה", icon: "🛏️" },
  { id: "activities", label: "בילויים", icon: "🎟️" },
  { id: "attractions", label: "אטרקציות", icon: "🎡" },
  { id: "shopping", label: "קניות", icon: "🛍️" },
  { id: "medical", label: "רפואי", icon: "💊" },
  { id: "gear", label: "ציוד", icon: "🎒" },
  { id: "service", label: "שירות", icon: "🛎️" },
  { id: "other", label: "אחר", icon: "📦" },
];

export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}
