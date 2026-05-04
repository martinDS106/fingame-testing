import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from './auth.constants';
import { MailService } from '../mail/mail.service';

type TokenPair = { accessToken: string; refreshToken: string };

function parseAdminEmails(): Set<string> {
  const raw =
    process.env.ADMIN_EMAILS ?? process.env.FIN_GAME_ADMIN_EMAILS ?? '';
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}

function isAdminEmail(email: string): boolean {
  if (!email) return false;
  const admins = parseAdminEmails();
  return admins.has(email.trim().toLowerCase());
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
  ) {}

  private async signTokens(user: {
    id: string;
    email: string;
    isAdmin: boolean;
  }): Promise<TokenPair> {
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, isAdmin: user.isAdmin },
      { expiresIn: '15m', secret: JWT_ACCESS_SECRET },
    );
    const refreshToken = await this.jwt.signAsync(
      { sub: user.id },
      { expiresIn: '30d', secret: JWT_REFRESH_SECRET },
    );
    return { accessToken, refreshToken };
  }

  async signup(emailRaw: string, password: string, displayName?: string) {
    const email = emailRaw.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        isAdmin: isAdminEmail(email),
        ...(displayName?.trim() ? { displayName: displayName.trim() } : {}),
      },
      select: { id: true, email: true, isAdmin: true, createdAt: true },
    });

    const tokens = await this.signTokens(user);
    return { user, tokens };
  }

  async login(emailRaw: string, password: string) {
    const email = emailRaw.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        isAdmin: true,
        passwordHash: true,
        createdAt: true,
      },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    // omit passwordHash from returned user object
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = user;

    // Auto-grant admin for configured emails (dev convenience).
    // In production you may prefer a dedicated admin management flow.
    const shouldBeAdmin = isAdminEmail(safeUser.email);
    const finalUser =
      shouldBeAdmin && !safeUser.isAdmin
        ? await this.prisma.user.update({
            where: { id: safeUser.id },
            data: { isAdmin: true },
            select: { id: true, email: true, isAdmin: true, createdAt: true },
          })
        : safeUser;

    const tokens = await this.signTokens(finalUser);
    return { user: finalUser, tokens };
  }

  async refresh(refreshTokenRaw: string) {
    let payload: { sub: string };
    try {
      payload = await this.jwt.verifyAsync<{ sub: string }>(refreshTokenRaw, {
        secret: JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, isAdmin: true, createdAt: true },
    });
    if (!user) throw new UnauthorizedException('Invalid refresh token');

    const tokens = await this.signTokens(user);
    return { user, tokens };
  }

  private hashResetToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Creates a password reset token for a user if exists.
   * Security: always returns ok=true to avoid account enumeration.
   *
   * Dev convenience: returns `resetToken` in non-production envs.
   */
  async forgotPassword(
    emailRaw: string,
  ): Promise<{ ok: true; sent: boolean }> {
    const email = emailRaw.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    // Always return ok=true to avoid account enumeration.
    if (!user) return { ok: true, sent: true };

    // Generate 6-digit OTP
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const pepper = (
      process.env.RESET_OTP_PEPPER ?? 'dev_reset_otp_pepper'
    ).trim();
    const codeHash = crypto
      .createHash('sha256')
      .update(`${user.id}:${code}:${pepper}`)
      .digest('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes

    await this.prisma.passwordResetOtp.create({
      data: { userId: user.id, codeHash, expiresAt },
    });

    const mailRes = await this.mail.sendPasswordResetOtp({ to: user.email, code });

    return { ok: true, sent: mailRes.sent };
  }

  resetPassword(): never {
    // kept for backwards compatibility (unused)
    throw new UnauthorizedException('Use OTP reset flow');
  }

  async resetPasswordWithOtp(params: {
    emailRaw: string;
    codeRaw: string;
    newPassword: string;
  }): Promise<{ ok: true }> {
    const email = params.emailRaw.trim().toLowerCase();
    const code = params.codeRaw.trim();
    if (!email || code.length !== 6) {
      throw new UnauthorizedException('Invalid reset code');
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!user) {
      // Avoid enumeration
      throw new UnauthorizedException('Invalid reset code');
    }

    const pepper = (
      process.env.RESET_OTP_PEPPER ?? 'dev_reset_otp_pepper'
    ).trim();
    const codeHash = crypto
      .createHash('sha256')
      .update(`${user.id}:${code}:${pepper}`)
      .digest('hex');

    const now = new Date();
    const row = await this.prisma.passwordResetOtp.findUnique({
      where: { codeHash },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        usedAt: true,
        attempts: true,
      },
    });

    if (!row || row.usedAt || row.expiresAt.getTime() <= now.getTime()) {
      throw new UnauthorizedException('Invalid reset code');
    }
    if (row.userId !== user.id) {
      throw new UnauthorizedException('Invalid reset code');
    }
    if (row.attempts >= 5) {
      throw new UnauthorizedException('Too many attempts');
    }

    const passwordHash = await bcrypt.hash(params.newPassword, 10);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      this.prisma.passwordResetOtp.update({
        where: { id: row.id },
        data: { usedAt: now, attempts: row.attempts + 1 },
      }),
      this.prisma.passwordResetOtp.deleteMany({
        where: { userId: user.id, usedAt: null, expiresAt: { lt: now } },
      }),
    ]);

    return { ok: true };
  }
}
