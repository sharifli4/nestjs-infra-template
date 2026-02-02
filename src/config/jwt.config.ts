import { registerAs } from '@nestjs/config';

export interface JwtConfig {
  accessTokenSecret: string;
  accessTokenExpiresIn: string;
  refreshTokenSecret: string;
  refreshTokenExpiresIn: string;
}

export default registerAs(
  'jwt',
  (): JwtConfig => ({
    accessTokenSecret:
      process.env.JWT_ACCESS_TOKEN_SECRET || 'change-me-access-secret',
    accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m',
    refreshTokenSecret:
      process.env.JWT_REFRESH_TOKEN_SECRET || 'change-me-refresh-secret',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d',
  }),
);
