import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { static as expressStatic } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());
  app.enableCors({
    origin: [
      'http://localhost:4200', 
      'http://localhost:3000',
      'https://metime-frontend-three.vercel.app',
      'https://metime-web.vercel.app',
      'https://metime-webapp.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Cross-Origin-Resource-Policy', 'Cross-Origin-Embedder-Policy'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptor for logging
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Static file serving for uploaded images (must be before API routes)
  const uploadsPath = join(__dirname, '..', 'uploads');
  console.log('📁 Uploads directory path:', uploadsPath);
  
  app.use('/uploads', expressStatic(uploadsPath, {
    setHeaders: (res, path) => {
      console.log('📄 Serving static file:', path);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  }));

  // Middleware
  app.use(new CorrelationIdMiddleware().use);
  
  // Global CORP headers for all responses
  app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    next();
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('MeTime API')
    .setDescription('Production-ready NestJS API with RBAC and multi-tenancy')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('companies', 'Company management endpoints')
    .addTag('public', 'Public endpoints (no authentication required)')
    .addTag('root', 'Root endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = configService.get('PORT', 3000);
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap();
