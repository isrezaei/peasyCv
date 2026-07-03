import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import type { AppConfig } from '../config/configuration';
import type { JwtPayload } from '../common/types/auth-user';
import { hashPassword, hashToken, verifyPassword, verifyToken } from '../common/security/hashing';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, AuthTokensDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  // --- Email + password ----------------------------------------------------

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }

    const passwordHash = await hashPassword(dto.password);
    const user = await this.users.createWithPassword({
      email: dto.email,
      passwordHash,
      name: dto.name ?? null,
    });

    return this.buildSession(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.users.findByEmail(dto.email);
    if (!user || !user.passwordHash) {
      // Same message whether the email is unknown or has no password (Google-only).
      throw new UnauthorizedException('Invalid email or password.');
    }

    const valid = await verifyPassword(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return this.buildSession(user);
  }

  // --- Refresh / logout ----------------------------------------------------

  async refresh(userId: string, providedRefreshToken: string): Promise<AuthTokensDto> {
    const user = await this.users.findById(userId);
    if (!user || !user.hashedRefreshToken) {
      throw new ForbiddenException('Access denied.');
    }

    const matches = await verifyToken(providedRefreshToken, user.hashedRefreshToken);
    if (!matches) {
      // Token reuse / mismatch: revoke the session entirely.
      await this.users.setRefreshTokenHash(user.id, null);
      throw new ForbiddenException('Access denied.');
    }

    return this.rotateTokens(user);
  }

  async logout(userId: string): Promise<void> {
    await this.users.setRefreshTokenHash(userId, null);
  }

  // --- Google OAuth --------------------------------------------------------

  /**
   * Resolve (or provision) the local account behind a Google identity. If an
   * account with the same email already exists it is linked to the Google id,
   * so email/password and Google sign-in converge on one account.
   */
  async validateGoogleUser(input: {
    googleId: string;
    email: string;
    name: string | null;
  }): Promise<User> {
    const byGoogle = await this.users.findByGoogleId(input.googleId);
    if (byGoogle) return byGoogle;

    const byEmail = await this.users.findByEmail(input.email);
    if (byEmail) {
      return byEmail.googleId ? byEmail : this.users.linkGoogleId(byEmail.id, input.googleId);
    }

    return this.users.createGoogleUser({
      email: input.email,
      googleId: input.googleId,
      name: input.name,
    });
  }

  /** Issue a session for a user already authenticated via the Google strategy. */
  async issueSessionForUser(userId: string): Promise<AuthResponseDto> {
    const user = await this.users.getByIdOrThrow(userId);
    return this.buildSession(user);
  }

  getProfile(user: User): AuthResponseDto['user'] {
    return this.users.toProfile(user);
  }

  // --- internals -----------------------------------------------------------

  private async buildSession(user: User): Promise<AuthResponseDto> {
    const tokens = await this.rotateTokens(user);
    return { user: this.users.toProfile(user), tokens };
  }

  private async rotateTokens(user: User): Promise<AuthTokensDto> {
    const tokens = await this.signTokens({ sub: user.id, email: user.email });
    await this.users.setRefreshTokenHash(user.id, await hashToken(tokens.refreshToken));
    return tokens;
  }

  private async signTokens(payload: JwtPayload): Promise<AuthTokensDto> {
    const jwtConfig = this.config.get('jwt', { infer: true });
    // expiresIn is typed as `number | StringValue` by jsonwebtoken; our config
    // value is a plain string (e.g. "15m") so it is cast to that option type.
    type ExpiresIn = JwtSignOptions['expiresIn'];
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: jwtConfig.accessSecret,
        expiresIn: jwtConfig.accessExpiresIn as ExpiresIn,
      }),
      this.jwt.signAsync(payload, {
        secret: jwtConfig.refreshSecret,
        expiresIn: jwtConfig.refreshExpiresIn as ExpiresIn,
      }),
    ]);
    return { accessToken, refreshToken };
  }
}
