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
  //
  // Policy:
  //   * localhost / 127.0.0.1 (any port, http or https) is ALWAYS allowed, so the
  //     API can be exercised from a local browser or tooling in every environment.
  //   * The explicitly-configured origins (FRONTEND_ORIGIN — e.g. the production
  //     studio domain https://studio.peasycv.ir and its http:// variant) are
  //     always allowed.
  //   * Private-LAN origins (a phone/other device at 10./192.168./172.16-31.) are
  //     allowed ONLY in development, where the dev server is reachable over the LAN
  //     (see next.config `allowedDevOrigins`) so a phone opens the app at, e.g.,
  //     http://192.168.1.9:3000. Without this the browser blocks every API call
  //     from that origin — login "Failed to fetch", no merge, an empty dashboard.
  //     Production stays locked to localhost plus the configured origins.
  const configuredOrigins = config.get('frontendOrigins', { infer: true });
  const allowLanOrigins = config.get('nodeEnv', { infer: true }) !== 'production';
  const LOCALHOST_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(?::\d+)?$/;
  const LAN_ORIGIN =
    /^https?:\/\/(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(?::\d+)?$/;
  app.enableCors({
    origin: (origin, callback) => {
      // Non-browser / same-origin requests carry no Origin header — allow them.
      if (!origin) return callback(null, true);
      if (LOCALHOST_ORIGIN.test(origin)) return callback(null, true);
      if (configuredOrigins.includes(origin)) return callback(null, true);
      if (allowLanOrigins && LAN_ORIGIN.test(origin)) return callback(null, true);
      return callback(null, false);
    },
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
