/**
 * Strongly-typed configuration assembled from environment variables. Registered
 * with @nestjs/config so the rest of the app reads settings via ConfigService
 * (typed through {@link AppConfig}) rather than touching process.env directly.
 */
export interface AppConfig {
  port: number;
  nodeEnv: string;
  frontendOrigins: string[];
  frontendUrl: string;
  apiUrl: string;
  jwt: {
    accessSecret: string;
    accessExpiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  google: {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
    successRedirect: string;
    enabled: boolean;
  };
  storage: {
    provider: 'local' | 's3' | 'cloudinary';
    local: { dir: string; baseUrl: string };
    s3: {
      region: string;
      bucket: string;
      accessKeyId: string;
      secretAccessKey: string;
      publicBaseUrl: string;
      endpoint: string;
    };
    cloudinary: {
      cloudName: string;
      apiKey: string;
      apiSecret: string;
      folder: string;
    };
  };
  pdf: {
    executablePath: string;
    renderTimeoutMs: number;
  };
}

function splitOrigins(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

export default (): AppConfig => {
  const provider = (process.env.STORAGE_PROVIDER ?? 'local') as AppConfig['storage']['provider'];

  return {
    port: parseInt(process.env.PORT ?? '4000', 10),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    frontendOrigins: splitOrigins(process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000'),
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    apiUrl: process.env.API_URL ?? 'http://localhost:4000',
    jwt: {
      accessSecret: process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret-change-me',
      accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
      refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-change-me',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      callbackUrl: process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:4000/auth/google/callback',
      successRedirect: process.env.OAUTH_SUCCESS_REDIRECT ?? 'http://localhost:3000/auth/callback',
      enabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
    storage: {
      provider,
      local: {
        dir: process.env.LOCAL_UPLOAD_DIR ?? 'uploads',
        baseUrl: process.env.LOCAL_UPLOAD_BASE_URL ?? 'http://localhost:4000/uploads',
      },
      s3: {
        region: process.env.S3_REGION ?? '',
        bucket: process.env.S3_BUCKET ?? '',
        accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
        publicBaseUrl: process.env.S3_PUBLIC_BASE_URL ?? '',
        endpoint: process.env.S3_ENDPOINT ?? '',
      },
      cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
        apiKey: process.env.CLOUDINARY_API_KEY ?? '',
        apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
        folder: process.env.CLOUDINARY_FOLDER ?? 'resume-profile-images',
      },
    },
    pdf: {
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH ?? '',
      renderTimeoutMs: parseInt(process.env.PDF_RENDER_TIMEOUT_MS ?? '60000', 10),
    },
  };
};
