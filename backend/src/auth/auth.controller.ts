import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import type { AppConfig } from '../config/configuration';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import type { AuthUser } from '../common/types/auth-user';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { AuthResponseDto, AuthTokensDto, UserProfileDto } from './dto/auth-response.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import type { RefreshRequestUser } from './strategies/jwt-refresh.strategy';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Create an account with email + password and start a session.' })
  @ApiOkResponse({ type: AuthResponseDto })
  register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.auth.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in with email + password.' })
  @ApiOkResponse({ type: AuthResponseDto })
  login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.auth.login(dto);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange a valid refresh token for a fresh token pair (rotates).' })
  @ApiOkResponse({ type: AuthTokensDto })
  refresh(
    // RefreshDto documents/validates the body shape; the guard reads the token.
    @Body() _dto: RefreshDto,
    @CurrentUser() user: RefreshRequestUser,
  ): Promise<AuthTokensDto> {
    return this.auth.refresh(user.id, user.refreshToken);
  }

  @ApiBearerAuth('access-token')
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke the current refresh token (server-side logout).' })
  async logout(@CurrentUser('id') userId: string): Promise<void> {
    await this.auth.logout(userId);
  }

  @ApiBearerAuth('access-token')
  @Get('me')
  @ApiOperation({ summary: 'Get the currently authenticated user.' })
  @ApiOkResponse({ type: UserProfileDto })
  async me(@CurrentUser('id') userId: string): Promise<UserProfileDto> {
    const user = await this.users.getByIdOrThrow(userId);
    return this.users.toProfile(user);
  }

  // --- Google OAuth --------------------------------------------------------

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  @ApiOperation({ summary: 'Begin the Google OAuth flow (redirects to Google).' })
  googleAuth(): void {
    // The guard redirects to Google; this body never executes.
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  @ApiOperation({
    summary: 'Google OAuth callback. Issues a session and redirects to the frontend.',
  })
  async googleCallback(@Req() req: Request, @Res() res: Response): Promise<void> {
    const principal = req.user as AuthUser;
    const session = await this.auth.issueSessionForUser(principal.id);

    // Hand the tokens to the frontend via the URL fragment (#) so they are not
    // sent to servers/logged like query params would be. The frontend's
    // /auth/callback route reads location.hash, stores them, and routes on.
    const redirect = this.config.get('google', { infer: true }).successRedirect;
    const params = new URLSearchParams({
      accessToken: session.tokens.accessToken,
      refreshToken: session.tokens.refreshToken,
    });
    res.redirect(`${redirect}#${params.toString()}`);
  }
}
