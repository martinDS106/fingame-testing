import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  health() {
    return { ok: true, apiVersion: '2026-06-25', referralCodes: true };
  }
}
