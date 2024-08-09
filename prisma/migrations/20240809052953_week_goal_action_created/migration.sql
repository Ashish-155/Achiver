-- CreateTable
CREATE TABLE `week_goal_actions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key_action` VARCHAR(191) NOT NULL,
    `who` VARCHAR(191) NULL,
    `day` VARCHAR(191) NULL,
    `week_goal_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `week_goal_actions` ADD CONSTRAINT `week_goal_actions_week_goal_id_fkey` FOREIGN KEY (`week_goal_id`) REFERENCES `week_goals`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
