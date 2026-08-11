import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // CORS configuration
  const corsOrigin = configService.get<string>('CORS_ORIGINS');
  const allowedOrigins = corsOrigin
    ? corsOrigin.split(',').map((o) => o.trim())
    : [
      'http://localhost:5000',
      'http://localhost:3000',
      'http://localhost:8000',

    ];

  app.enableCors({
    origin: (
      origin: string,
      callback: (err: Error | null, allow: boolean) => void,
    ) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // If CORS_ORIGINS is *, allow all origins
      if (corsOrigin === '*') return callback(null, true);

      // Check if the origin is in the allowed list
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
      'X-Device-ID',
      'X-Tenant-ID',
    ],
    exposedHeaders: ['Authorization', 'Content-Disposition'],
    credentials: true,
    maxAge: 600,
  });

  app.setGlobalPrefix('v1');
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.use(helmet());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Smart Sale POS API')
    .setDescription('API documentation for Smart Sale POS System')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter token using: Bearer <token>',
        in: 'header',
      },
      'token',
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, swaggerDocument, {
    customSiteTitle: 'Smart Sale POS – API Docs',
    customfavIcon: 'https://smartsalepos.com/favicon.ico',
    customCssUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    customCss: `
      .topbar { background-color: #0d9488; }
      .topbar-wrapper span { color: white !important; font-weight: bold; }
      .swagger-ui .info h1 { color: #0d9488; }
      .swagger-ui .scheme-container { background-color: #fafafa; }
      .swagger-ui .opblock.opblock-get { border-color: #0d9488; }
      .swagger-ui .opblock.opblock-post { border-color: #2563eb; }
      .swagger-ui .opblock.opblock-put { border-color: #ca8a04; }
      .swagger-ui .opblock.opblock-delete { border-color: #dc2626; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      displayRequestDuration: true,
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  const port = configService.get<number>('PORT') || 8000;
  const host = configService.get<string>('APP_HOST') || 'http://localhost';
  const swaggerPath = configService.get<string>('SWAGGER_PATH') || '/docs';

  await app.listen(port);

  logger.log(`🚀 Smart Sale POS API is running on ${host}:${port}/v1`);
  logger.log(`📘 Swagger Docs available at ${host}:${port}${swaggerPath}`);
  logger.log(`🔒 Environment: ${configService.get('NODE_ENV', 'development')}`);
}

bootstrap().catch((error) => {
  console.error('Error starting application:', error);
  process.exit(1);
});
