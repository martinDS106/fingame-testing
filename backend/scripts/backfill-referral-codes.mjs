import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function generateReferralCode() {
  const bytes = crypto.randomBytes(5);
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += CHARSET[bytes[i] % CHARSET.length];
  }
  return code;
}

const prisma = new PrismaClient();

try {
  const users = await prisma.user.findMany({
    where: { referralCode: null },
    select: { id: true, email: true },
  });
  console.log(`Users without referral code: ${users.length}`);

  for (const user of users) {
    let assigned = false;
    for (let attempt = 0; attempt < 30; attempt++) {
      const referralCode = generateReferralCode();
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { referralCode },
        });
        console.log(`OK ${user.email} -> ${referralCode}`);
        assigned = true;
        break;
      } catch {
        // unique collision
      }
    }
    if (!assigned) {
      console.error(`FAILED ${user.email}`);
    }
  }
} finally {
  await prisma.$disconnect();
}
