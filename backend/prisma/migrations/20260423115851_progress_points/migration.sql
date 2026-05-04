-- AlterTable
ALTER TABLE `Course` MODIFY `icon` VARCHAR(191) NULL DEFAULT '📚';

-- AlterTable
ALTER TABLE `User` ADD COLUMN `avatar` TEXT NULL,
    ADD COLUMN `coins` INTEGER NOT NULL DEFAULT 100,
    ADD COLUMN `displayName` VARCHAR(191) NOT NULL DEFAULT 'Player',
    ADD COLUMN `lastActiveDate` DATETIME(3) NULL,
    ADD COLUMN `level` VARCHAR(191) NOT NULL DEFAULT 'Beginner',
    ADD COLUMN `longestStreak` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `streak` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `xp` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `CoinsLog` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `reason` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CoinsLog_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserProgress` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(191) NOT NULL,
    `refId` VARCHAR(191) NOT NULL,
    `progress` DECIMAL(5, 2) NOT NULL DEFAULT 0.0,
    `completed` BOOLEAN NOT NULL DEFAULT false,
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `UserProgress_userId_idx`(`userId`),
    UNIQUE INDEX `UserProgress_userId_kind_refId_key`(`userId`, `kind`, `refId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuizAttempt` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `quizId` VARCHAR(191) NOT NULL,
    `score` INTEGER NOT NULL,
    `total` INTEGER NOT NULL,
    `coinsEarned` INTEGER NOT NULL DEFAULT 0,
    `completedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `QuizAttempt_userId_completedAt_idx`(`userId`, `completedAt`),
    INDEX `QuizAttempt_quizId_idx`(`quizId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockPrice` (
    `symbol` VARCHAR(191) NOT NULL,
    `price` DECIMAL(12, 2) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`symbol`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CoinsLog` ADD CONSTRAINT `CoinsLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserProgress` ADD CONSTRAINT `UserProgress_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuizAttempt` ADD CONSTRAINT `QuizAttempt_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuizAttempt` ADD CONSTRAINT `QuizAttempt_quizId_fkey` FOREIGN KEY (`quizId`) REFERENCES `Quiz`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
