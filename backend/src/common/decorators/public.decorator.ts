import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route as publicly accessible, exempting it from the globally-applied
 * JWT access guard (see JwtAuthGuard). Used for auth endpoints and the public
 * read-only share/PDF routes.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
