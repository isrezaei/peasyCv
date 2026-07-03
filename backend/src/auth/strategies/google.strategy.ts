import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import type { AppConfig } from '../../config/configuration';
import { AuthService } from '../auth.service';

/**
 * Google OAuth 2.0 strategy. Construction always succeeds (placeholder
 * credentials when Google is not configured) so the app boots without Google
 * env vars — the GoogleAuthGuard blocks the routes when the feature is disabled.
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    config: ConfigService<AppConfig, true>,
    private readonly authService: AuthService,
  ) {
    const google = config.get('google', { infer: true });
    super({
      clientID: google.clientId || 'google-oauth-disabled',
      clientSecret: google.clientSecret || 'google-oauth-disabled',
      callbackURL: google.callbackUrl,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      done(new Error('Google account did not return an email address.'), undefined);
      return;
    }

    const user = await this.authService.validateGoogleUser({
      googleId: profile.id,
      email,
      name: profile.displayName ?? null,
    });

    // Attached to req.user; the controller then issues our own JWT session.
    done(null, { id: user.id, email: user.email });
  }
}
