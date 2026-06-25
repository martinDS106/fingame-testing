import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { meUserSelect } from '../me/user-select';
import {
  REFERRAL_INVITEE_COINS,
  REFERRAL_REFERRER_COINS,
} from './referral.constants';

function normalizeReferralInput(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
}

@Injectable()
export class ReferralService {
  constructor(private readonly prisma: PrismaService) {}

  async applyReferral(userId: string, rawCode: string) {
    const code = normalizeReferralInput(rawCode);
    if (code.length !== 5) {
      throw new BadRequestException('Referral code must be 5 characters');
    }

    const self = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        referralCode: true,
        referredByCode: true,
        referralOnboardingPending: true,
      },
    });
    if (!self) throw new NotFoundException('User not found');
    if (!self.referralOnboardingPending) {
      throw new BadRequestException('Referral onboarding already completed');
    }
    if (self.referredByCode) {
      throw new BadRequestException('Referral code already applied');
    }
    if (self.referralCode && code === self.referralCode) {
      throw new BadRequestException('Cannot use your own referral code');
    }

    const referrer = await this.prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true, referralCode: true },
    });
    if (!referrer) {
      throw new BadRequestException('Referral code not found');
    }
    if (referrer.id === userId) {
      throw new BadRequestException('Cannot use your own referral code');
    }

    const inviteeCoins = Math.max(0, REFERRAL_INVITEE_COINS);
    const referrerCoins = Math.max(0, REFERRAL_REFERRER_COINS);

    const updatedUser = await this.prisma.$transaction(async (tx) => {
      const invitee = await tx.user.update({
        where: { id: userId },
        data: {
          referredByCode: code,
          referralOnboardingPending: false,
          coins: { increment: inviteeCoins },
        },
        select: meUserSelect,
      });

      await tx.user.update({
        where: { id: referrer.id },
        data: { coins: { increment: referrerCoins } },
      });

      if (inviteeCoins > 0) {
        await tx.coinsLog.create({
          data: {
            userId,
            amount: inviteeCoins,
            reason: 'referral_invitee',
          },
        });
      }
      if (referrerCoins > 0) {
        await tx.coinsLog.create({
          data: {
            userId: referrer.id,
            amount: referrerCoins,
            reason: 'referral_referrer',
          },
        });
      }

      return invitee;
    });

    return {
      user: updatedUser,
      inviteeCoins,
      referrerCoins,
    };
  }

  async skipReferralOnboarding(userId: string) {
    const self = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { referralOnboardingPending: true },
    });
    if (!self) throw new NotFoundException('User not found');
    if (!self.referralOnboardingPending) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: meUserSelect,
      });
      return { user };
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { referralOnboardingPending: false },
      select: meUserSelect,
    });
    return { user };
  }
}
