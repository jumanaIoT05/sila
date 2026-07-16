-- CreateTable
CREATE TABLE "bank" (
    "bank_id" SERIAL NOT NULL,
    "bank_name" VARCHAR(100) NOT NULL,

    CONSTRAINT "bank_pkey" PRIMARY KEY ("bank_id")
);

-- CreateTable
CREATE TABLE "transaction_type" (
    "transaction_type_id" SERIAL NOT NULL,
    "type_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "transaction_type_pkey" PRIMARY KEY ("transaction_type_id")
);

-- CreateTable
CREATE TABLE "spending_category" (
    "spending_category_id" SERIAL NOT NULL,
    "category_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "spending_category_pkey" PRIMARY KEY ("spending_category_id")
);

-- CreateTable
CREATE TABLE "ai_output_type" (
    "ai_output_type_id" SERIAL NOT NULL,
    "output_type_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "ai_output_type_pkey" PRIMARY KEY ("ai_output_type_id")
);

-- CreateTable
CREATE TABLE "health_status" (
    "health_status_id" SERIAL NOT NULL,
    "status_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "health_status_pkey" PRIMARY KEY ("health_status_id")
);

-- CreateTable
CREATE TABLE "goal_calculation_mode" (
    "calculation_mode_id" SERIAL NOT NULL,
    "mode_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "goal_calculation_mode_pkey" PRIMARY KEY ("calculation_mode_id")
);

-- CreateTable
CREATE TABLE "app_user" (
    "user_id" SERIAL NOT NULL,
    "phone_number" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_user_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "account" (
    "account_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "bank_id" INTEGER NOT NULL,
    "last_four_digits" CHAR(4) NOT NULL,
    "current_balance" DECIMAL(14,2) NOT NULL,
    "is_manually_added" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "account_pkey" PRIMARY KEY ("account_id")
);

-- CreateTable
CREATE TABLE "transaction" (
    "transaction_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "account_id" INTEGER NOT NULL,
    "transaction_type_id" INTEGER NOT NULL,
    "spending_category_id" INTEGER NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "transaction_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateTable
CREATE TABLE "ai_output" (
    "ai_output_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "ai_output_type_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_output_pkey" PRIMARY KEY ("ai_output_id")
);

-- CreateTable
CREATE TABLE "financial_score_snapshot" (
    "financial_score_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "score_value" INTEGER NOT NULL,
    "snapshot_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "financial_score_snapshot_pkey" PRIMARY KEY ("financial_score_id")
);

-- CreateTable
CREATE TABLE "health_score_snapshot" (
    "health_score_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "health_status_id" INTEGER NOT NULL,
    "snapshot_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_score_snapshot_pkey" PRIMARY KEY ("health_score_id")
);

-- CreateTable
CREATE TABLE "smart_budget" (
    "budget_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "spending_category_id" INTEGER NOT NULL,
    "recommended_amount" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "smart_budget_pkey" PRIMARY KEY ("budget_id")
);

-- CreateTable
CREATE TABLE "financial_goal" (
    "goal_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "calculation_mode_id" INTEGER NOT NULL,
    "goal_type" VARCHAR(255) NOT NULL,
    "target_amount" DECIMAL(14,2) NOT NULL,
    "monthly_saving_amount" DECIMAL(14,2) NOT NULL,
    "estimated_months" INTEGER NOT NULL,

    CONSTRAINT "financial_goal_pkey" PRIMARY KEY ("goal_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_user_phone_number_key" ON "app_user"("phone_number");

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "bank"("bank_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_transaction_type_id_fkey" FOREIGN KEY ("transaction_type_id") REFERENCES "transaction_type"("transaction_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_spending_category_id_fkey" FOREIGN KEY ("spending_category_id") REFERENCES "spending_category"("spending_category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_output" ADD CONSTRAINT "ai_output_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_output" ADD CONSTRAINT "ai_output_ai_output_type_id_fkey" FOREIGN KEY ("ai_output_type_id") REFERENCES "ai_output_type"("ai_output_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_score_snapshot" ADD CONSTRAINT "financial_score_snapshot_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_score_snapshot" ADD CONSTRAINT "health_score_snapshot_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_score_snapshot" ADD CONSTRAINT "health_score_snapshot_health_status_id_fkey" FOREIGN KEY ("health_status_id") REFERENCES "health_status"("health_status_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "smart_budget" ADD CONSTRAINT "smart_budget_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "smart_budget" ADD CONSTRAINT "smart_budget_spending_category_id_fkey" FOREIGN KEY ("spending_category_id") REFERENCES "spending_category"("spending_category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_goal" ADD CONSTRAINT "financial_goal_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_goal" ADD CONSTRAINT "financial_goal_calculation_mode_id_fkey" FOREIGN KEY ("calculation_mode_id") REFERENCES "goal_calculation_mode"("calculation_mode_id") ON DELETE RESTRICT ON UPDATE CASCADE;
