-- AlterTable
ALTER TABLE `week_goals` ADD COLUMN `lag_cumulative_execution_score` VARCHAR(191) NULL,
    ADD COLUMN `lead_cumulative_execution_score` VARCHAR(191) NULL;
