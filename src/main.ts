import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { CustomLoggerService } from './logger/logger.service';
import { env } from './config/env';
import {
  InfrastructureModuleBuilder,
  ConfigurationLoaderFactory,
} from './core/factories';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Get custom logger
  const logger = app.get(CustomLoggerService);
  app.useLogger(logger);

  // Log loaded infrastructure modules
  const loadedModules = InfrastructureModuleBuilder.create()
    .withLogger()
    .withDatabase()
    .withRedis()
    .getLoadedModules();

  const loadedConfigs = ConfigurationLoaderFactory.getLoadedConfigurations();

  logger.log('🏗️  Infrastructure modules loaded:', {
    modules: loadedModules,
    configurations: loadedConfigs,
  });

  // Global API prefix
  app.setGlobalPrefix('api');

  // API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // CORS configuration
  app.enableCors({
    origin:
      env.NODE_ENV === 'production'
        ? process.env.CORS_ORIGINS?.split(',') || []
        : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-correlation-id'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('NestJS Infrastructure Template API')
    .setDescription(
      'Production-ready NestJS API with PostgreSQL, Redis, Winston logging, and comprehensive error handling',
    )
    .setVersion('1.0')
    .addTag('health', 'Health check endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT access token',
        in: 'header',
      },
      'access-token',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT refresh token',
        in: 'header',
      },
      'refresh-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
    },
  });

  await app.listen(env.PORT);

  logger.log(`🚀 Application is running on: http://localhost:${env.PORT}/api`);
  logger.log(`📚 Swagger documentation: http://localhost:${env.PORT}/docs`);
  logger.log(`🌍 Environment: ${env.NODE_ENV}`);
}

void bootstrap();
