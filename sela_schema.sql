-- =============================================================
-- Sela | صِلة  —  Database Schema (PostgreSQL)
-- Generated strictly from the approved ER Diagram.
-- Order: Lookup tables first, then core entities referencing them.
-- =============================================================

-- =====================================================
-- LOOKUP TABLES
-- =====================================================

CREATE TABLE bank (
    bank_id     SERIAL PRIMARY KEY,
    bank_name   VARCHAR(100) NOT NULL
);

CREATE TABLE transaction_type (
    transaction_type_id  SERIAL PRIMARY KEY,
    type_name            VARCHAR(50) NOT NULL
);

CREATE TABLE spending_category (
    spending_category_id  SERIAL PRIMARY KEY,
    category_name         VARCHAR(50) NOT NULL
);

CREATE TABLE ai_output_type (
    ai_output_type_id   SERIAL PRIMARY KEY,
    output_type_name    VARCHAR(50) NOT NULL
);

CREATE TABLE health_status (
    health_status_id  SERIAL PRIMARY KEY,
    status_name       VARCHAR(50) NOT NULL
);

CREATE TABLE goal_calculation_mode (
    calculation_mode_id  SERIAL PRIMARY KEY,
    mode_name            VARCHAR(50) NOT NULL
);

-- =====================================================
-- CORE ENTITIES
-- =====================================================

CREATE TABLE app_user (
    user_id       SERIAL PRIMARY KEY,
    phone_number  VARCHAR(20) NOT NULL UNIQUE,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE account (
    account_id         SERIAL PRIMARY KEY,
    user_id            INTEGER NOT NULL,
    bank_id            INTEGER NOT NULL,
    last_four_digits   CHAR(4) NOT NULL,
    current_balance    NUMERIC(14,2) NOT NULL,
    is_manually_added  BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_account_user
        FOREIGN KEY (user_id) REFERENCES app_user (user_id),
    CONSTRAINT fk_account_bank
        FOREIGN KEY (bank_id) REFERENCES bank (bank_id)
);

CREATE TABLE transaction (
    transaction_id        SERIAL PRIMARY KEY,
    user_id               INTEGER NOT NULL,
    account_id            INTEGER NOT NULL,
    transaction_type_id   INTEGER NOT NULL,
    spending_category_id  INTEGER NOT NULL,
    amount                NUMERIC(14,2) NOT NULL,
    transaction_date      TIMESTAMP NOT NULL,
    CONSTRAINT fk_transaction_user
        FOREIGN KEY (user_id) REFERENCES app_user (user_id),
    CONSTRAINT fk_transaction_account
        FOREIGN KEY (account_id) REFERENCES account (account_id),
    CONSTRAINT fk_transaction_type
        FOREIGN KEY (transaction_type_id) REFERENCES transaction_type (transaction_type_id),
    CONSTRAINT fk_transaction_category
        FOREIGN KEY (spending_category_id) REFERENCES spending_category (spending_category_id)
);

CREATE TABLE ai_output (
    ai_output_id       SERIAL PRIMARY KEY,
    user_id            INTEGER NOT NULL,
    ai_output_type_id  INTEGER NOT NULL,
    content            TEXT NOT NULL,
    generated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ai_output_user
        FOREIGN KEY (user_id) REFERENCES app_user (user_id),
    CONSTRAINT fk_ai_output_type
        FOREIGN KEY (ai_output_type_id) REFERENCES ai_output_type (ai_output_type_id)
);

CREATE TABLE financial_score_snapshot (
    financial_score_id  SERIAL PRIMARY KEY,
    user_id             INTEGER NOT NULL,
    score_value         INTEGER NOT NULL,
    snapshot_date       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_financial_score_user
        FOREIGN KEY (user_id) REFERENCES app_user (user_id)
);

CREATE TABLE health_score_snapshot (
    health_score_id   SERIAL PRIMARY KEY,
    user_id           INTEGER NOT NULL,
    health_status_id  INTEGER NOT NULL,
    snapshot_date     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_health_score_user
        FOREIGN KEY (user_id) REFERENCES app_user (user_id),
    CONSTRAINT fk_health_score_status
        FOREIGN KEY (health_status_id) REFERENCES health_status (health_status_id)
);

CREATE TABLE smart_budget (
    budget_id             SERIAL PRIMARY KEY,
    user_id               INTEGER NOT NULL,
    spending_category_id  INTEGER NOT NULL,
    recommended_amount    NUMERIC(14,2) NOT NULL,
    CONSTRAINT fk_smart_budget_user
        FOREIGN KEY (user_id) REFERENCES app_user (user_id),
    CONSTRAINT fk_smart_budget_category
        FOREIGN KEY (spending_category_id) REFERENCES spending_category (spending_category_id)
);

CREATE TABLE financial_goal (
    goal_id               SERIAL PRIMARY KEY,
    user_id               INTEGER NOT NULL,
    calculation_mode_id   INTEGER NOT NULL,
    goal_type             VARCHAR(255) NOT NULL,
    target_amount         NUMERIC(14,2) NOT NULL,
    monthly_saving_amount NUMERIC(14,2) NOT NULL,
    estimated_months      INTEGER NOT NULL,
    CONSTRAINT fk_financial_goal_user
        FOREIGN KEY (user_id) REFERENCES app_user (user_id),
    CONSTRAINT fk_financial_goal_mode
        FOREIGN KEY (calculation_mode_id) REFERENCES goal_calculation_mode (calculation_mode_id)
);
