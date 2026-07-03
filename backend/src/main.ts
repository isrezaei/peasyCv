import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { AppModule } from './app.module';
import type { AppConfig } from './config/configuration';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: false,
  });
  const config = app.get(ConfigService<AppConfig, true>);

  // Validate + transform every request DTO. `whitelist` strips properties with
  // no decorator so unknown fields are dropped (not rejected) — important for
  // the resume payload round-trip resilience.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  app.useGlobalFilters(new PrismaExceptionFilter());

  // CORS for the frontend origin(s). credentials enabled in case cookie-based
  // flows are added later; the default flow uses bearer tokens.
  app.enableCors({
    origin: config.get('frontendOrigins', { infer: true }),
    credentials: true,
  });

  // Serve locally-stored uploads (dev "local" storage provider) at /uploads.
  const storage = config.get('storage', { infer: true });
  if (storage.provider === 'local') {
    app.useStaticAssets(join(process.cwd(), storage.local.dir), { prefix: '/uploads/' });
  }

  // ---- Swagger / OpenAPI ----
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Resume Builder API')
    .setDescription(
      'Backend for the Persian/RTL resume builder. Auth (JWT + refresh + Google), ' +
        'resume CRUD with full ResumeData persistence, public read-only share, ' +
        'server-side PDF rendering, and profile-image uploads.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token',
    )
    .addServer(config.get('apiUrl', { infer: true }))
    .addTag('auth', 'Registration, login, refresh, logout, Google OAuth, current user')
    .addTag('resumes', 'Owned resume CRUD + sharing controls')
    .addTag('share', 'Public, unauthenticated, read-only resume view')
    .addTag('uploads', 'Profile-image upload to cloud storage')
    .addTag('pdf', 'Server-side A4 PDF rendering')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = config.get('port', { infer: true });
  await app.listen(port);
  new Logger('Bootstrap').log(`API listening on http://localhost:${port} (docs at /docs)`);
}

void bootstrap();
