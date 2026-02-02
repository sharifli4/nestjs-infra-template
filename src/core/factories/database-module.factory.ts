import { DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { DatabaseConfig } from '../../config/database.config';

/**
 * Factory for creating database module configuration
 * Implements Factory Pattern for optional module loading
 */
export class DatabaseModuleFactory {
  /**
   * Creates MikroORM module with PostgreSQL driver
   * @returns DynamicModule configuration for database
   */
  static create(): DynamicModule | Promise<DynamicModule> {
    return MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get<DatabaseConfig>('database');

        if (!dbConfig) {
          throw new Error(
            'Database configuration not found. Ensure USE_DATABASE=true and database config is loaded.',
          );
        }

        const useSSL = process.env.DB_SSL === 'true';

        return {
          driver: PostgreSqlDriver,
          host: dbConfig.host,
          password: dbConfig.password,
          dbName: dbConfig.name,
          user: dbConfig.username,
          port: dbConfig.port,
          discovery: { warnWhenNoEntities: false },
          autoLoadEntities: true,

          // Connection pooler support (PgBouncer, RDS Proxy)
          ...(dbConfig.useConnectionPooler && {
            ensureDatabase: false,
            allowGlobalContext: true,
          }),

          // SSL support
          ...(useSSL && {
            driverOptions: {
              connection: {
                ssl: { rejectUnauthorized: false },
              },
            },
          }),
        };
      },
      inject: [ConfigService],
    });
  }

  /**
   * Checks if database module should be loaded
   * @returns true if USE_DATABASE environment variable is set to 'true'
   */
  static shouldLoad(): boolean {
    return process.env.USE_DATABASE === 'true';
  }
}
