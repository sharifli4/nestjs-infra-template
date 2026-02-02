import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  useConnectionPooler: boolean;
}

export default registerAs(
  'database',
  (): DatabaseConfig => ({
    name: process.env.DB_NAME || 'default_db',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'user',
    password: process.env.DB_PASSWORD || 'password',
    useConnectionPooler: process.env.DB_USE_CONNECTION_POOLER === 'true',
  }),
);
