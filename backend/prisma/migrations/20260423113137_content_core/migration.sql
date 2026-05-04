-- CreateTable
CREATE TABLE `Course` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `titleAr` TEXT NULL,
    `description` TEXT NULL,
    `descriptionAr` TEXT NULL,
    `topic` VARCHAR(191) NOT NULL DEFAULT 'investing',
    `icon` VARCHAR(191) NULL DEFAULT '📚',
    `color` VARCHAR(191) NULL DEFAULT '#2563eb',
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `coinReward` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Course_topic_sortOrder_idx`(`topic`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lesson` (
    `id` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `titleAr` TEXT NULL,
    `summary` TEXT NULL,
    `summaryAr` TEXT NULL,
    `durationMinutes` INTEGER NOT NULL DEFAULT 10,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Lesson_courseId_sortOrder_idx`(`courseId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Video` (
    `id` VARCHAR(191) NOT NULL,
    `lessonId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `titleAr` TEXT NULL,
    `url` TEXT NOT NULL,
    `thumbnail` TEXT NULL,
    `durationSeconds` INTEGER NOT NULL DEFAULT 0,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Video_lessonId_sortOrder_idx`(`lessonId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Quiz` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `titleAr` TEXT NULL,
    `description` TEXT NULL,
    `descriptionAr` TEXT NULL,
    `category` VARCHAR(191) NOT NULL DEFAULT 'general',
    `difficulty` VARCHAR(191) NOT NULL DEFAULT 'easy',
    `coinReward` INTEGER NOT NULL DEFAULT 10,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Quiz_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Question` (
    `id` VARCHAR(191) NOT NULL,
    `quizId` VARCHAR(191) NOT NULL,
    `question` TEXT NOT NULL,
    `questionAr` TEXT NULL,
    `options` JSON NOT NULL,
    `optionsAr` JSON NULL,
    `correctIndex` INTEGER NOT NULL,
    `explanation` TEXT NULL,
    `explanationAr` TEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Question_quizId_sortOrder_idx`(`quizId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Lesson` ADD CONSTRAINT `Lesson_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Video` ADD CONSTRAINT `Video_lessonId_fkey` FOREIGN KEY (`lessonId`) REFERENCES `Lesson`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_quizId_fkey` FOREIGN KEY (`quizId`) REFERENCES `Quiz`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
