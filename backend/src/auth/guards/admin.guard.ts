import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from '../jwt.strategy';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: unknown }>();
    const user = req.user as JwtPayload | undefined;
    if (user?.isAdmin) return true;
    throw new ForbiddenException('admin only');
  }
}
