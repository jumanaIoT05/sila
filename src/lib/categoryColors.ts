// Single source of truth for category colors, shared by the donut chart and
// the Top Spending Categories list so a category's swatch always matches its
// donut segment. Colors stay within the Sila navy → blue → gold palette.

const CATEGORY_COLORS: Record<string, string> = {
  Bills: "#1A2B4D", // primary navy
  Shopping: "#39546D", // trust
  Groceries: "#6B8FA7", // stability
  Restaurants: "#D4AF37", // gold
  Transportation: "#8AA6BC", // light blue
  Subscriptions: "#B8952B", // dark gold
  Entertainment: "#4E6E8A",
  Health: "#9CB2C4",
  Other: "#AEB8C4", // neutral
  Income: "#D4AF37", // gold (inflow)
};

// Deterministic fallback for any category not in the map above.
const FALLBACK = ["#1A2B4D", "#39546D", "#6B8FA7", "#D4AF37", "#8AA6BC", "#B8952B"];

export function categoryColor(name: string): string {
  if (CATEGORY_COLORS[name]) return CATEGORY_COLORS[name];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return FALLBACK[hash % FALLBACK.length];
}

// Emoji icon per category (budget cards, etc.).
const CATEGORY_ICONS: Record<string, string> = {
  Restaurants: "🍽️",
  Shopping: "🛍️",
  Transportation: "🚗",
  Groceries: "🛒",
  Bills: "🧾",
  Subscriptions: "📺",
  Entertainment: "🎬",
  Health: "💊",
  Other: "📦",
  Income: "💰",
};

export function categoryIcon(name: string): string {
  return CATEGORY_ICONS[name] ?? "📦";
}
