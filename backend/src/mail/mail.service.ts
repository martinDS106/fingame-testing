import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter | null = null;

  private getTransporter(): nodemailer.Transporter | null {
    if (this.transporter) return this.transporter;

    const host = (process.env.SMTP_HOST ?? '').trim();
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = (process.env.SMTP_USER ?? '').trim();
    const pass = (process.env.SMTP_PASS ?? '').trim();

    if (!host || !user || !pass) return null;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    return this.transporter;
  }

  async sendPasswordResetOtp(params: { to: string; code: string }) {
    const from = (
      process.env.SMTP_FROM ?? 'Fin-Game <no-reply@fin-game.local>'
    ).trim();
    const transporter = this.getTransporter();

    // If SMTP isn't configured, we don't error (to avoid breaking dev).
    // We log the OTP so it can still be tested locally.
    if (!transporter) {
      console.log('[mail] SMTP not configured; OTP:', {
        to: params.to,
        code: params.code,
      });
      return { ok: true, sent: false };
    }

    await transporter.sendMail({
      from,
      to: params.to,
      subject: 'Fin-Game password reset code',
      text: `Your Fin-Game password reset code is: ${params.code}\n\nThis code expires in 10 minutes.`,
    });

    return { ok: true, sent: true };
  }
}
