// =============================================================
// Demo Mode scenarios (presentation / hackathon only).
// Each scenario is a sequence of realistic bank SMS messages that are fed
// through the SAME parser + ingestion pipeline the app uses for real SMS,
// so they generate transactions exactly as real messages would.
// =============================================================

export interface DemoScenario {
  key: string;
  title: string;
  description: string;
  icon: string;
  messages: string[];
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    key: "salary_month",
    title: "Salary Month",
    description: "Salary lands, recurring bills and a few everyday purchases post.",
    icon: "💰",
    messages: [
      "Al Rajhi Bank: Salary of 8000 SAR deposited to account ending 4821",
      "Al Rajhi Bank: Bill payment of 450 SAR to STC from card ending 4821",
      "Al Rajhi Bank: Purchase of 215.50 SAR at Tamimi Markets from card ending 4821",
      "Al Rajhi Bank: Netflix subscription of 55 SAR from card ending 4821",
      "Al Rajhi Bank: Careem ride of 40 SAR from card ending 4821",
    ],
  },
  {
    key: "heavy_spending",
    title: "Heavy Spending",
    description: "A splurge weekend — big shopping, dining and an ATM withdrawal push budgets over.",
    icon: "🔥",
    messages: [
      "Al Rajhi Bank: Purchase of 899 SAR at Noon.com from card ending 4821",
      "Al Rajhi Bank: Purchase of 450 SAR at Zara from card ending 4821",
      "Al Rajhi Bank: Restaurant purchase of 320 SAR from card ending 4821",
      "Al Rajhi Bank: Purchase of 275 SAR at Jarir from card ending 4821",
      "Al Rajhi Bank: ATM cash withdrawal of 600 SAR from card ending 4821",
    ],
  },
  {
    key: "goal_achievement",
    title: "Goal Achievement",
    description: "A strong savings month — salary, a bonus and cashback boost income and saving rate.",
    icon: "🎯",
    messages: [
      "Al Rajhi Bank: Salary of 8000 SAR deposited to account ending 4821",
      "Al Rajhi Bank: Bonus of 3500 SAR deposited to account ending 4821",
      "Al Rajhi Bank: Cashback of 120 SAR credited to account ending 4821",
      "Al Rajhi Bank: Purchase of 90 SAR at Tamimi Markets from card ending 4821",
    ],
  },
];

export function findScenario(key: string): DemoScenario | undefined {
  return DEMO_SCENARIOS.find((s) => s.key === key);
}
