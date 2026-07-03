/** The authenticated principal attached to the request by the JWT strategy. */
export interface AuthUser {
  id: string;
  email: string;
}

/** Payload carried inside both access and refresh JWTs. */
export interface JwtPayload {
  sub: string;
  email: string;
}
