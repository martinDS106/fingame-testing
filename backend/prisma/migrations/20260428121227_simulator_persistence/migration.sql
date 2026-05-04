-- AlterTable
ALTER TABLE `Course` MODIFY `icon` VARCHAR(191) NULL DEFAULT '📚';

-- AlterTable
ALTER TABLE `User` ADD COLUMN `simCash` INTEGER NOT NULL DEFAULT 100000;

-- CreateTable
CREATE TABLE `InvestmentHolding` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `symbol` VARCHAR(191) NOT NULL,
    `shares` INTEGER NOT NULL,
    `avgCost` DECIMAL(12, 2) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `InvestmentHolding_userId_updatedAt_idx`(`userId`, `updatedAt`),
    UNIQUE INDEX `InvestmentHolding_userId_symbol_key`(`userId`, `symbol`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InvestmentTrade` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `symbol` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `shares` INTEGER NOT NULL,
    `price` DECIMAL(12, 2) NOT NULL,
    `orderType` VARCHAR(191) NULL,
    `at` DATETIME(3) NOT NULL,

    INDEX `InvestmentTrade_userId_at_idx`(`userId`, `at`),
    INDEX `InvestmentTrade_symbol_at_idx`(`symbol`, `at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BankingTransaction` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `accountId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `note` TEXT NULL,
    `at` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `BankingTransaction_userId_at_idx`(`userId`, `at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `InvestmentHolding` ADD CONSTRAINT `InvestmentHolding_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvestmentTrade` ADD CONSTRAINT `InvestmentTrade_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BankingTransaction` ADD CONSTRAINT `BankingTransaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
