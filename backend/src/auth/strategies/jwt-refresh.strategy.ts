import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import type { AppConfig } from '../../config/configuration';
import type { JwtPayload } from '../../common/types/auth-user';

export interface RefreshRequestUser {
  id: string;
  email: string;
  refreshToken: string;
}

/**
 * Refresh-token strategy. Reads the refresh token from the JSON body field
 * `refreshToken`, verifies it against the refresh secret, and forwards the raw
 * token alongside the payload so the service can compare it to the stored hash
 * and rotate it.
 */
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService<AppConfig, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: config.get('jwt', { infer: true }).refreshSecret,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload): RefreshRequestUser {
    const refreshToken = (req.body as { refreshToken?: string })?.refreshToken ?? '';
    return { id: payload.sub, email: payload.email, refreshToken };
  }
}
