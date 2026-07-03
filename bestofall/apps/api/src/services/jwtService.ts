import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthTokens, User } from '@bestofall/shared';

export interface AccessTokenPayload {
  sub: string; // user id
  phone: string;
  role: 'user' | 'admin';
}

export function issueTokens(user: User): AuthTokens {
  const payload: AccessTokenPayload = { sub: user.id, phone: user.phone, role: user.role };

  const accessToken = jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessTtl,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign({ sub: user.id }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshTtl,
  } as jwt.SignOptions);

  return { accessToken, refreshToken, expiresIn: 15 * 60 };
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, env.jwtRefreshSecret) as { sub: string };
}
