/*
  Warnings:

  - Added the required column `name` to the `goals` table without a default value. This is not possible if the table is not empty.
  - Made the column `start_date` on table `goals` required. This step will fail if there are existing NULL values in that column.
  - Made the column `end_date` on table `goals` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `goals` ADD COLUMN `name` VARCHAR(191) NOT NULL,
    MODIFY `start_date` VARCHAR(191) NOT NULL,
    MODIFY `end_date` VARCHAR(191) NOT NULL;
