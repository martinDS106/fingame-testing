-- One-time referral prompt for brand-new signups only.
ALTER TABLE `User` ADD COLUMN `referralOnboardingPending` BOOLEAN NOT NULL DEFAULT false;
