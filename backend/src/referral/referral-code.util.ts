import * as crypto from 'crypto';
import type { PrismaService } from '../prisma/prisma.service';

const REFERRAL_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const REFERRAL_CODE_LENGTH = 5;
const MAX_ATTEMPTS = 30;

export function generateReferralCode(): string {
  const bytes = crypto.randomBytes(REFERRAL_CODE_LENGTH);
  let code = '';
  for (let i = 0; i < REFERRAL_CODE_LENGTH; i++) {
    code += REFERRAL_CHARSET[bytes[i]! % REFERRAL_CHARSET.length];
  }
  return code;
}

export async function allocateUniqueReferralCode(
  prisma: PrismaService,
): Promise<string> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const referralCode = generateReferralCode();
    const existing = await prisma.user.findUnique({
      where: { referralCode },
      select: { id: true },
    });
    if (!existing) return referralCode;
  }
  throw new Error('Failed to allocate unique referral code');
}

export async function ensureUserReferralCode(
  prisma: PrismaService,
  userId: string,
): Promise<string> {
  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });
  if (current?.referralCode) return current.referralCode;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const referralCode = generateReferralCode();
    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { referralCode },
        select: { referralCode: true },
      });
      if (updated.referralCode) return updated.referralCode;
    } catch {
      // Unique collision — retry with another code.
    }
  }
  throw new Error('Failed to ensure referral code for user');
}
