import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';

/**
 * Translates known Prisma errors into clean HTTP responses instead of leaking a
 * 500 with internal details. Unmapped Prisma errors fall through to a generic
 * 500 (logged) so we never expose database internals to clients.
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    switch (exception.code) {
      case 'P2002': {
        // Unique constraint violation.
        const target = (exception.meta?.target as string[] | undefined)?.join(', ') ?? 'field';
        response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          error: 'Conflict',
          message: `A record with this ${target} already exists.`,
        });
        return;
      }
      case 'P2025': {
        // Record not found (update/delete on a missing row).
        response.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          error: 'Not Found',
          message: 'The requested record was not found.',
        });
        return;
      }
      default: {
        this.logger.error(`Unhandled Prisma error ${exception.code}: ${exception.message}`);
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
          message: 'A database error occurred.',
        });
      }
    }
  }
}
