-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `contact_no` VARCHAR(191) NOT NULL,
    `isd_code` VARCHAR(191) NOT NULL,
    `whats_app_number` VARCHAR(191) NULL,
    `location` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `date_of_birth` VARCHAR(191) NULL,
    `profile_image` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `goals` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(191) NULL,
    `lead_target` INTEGER NOT NULL,
    `lead_actual` INTEGER NULL,
    `lag_target` INTEGER NULL,
    `lag_actual` INTEGER NULL,
    `duration` VARCHAR(191) NOT NULL,
    `duration_weeks` INTEGER NULL,
    `start_date` VARCHAR(191) NULL,
    `end_date` VARCHAR(191) NULL,
    `lead_execution_score` VARCHAR(191) NULL,
    `lag_execution_score` VARCHAR(191) NULL,
    `overall_execution_score` VARCHAR(191) NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `week_goals` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `week_for` INTEGER NOT NULL,
    `goal_id` INTEGER NOT NULL,
    `description` VARCHAR(191) NULL,
    `lead_target` INTEGER NOT NULL,
    `lead_actual` INTEGER NULL,
    `lag_target` INTEGER NULL,
    `lag_actual` INTEGER NULL,
    `start_date` VARCHAR(191) NULL,
    `end_date` VARCHAR(191) NULL,
    `lead_execution_score` VARCHAR(191) NULL,
    `lag_execution_score` VARCHAR(191) NULL,
    `overall_execution_score` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `goal_additional_points` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(191) NULL,
    `additional_point` VARCHAR(191) NULL,
    `point_label` VARCHAR(191) NULL,
    `point_value` VARCHAR(191) NULL,
    `user_id` INTEGER NOT NULL,
    `goal_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `goals` ADD CONSTRAINT `goals_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `week_goals` ADD CONSTRAINT `week_goals_goal_id_fkey` FOREIGN KEY (`goal_id`) REFERENCES `goals`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `goal_additional_points` ADD CONSTRAINT `goal_additional_points_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `goal_additional_points` ADD CONSTRAINT `goal_additional_points_goal_id_fkey` FOREIGN KEY (`goal_id`) REFERENCES `goals`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
