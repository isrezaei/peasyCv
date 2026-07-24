import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../common/types/auth-user';

/**
 * The REAL admin boundary. Applied class-level on the admin controller so no
 * endpoint can be added unguarded; runs after the global JwtAuthGuard (no
 * token is a 401 before this executes; a valid non-admin token 403s here).
 *
 * Deliberately a fresh DB read on EVERY request — never a JWT claim: admin can
 * be revoked instantly, and nothing a client puts in a token or payload can
 * grant it. `isAdmin` is absent from every DTO and is only ever written
 * out-of-band (manual UPDATE or the seed script).
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    const userId = request.user?.id;
    if (!userId) throw new ForbiddenException('Admin access required.');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    });
    if (!user?.isAdmin) throw new ForbiddenException('Admin access required.');
    return true;
  }
}
