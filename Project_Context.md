# Project Context — Sela | صِلة 💵

> A single reference document capturing the full context, requirements, and design artifacts for the Sela project. Intended as the onboarding/context file for anyone (or any tool) working on the project.

---

## 1. Project Overview

**Sela** is a smart financial mobile application designed to simplify personal finance management by gathering and analyzing financial activities from multiple bank accounts in one unified platform.

Instead of tracking each bank account separately, Sela provides users with a complete overview of their financial status through AI-powered analytics, personalized recommendations, and financial insights that help users make smarter financial decisions and improve their financial awareness.

### Core Approach
Rather than integrating directly with banks, the application analyzes **bank SMS messages** received on the user's device. This reduces security and integration complexity while providing a faster, simpler user experience.

---

## 2. How the Platform Works

### 2.1 Connecting Financial Accounts (Semi-Automatic Onboarding)
When a user registers for the first time:

- **Select used banks** — e.g., Al Rajhi Bank, SNB, Alinma Bank.
- **Grant SMS access** — the app reads bank SMS messages directly from the device (requires SMS read permission). It analyzes both previous and incoming messages, e.g. "Purchase of 45 SAR from STC Pay" or "Salary deposit of 8000 SAR".
- **Account detection** — after permission is granted, the app analyzes messages and detects the accounts associated with each bank. Detected accounts are displayed for the user to confirm. If an account is missing, the user can add it manually with its balance; it is then added to the detected list and the user confirms again.
- **Enter current balance once** — the user manually enters the current balance of each account during initial setup only (SMS messages provide transaction activity but may not reflect the exact balance). After setup, balances update automatically based on new transactions.
- **Account identification** — the application does **not** require full bank account numbers; only the **last four digits** are used to identify and track accounts associated with financial SMS messages.

### 2.2 Financial Data Collection
With the user's permission, the platform collects and analyzes: salaries, transfers, purchases, bills and subscriptions.

### 2.3 AI-Powered Data Analysis
AI automatically categorizes transactions (e.g., Restaurants, Shopping, Transportation, Bills), analyzes spending behavior, and detects financial patterns. Analytics recalculate **immediately upon each new transaction / SMS received** (real-time).

### 2.4 Smart Dashboard
Displays total balance across accounts, highest spending categories, monthly spending comparisons, saving percentage, and an overall financial summary.

### 2.5 Smart Recommendations
Personalized recommendations based on spending behavior, e.g. category increase alerts, potential savings suggestions, and budget-overrun warnings.

---

## 3. Key Features

| Feature | Description |
|---|---|
| **Financial Score** | A score out of 100 based on financial behavior, with tips to improve it. |
| **Financial Health Score** | Evaluated from saving rate, overspending habits, salary consistency, impulsive purchases, and budget commitment. Displayed as Excellent / Average / Needs Improvement. |
| **Smart Budget** | Auto-suggested personalized budgets per spending category based on previous months' patterns. |
| **AI Insights** | Actionable insights (e.g., nighttime spending changes, weekend purchase patterns, unused subscriptions). |
| **Financial Goals** | User-defined goals with smart saving plans and time/saving estimates. |

---

## 4. Confirmed Design Decisions (Clarifications)

These decisions were explicitly confirmed by the project owner and govern the design. **Nothing here is assumed.**

### Authentication & Users
- Authentication is via **phone number + OTP only** (no email/password).
- The system is **multi-user**; each user owns their own accounts, transactions, goals, etc.

### Accounts & Banks
- Balances are tracked at the **account level**, and each account belongs to a bank. One user → multiple banks; one bank (for that user) → one or more accounts.
- Accounts are auto-detected from SMS after permission, confirmed by the user, with manual add as a fallback.
- Accounts are identified by the **last four digits** only.

### Transactions
- Each transaction has **two separate fields**: a **Transaction Type** (salary, transfer, purchase, bill payment, etc.) and a **Spending Category** (restaurants, shopping, transportation, bills, etc.). A transaction may have one type and one category simultaneously.

### Manual Balance Adjustment
- The user can manually update certain balances, and the system **recalculates anything affected** by the update.

### Real-Time Processing
- All analytics, dashboards, scores, budgets, recommendations, and insights recalculate **immediately** upon each new transaction/SMS.

### AI Outputs
- Smart Recommendations, AI Insights, and Financial Score Tips are stored in a **single generic "AI Outputs" entity**. Each record includes output type, related user, generated content, and timestamp. Outputs are generated dynamically and persisted for history tracking.

### Scores & Budgets
- **Financial Score** and **Financial Health Score** are stored as **periodic snapshots** for historical/trend analysis.
- **Smart Budget** is a separate entity — each user can have multiple budget records across different spending categories.
- **Saving Percentage** is **calculated dynamically** (not stored as a persistent entity).

### Financial Goals
- `goal_type` is a **free-text** field (not a lookup).
- The saving plan / time estimate is stored as **attributes on the Goal entity** itself.
- Goals support **two calculation modes**:
  - **Saving-driven**: user enters monthly saving amount → system calculates estimated months.
  - **Deadline-driven**: user enters a deadline (months) → system calculates required monthly saving amount.
  - A `calculation_mode` field (lookup) records which mode produced the goal.

### Non-Functional Requirements
- Explicitly **out of scope / dismissed** by the project owner for now.

---

## 5. Functional Requirements (Summary)

Full text lives in `Sela_Functional_Requirements.docx`. Groups:

- **FR-1** Account Registration & Authentication (phone + OTP)
- **FR-2** Onboarding & Bank Selection (bank selection, SMS permission, account detection, one-time balance entry)
- **FR-3** Financial Data Collection (read incoming SMS, collect transactions, auto-update balance)
- **FR-4** Manual Balance Adjustment (manual update + recalculation of affected data)
- **FR-5** AI-Powered Transaction Categorization (auto-categorize, detect patterns)
- **FR-6** Smart Dashboard (total balance, top categories, monthly comparison, saving %, summary)
- **FR-7** Smart Recommendations (personalized, change alerts, savings, budget-overrun warnings)
- **FR-8** Financial Score (score /100, improvement tips)
- **FR-9** Financial Health Score (factor-based; Excellent/Average/Needs Improvement)
- **FR-10** Smart Budget (auto-suggested per-category budgets)
- **FR-11** AI Insights (actionable insights)
- **FR-12** Financial Goals (set goals; two calculation modes; saving plans)
- **FR-13** Real-Time Processing (recalculate on every new transaction/SMS)

---

## 6. Database Design

### 6.1 Core Entities (8)
- **app_user** — `user_id` (PK), `phone_number` (unique), `created_at`
- **account** — `account_id` (PK), `user_id` (FK), `bank_id` (FK), `last_four_digits`, `current_balance`, `is_manually_added`
- **transaction** — `transaction_id` (PK), `user_id` (FK), `account_id` (FK), `transaction_type_id` (FK), `spending_category_id` (FK), `amount`, `transaction_date`
- **ai_output** — `ai_output_id` (PK), `user_id` (FK), `ai_output_type_id` (FK), `content`, `generated_at`
- **financial_score_snapshot** — `financial_score_id` (PK), `user_id` (FK), `score_value`, `snapshot_date`
- **health_score_snapshot** — `health_score_id` (PK), `user_id` (FK), `health_status_id` (FK), `snapshot_date`
- **smart_budget** — `budget_id` (PK), `user_id` (FK), `spending_category_id` (FK), `recommended_amount`
- **financial_goal** — `goal_id` (PK), `user_id` (FK), `calculation_mode_id` (FK), `goal_type`, `target_amount`, `monthly_saving_amount`, `estimated_months`

### 6.2 Lookup Tables (6)
- **bank** — `bank_id` (PK), `bank_name`
- **transaction_type** — `transaction_type_id` (PK), `type_name`
- **spending_category** — `spending_category_id` (PK), `category_name`
- **ai_output_type** — `ai_output_type_id` (PK), `output_type_name`
- **health_status** — `health_status_id` (PK), `status_name`
- **goal_calculation_mode** — `calculation_mode_id` (PK), `mode_name` (saving_driven, deadline_driven)

### 6.3 Relationships (15, all one-to-many)
- app_user → account, transaction, ai_output, financial_score_snapshot, health_score_snapshot, smart_budget, financial_goal
- bank → account
- account → transaction
- transaction_type → transaction
- spending_category → transaction, smart_budget
- ai_output_type → ai_output
- health_status → health_score_snapshot
- goal_calculation_mode → financial_goal

> **Note:** Saving Percentage is intentionally **not** an entity — it is computed dynamically from income and spending data.

---

## 7. Data Flow Diagram (DFD)

### External Entities (2)
1. **User**
2. **Bank SMS / Device Messages**
   *(No separate OTP/SMS Gateway entity by decision.)*

### Logical Data Stores (4)
- **D1** User Data
- **D2** Financial Data
- **D3** AI Analysis Results
- **D4** Goals & Budgets Data
  *(Lookup tables are not modeled as separate data stores.)*

### Processes — Level 1 (mapped to FR groups)
1. Register & Authenticate User (FR-1)
2. Onboard & Detect Accounts (FR-2)
3. Collect & Process Transactions (FR-3, FR-4)
4. Analyze & Categorize Finances (FR-5, FR-13)
5. Generate Dashboard & Reports (FR-6)
6. Generate AI Outputs (FR-7, FR-8, FR-9, FR-11)
7. Manage Budgets & Goals (FR-10, FR-12)

Level 0 (Context) shows the whole system as a single process (0) between the two external entities.

---

## 8. Project Artifacts

| File | Description |
|---|---|
| `Sela_Functional_Requirements.docx` | Full functional requirements specification (FR-1 → FR-13). |
| `sela_schema.sql` | PostgreSQL schema — 14 tables, 15 foreign keys, lookup tables first. |
| `Sela_ER_Diagram.drawio` / `.xml` | ER diagram (Diagrams.net), all entities/attributes/keys/relationships. |
| `Sela_DFD.drawio` / `.xml` | DFD with two pages: Level 0 (Context) and Level 1 (Decomposition). |
| `Sela_ER_Diagram.drawio.png` | PNG export of the ER diagram for quick viewing/embedding. |
| `Sela_DFD-Level 0 - Context.drawio.png` | PNG export of the Level 0 (Context) DFD. |
| `Sela_DFD-Level 1 - Decomposition.drawio.png` | PNG export of the Level 1 (Decomposition) DFD. |
| `sela_database_er_diagram_v2.html` | Interactive HTML version of the ER diagram (rendered Mermaid ERD). |
| `App_Design_Reference.png` | App visual/design reference. Official app color palette: Navy Blue `#162E5F`, Light Gray `#E6E6E6`, Light Lavender `#E3E2FF`, Dark Purple `#3E007D`, Pink Purple `#7D0070`. |
| `Project_Context.md` | This file. |

---

## 9. Conventions & Ground Rules

- **No invented requirements:** every entity, attribute, relationship, process, and data flow is derived strictly from information provided by the project owner.
- **Currency:** SAR (Saudi Riyal).
- **Target DB engine:** PostgreSQL.
- **Money type:** `NUMERIC(14,2)`; **last four digits:** `CHAR(4)` (revisit if specific constraints are provided).
- **Reserved-word handling:** the users table is named `app_user` to avoid the SQL reserved word `user`.

---

*Last updated as part of the ongoing Sela design effort. Update this file whenever new decisions are confirmed.*
