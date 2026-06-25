-- Unique shareable referral code per user (5 chars: A-Z + 0-9).
ALTER TABLE `User` ADD COLUMN `referralCode` VARCHAR(5) NULL;

CREATE UNIQUE INDEX `User_referralCode_key` ON `User`(`referralCode`);
