import { ExecutionContext, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { AppConfig } from '../../config/configuration';

/**
 * Google OAuth guard. Refuses with 503 when Google credentials are not
 * configured (so the routes exist and document cleanly, but make the disabled
 * state explicit instead of failing obscurely inside passport).
 */
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor(private readonly config: ConfigService<AppConfig, true>) {
    super({ accessType: 'offline', prompt: 'select_account' });
  }

  canActivate(context: ExecutionContext) {
    if (!this.config.get('google', { infer: true }).enabled) {
      throw new ServiceUnavailableException(
        'Google sign-in is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.',
      );
    }
    return super.canActivate(context);
  }
}
