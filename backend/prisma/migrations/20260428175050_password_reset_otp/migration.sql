-- AlterTable
ALTER TABLE `Course` MODIFY `icon` VARCHAR(191) NULL DEFAULT '📚';

-- CreateTable
CREATE TABLE `PasswordResetOtp` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `codeHash` VARCHAR(64) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PasswordResetOtp_codeHash_key`(`codeHash`),
    INDEX `PasswordResetOtp_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `PasswordResetOtp_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PasswordResetOtp` ADD CONSTRAINT `PasswordResetOtp_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
