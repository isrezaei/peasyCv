import { Injectable, NotFoundException } from '@nestjs/common';
import type { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UserProfileDto } from '../auth/dto/auth-response.dto';

/** Owns all User-table reads/writes. AuthService composes these for its flows. */
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async getByIdOrThrow(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found.');
    return user;
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  findByGoogleId(googleId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { googleId } });
  }

  createWithPassword(input: { email: string; passwordHash: string; name?: string | null }): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash: input.passwordHash,
        name: input.name ?? null,
      },
    });
  }

  createGoogleUser(input: { email: string; googleId: string; name?: string | null }): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        googleId: input.googleId,
        name: input.name ?? null,
      },
    });
  }

  linkGoogleId(userId: string, googleId: string): Promise<User> {
    return this.prisma.user.update({ where: { id: userId }, data: { googleId } });
  }

  setRefreshTokenHash(userId: string, hashedRefreshToken: string | null): Promise<User> {
    return this.prisma.user.update({ where: { id: userId }, data: { hashedRefreshToken } });
  }

  /** Maps a User row to the public profile shape returned by the API. */
  toProfile(user: User): UserProfileDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      hasPassword: Boolean(user.passwordHash),
      googleLinked: Boolean(user.googleId),
      createdAt: user.createdAt.toISOString(),
    };
  }
}
