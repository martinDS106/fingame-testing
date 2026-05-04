import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JWT_ACCESS_SECRET } from './auth.constants';

export type JwtPayload = {
  sub: string;
  email: string;
  isAdmin: boolean;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_ACCESS_SECRET,
    });
  }

  validate(payload: JwtPayload) {
    return payload;
  }
}
